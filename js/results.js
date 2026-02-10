// js/results.js

const personalAwards = [
  '8.webp', '1.webp', '3.webp', '4.webp', '5.webp',
  '7.webp','2.webp', '6.webp','9.webp', '1.png', '10.webp'
];

const teamAwards = [
  '1.jpg', '2.webp', '1.webp', '6.webp', '3.webp', '4.webp', '5.webp'
];

let carousels = {};
let lightboxState = {
  isOpen: false,
  currentType: null,
  currentIndex: 0
};
let initialized = false;

function createSlide(filename, folder, idx) {
  return `
    <div class="results__slide" data-idx="${idx}">
      <div class="results__slideInner">
        <img src="assets/result/${folder}/${filename}" alt="Грамота" loading="lazy">
      </div>
    </div>
  `;
}

function getSlidesPerView() {
  if (window.matchMedia('(max-width: 640px)').matches) return 1;
  if (window.matchMedia('(max-width: 980px)').matches) return 2;
  return 3;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function updateCarousel(type) {
  const carousel = carousels[type];
  if (!carousel) return;

  const { track, prevBtn, nextBtn } = carousel;

  const slides = track.querySelectorAll('.results__slide');
  if (!slides.length) return;

  // На мобильных не применяем transform, используется нативная прокрутка
  if (window.matchMedia('(max-width: 640px)').matches) {
    return;
  }

  const perView = getSlidesPerView();
  const maxIndex = Math.max(0, slides.length - perView);

  carousel.currentIndex = clamp(carousel.currentIndex, 0, maxIndex);

  // Используем процентное смещение для надежности
  const slidePercent = 100 / perView;
  const offsetPercent = -(carousel.currentIndex * slidePercent);

  track.style.transform = `translateX(${offsetPercent}%)`;

  prevBtn.disabled = carousel.currentIndex === 0;
  nextBtn.disabled = carousel.currentIndex >= maxIndex;
}

function initCarousel(type, awards, folder) {
  const carouselEl = document.querySelector(`[data-carousel="${type}"]`);
  const prevBtn = document.querySelector(`[data-carousel-prev="${type}"]`);
  const nextBtn = document.querySelector(`[data-carousel-next="${type}"]`);

  if (!carouselEl || !prevBtn || !nextBtn) return;

  const track = document.createElement('div');
  track.className = 'results__track';
  track.innerHTML = awards.map((f, i) => createSlide(f, folder, i)).join('');
  carouselEl.appendChild(track);

  carousels[type] = {
    track,
    prevBtn,
    nextBtn,
    currentIndex: 0,
    total: awards.length,
    awards,
    folder
  };

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    carousels[type].currentIndex -= 1;
    updateCarousel(type);
  });

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    carousels[type].currentIndex += 1;
    updateCarousel(type);
  });

  // Открытие лайтбокса (только на десктопе)
  track.querySelectorAll('.results__slide').forEach((slide) => {
    slide.addEventListener('click', () => {
      // Не открываем лайтбокс на мобильных
      if (window.matchMedia('(max-width: 640px)').matches) {
        return;
      }
      const idx = parseInt(slide.dataset.idx, 10);
      openLightbox(type, idx);
    });
  });

  updateCarousel(type);
}

function createLightbox() {
  const lightbox = document.createElement('div');
  lightbox.className = 'results__lightbox';
  lightbox.innerHTML = `
    <div class="results__lightboxContent">
      <button class="results__lightboxClose" type="button">×</button>
      <button class="results__lightboxNav results__lightboxNav--prev" type="button">‹</button>

      <div class="results__lightboxFrame">
        <img class="results__lightboxImg" src="" alt="Грамота">
      </div>

      <button class="results__lightboxNav results__lightboxNav--next" type="button">›</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const closeBtn = lightbox.querySelector('.results__lightboxClose');
  const prevBtn = lightbox.querySelector('.results__lightboxNav--prev');
  const nextBtn = lightbox.querySelector('.results__lightboxNav--next');
  const img = lightbox.querySelector('.results__lightboxImg');

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeLightbox();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (lightboxState.currentIndex > 0) {
      lightboxState.currentIndex -= 1;
      updateLightbox();
    }
  });

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const carousel = carousels[lightboxState.currentType];
    if (lightboxState.currentIndex < carousel.awards.length - 1) {
      lightboxState.currentIndex += 1;
      updateLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!lightboxState.isOpen) return;

    if (e.key === 'Escape') closeLightbox();

    if (e.key === 'ArrowLeft' && lightboxState.currentIndex > 0) {
      lightboxState.currentIndex -= 1;
      updateLightbox();
    }

    if (e.key === 'ArrowRight') {
      const carousel = carousels[lightboxState.currentType];
      if (lightboxState.currentIndex < carousel.awards.length - 1) {
        lightboxState.currentIndex += 1;
        updateLightbox();
      }
    }
  });

  return { lightbox, prevBtn, nextBtn, img };
}

let lightboxElements = null;

function openLightbox(type, index) {
  // Отключаем лайтбокс на мобильных устройствах
  if (window.matchMedia('(max-width: 640px)').matches) {
    return;
  }
  
  if (!lightboxElements) {
    lightboxElements = createLightbox();
  }

  lightboxState.isOpen = true;
  lightboxState.currentType = type;
  lightboxState.currentIndex = index;

  updateLightbox();
  lightboxElements.lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightboxElements) return;
  lightboxState.isOpen = false;
  lightboxElements.lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  if (!lightboxElements || !lightboxState.isOpen) return;

  const carousel = carousels[lightboxState.currentType];
  const { awards, folder } = carousel;
  const { currentIndex } = lightboxState;

  lightboxElements.img.src = `assets/result/${folder}/${awards[currentIndex]}`;

  lightboxElements.prevBtn.disabled = currentIndex === 0;
  lightboxElements.nextBtn.disabled = currentIndex === awards.length - 1;
}

function initResults() {
  if (initialized) {
    console.log('Карусели уже инициализированы, пропускаем');
    return;
  }
  
  console.log('initResults вызван');
  
  const personalCarousel = document.querySelector('[data-carousel="personal"]');
  const teamCarousel = document.querySelector('[data-carousel="team"]');

  console.log('personalCarousel:', personalCarousel);
  console.log('teamCarousel:', teamCarousel);

  if (!personalCarousel || !teamCarousel) {
    console.log('Карусели не найдены, повторная попытка через 100ms');
    setTimeout(initResults, 100);
    return;
  }

  console.log('Инициализация каруселей...');
  initCarousel('personal', personalAwards, 's');
  initCarousel('team', teamAwards, 't');

  // перерасчёт на ресайз (адаптив: 3/2/1 карточка)
  window.addEventListener('resize', () => {
    Object.keys(carousels).forEach(updateCarousel);
  });
  
  initialized = true;
  console.log('Карусели инициализированы');
}

// Ждем события blocksLoaded от main.js или загрузки DOM
window.addEventListener('blocksLoaded', initResults);

// Запасной вариант - ждем полной загрузки
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initResults, 300);
  });
} else {
  setTimeout(initResults, 300);
}

// Дополнительная попытка через 1 секунду на случай медленной загрузки
setTimeout(initResults, 1000);