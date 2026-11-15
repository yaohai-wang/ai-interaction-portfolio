// 流程图：主线一排节点，上方是积分的变化，下方是断网时的两条退路。
// 输出一段内联 SVG，网页版和 PDF 版共用；颜色与字号在各自的样式表里（.flow …）。
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function flowSvg(ch) {
  const W = 128, H = 60, STEP = 160, TOP = 96, BR = 262;
  const n = ch.main.length, width = (n - 1) * STEP + W;
  const cx = (i) => i * STEP + W / 2, cy = TOP + H / 2, bcy = BR + H / 2;
  const node = (x, y, label, cls) => `<g class="fl-node ${cls}"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="18"/><text x="${x + W / 2}" y="${y + H / 2}" dy=".36em" text-anchor="middle">${esc(label)}</text></g>`;

  // 上方：可用积分，只在变化的那一步写出新数字
  const marks = [{ i: 0, value: ch.start }, ...ch.main.map((m, i) => (m.points ? { i, value: m.points, delta: m.delta } : null)).filter(Boolean)];
  let ledger = `<text class="fl-cap" x="0" y="12">可用积分</text>`;
  marks.forEach((m, k) => {
    const end = k + 1 < marks.length ? cx(marks[k + 1].i) - 40 : width;
    ledger += `<text class="fl-num${m.delta ? ' is-changed' : ''}" x="${cx(m.i)}" y="56" text-anchor="middle">${m.value}</text>`;
    if (m.delta) ledger += `<text class="fl-delta" x="${cx(m.i)}" y="80" text-anchor="middle">${esc(m.delta)}</text>`;
    ledger += `<line class="fl-track" x1="${cx(m.i) + 40}" y1="46" x2="${end}" y2="46"/>`;
  });

  // 主线
  let main = '';
  ch.main.forEach((m, i) => {
    main += node(i * STEP, TOP, m.label, `is-${m.who}`);
    if (i < n - 1) main += `<line class="fl-edge" x1="${i * STEP + W + 5}" y1="${cy}" x2="${(i + 1) * STEP - 7}" y2="${cy}" marker-end="url(#fl-arrow)"/>`;
  });

  // 下方：断网后的两条退路，都回到主线上
  const b = ch.branch, bx = b.from * STEP;
  let branch = `<line class="fl-edge is-alt" x1="${cx(b.from)}" y1="${TOP + H + 5}" x2="${cx(b.from)}" y2="${BR - 7}" marker-end="url(#fl-arrow)"/>
    <text class="fl-note" x="${cx(b.from) + 12}" y="${(TOP + H + BR) / 2 + 4}">${esc(b.cause)}</text>
    ${node(bx, BR, b.label, 'is-alt')}`;
  for (const back of b.back) {
    const x = back.to * STEP, right = back.to > b.from;
    branch += `<line class="fl-edge is-alt" x1="${right ? bx + W + 5 : bx - 5}" y1="${bcy}" x2="${right ? x - 7 : x + W + 7}" y2="${bcy}" marker-end="url(#fl-arrow)"/>
      ${node(x, BR, back.label, 'is-alt')}
      <line class="fl-edge is-alt" x1="${cx(back.to)}" y1="${BR - 5}" x2="${cx(back.to)}" y2="${TOP + H + 7}" marker-end="url(#fl-arrow)"/>
      <text class="fl-note" x="${cx(back.to) + 12}" y="${(TOP + H + BR) / 2 + 4}">${esc(back.note)}</text>`;
  }

  const desc = `主线：${ch.main.map((m) => m.label).join('，')}。可用积分从 ${ch.start} 开始，${marks.slice(1).map((m) => `${ch.main[m.i].label}后是 ${m.value}`).join('，')}。${b.cause}时进入“${b.label}”，可以${b.back.map((k) => `${k.label}（${k.note}）`).join('，或者')}。`;
  return `<svg class="flow-svg" viewBox="0 -4 ${width} ${BR + H + 8}" role="img" aria-label="${esc(desc)}">
    <defs><marker id="fl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 9 5 1 9" fill="none" stroke="#9a9a9a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
    ${ledger}${main}${branch}
  </svg>`;
}

export const flowLegend = (ch) => `<ul class="flow-legend">${ch.legend.map((l) => `<li class="is-${l.who}"><i></i>${esc(l.label)}</li>`).join('')}<li class="is-alt"><i></i>出错时的退路</li></ul>`;
