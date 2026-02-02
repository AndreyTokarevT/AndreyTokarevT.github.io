/* js/main.js */

/* ─── Fetch helpers ─── */
async function loadText(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error('load error:', url);
    return '';
  }
  return res.text();
}

async function loadJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error('json error:', url);
    return null;
  }
  return res.json();
}

/* ─── Mount blocks ─── */
async function mount(id, file) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = await loadText(file);
}

/* ─── Scroll-entrance animations ─── */
function initScrollAnims() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));
}

/* ─── Header: scroll shadow + active nav link ─── */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  const links = header.querySelectorAll('.header__link');
  const sections = [...document.querySelectorAll('section[id]')];

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.remove('active'));
      const match = [...links].find(l => l.getAttribute('href') === '#' + e.target.id);
      if (match) match.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => obs.observe(s));
}

/* ─── Materials tabs filter ─── */
function initMaterialsTabs() {
  const tabs = document.querySelectorAll('.materials__tab');
  const cards = document.querySelectorAll('.materials__card');
  if (!tabs.length) return;

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab || 'all';

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      cards.forEach(card => {
        const show = tab === 'all' || card.dataset.type === tab;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.classList.remove('visible');
          requestAnimationFrame(() => card.classList.add('visible'));
        }
      });
    });
  });
}

/* ─── Results carousels ─── */
function scrollCarousel(key, dir) {
  const track = document.querySelector(`.results__carousel[data-carousel="${key}"]`);
  if (!track) return;

  const slide = track.querySelector('.results__slide');
  const step = slide ? slide.getBoundingClientRect().width + 14 : 320;
  track.scrollBy({ left: dir * step, behavior: 'smooth' });
}

function initCarousels() {
  document.querySelectorAll('[data-carousel-prev]').forEach(btn => {
    btn.addEventListener('click', () =>
      scrollCarousel(btn.dataset.carouselPrev, -1)
    );
  });

  document.querySelectorAll('[data-carousel-next]').forEach(btn => {
    btn.addEventListener('click', () =>
      scrollCarousel(btn.dataset.carouselNext, 1)
    );
  });

  document.querySelectorAll('.results__carousel').forEach(el => {
    el.addEventListener('keydown', e => {
      const key = el.dataset.carousel;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollCarousel(key, -1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollCarousel(key, 1);
      }
    });
  });
}

/* ─── Footer year ─── */
function initFooterYear() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─── Hero portrait safe init ─── */
function startHeroPortraitSafe() {
  const tryStart = () => {
    const wrap = document.querySelector('#hero-mount .hero__portrait');
    const canvas = document.querySelector('#hero-mount .hero__canvas');

    if (!wrap || !canvas || !window.initHeroPortrait) return false;

    const r = wrap.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return false;

    window.initHeroPortrait();
    return true;
  };

  let tries = 0;
  const step = () => {
    tries++;
    if (tryStart() || tries > 60) return;
    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

/* ─── Bootstrap ─── */
document.addEventListener('DOMContentLoaded', async () => {
  const config = await loadJSON('data/sections.json');
  if (!config?.mounts) return;

  for (const block of config.mounts) {
    await mount(block.id, block.html);
  }

  initScrollAnims();
  initHeader();
  initMaterialsTabs();
  initCarousels();
  initFooterYear();

  startHeroPortraitSafe();
});