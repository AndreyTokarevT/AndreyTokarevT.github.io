// js/materials.js

const allMaterials = [
  { type: 'presentations', grade: '8 класс', title: 'Общевоинские уставы', text: 'Основы воинской дисциплины и порядок несения службы.', file: 'assets/maters/8_кл_Общевоинские_уставы.pptx' },
  { type: 'presentations', grade: '5–7 класс', title: 'Безопасная эксплуатация бытовых приборов', text: 'Правила безопасности при использовании электроприборов дома.', file: 'assets/maters/Безопасная_эксплуатация_бытовых_приборов.pptx' },
  { type: 'presentations', grade: '10–11 класс', title: 'Виды, назначение и характеристики стрелкового оружия', text: 'Обзор основных видов стрелкового оружия и их характеристики.', file: 'assets/maters/Виды_назначение_и_характеристики_стрелкового.pptx' },
  { type: 'presentations', grade: '8–9 класс', title: 'Воинская дисциплина и её значение', text: 'Роль дисциплины в военной службе и повседневной жизни.', file: 'assets/maters/Воинская_дисциплина_ее_значение.pptx' },
  { type: 'notes', grade: '9–11 класс', title: 'Герои среди нас', text: 'Рассказы о подвигах современников и патриотическое воспитание.', file: 'assets/maters/Герои_среди_нас.docx' },
  { type: 'notes', grade: '8–10 класс', title: 'Дни Воинской Славы России', text: 'Важнейшие даты и события военной истории России.', file: 'assets/maters/Дни_Воинской_Славы_России.docx' },
  { type: 'notes', grade: '8–9 класс', title: 'Единая государственная система предупреждения и ликвидации ЧС', text: 'Структура и задачи РСЧС при возникновении чрезвычайных ситуаций.', file: 'assets/maters/Единая_государственная_система_предупреждения_и_ликвидации_ЧС.docx' },
  { type: 'notes', grade: '10–11 класс', title: 'Основы огневой подготовки', text: 'Правила обращения с оружием, меры безопасности и техника стрельбы.', file: 'assets/maters/Основы_огневой_подготовки.docx' },
  { type: 'notes', grade: '7–9 класс', title: 'Первая помощь', text: 'Алгоритм действий, остановка кровотечений, базовые состояния.', file: 'assets/maters/Первая_помощь.docx' },
  { type: 'notes', grade: '10–11 класс', title: 'Современный защитник Отечества', text: 'Качества и подготовка военнослужащих в современной армии.', file: 'assets/maters/Современный_защитник_Отечества.docx' },
  { type: 'notes', grade: '8–9 класс', title: 'Средства индивидуальной и коллективной защиты', text: 'Использование СИЗ и убежищ при ЧС и военных действиях.', file: 'assets/maters/Средства_индивидуальной_и_коллективной_защиты.docx' },
  { type: 'notes', grade: '10–11 класс', title: 'Тактическая медицина', text: 'Оказание помощи в боевых условиях и экстремальных ситуациях.', file: 'assets/maters/Тактическая_медицина.docx' },
  { type: 'notes', grade: '9–11 класс', title: 'Терроризм: угроза обществу', text: 'Деловая игра: алгоритмы действий при угрозе теракта, правовая ответственность.', file: 'assets/maters/Терроризм.docx' }
];

let currentVisible = 4;
let currentFilter = 'all';

function renderMaterials() {
  const grid = document.querySelector('.materials__grid');
  const loadMoreBtn = document.querySelector('#loadMoreBtn');
  const loadMoreWrap = document.querySelector('.materials__loadMore');

  grid.innerHTML = '';

  const filtered = currentFilter === 'all' 
    ? allMaterials 
    : allMaterials.filter(m => m.type === currentFilter);

  filtered.slice(0, currentVisible).forEach(mat => {
    const badgeText = mat.type === 'presentations' ? 'Презентация' : 'Конспект';
    const ext = mat.file.endsWith('.pptx') ? 'PPTX' : 'DOCX';

    const card = document.createElement('article');
    card.className = 'materials__card';
    card.setAttribute('data-type', mat.type);
    card.innerHTML = `
      <div class="materials__cardTop">
        <span class="materials__badge">${badgeText}</span>
        <span class="materials__grade">${mat.grade}</span>
      </div>
      <h3 class="materials__cardTitle">${mat.title}</h3>
      <p class="materials__cardText">${mat.text}</p>
      <a class="materials__dl" href="${mat.file}" download>Скачать ${ext}</a>
    `;
    grid.appendChild(card);
  });

  if (currentVisible >= filtered.length) {
    loadMoreWrap.classList.add('hidden');
  } else {
    loadMoreWrap.classList.remove('hidden');
  }
}

function initMaterialsLoad() {
  const tabs = document.querySelectorAll('.materials__tab');
  const loadMoreBtn = document.querySelector('#loadMoreBtn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      currentFilter = tab.dataset.tab || 'all';
      currentVisible = 4;
      renderMaterials();
    });
  });

  loadMoreBtn.addEventListener('click', () => {
    currentVisible += 4;
    renderMaterials();
  });

  renderMaterials();
}

document.addEventListener('DOMContentLoaded', initMaterialsLoad);