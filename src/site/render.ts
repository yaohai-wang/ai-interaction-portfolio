// 网页版作品集的 HTML 渲染。Astro 页面只负责把这里返回的字符串放进文档，
// 这样同一份模板可以在没有 Astro 的环境里直接用 Node 预览。
import fs from 'node:fs';
import { site, cases } from './content.ts';
import { flowSvg, flowLegend } from './flow.ts';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const has = (p) => fs.existsSync('public' + p);

const dimCache = new Map();
function dims(src) {
  if (dimCache.has(src)) return dimCache.get(src);
  let out = { w: 1920, h: 1200 };
  try {
    const d = fs.readFileSync('public' + src);
    let i = 2;
    while (i < d.length) {
      if (d[i] !== 0xff) { i++; continue; }
      const m = d[i + 1];
      if (m === 0xc0 || m === 0xc1 || m === 0xc2) { out = { h: d.readUInt16BE(i + 5), w: d.readUInt16BE(i + 7) }; break; }
      i += 2 + d.readUInt16BE(i + 2);
    }
  } catch {}
  dimCache.set(src, out);
  return out;
}

function pic(src, alt, { eager = false, cls = '', attrs = '' } = {}) {
  const { w, h } = dims(src);
  const webp = src.replace(/\.jpg$/, '.webp');
  const source = webp !== src && has(webp) ? `<source srcset="${webp}" type="image/webp">` : '';
  return `<picture${cls ? ` class="${cls}"` : ''}${attrs ? ' ' + attrs : ''}>${source}<img src="${src}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
}

const triangle = '<svg class="tri" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 22 21H2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
const arrow = (dir) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === 'prev' ? 'M14 5 7 12l7 7' : 'm10 5 7 7-7 7'}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function nav(current) {
  const pdf = has(site.pdf);
  return `<a class="skip" href="#main">跳到正文</a>
<header class="nav">
  <a class="mark" href="/" aria-label="${esc(site.latin)}，回到首页">${triangle}<span>${esc(site.latin)}</span></a>
  <nav aria-label="主导航">
    <a href="/#works"${current === 'works' ? ' aria-current="true"' : ''}>作品</a>
    <a href="/#about">关于</a>
    ${pdf ? `<a href="${site.pdf}">PDF 版</a>` : ''}
  </nav>
</header>`;
}

function footer() {
  return `<footer class="foot">
  <p>${esc(site.name)} ${esc(site.latin)}，AI 交互设计作品集</p>
  <p><a href="/print/">打印版</a><a href="/specs/">设计规格</a><a href="/assets-review/">素材索引</a></p>
</footer>
<dialog class="zoom" aria-label="查看大图">
  <form method="dialog"><button class="zoom-close" aria-label="关闭大图">关闭</button></form>
  <div class="zoom-stage"></div>
</dialog>`;
}

export function renderHome() {
  const picker = cases.map((c) => `<a href="/cases/${c.slug}/" data-emblem="${c.emblem}" data-summary="${esc(c.summary)}">${esc(c.title)}</a>`).join('');
  const works = cases.map((c, i) => `<article class="work${i % 2 ? ' is-flip' : ''}">
      <a class="work-media" href="/cases/${c.slug}/" aria-label="查看案例：${esc(c.title)}" style="view-transition-name:cover-${c.slug}">${pic(c.cover.src, c.cover.alt, { eager: i === 0 })}</a>
      <div class="work-copy">
        <p class="label">${esc(c.tag)}</p>
        <h3 class="heading-lg"><a href="/cases/${c.slug}/">${esc(c.title)}</a></h3>
        <p class="body">${esc(c.summary)}</p>
        <p class="small">${esc(c.status)}</p>
      </div>
    </article>`).join('\n');
  const about = site.about.map((a) => `<div><p class="label">${esc(a.label)}</p><h3 class="heading-xs">${esc(a.title)}</h3><p class="body">${esc(a.text)}</p></div>`).join('');
  const demos = cases.filter((c) => c.demo).map((c) => `<li><a href="${c.demo}" target="_blank" rel="noopener noreferrer"><span class="demo-title">${esc(c.title)}</span><span class="demo-host">${esc(c.demoLabel)}</span></a>${c.qr && has(c.qr) ? `<img src="${c.qr}" width="72" height="72" alt="${esc(c.title)} 的二维码" loading="lazy">` : ''}</li>`).join('');

  return `${nav('works')}
<main id="main">
  <section class="hero">
    <div class="hero-copy">
      <p class="label">${esc(site.label)}</p>
      <h1 class="display">${site.headline.map((l) => `<span>${esc(l)}</span>`).join('')}</h1>
      <p class="body"><strong>${esc(site.name)}</strong> ${esc(site.latin)}。${esc(site.lead)}</p>
      <p class="actions"><a class="pill" href="#works">查看作品</a></p>
    </div>
    <div class="sky" data-sky>
      <canvas aria-hidden="true"></canvas>
      <div class="sky-ui">
        <nav class="sky-picker" aria-label="四个作品">${picker}</nav>
        <p class="sky-caption small" data-sky-caption data-default="${esc(site.constellationHint)}">${esc(site.constellationHint)}</p>
      </div>
    </div>
  </section>

  <section class="why" aria-label="为什么做交互设计">
    ${site.why.map((s, i) => `<p class="${i ? 'lead' : 'heading'}">${esc(s)}</p>`).join('')}
  </section>

  <section class="works" id="works" aria-labelledby="works-title">
    <header class="section-head">
      <h2 class="heading-lg" id="works-title">四个项目，四种交互问题</h2>
      <p class="lead">空间反馈、状态确认、上下文与主题导航。</p>
    </header>
    ${works}
  </section>

  <section class="approach" id="approach" aria-labelledby="approach-title">
    <header class="section-head">
      <h2 class="heading-lg" id="approach-title">${esc(site.approach.title)}</h2>
      <p class="lead">${esc(site.approach.lead)}</p>
    </header>
    <ol class="approach-list">${site.approach.items.map((a) => `<li><h3 class="heading-xs">${esc(a.title)}</h3><p class="body">${esc(a.text)}</p><p class="small"><a href="/cases/${a.slug}/">${esc(a.from)}</a></p></li>`).join('')}</ol>
  </section>

  <section class="about" id="about" aria-labelledby="about-title">
    <h2 class="heading-lg" id="about-title">${esc(site.name)} <span class="latin">${esc(site.latin)}</span></h2>
    <div class="about-grid">${about}</div>
  </section>

  <section class="closing" aria-labelledby="closing-title">
    <div>
      <h2 class="heading-lg" id="closing-title">${esc(site.closing.title)}</h2>
      <p class="body">${esc(site.closing.text)}</p>
      <dl class="contact">
        <div><dt>邮箱</dt><dd><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></dd></div>
        <div><dt>微信</dt><dd>${esc(site.contact.wechat)}</dd></div>
      </dl>
    </div>
    <ul class="demos">${demos}</ul>
  </section>
</main>
${footer()}`;
}

function sourceNote(text) {
  return text ? `<details class="source"><summary>这组画面怎么来的</summary><p>${esc(text)}</p></details>` : '';
}

function notesGrid(items) {
  if (!items?.length) return '';
  return `<div class="notes count-${items.length}">${items.map((i) => `<div><h3 class="heading-xs">${esc(i.title)}</h3><p class="body">${esc(i.text)}</p>${i.note ? `<p class="small">${esc(i.note)}</p>` : ''}</div>`).join('')}</div>`;
}

function chapterHead(ch) {
  return `<header class="chapter-head"><h2 class="heading" id="${ch.id}-title">${esc(ch.title)}</h2>${ch.lead ? `<p class="lead">${esc(ch.lead)}</p>` : ''}</header>`;
}

function player(ch, c) {
  const isSwitch = ch.variant === 'switch';
  const tabs = ch.steps.map((s, i) => `<li><button type="button" role="tab" id="${ch.id}-tab-${i}" aria-selected="${i === 0}" aria-controls="${ch.id}-stage" tabindex="${i === 0 ? 0 : -1}" data-step="${i}">${isSwitch ? '' : `<span class="num">${i + 1}</span>`}<span>${esc(s.label)}</span></button></li>`).join('');
  const frames = ch.steps.map((s, i) => pic(s.src, `${c.title}：${s.label}`, { eager: false, cls: `frame${i === 0 ? ' is-active' : ''}${ch.stage === 'panel' && !s.full ? ' is-panel' : ''}`, attrs: `data-frame="${i}"` })).join('');
  const stats = ch.stats ? `<dl class="stats">${ch.stats.map((label, i) => `<div><dt>${esc(label)}</dt><dd><span data-stat="${i}">${ch.steps[0].stats[i].toLocaleString('en-US')}</span>${ch.unit ? `<small>${esc(ch.unit)}</small>` : ''}</dd></div>`).join('')}</dl>` : '';
  const data = esc(JSON.stringify(ch.steps.map((s) => ({ text: s.text, stats: s.stats || null }))));
  return `<section class="chapter" aria-labelledby="${ch.id}-title">
    ${chapterHead(ch)}
    <div class="player${isSwitch ? ' is-switch' : ch.stage === 'panel' ? '' : ' is-wide'}" data-player data-steps="${data}">
      <div class="player-rail">
        <ol class="steps" role="tablist" aria-label="${esc(ch.title)}">${tabs}</ol>
        ${stats}
        <p class="step-text body" data-step-text aria-live="polite">${esc(ch.steps[0].text)}</p>
        ${isSwitch ? '' : `<p class="player-ctl"><button type="button" class="play" data-play aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-play" d="M8 5v14l11-7z" fill="currentColor"/><path class="i-pause" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg><span data-play-label>自动播放</span></button><button type="button" data-prev aria-label="上一步" disabled>${arrow('prev')}</button><span class="small" data-count>1 / ${ch.steps.length}</span><button type="button" data-next aria-label="下一步">${arrow('next')}</button></p>`}
      </div>
      <div class="stage${ch.stage === 'panel' ? ' has-backdrop' : ''}" id="${ch.id}-stage" role="tabpanel" aria-labelledby="${ch.id}-tab-0" tabindex="0">
        ${ch.backdrop ? pic(ch.backdrop, '', { cls: 'backdrop' }) : ''}
        ${frames}
        <i class="stage-progress" aria-hidden="true"></i>
        <button type="button" class="stage-zoom" data-zoom>放大看</button>
      </div>
    </div>
    ${notesGrid(ch.items)}
    ${sourceNote(ch.source)}
  </section>`;
}

function compare(ch, c) {
  return `<section class="chapter" aria-labelledby="${ch.id}-title">
    ${chapterHead(ch)}
    <div class="compare" data-compare>
      <div class="compare-stage">
        ${pic(ch.after.src, `${c.title}：${ch.after.label}`, { cls: 'cmp-after' })}
        ${pic(ch.before.src, `${c.title}：${ch.before.label}`, { cls: 'cmp-before' })}
        <span class="cmp-tag is-before">${esc(ch.before.label)}</span>
        <span class="cmp-tag is-after">${esc(ch.after.label)}</span>
        <span class="cmp-handle" aria-hidden="true">${arrow('prev')}${arrow('next')}</span>
        <input type="range" min="0" max="100" value="50" step="0.1" aria-label="拖动分隔线，对比${esc(ch.before.label)}与${esc(ch.after.label)}">
      </div>
      <div class="compare-text">
        <p class="body"><strong>${esc(ch.before.label)}</strong>${esc(ch.before.text)}</p>
        <p class="body"><strong>${esc(ch.after.label)}</strong>${esc(ch.after.text)}</p>
      </div>
    </div>
    ${notesGrid(ch.items)}
    ${sourceNote(ch.source)}
  </section>`;
}

function video(ch) {
  if (!has(ch.src)) return '';
  return `<section class="chapter" aria-labelledby="${ch.id}-title">
    ${chapterHead(ch)}
    <figure class="video"><video controls preload="none" playsinline${ch.poster && has(ch.poster) ? ` poster="${ch.poster}"` : ''}><source src="${ch.src}" type="video/mp4"></video></figure>
    ${sourceNote(ch.source)}
  </section>`;
}

function flow(ch) {
  return `<section class="chapter" aria-labelledby="${ch.id}-title">
    ${chapterHead(ch)}
    <figure class="flow"><div class="flow-scroll" tabindex="0">${flowSvg(ch)}</div><figcaption>${flowLegend(ch)}</figcaption></figure>
  </section>`;
}

function notes(ch) {
  return `<section class="chapter" aria-labelledby="${ch.id}-title">
    ${chapterHead(ch)}
    ${notesGrid(ch.items)}
  </section>`;
}

export function caseSlugs() {
  return cases.map((c) => c.slug);
}

export function caseTitle(slug) {
  const c = cases.find((x) => x.slug === slug);
  return `${c.title}，${site.name}的作品集`;
}

export function renderCase(slug) {
  const index = cases.findIndex((x) => x.slug === slug);
  const c = cases[index];
  const next = cases[(index + 1) % cases.length];
  const chapters = c.chapters.map((ch) => ({ player, compare, video, notes, flow })[ch.type](ch, c)).join('\n');
  const meta = c.hero.meta.map((m) => `<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join('');
  return `${nav()}
<main id="main" class="case">
  <header class="case-hero">
    <p class="crumb small"><a href="/#works">全部作品</a><span>${c.number} / ${String(cases.length).padStart(2, '0')}</span></p>
    <p class="label">${esc(c.tag)}</p>
    <h1 class="heading-lg">${esc(c.hero.title)}</h1>
    <p class="lead">${esc(c.hero.lead)}</p>
    <div class="case-facts">
      <p class="question">${esc(c.hero.question)}</p>
      <dl class="meta">${meta}</dl>
      ${c.demo ? `<p class="actions"><a class="pill" href="${c.demo}" target="_blank" rel="noopener noreferrer">打开 ${esc(c.demoLabel)}</a></p>` : ''}
    </div>
    <figure class="case-cover" style="view-transition-name:cover-${c.slug}">
      ${pic(c.cover.src, c.cover.alt, { eager: true })}
      ${c.hero.note ? `<figcaption class="small">${esc(c.hero.note)}</figcaption>` : ''}
    </figure>
  </header>
  ${chapters}
  <nav class="next" aria-label="下一个作品">
    <p class="label">下一个</p>
    <a class="display" href="/cases/${next.slug}/">${esc(next.title)}</a>
    <p class="body">${esc(next.summary)}</p>
  </nav>
</main>
${footer()}`;
}

export const meta = { title: `${site.name}，AI 交互设计作品集`, description: site.description };
