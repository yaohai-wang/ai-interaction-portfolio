#!/usr/bin/osascript -l JavaScript
// Native macOS PDFKit rendering, without UI automation or PDF modification.
// Usage: osascript -l JavaScript scripts/render-native.js INPUT.pdf tmp/qa/native
ObjC.import('Foundation');
ObjC.import('AppKit');
ObjC.import('PDFKit');

function resolvedPath(value) {
  const absolute = value.startsWith('/') ? value : ObjC.unwrap($.NSFileManager.defaultManager.currentDirectoryPath) + '/' + value;
  return ObjC.unwrap($(absolute).stringByStandardizingPath.stringByResolvingSymlinksInPath);
}
function run(argv) {
  if (argv.length !== 2) throw new Error('Usage: osascript -l JavaScript scripts/render-native.js INPUT.pdf portfolio/tmp/output');
  const processArgs = ObjC.deepUnwrap($.NSProcessInfo.processInfo.arguments);
  const scriptPath = processArgs.map(String).find(x => /render-native\.js$/.test(x));
  if (!scriptPath) throw new Error('Cannot determine the portfolio root from the script path');
  const root = resolvedPath(scriptPath).replace(/\/scripts\/render-native\.js$/, '');
  const allowedRoot = resolvedPath(root + '/tmp');
  const input = resolvedPath(argv[0]);
  const output = resolvedPath(argv[1]);
  if (!output.startsWith(allowedRoot + '/')) throw new Error('Output must be below ' + allowedRoot);
  const fm = $.NSFileManager.defaultManager;
  const inputData = $.NSData.dataWithContentsOfFile(input);
  if (!inputData || !inputData.length) throw new Error('Cannot read input PDF');
  const document = $.PDFDocument.alloc.initWithData(inputData);
  if (!document || document.isLocked || document.pageCount < 1) throw new Error('Input must be a readable, unlocked, nonempty PDF');
  if (!fm.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(output, true, $(), null)) throw new Error('Cannot create output directory');
  const pages = [];
  for (let index = 0; index < document.pageCount; index++) {
    const page = document.pageAtIndex(index);
    const box = page.boundsForBox(1); // PDFDisplayBox.cropBox
    const rotation = ((page.rotation % 360) + 360) % 360;
    const rotated = rotation === 90 || rotation === 270;
    const displayWidth = rotated ? box.size.height : box.size.width;
    const displayHeight = rotated ? box.size.width : box.size.height;
    if (!(displayWidth > 0 && displayHeight > 0)) throw new Error('Invalid page bounds at ' + (index + 1));
    const targetWidth = 1200;
    const targetHeight = Math.max(1, Math.round(targetWidth * displayHeight / displayWidth));
    const nativeImage = page.thumbnailOfSizeForBox($.NSMakeSize(targetWidth, targetHeight), 1);
    const bitmap = $.NSBitmapImageRep.imageRepWithData(nativeImage.TIFFRepresentation);
    const width = Number(bitmap.pixelsWide);
    const height = Number(bitmap.pixelsHigh);
    if (width !== targetWidth) throw new Error('Native renderer returned unexpected width ' + width + ' on page ' + (index + 1));
    const png = bitmap.representationUsingTypeProperties(4, $({})); // NSBitmapImageFileType.png
    const name = 'page-' + String(index + 1).padStart(2, '0') + '.png';
    if (!png.writeToFileAtomically(output + '/' + name, true)) throw new Error('Cannot write ' + name);
    pages.push({page:index + 1, image:name, width, height, bytes:Number(png.length),
      pdfWidthPoints:box.size.width, pdfHeightPoints:box.size.height, rotation});
    console.log('Rendered ' + name + ': ' + width + ' x ' + height);
  }
  if (!inputData.isEqualToData($.NSData.dataWithContentsOfFile(input))) throw new Error('Input PDF changed while rendering; rerun against the completed export');
  const report = {renderer:'macOS PDFKit PDFPage.thumbnail / AppKit NSBitmapImageRep via JXA',
    generatedAt:new Date().toISOString(), input, inputBytes:Number(inputData.length), inputUnchanged:true,
    outputDirectory:output, pageCount:Number(document.pageCount), renderedPageCount:pages.length,
    targetWidth:1200, pages,
    environmentNote:'Swift 6.1.2 CLT failed with duplicate SwiftBridging module definitions; this native Objective-C bridge needs no compiler or system installation.'};
  const json = $(JSON.stringify(report, null, 2)).dataUsingEncoding($.NSUTF8StringEncoding);
  if (!json.writeToFileAtomically(output + '/report.json', true)) throw new Error('Cannot write report.json');
  return JSON.stringify({pageCount:report.pageCount, report:output + '/report.json'});
}
