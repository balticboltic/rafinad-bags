(() => {
  const endpoint = 'https://d5dttu513ukq6koa4l9s.628pfjdx.apigw.yandexcloud.net/api/public/colors';
  const fallbackColors = [
    { name: 'Тёплый песок', image_url: 'assets/raffia/placeholder-honey.webp', supplier: 'Временный пример' },
    { name: 'Пыльная роза', image_url: 'assets/raffia/placeholder-rose.webp', supplier: 'Временный пример' },
    { name: 'Оливковый сад', image_url: 'assets/raffia/placeholder-olive.webp', supplier: 'Временный пример' },
    { name: 'Дымчатая сирень', image_url: 'assets/raffia/placeholder-periwinkle.webp', supplier: 'Временный пример' },
  ];

  const gallery = document.querySelector('#gallery');
  if (!gallery) return;
  const section = document.createElement('section');
  section.className = 'raffia-colors';
  section.id = 'colors';
  section.innerHTML = '<div class="raffia-colors__layout"><div class="raffia-colors__copy"><div class="tag">Цвет на заказ</div><h2>Сумка в вашем оттенке</h2><p>Знакомая форма может получить совсем другое настроение. Ольга подтвердит наличие рафии и срок работы до начала заказа.</p><a href="#buy" class="btn-primary">Обсудить свой цвет</a></div><div class="raffia-colors__grid" aria-live="polite"></div></div><p class="raffia-colors__note">Сейчас здесь временные примеры фактуры. Реальные мотки, названия и коды будут постепенно добавляться мастером.</p>';
  gallery.insertAdjacentElement('afterend', section);

  const navigation = document.querySelector('#site-navigation');
  const collectionLink = navigation?.querySelector('a[href="#gallery"]');
  if (navigation && collectionLink && !navigation.querySelector('a[href="#colors"]')) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#colors'; link.textContent = 'Цвета';
    item.append(link); collectionLink.parentElement.after(item);
  }

  const grid = section.querySelector('.raffia-colors__grid');
  const note = section.querySelector('.raffia-colors__note');
  const messageField = document.querySelector('#custom-order textarea[name="message"]');

  const render = (colors, temporary) => {
    grid.replaceChildren();
    colors.forEach((color) => {
      const card = document.createElement('article'); card.className = 'raffia-color-card';
      const image = document.createElement('img'); image.src = color.image_url; image.alt = `Моток рафии «${color.name}»`; image.loading = 'lazy'; image.decoding = 'async';
      const body = document.createElement('div'); body.className = 'raffia-color-card__body';
      const title = document.createElement('h3'); title.textContent = color.name;
      const subtitle = document.createElement('p'); subtitle.textContent = temporary ? 'Временный пример' : [color.supplier, color.supplier_code].filter(Boolean).join(' · ') || 'Доступен для заказа';
      body.append(title, subtitle);
      if (!temporary) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Выбрать оттенок';
        button.addEventListener('click', () => {
          document.querySelector('#buy')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.setTimeout(() => { if (messageField) { messageField.value = `Хочу обсудить сумку в цвете «${color.name}»${color.supplier_code ? `, код ${color.supplier_code}` : ''}.`; messageField.focus(); } }, 380);
        });
        body.append(button);
      }
      card.append(image, body); grid.append(card);
    });
  };

  render(fallbackColors, true);
  fetch(endpoint).then((response) => response.ok ? response.json() : []).then((colors) => {
    if (!Array.isArray(colors) || !colors.length) return;
    render(colors, false);
    note.textContent = 'Оттенки показаны по наличию у мастера. Перед заказом Ольга подтвердит срок работы и детали.';
  }).catch(() => {});
})();
