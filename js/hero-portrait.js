/* js/hero-portrait.js */
/* Morph between frames with point matching (A -> nearest B), ~1.3s transition.
   - No ribbons
   - Deterministic glyphs per point key (stable)
*/
(function () {
  function initHeroPortrait() {
    const wrap = document.querySelector('.hero__portrait');
    if (!wrap) return;

    const canvas = wrap.querySelector('.hero__canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const seqAttr = wrap.dataset.seq || '';
    const seq = seqAttr.split(',').map(s => s.trim()).filter(Boolean);

    const single = wrap.dataset.src ? [wrap.dataset.src.trim()] : [];
    const sources = seq.length ? seq : single;
    if (!sources.length) return;

    const GLYPHS = ['+', '·', 'z', 'Z', '■', '□'];

    const cfg = {
      grid: 5,
      fontBase: 11,
      jitter: 0.28,
      maxPoints: 6500,
      edgeThreshold: 16,
      shadeMin: 70,
      shadeMax: 220,

      transitionMs: 1300, // <-- как просил
      holdMs: 380,

      // matching quality/speed
      matchCell: 32,      // размер ячейки для поиска ближайших
      matchMaxDist: 80,   // максимум расстояния для "связки" A->B

      // визуал
      alphaBoost: 1.35,   // сделать темнее (увеличить альфу)
      fill: '#000'
    };

    let W = 0, H = 0, DPR = 1;

    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d', { willReadFrequently: true });

    const imgs = sources.map(() => new Image());
    let readyCount = 0;

    // points cache per frame: array of points
    const frames = []; // frames[i] = { pts: Point[] }
    // transition cache between (a,b): morph list
    let morph = []; // array of MorphPoint
    let currentIdx = 0;
    let nextIdx = sources.length > 1 ? 1 : 0;

    // phase control
    let phase = 'hold'; // 'hold' | 'morph'
    let phaseStart = 0;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function hash01(str) {
      // deterministic 0..1
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return (h >>> 0) / 4294967295;
    }

    function resize() {
      const r = wrap.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width));
      H = Math.max(1, Math.floor(r.height));
      DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      off.width = W;
      off.height = H;

      if (readyCount === imgs.length) {
        buildFrame(currentIdx);
        buildFrame(nextIdx);
        buildMorph(currentIdx, nextIdx);
      }
    }

    function drawCover(img) {
      offCtx.clearRect(0, 0, W, H);

      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;

      const s = Math.max(W / iw, H / ih);
      const dw = iw * s;
      const dh = ih * s;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;

      offCtx.filter = 'blur(0.8px)';
      offCtx.drawImage(img, dx, dy, dw, dh);
      offCtx.filter = 'none';
    }

    function extractPoints(img) {
      drawCover(img);

      const data = offCtx.getImageData(0, 0, W, H).data;
      const step = cfg.grid;

      const lum = (x, y) => {
        const i = (y * W + x) * 4;
        return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      };

      const pts = [];
      for (let y = step; y < H - step; y += step) {
        for (let x = step; x < W - step; x += step) {
          const l = lum(x, y);
          if (l < cfg.shadeMin || l > cfg.shadeMax) continue;

          const edge =
            Math.abs(l - lum(x + step, y)) +
            Math.abs(l - lum(x, y + step));

          if (edge > cfg.edgeThreshold) {
            const p = (255 - l) / 255;

            // key based on grid coord => stable across frames (but matching will move)
            const key = x + '_' + y;

            pts.push({
              x, y,
              a: 0.22 + p * 0.62,
              s: cfg.fontBase + p * 3,
              g: GLYPHS[(hash01(key) * GLYPHS.length) | 0],
              seed: hash01(key + '_n') * 1000,
              // keep key for deterministic noise
              key
            });

            if (pts.length >= cfg.maxPoints) break;
          }
        }
        if (pts.length >= cfg.maxPoints) break;
      }

      return pts;
    }

    function buildFrame(idx) {
      const img = imgs[idx];
      if (!img || !img.complete) return;
      frames[idx] = { pts: extractPoints(img) };
    }

    // spatial grid for faster nearest-neighbor matching
    function buildSpatialIndex(pts) {
      const cell = cfg.matchCell;
      const cols = Math.ceil(W / cell);
      const rows = Math.ceil(H / cell);
      const buckets = new Array(cols * rows);
      for (let i = 0; i < buckets.length; i++) buckets[i] = [];

      const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const cx = clamp((p.x / cell) | 0, 0, cols - 1);
        const cy = clamp((p.y / cell) | 0, 0, rows - 1);
        buckets[cy * cols + cx].push(i);
      }

      return { cell, cols, rows, buckets };
    }

    function nearestUnmatched(idxB, pA, usedB) {
      // search around pA in B's spatial grid
      const { cell, cols, rows, buckets, ptsB } = idxB;
      const cx = Math.max(0, Math.min(cols - 1, (pA.x / cell) | 0));
      const cy = Math.max(0, Math.min(rows - 1, (pA.y / cell) | 0));

      const maxR = Math.ceil(cfg.matchMaxDist / cell);
      let best = -1;
      let bestD2 = cfg.matchMaxDist * cfg.matchMaxDist;

      for (let r = 0; r <= maxR; r++) {
        // ring scan: (cx-r..cx+r, cy-r..cy+r)
        const x0 = Math.max(0, cx - r), x1 = Math.min(cols - 1, cx + r);
        const y0 = Math.max(0, cy - r), y1 = Math.min(rows - 1, cy + r);

        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const bucket = buckets[y * cols + x];
            for (let k = 0; k < bucket.length; k++) {
              const bi = bucket[k];
              if (usedB[bi]) continue;
              const pB = ptsB[bi];
              const dx = pB.x - pA.x;
              const dy = pB.y - pA.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < bestD2) {
                bestD2 = d2;
                best = bi;
              }
            }
          }
        }

        // if we already found something very close, can early-exit
        if (best !== -1 && bestD2 < (cell * cell)) break;
      }

      return best;
    }

    function buildMorph(aIdx, bIdx) {
      const A = frames[aIdx]?.pts || [];
      const B = frames[bIdx]?.pts || [];

      // build spatial index for B
      const idxB = buildSpatialIndex(B);
      idxB.ptsB = B;

      const usedB = new Uint8Array(B.length);
      const out = [];

      // 1) match each A -> nearest B
      for (let i = 0; i < A.length; i++) {
        const a = A[i];
        const bi = nearestUnmatched(idxB, a, usedB);
        if (bi !== -1) {
          usedB[bi] = 1;
          const b = B[bi];

          out.push({
            ax: a.x, ay: a.y, aa: a.a, as: a.s, ag: a.g,
            bx: b.x, by: b.y, ba: b.a, bs: b.s, bg: b.g,
            seed: a.seed,
            key: a.key
          });
        } else {
          // no pair: fade-out and drift
          const jx = (hash01(a.key + '_ox') - 0.5) * cfg.grid * 10;
          const jy = (hash01(a.key + '_oy') - 0.5) * cfg.grid * 10;

          out.push({
            ax: a.x, ay: a.y, aa: a.a, as: a.s, ag: a.g,
            bx: a.x + jx, by: a.y + jy, ba: 0, bs: a.s * 0.9, bg: a.g,
            seed: a.seed,
            key: a.key
          });
        }
      }

      // 2) remaining B (new points): fade-in from offset
      for (let j = 0; j < B.length; j++) {
        if (usedB[j]) continue;
        const b = B[j];

        const key = 'b_' + b.x + '_' + b.y;
        const jx = (hash01(key + '_ix') - 0.5) * cfg.grid * 10;
        const jy = (hash01(key + '_iy') - 0.5) * cfg.grid * 10;

        out.push({
          ax: b.x + jx, ay: b.y + jy, aa: 0, as: b.s * 0.9, ag: b.g,
          bx: b.x, by: b.y, ba: b.a, bs: b.s, bg: b.g,
          seed: b.seed,
          key
        });
      }

      morph = out;
    }

    function drawMorph(tRaw, ts) {
      const t = easeInOutCubic(tRaw);

      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = cfg.fill;

      for (let i = 0; i < morph.length; i++) {
        const m = morph[i];

        const x = m.ax + (m.bx - m.ax) * t;
        const y = m.ay + (m.by - m.ay) * t;

        let a = m.aa + (m.ba - m.aa) * t;
        a = Math.min(1, a * cfg.alphaBoost);
        if (a < 0.02) continue;

        const s = m.as + (m.bs - m.as) * t;

        const n = m.seed + (ts * 0.001);
        const wobX = Math.sin(n) * cfg.jitter;
        const wobY = Math.cos(n) * cfg.jitter;

        // glyph: keep A first, then switch to B after середины
        const g = (t < 0.55 ? m.ag : m.bg);

        ctx.globalAlpha = a;
        ctx.font = `${s}px monospace`;
        ctx.fillText(g, x + wobX, y + wobY);
      }

      ctx.globalAlpha = 1;
    }

    function tick(ts) {
      if (!phaseStart) phaseStart = ts;

      if (phase === 'hold') {
        // show "current" as morph t=0.. but we can just draw from frame itself:
        // reuse morph list from current->current (or just draw current frame points)
        // Here: draw stable current using "morph" built for current->next at t=0 (it uses A positions).
        drawMorph(0, ts);

        if (sources.length > 1 && (ts - phaseStart) >= cfg.holdMs) {
          phase = 'morph';
          phaseStart = ts;

          // ensure next exists & build morph current->next
          buildFrame(nextIdx);
          buildMorph(currentIdx, nextIdx);
        }
      } else {
        const t = Math.min(1, (ts - phaseStart) / cfg.transitionMs);
        drawMorph(t, ts);

        if (t >= 1) {
          // commit transition
          currentIdx = nextIdx;
          nextIdx = (nextIdx + 1) % imgs.length;

          phase = 'hold';
          phaseStart = ts;

          // prebuild next frame + morph for snappy hold rendering
          buildFrame(nextIdx);
          buildMorph(currentIdx, nextIdx);
        }
      }

      requestAnimationFrame(tick);
    }

    function start() {
      resize();

      buildFrame(0);
      if (imgs.length > 1) buildFrame(1);

      currentIdx = 0;
      nextIdx = imgs.length > 1 ? 1 : 0;

      // build initial morph current->next for hold rendering
      buildMorph(currentIdx, nextIdx);

      phase = 'hold';
      phaseStart = 0;

      requestAnimationFrame(tick);
      new ResizeObserver(resize).observe(wrap);
    }

    imgs.forEach((im, i) => {
      im.decoding = 'async';
      im.loading = 'eager';
      im.onload = () => {
        readyCount++;
        if (readyCount === imgs.length) start();
      };
      im.onerror = () => console.error('portrait frame load error:', sources[i]);
      im.src = sources[i];
    });
  }

  window.initHeroPortrait = initHeroPortrait;
})();