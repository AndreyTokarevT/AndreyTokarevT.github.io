// js/materials.js

const MATERIALS = [
  { type: 'presentations', grade: '8 класс', title: 'Общевоинские уставы', text: 'Основы воинской дисциплины и порядок несения службы.', file: 'assets/maters/8_кл_Общевоинские_уставы.pptx' },
  { type: 'presentations', grade: '8 класс', title: 'Безопасная эксплуатация бытовых приборов', text: 'Правила безопасности при использовании электроприборов дома.', file: 'assets/maters/Безопасная_эксплуатация_бытовых_приборов.pptx' },
  { type: 'presentations', grade: '10–11 класс', title: 'Виды, назначение и характеристики стрелкового оружия', text: 'Обзор основных видов стрелкового оружия и их характеристики.', file: 'assets/maters/Виды_назначение_и_характеристики_стрелкового.pptx' },
  { type: 'presentations', grade: '8–9 класс', title: 'Воинская дисциплина и её значение', text: 'Роль дисциплины в военной службе и повседневной жизни.', file: 'assets/maters/Воинская_дисциплина_ее_значение.pptx' },
  { type: 'notes', grade: '9–11 класс', title: 'Герои среди нас', text: 'Рассказы о подвигах современников и патриотическое воспитание.', file: 'assets/maters/Герои_среди_нас.docx' },
  { type: 'notes', grade: '8–10 класс', title: 'Дни Воинской Славы России', text: 'Важнейшие даты и события военной истории России.', file: 'assets/maters/Дни_Воинской_Славы_России.docx' },
  { type: 'notes', grade: '8–9 класс', title: 'Единая государственная система предупреждения и ликвидации ЧС', text: 'Структура и задачи РСЧС при возникновении чрезвычайных ситуаций.', file: 'assets/maters/Единая_государственная_система_предупреждения_и_ликвидации_ЧС.docx' },
  { type: 'notes', grade: '10–11 класс', title: 'Основы огневой подготовки', text: 'Правила обращения с оружием, меры безопасности и техника стрельбы.', file: 'assets/maters/Основы_огневой_подготовки.docx' },
  { type: 'notes', grade: '8–9 класс', title: 'Первая помощь', text: 'Алгоритм действий, остановка кровотечений, базовые состояния.', file: 'assets/maters/Первая_помощь.docx' },
  { type: 'notes', grade: '10–11 класс', title: 'Современный защитник Отечества', text: 'Качества и подготовка военнослужащих в современной армии.', file: 'assets/maters/Современный_защитник_Отечества.docx' },
  { type: 'notes', grade: '8–9 класс', title: 'Средства индивидуальной и коллективной защиты', text: 'Использование СИЗ и убежищ при ЧС и военных действиях.', file: 'assets/maters/Средства_индивидуальной_и_коллективной_защиты.docx' },
  { type: 'notes', grade: '10–11 класс', title: 'Тактическая медицина', text: 'Оказание помощи в боевых условиях и экстремальных ситуациях.', file: 'assets/maters/Тактическая_медицина.docx' },
  { type: 'notes', grade: '9–11 класс', title: 'Терроризм: угроза обществу', text: 'Деловая игра: алгоритмы действий при угрозе теракта, правовая ответственность.', file: 'assets/maters/Терроризм.docx' },
  { type: 'tests', grade: '8 класс', title: 'Понятие безопасности личности', text: 'Тест на проверку знаний об угрозах безопасности личности, общества и государства.', file: 'assets/maters/Test/Понятие безопасности личности.docx' },
  { type: 'tests', grade: '8 класс', title: 'Поведение в повседневной жизни', text: 'Тест по правилам безопасного поведения в быту и повседневной жизни.', file: 'assets/maters/Test/Поведение в повседневной жизни.docx' },
  { type: 'tests', grade: '8 класс', title: 'Пожарная безопасность и действия при пожаре', text: 'Проверка знаний о правилах пожарной безопасности и действиях при возгорании.', file: 'assets/maters/Test/Пожарная безопасность и действия при пожаре.docx' },
  { type: 'tests', grade: '8 класс', title: 'Электробезопасность', text: 'Тест по безопасному использованию электроприборов и электробезопасности.', file: 'assets/maters/Test/Электробезопасность.docx' },
  { type: 'tests', grade: '8–9 класс', title: 'Безопасность на улице и в общественных местах', text: 'Проверка знаний о правилах поведения на улице и в общественных местах.', file: 'assets/maters/Test/Безопасность на улице и в общественных местах.docx' },
  { type: 'tests', grade: '8–9 класс', title: 'Безопасность на транспорте', text: 'Тест по правилам безопасности при использовании различных видов транспорта.', file: 'assets/maters/Test/Безопасность на транспорте.docx' },
  { type: 'tests', grade: '8–9 класс', title: 'Безопасность в природной среде', text: 'Проверка знаний о правилах безопасности в походах, лесу и на природе.', file: 'assets/maters/Test/Безопасность в природной среде.docx' },
  { type: 'tests', grade: '8–9 класс', title: 'Чрезвычайные ситуации природного характера', text: 'Тест на знание природных ЧС: землетрясения, наводнения, ураганы.', file: 'assets/maters/Test/Чрезвычайные ситуации природного характера.docx' },
  { type: 'tests', grade: '8–9 класс', title: 'Чрезвычайные ситуации техногенного характера', text: 'Проверка знаний о техногенных ЧС: аварии, взрывы, химические выбросы.', file: 'assets/maters/Test/Чрезвычайные ситуации техногенного характера.docx' },
  { type: 'tests', grade: '8–10 класс', title: 'Оповещение населения и действия при угрозе ЧС', text: 'Тест по системам оповещения и алгоритмам действий при чрезвычайных ситуациях.', file: 'assets/maters/Test/Оповещение населения и действия при угрозе ЧС.docx' }
];

let state = {
  filter: 'all',
  expanded: false
};

function getFiltered() {
  return state.filter === 'all' 
    ? MATERIALS 
    : MATERIALS.filter(m => m.type === state.filter);
}

function createCard(mat) {
  let badge = 'Метод. разработка';
  if (mat.type === 'presentations') badge = 'Презентация';
  if (mat.type === 'tests') badge = 'Тест';
  
  const ext = mat.file.endsWith('.pptx') ? 'PPTX' : 'DOCX';
  
  return `
    <article class="materials__card" data-type="${mat.type}">
      <div class="materials__cardTop">
        <span class="materials__badge">${badge}</span>
        <span class="materials__grade">${mat.grade}</span>
      </div>
      <h3 class="materials__cardTitle">${mat.title}</h3>
      <p class="materials__cardText">${mat.text}</p>
      <a class="materials__dl" href="${mat.file}" download>Скачать ${ext}</a>
    </article>
  `;
}

function render() {
  const grid = document.querySelector('[data-materials-grid]');
  const btn = document.querySelector('[data-materials-toggle]');
  const wrap = document.querySelector('.materials__loadMore');
  
  if (!grid || !btn || !wrap) return;
  
  const filtered = getFiltered();
  const toShow = state.expanded ? filtered : filtered.slice(0, 4);
  
  grid.innerHTML = toShow.map(createCard).join('');
  
  if (filtered.length <= 4) {
    wrap.classList.add('hidden');
  } else {
    wrap.classList.remove('hidden');
    btn.textContent = state.expanded ? 'Свернуть' : 'Показать ещё';
  }
}

function init() {
  const tabs = document.querySelectorAll('.materials__tab');
  const btn = document.querySelector('[data-materials-toggle]');
  
  if (!tabs.length || !btn) {
    setTimeout(init, 100);
    return;
  }
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      
      state.filter = tab.dataset.tab || 'all';
      state.expanded = false;
      render();
    });
  });
  
  btn.addEventListener('click', () => {
    state.expanded = !state.expanded;
    render();
  });
  
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}