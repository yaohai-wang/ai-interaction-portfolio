// PDF 版作品集：把网页版的内容排成 1600×900 的横向页面。
// 交互在纸面上换成并排的画面：步骤变成连续帧，拖动对比变成左右两栏，切换变成一组画面。
// 样式在 public/site/print.css。用无头浏览器按页面尺寸打印即可得到 PDF。
import { site, cases } from './content.ts';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n) => Number(n).toLocaleString('en-US');
// 去掉只对网页交互成立的句子（“点下面的步骤…”“拖动中间的分隔线…”）。
const still = (text) => String(text || '').split('。').filter((s) => s && !/点下面|点下去|拖动中间|选一个看看/.test(s)).map((s) => s + '。').join('');
const chunk = (list, n) => list.reduce((rows, item, i) => (i % n ? rows[rows.length - 1].push(item) : rows.push([item]), rows), []);

// 每页的背景：和网页版同一层稀疏的小三角。纸面上没有指针，就把“指针经过”的那一刻定格在页面的空处：
// 几颗三角亮成彩色、连成线，周围一圈很淡的紫光。位置和形状由页码决定，每页不同但可复现。
function field(page, cls) {
  let seed = 4099 + page * 7919;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const colors = ['#8052ff', '#a98bff', '#ffb829', '#3fb6a0', '#e85fb4', '#4f8dff', '#ffffff'];
  const focus = cls.includes('is-cover') ? [470, 770] : cls.includes('is-toc') ? [1240, 790] : cls.includes('is-notes') ? [1320, 190] : [1380 + (rnd() - 0.5) * 120, 118 + (rnd() - 0.5) * 50];
  const tri = (x, y, r, rot) => [0, 1, 2].map((v) => `${(x + Math.cos(rot + v * 2.0944) * r).toFixed(1)},${(y + Math.sin(rot + v * 2.0944) * r).toFixed(1)}`).join(' ');
  let dim = '', lit = '', links = '';
  for (let i = 0; i < 120; i++) {
    const z = 0.25 + rnd() * 0.75;
    dim += `<polygon points="${tri(rnd() * 1600, rnd() * 900, (3 + rnd() * 6) * z, rnd() * 6.283)}" opacity="${(0.14 + z * 0.3).toFixed(2)}"/>`;
  }
  const stars = Array.from({ length: 9 }, () => {
    const a = rnd() * 6.283, d = 30 + rnd() * 170;
    return { x: focus[0] + Math.cos(a) * d, y: focus[1] + Math.sin(a) * d * 0.62, k: 1 - d / 230, c: colors[(rnd() * colors.length) | 0], r: 4 + rnd() * 6, rot: rnd() * 6.283 };
  });
  for (const s of stars) lit += `<polygon points="${tri(s.x, s.y, s.r * (1 + s.k * 0.6), s.rot)}" stroke="${s.c}" opacity="${(0.35 + s.k * 0.6).toFixed(2)}"/>`;
  for (let i = 0; i < stars.length; i++) for (let j = i + 1; j < stars.length; j++) {
    const a = stars[i], b = stars[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 150) links += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" opacity="${(Math.min(a.k, b.k) * (1 - d / 150) * 0.7).toFixed(2)}"/>`;
  }
  return `<svg class="field" viewBox="0 0 1600 900" aria-hidden="true"><defs><radialGradient id="glow${page}" cx="${focus[0].toFixed(0)}" cy="${focus[1].toFixed(0)}" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8052ff" stop-opacity=".17"/><stop offset=".5" stop-color="#8052ff" stop-opacity=".05"/><stop offset="1" stop-color="#8052ff" stop-opacity="0"/></radialGradient></defs><rect width="1600" height="900" fill="url(#glow${page})"/><g fill="none" stroke="#9a9a9a" stroke-width="1">${dim}</g><g fill="none" stroke="#ffffff" stroke-width="1">${links}</g><g fill="none" stroke-width="1.2">${lit}</g></svg>`;
}

export function renderPrint({ prefix = '', sky = (name) => `/site/sky/${name}.jpg` } = {}) {
  const img = (src, alt = '', cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="${prefix}${src}" alt="${esc(alt)}">`;
  const pages = [];
  const add = (html, { cls = '', section = '' } = {}) => pages.push({ html, cls, section });

  const head = (title, lead, more = '') => `<header class="head"><h2>${esc(title)}${more ? `<small>${more}</small>` : ''}</h2>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</header>`;
  const itemsRow = (items) => (items && items.length ? `<div class="items n${items.length}">${items.map((i) => `<div><h4>${esc(i.title)}</h4><p>${esc(i.text)}</p>${i.note ? `<p class="note">${esc(i.note)}</p>` : ''}</div>`).join('')}</div>` : '');
  const source = (text) => (text ? `<p class="source">画面来源：${esc(text)}</p>` : '');

  // 封面
  add(`<div class="cover-copy">
      <p class="label">${esc(site.label)}</p>
      <h1>${site.headline.map((l) => `<span>${esc(l)}</span>`).join('')}</h1>
      <p class="lead"><strong>${esc(site.name)}</strong> ${esc(site.latin)}。${esc(site.lead)}</p>
    </div>
    <figure class="cover-sky">${img(sky('frame'), '')}</figure>`, { cls: 'is-cover' });

  // 目录：四个作品各自的星群形状
  const tocIndex = pages.length;
  add('', { cls: 'is-toc' });

  const starts = {};
  for (const c of cases) {
    starts[c.slug] = pages.length + 1;
    const section = c.title;
    // 案例首页
    add(`<div class="opener-copy">
        <p class="label">${esc(c.tag)}</p>
        <h2>${esc(c.hero.title)}</h2>
        <p class="lead">${esc(c.hero.lead)}</p>
        <p class="question">${esc(c.hero.question)}</p>
        <dl class="meta">${c.hero.meta.map((m) => `<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join('')}</dl>
        ${c.demo ? `<a class="demo" href="${c.demo}">${img(c.qr, `${c.title} 的二维码`)}<span><small>在线 Demo</small>${esc(c.demoLabel)}</span></a>` : ''}
      </div>
      <figure class="opener-cover">${img(c.cover.src, c.cover.alt)}${c.hero.note ? `<figcaption>${esc(c.hero.note)}</figcaption>` : ''}</figure>`, { cls: 'is-opener', section });

    for (const ch of c.chapters) {
      if (ch.type === 'notes') {
        add(`${head(ch.title, ch.lead)}<div class="notes">${ch.items.map((i) => `<div><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p>${i.note ? `<p class="note">${esc(i.note)}</p>` : ''}</div>`).join('')}</div>`, { cls: 'is-notes', section });
        continue;
      }
      if (ch.type === 'compare') {
        const side = (s, cls) => `<figure class="shot ${cls}">${img(s.src, s.label)}<figcaption><b>${esc(s.label)}</b><span>${esc(s.text)}</span></figcaption></figure>`;
        add(`${head(ch.title, still(ch.lead))}<div class="frames n2">${side(ch.before, 'is-before')}${side(ch.after, 'is-after')}</div>${itemsRow(ch.items)}${source(ch.source)}`, { section });
        continue;
      }
      if (ch.type === 'video') {
        add(`${head(ch.title, ch.lead)}<div class="frames is-video"><figure class="shot">${img(ch.poster, ch.title)}</figure><div class="aside"><p>PDF 里放的是录屏的一帧。</p>${ch.source ? `<p>${esc(ch.source)}</p>` : ''}</div></div>`, { section });
        continue;
      }
      // player：连续步骤或一组可切换的画面
      const isSwitch = ch.variant === 'switch';
      const panel = ch.stage === 'panel';
      const n = ch.steps.length;
      const figure = (s, i) => {
        const prev = i > 0 ? ch.steps[i - 1].stats : null;
        const stats = s.stats ? `<dl class="stats">${ch.stats.map((label, k) => `<div${prev && prev[k] !== s.stats[k] ? ' class="is-changed"' : ''}><dt>${esc(label)}</dt><dd>${fmt(s.stats[k])}${ch.unit ? `<small>${esc(ch.unit)}</small>` : ''}</dd></div>`).join('')}</dl>` : '';
        const framed = panel && !s.full;
        return `<figure class="shot${panel ? ' is-panel' : ''}${panel && s.full ? ' is-full' : ''}">
          <div class="stage">${panel && ch.backdrop ? img(ch.backdrop, '', 'backdrop') : ''}${img(s.src, `${c.title}：${s.label}`, 'frame')}</div>
          <figcaption><b>${isSwitch ? '' : `<i>${i + 1}</i>`}${esc(s.label)}</b><span>${esc(s.text)}</span>${stats}</figcaption>
        </figure>`;
      };
      if (isSwitch && n === 5) {
        // 一张大图，四张小图
        add(`${head(ch.title, still(ch.lead))}<div class="frames is-mosaic">${ch.steps.map(figure).join('')}</div>${itemsRow(ch.items)}${source(ch.source)}`, { section });
        continue;
      }
      const per = isSwitch ? Math.min(n, 3) : panel ? (n === 4 ? 4 : 3) : n === 3 || (n === 5 && !ch.stats) ? 3 : 2;
      const groups = chunk(ch.steps.map((s, i) => ({ s, i })), per);
      groups.forEach((group, g) => {
        const last = g === groups.length - 1;
        let aside = '';
        if (last && group.length < per && ch.stats) {
          // 最后一页留出的位置放整段流程的数字账本
          aside = `<div class="aside ledger"><table><thead><tr><th></th>${ch.stats.map((l) => `<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>${ch.steps.map((s, i) => `<tr><th><i>${i + 1}</i>${esc(s.label)}</th>${s.stats.map((v, k) => `<td${i > 0 && ch.steps[i - 1].stats[k] !== v ? ' class="is-changed"' : ''}>${fmt(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>${ch.unit ? `<p class="note">单位：${esc(ch.unit)}。数字变化的那一步标为黄色。</p>` : ''}</div>`;
        } else if (last && group.length < per && ch.items) {
          aside = `<div class="aside">${ch.items.map((i) => `<div><h4>${esc(i.title)}</h4><p>${esc(i.text)}</p></div>`).join('')}</div>`;
        } else if (last && group.length < per && ch.source) {
          aside = `<div class="aside"><div><h4>画面来源</h4><p>${esc(ch.source)}</p></div></div>`;
        }
        const asideHasSource = aside.includes('<h4>画面来源</h4>');
        const more = groups.length > 1 ? `${g + 1} / ${groups.length}` : '';
        add(`${head(ch.title, g === 0 ? still(ch.lead) : '', more)}<div class="frames n${per}">${group.map(({ s, i }) => figure(s, i)).join('')}${aside}</div>${last && !(aside && !ch.stats) ? itemsRow(ch.items) : ''}${last && !asideHasSource ? source(ch.source) : ''}`, { section });
      });
    }
  }

  // 结尾：关于与 Demo 入口
  add(`<div class="end-about">
      <h2>${esc(site.name)} <span>${esc(site.latin)}</span></h2>
      <div class="notes">${site.about.map((a) => `<div><p class="label">${esc(a.label)}</p><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></div>`).join('')}</div>
    </div>
    <div class="end-demos">
      <p class="lead">${esc(site.closing.text)}</p>
      <div class="demos">${cases.filter((c) => c.demo).map((c) => `<a class="demo" href="${c.demo}">${img(c.qr, `${c.title} 的二维码`)}<span><small>${esc(c.title)}</small>${esc(c.demoLabel)}</span></a>`).join('')}</div>
    </div>`, { cls: 'is-end' });

  pages[tocIndex].html = `${head('四个项目，四种交互问题', '空间反馈、状态确认、上下文与主题导航。')}
    <div class="toc">${cases.map((c) => `<a href="#p${starts[c.slug]}">
      <figure>${img(sky(c.emblem), '')}</figure>
      <p class="label">${esc(c.tag)}</p>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.summary)}</p>
      <p class="note">${esc(c.status)}<br>第 ${starts[c.slug]} 页</p>
    </a>`).join('')}</div>`;

  const total = pages.length;
  return pages.map((p, i) => `<section class="page ${p.cls}" id="p${i + 1}">
    ${field(i + 1, p.cls)}
    ${p.html}
    ${i ? `<footer class="folio"><span>${esc(site.name)} ${esc(site.latin)}，AI 交互设计作品集${p.section ? `<b>${esc(p.section)}</b>` : ''}</span><span>${String(i + 1).padStart(2, '0')} / ${total}</span></footer>` : ''}
  </section>`).join('\n');
}

export const printMeta = { title: `${site.name}，AI 交互设计作品集`, description: site.description };
