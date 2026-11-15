import { access, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
await access(new URL('index.html', dist));

for (const directory of ['print', 'specs', 'assets-review']) {
  await rm(new URL(directory, dist), { recursive: true, force: true });
  console.log(`Excluded internal page: ${directory}`);
}

for (const file of ['cases/ideal-home/index.html', 'site/site.js', 'downloads/portfolio-ai-interaction-revised.pdf']) {
  await access(new URL(file, dist));
}
console.log(`Static deployment directory ready: ${fileURLToPath(dist)}`);
