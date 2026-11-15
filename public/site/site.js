// 网页版作品集的交互：首屏星群、步骤播放器、前后对比、大图查看。没有外部依赖。
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ———————————————————— 星群 ———————————————————— */
  function initSky(root) {
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const links = [...root.querySelectorAll('[data-emblem]')];
    const caption = root.querySelector('[data-sky-caption]');
    const N = innerWidth < 700 ? 900 : 1500;
    const colors = ['#8052ff', '#8052ff', '#a98bff', '#ffb829', '#ffb829', '#15846e', '#3fb6a0', '#e85fb4', '#4f8dff', '#ffffff', '#bdbdbd'];

    let seed = 2707;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

    // 默认形态：一座木构架的骨架。柱、梁、椽、脊檩和斜撑，沿杆件撒点。
    function frameShape() {
      const segs = [];
      const zs = [-0.7, 0, 0.7];
      const X = 0.86, base = 0.62, eave = -0.04, ridge = -0.72;
      for (const z of zs) {
        segs.push([[-X, base, z], [-X, eave, z]], [[X, base, z], [X, eave, z]]);
        segs.push([[-X, eave, z], [X, eave, z]]);
        segs.push([[-X - 0.12, eave + 0.09, z], [0, ridge, z]], [[X + 0.12, eave + 0.09, z], [0, ridge, z]]);
        segs.push([[0, eave, z], [0, ridge, z]]);
        segs.push([[-X, 0.2, z], [-X + 0.3, eave, z]], [[X, 0.2, z], [X - 0.3, eave, z]]);
      }
      const z0 = zs[0], z1 = zs[zs.length - 1];
      segs.push([[0, ridge, z0 - 0.08], [0, ridge, z1 + 0.08]]);
      for (const sx of [-1, 1]) {
        segs.push([[sx * X, eave, z0], [sx * X, eave, z1]], [[sx * X, base, z0], [sx * X, base, z1]]);
        segs.push([[sx * 0.45, -0.37, z0], [sx * 0.45, -0.37, z1]]);
      }
      segs.push([[-X, base, z0], [X, base, z0]], [[-X, base, z1], [X, base, z1]]);
      const len = (s) => Math.hypot(s[1][0] - s[0][0], s[1][1] - s[0][1], s[1][2] - s[0][2]);
      const total = segs.reduce((a, s) => a + len(s), 0);
      const pts = [];
      for (const s of segs) {
        const n = Math.round((len(s) / total) * N);
        for (let i = 0; i < n; i++) {
          const t = rnd(), j = 0.016;
          pts.push([s[0][0] + (s[1][0] - s[0][0]) * t + (rnd() - 0.5) * j, s[0][1] + (s[1][1] - s[0][1]) * t + (rnd() - 0.5) * j, s[0][2] + (s[1][2] - s[0][2]) * t + (rnd() - 0.5) * j]);
        }
      }
      return fit(pts);
    }

    // 作品形态：在离屏画布上画线稿，再从亮起的像素里取点。
    function drawn(draw) {
      const S = 220, c = document.createElement('canvas');
      c.width = c.height = S;
      const g = c.getContext('2d');
      g.strokeStyle = g.fillStyle = '#fff';
      g.lineWidth = 6; g.lineCap = g.lineJoin = 'round';
      draw(g, S);
      const data = g.getImageData(0, 0, S, S).data, lit = [];
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (data[(y * S + x) * 4 + 3] > 90) lit.push([x, y]);
      const pts = [];
      for (let i = 0; i < N; i++) {
        const p = lit[(rnd() * lit.length) | 0];
        pts.push([((p[0] + rnd()) / S) * 2 - 1, ((p[1] + rnd()) / S) * 2 - 1, (rnd() - 0.5) * 0.3]);
      }
      return pts;
    }
    const line = (g, pts, close) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath(); g.stroke(); };

    const shapes = {
      frame: frameShape(),
      // 理想之家：一间敞开的等轴测房间，窗、一盆植物。
      room: drawn((g) => {
        line(g, [[110, 196], [22, 146], [110, 96], [198, 146]], true);
        line(g, [[22, 146], [22, 58], [110, 8], [110, 96]]);
        line(g, [[110, 8], [198, 58], [198, 146]]);
        line(g, [[48, 98], [48, 66], [82, 47], [82, 79]], true);
        line(g, [[136, 47], [136, 79], [170, 98], [170, 66]], true);
        g.fillRect(104, 130, 12, 26);
        g.beginPath(); g.arc(110, 120, 15, 0, 7); g.fill();
        line(g, [[62, 150], [96, 169], [118, 156]]);
      }),
      // TasteTwin：一只碗，三缕热气，一双筷子。
      bowl: drawn((g) => {
        g.beginPath(); g.ellipse(110, 112, 84, 20, 0, 0, 7); g.stroke();
        g.beginPath(); g.moveTo(26, 114); g.bezierCurveTo(30, 196, 190, 196, 194, 114); g.stroke();
        line(g, [[80, 192], [140, 192]]);
        for (const x of [80, 110, 140]) { g.beginPath(); g.moveTo(x, 84); g.bezierCurveTo(x - 14, 66, x + 14, 52, x, 30); g.stroke(); }
        line(g, [[150, 104], [208, 40]]); line(g, [[164, 108], [216, 52]]);
      }),
      // 围场智析：一台赛车的侧影。
      car: drawn((g) => {
        g.lineWidth = 7;
        g.beginPath(); g.arc(48, 150, 20, 0, 7); g.stroke();
        g.beginPath(); g.arc(172, 150, 20, 0, 7); g.stroke();
        line(g, [[2, 158], [24, 158]]);
        line(g, [[76, 160], [144, 160]]);
        line(g, [[4, 148], [32, 138], [78, 132], [100, 116], [122, 116]]);
        line(g, [[122, 116], [130, 96], [142, 96], [152, 126], [198, 132]]);
        line(g, [[190, 98], [216, 98]]); line(g, [[208, 98], [208, 134]]);
        line(g, [[196, 158], [214, 158]]);
      }),
      // 桌面平行宇宙：显示器、桌面、键盘和一只杯子。
      desk: drawn((g) => {
        line(g, [[46, 26], [174, 26], [174, 112], [46, 112]], true);
        line(g, [[110, 112], [110, 138]]); line(g, [[84, 140], [136, 140]]);
        line(g, [[8, 164], [212, 164]]);
        line(g, [[58, 180], [150, 180], [158, 198], [50, 198]], true);
        line(g, [[176, 132], [176, 158], [198, 158], [198, 132]], true);
        g.beginPath(); g.arc(204, 146, 8, -1.3, 1.3); g.stroke();
        g.beginPath(); g.arc(110, 68, 16, 0, 7); g.stroke();
      }),
    };

    function fit(pts) {
      let m = 0;
      for (const p of pts) m = Math.max(m, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
      while (pts.length < N) pts.push(pts[(rnd() * pts.length) | 0].slice());
      pts.length = N;
      return pts.map((p) => [p[0] / m, p[1] / m, p[2] / m]);
    }

    const P = Array.from({ length: N }, (_, i) => {
      const s = shapes.frame[i];
      return { x: s[0] * 2.4, y: s[1] * 2.4, z: s[2] * 2.4, vx: 0, vy: 0, vz: 0, ox: 0, oy: 0, size: 1.6 + rnd() * 3.2, rot: rnd() * 6.283, spin: (rnd() - 0.5) * 0.012, color: (rnd() * colors.length) | 0, phase: rnd() * 6.283 };
    });
    const ambient = Array.from({ length: 70 }, () => ({ x: rnd(), y: rnd(), size: 1.5 + rnd() * 2.5, rot: rnd() * 6.283, color: (rnd() * 6) | 0, drift: 0.2 + rnd() * 0.6 }));

    let current = 'frame', w = 0, h = 0, dpr = 1, visible = true, raf = 0, t0 = performance.now();
    const pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      if (reduce) draw(performance.now(), true);
    }

    function setShape(name, kick = true) {
      if (!shapes[name] || name === current) return;
      current = name;
      if (kick && !reduce) for (const p of P) { p.vx += (rnd() - 0.5) * 0.05; p.vy += (rnd() - 0.5) * 0.05; p.vz += (rnd() - 0.5) * 0.05; }
      if (reduce) draw(performance.now(), true);
    }

    function draw(now, snap) {
      const t = (now - t0) / 1000;
      const target = shapes[current];
      const yaw = current === 'frame' ? 0.72 + Math.sin(t * 0.28) * 0.5 : Math.sin(t * 0.5) * 0.32;
      const pitch = current === 'frame' ? -0.2 : -0.06;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const scale = Math.min(w, h) * (current === 'frame' ? 0.33 : 0.41);
      const cx0 = w * 0.5, cy0 = h * 0.5;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      // 环境里零散的点
      const buckets = colors.map(() => [[], []]);
      for (const a of ambient) {
        const x = ((a.x + t * 0.004 * a.drift) % 1) * w, y = a.y * h;
        buckets[a.color][0].push(x, y, a.size, a.rot + t * 0.1, 0);
      }
      for (let i = 0; i < N; i++) {
        const p = P[i], s = target[i];
        if (snap) { p.x = s[0]; p.y = s[1]; p.z = s[2]; p.ox = p.oy = 0; }
        else {
          p.vx = (p.vx + (s[0] - p.x) * 0.018) * 0.9; p.vy = (p.vy + (s[1] - p.y) * 0.018) * 0.9; p.vz = (p.vz + (s[2] - p.z) * 0.018) * 0.9;
          p.x += p.vx; p.y += p.vy; p.z += p.vz; p.rot += p.spin;
        }
        const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cp - z1 * sp, z2 = p.y * sp + z1 * cp;
        const k = 1 / (1 + z2 * 0.34);
        let sx = cx0 + x1 * scale * k, sy2 = cy0 + y2 * scale * k;
        if (pointer.active && !snap) {
          const dx = sx + p.ox - pointer.x, dy = sy2 + p.oy - pointer.y, d2 = dx * dx + dy * dy, R = 120;
          if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 5; p.ox += (dx / d) * f; p.oy += (dy / d) * f; }
        }
        p.ox *= 0.92; p.oy *= 0.92;
        sx += p.ox; sy2 += p.oy;
        const twinkle = 0.75 + 0.25 * Math.sin(t * 1.3 + p.phase);
        buckets[p.color][z2 > 0 ? 0 : 1].push(sx, sy2, p.size * k, p.rot, twinkle);
      }
      for (let c = 0; c < colors.length; c++) {
        for (let near = 0; near < 2; near++) {
          const b = buckets[c][near];
          if (!b.length) continue;
          ctx.strokeStyle = colors[c];
          ctx.globalAlpha = near ? 0.92 : 0.42;
          ctx.beginPath();
          for (let i = 0; i < b.length; i += 5) {
            const x = b[i], y = b[i + 1], r = b[i + 2], a = b[i + 3];
            for (let v = 0; v < 3; v++) {
              const ang = a + v * 2.0944, px = x + Math.cos(ang) * r, py = y + Math.sin(ang) * r;
              v ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
            }
            ctx.closePath();
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop(now) { draw(now, false); raf = visible ? requestAnimationFrame(loop) : 0; }
    function start() { if (!reduce && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    // 指针让星群避让
    addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
      pointer.active = pointer.x > -80 && pointer.y > -80 && pointer.x < w + 80 && pointer.y < h + 80;
    }, { passive: true });
    addEventListener('pointerleave', () => (pointer.active = false));

    // 作品入口：指向哪个，星群就变成哪个；没人碰的时候自己轮换
    let held = false, cycle = 0, timer = 0;
    const order = ['frame', ...links.map((l) => l.dataset.emblem)];
    function show(name) {
      setShape(name);
      links.forEach((l) => l.classList.toggle('is-on', l.dataset.emblem === name));
      const link = links.find((l) => l.dataset.emblem === name);
      caption.textContent = link ? link.dataset.summary : caption.dataset.default;
    }
    function schedule() {
      clearTimeout(timer);
      if (reduce || held) return;
      timer = setTimeout(() => { cycle = (cycle + 1) % order.length; show(order[cycle]); schedule(); }, order[cycle] === 'frame' ? 5200 : 3800);
    }
    for (const l of links) {
      const on = () => { held = true; clearTimeout(timer); cycle = order.indexOf(l.dataset.emblem); show(l.dataset.emblem); };
      const off = () => { held = false; schedule(); };
      l.addEventListener('pointerenter', on); l.addEventListener('focus', on);
      l.addEventListener('pointerleave', off); l.addEventListener('blur', off);
    }

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? (start(), schedule()) : (stop(), clearTimeout(timer)); }).observe(root);
    document.addEventListener('visibilitychange', () => (document.hidden ? (stop(), clearTimeout(timer)) : (start(), schedule())));
    root.skyShow = (name) => { held = true; clearTimeout(timer); show(name); };
    resize();
    if (reduce) draw(performance.now(), true); else { start(); schedule(); }
  }

  /* ———————————————————— 全页背景 ———————————————————— */
  // 稀疏的小三角铺满整页：平时很暗，随滚动按远近错位；指针附近的会亮成彩色、连成线，点一下会被推开。
  function initField() {
    const canvas = document.createElement('canvas');
    canvas.className = 'field';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#8052ff', '#a98bff', '#ffb829', '#3fb6a0', '#e85fb4', '#4f8dff', '#ffffff'];
    let seed = 9157;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const R = 250, LINK = 150, PAD = 60;
    let w = 0, h = 0, dpr = 1, P = [], raf = 0, last = 0;
    const pointer = { x: -9999, y: -9999, seen: -1e9 };
    const glow = { x: 0, y: 0, a: 0 };

    function build() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      const n = Math.round(Math.min(340, Math.max(90, (w * h) / 5600)));
      seed = 9157;
      P = Array.from({ length: n }, () => ({
        x: rnd() * w, y: rnd() * (h + PAD * 2), z: 0.25 + rnd() * 0.75, size: 3 + rnd() * 6,
        rot: rnd() * 6.283, spin: (rnd() - 0.5) * 0.006, drift: (rnd() - 0.5) * 6, color: colors[(rnd() * colors.length) | 0],
        ox: 0, oy: 0, vx: 0, vy: 0, lit: 0, sx: 0, sy: 0,
      }));
      if (reduce) draw(0);
    }

    function draw(now) {
      const t = now / 1000, span = h + PAD * 2, sy = scrollY;
      const active = now - pointer.seen < 2200;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // 指针周围一圈很淡的紫光，跟得稍慢一点
      if (!reduce) {
        if (glow.a < 0.01) { glow.x = pointer.x; glow.y = pointer.y; }
        glow.x += (pointer.x - glow.x) * 0.08; glow.y += (pointer.y - glow.y) * 0.08;
        glow.a += ((active ? 1 : 0) - glow.a) * 0.05;
        if (glow.a > 0.01) {
          const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 420);
          g.addColorStop(0, `rgba(128, 82, 255, ${0.16 * glow.a})`);
          g.addColorStop(0.5, `rgba(128, 82, 255, ${0.05 * glow.a})`);
          g.addColorStop(1, 'rgba(128, 82, 255, 0)');
          ctx.fillStyle = g;
          ctx.fillRect(glow.x - 420, glow.y - 420, 840, 840);
        }
      }
      ctx.lineWidth = 1;
      const litOnes = [];
      for (const p of P) {
        // 远的走得慢，近的走得快
        let y = (p.y - sy * p.z * 0.32 + Math.sin(t * 0.25 + p.rot) * p.drift) % span;
        if (y < 0) y += span;
        y -= PAD;
        const x = p.x + Math.cos(t * 0.2 + p.rot) * p.drift;
        const dx = x + p.ox - pointer.x, dy = y + p.oy - pointer.y, d = Math.hypot(dx, dy);
        const target = active && d < R ? 1 - d / R : 0;
        p.lit += (target - p.lit) * 0.1;
        p.vx *= 0.9; p.vy *= 0.9;
        p.ox = (p.ox + p.vx) * 0.965; p.oy = (p.oy + p.vy) * 0.965;
        p.rot += p.spin * (1 + p.lit * 8);
        p.sx = x + p.ox; p.sy = y + p.oy;
        const r = p.size * p.z * (1 + p.lit * 0.9);
        ctx.globalAlpha = Math.min(1, 0.14 + p.z * 0.3 + p.lit * 0.8);
        ctx.strokeStyle = p.lit > 0.04 ? p.color : '#9a9a9a';
        ctx.beginPath();
        for (let v = 0; v < 3; v++) {
          const a = p.rot + v * 2.0944, px = p.sx + Math.cos(a) * r, py = p.sy + Math.sin(a) * r;
          v ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
        if (p.lit > 0.18) litOnes.push(p);
      }
      // 亮起来的几颗之间连线，像临时画出的一个星座
      ctx.strokeStyle = '#ffffff';
      for (let i = 0; i < litOnes.length; i++) for (let j = i + 1; j < litOnes.length; j++) {
        const a = litOnes[i], b = litOnes[j], d = Math.hypot(a.sx - b.sx, a.sy - b.sy);
        if (d > LINK) continue;
        ctx.globalAlpha = Math.min(a.lit, b.lit) * (1 - d / LINK) * 0.7;
        ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function loop(now) { last = now; draw(now); raf = requestAnimationFrame(loop); }
    addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = performance.now(); }, { passive: true });
    addEventListener('pointerdown', (e) => {
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = performance.now();
      if (reduce) return;
      for (const p of P) {
        const dx = p.sx - e.clientX, dy = p.sy - e.clientY, d = Math.hypot(dx, dy) || 1;
        if (d < 260) { const f = (1 - d / 260) * 7; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => (pointer.seen = -1e9));
    addEventListener('resize', build);
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); raf = 0; if (!document.hidden && !reduce) raf = requestAnimationFrame(loop); });
    if (reduce) addEventListener('scroll', () => draw(0), { passive: true });
    build();
    if (!reduce) raf = requestAnimationFrame(loop);
  }

  /* ———————————————————— 步骤播放器 ———————————————————— */
  function initPlayer(root) {
    const steps = JSON.parse(root.dataset.steps);
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const frames = [...root.querySelectorAll('[data-frame]')];
    const text = root.querySelector('[data-step-text]');
    const count = root.querySelector('[data-count]');
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const stage = root.querySelector('.stage');
    const statEls = [...root.querySelectorAll('[data-stat]')];
    const list = root.querySelector('.steps');
    let index = 0;
    const fmt = (n) => Math.round(n).toLocaleString('en-US');

    function tween(el, from, to) {
      if (from === to) return;
      const dd = el.closest('dd');
      dd.classList.add('is-changed');
      setTimeout(() => dd.classList.remove('is-changed'), 900);
      if (reduce) { el.textContent = fmt(to); return; }
      const start = performance.now(), dur = 600;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    function go(i, focus) {
      i = Math.max(0, Math.min(steps.length - 1, i));
      if (i === index) return;
      const before = steps[index], after = steps[i];
      index = i;
      tabs.forEach((t, n) => { t.setAttribute('aria-selected', n === i); t.tabIndex = n === i ? 0 : -1; });
      frames.forEach((f, n) => f.classList.toggle('is-active', n === i));
      const img = frames[i].querySelector('img');
      if (img) img.loading = 'eager';
      const ahead = frames[i + 1]?.querySelector('img');
      if (ahead) ahead.loading = 'eager';
      text.textContent = after.text;
      stage.setAttribute('aria-labelledby', tabs[i].id);
      if (count) count.textContent = `${i + 1} / ${steps.length}`;
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === steps.length - 1;
      if (after.stats) statEls.forEach((el, n) => tween(el, before.stats ? before.stats[n] : after.stats[n], after.stats[n]));
      if (focus) tabs[i].focus();
      // 步骤条横向溢出时，只滚动步骤条本身，不带着整页跳
      if (list && list.scrollWidth > list.clientWidth) {
        const lr = list.getBoundingClientRect(), tr = tabs[i].getBoundingClientRect();
        list.scrollTo({ left: list.scrollLeft + tr.left - lr.left - (lr.width - tr.width) / 2, behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    // 自动播放：像看一段录屏一样把步骤走一遍。任何手动操作都会停下它。
    const play = root.querySelector('[data-play]');
    const playLabel = root.querySelector('[data-play-label]');
    const STEP = 2600;
    let timer = 0;
    const playing = () => timer !== 0;
    function tick() {
      stage.classList.remove('is-playing');
      void stage.offsetWidth;
      stage.classList.add('is-playing');
      timer = setTimeout(() => {
        if (index >= steps.length - 1) return stop();
        go(index + 1);
        tick();
      }, STEP);
    }
    function start() {
      if (!play || playing()) return;
      if (index >= steps.length - 1) go(0);
      stage.style.setProperty('--step-ms', STEP + 'ms');
      play.setAttribute('aria-pressed', 'true');
      playLabel.textContent = '暂停';
      tick();
    }
    function stop() {
      if (!play) return;
      clearTimeout(timer); timer = 0;
      stage.classList.remove('is-playing');
      play.setAttribute('aria-pressed', 'false');
      playLabel.textContent = index >= steps.length - 1 ? '重新播放' : '自动播放';
    }
    play?.addEventListener('click', () => (playing() ? stop() : start()));
    if (play) new IntersectionObserver(([e]) => { if (!e.isIntersecting && playing()) stop(); }).observe(stage);
    const manual = (fn) => (...a) => { if (playing()) stop(); fn(...a); if (playLabel && !playing()) playLabel.textContent = index >= steps.length - 1 ? '重新播放' : '自动播放'; };

    tabs.forEach((t, n) => t.addEventListener('click', manual(() => go(n))));
    prev?.addEventListener('click', manual(() => go(index - 1)));
    next?.addEventListener('click', manual(() => go(index + 1)));
    root.addEventListener('keydown', (e) => {
      if (e.target.closest('[data-zoom]')) return;
      if (playing() && /^(Arrow|Home|End)/.test(e.key)) stop();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(index + 1, e.target.matches('[role="tab"]')); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(index - 1, e.target.matches('[role="tab"]')); }
      else if (e.key === 'Home') { e.preventDefault(); go(0, true); }
      else if (e.key === 'End') { e.preventDefault(); go(steps.length - 1, true); }
    });
    // 在画面上左右滑动切换
    let sx = null;
    stage.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
    stage.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 44) { if (playing()) stop(); go(index + (e.clientX < sx ? 1 : -1)); } sx = null; });
    // 点画面本身进入下一步（鼠标）
    stage.addEventListener('click', (e) => { if (e.target.closest('[data-zoom]')) return; if (e.detail && index < steps.length - 1 && !root.classList.contains('is-switch')) { if (playing()) stop(); go(index + 1); } });

    root.querySelector('[data-zoom]')?.addEventListener('click', () => {
      const img = frames[index].querySelector('img');
      openZoom(img.currentSrc || img.src, img.alt);
    });
  }

  /* ———————————————————— 前后对比 ———————————————————— */
  function initCompare(root) {
    const stage = root.querySelector('.compare-stage');
    const input = root.querySelector('input');
    const set = () => stage.style.setProperty('--pos', input.value + '%');
    input.addEventListener('input', set);
    // 键盘一次走 5%，拖动时保持细腻
    input.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 }[e.key];
      if (!d) return;
      e.preventDefault();
      input.value = Math.max(0, Math.min(100, Number(input.value) + d));
      set();
    });
    set();
  }

  /* ———————————————————— 大图 ———————————————————— */
  const dialog = document.querySelector('.zoom');
  let opener = null;
  function openZoom(src, alt) {
    if (!dialog) return;
    opener = document.activeElement;
    const img = new Image();
    img.src = src; img.alt = alt;
    dialog.querySelector('.zoom-stage').replaceChildren(img);
    dialog.showModal();
  }
  dialog?.addEventListener('click', (e) => { if (e.target === dialog || e.target.classList.contains('zoom-stage')) dialog.close(); });
  dialog?.addEventListener('close', () => { dialog.querySelector('.zoom-stage').replaceChildren(); opener?.focus(); });

  initField();
  document.querySelectorAll('[data-sky]').forEach(initSky);
  document.querySelectorAll('[data-player]').forEach(initPlayer);
  document.querySelectorAll('[data-compare]').forEach(initCompare);
})();
