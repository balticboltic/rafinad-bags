(() => {
  const endpoint = 'https://d5dttu513ukq6koa4l9s.628pfjdx.apigw.yandexcloud.net/api/public/colors';
  const fallbackColors = [
    { name: 'Тёплый песок', image_url: 'assets/raffia/placeholder-honey.webp' },
    { name: 'Пыльная роза', image_url: 'assets/raffia/placeholder-rose.webp' },
    { name: 'Оливковый сад', image_url: 'assets/raffia/placeholder-olive.webp' },
    { name: 'Дымчатая сирень', image_url: 'assets/raffia/placeholder-periwinkle.webp' },
  ];

  const gallery = document.querySelector('#gallery');
  if (!gallery) return;
  const section = document.createElement('section');
  section.className = 'raffia-colors';
  section.id = 'colors';
  section.innerHTML =
    '<div class="raffia-colors__layout">'
    + '<div class="raffia-colors__copy">'
    + '<div class="tag">Цвет на заказ</div>'
    + '<h2>Сумка в вашем оттенке</h2>'
    + '<p>Знакомая форма может получить совсем другое настроение. Ольга подтвердит наличие рафии и срок работы до начала заказа.</p>'
    + '<a href="#buy" class="btn-primary">Обсудить свой цвет</a>'
    + '</div>'
    + '<div class="raffia-colors__ribbon-wrap">'
    + '<button class="raffia-colors__arrow raffia-colors__arrow--prev" type="button" aria-label="Предыдущие цвета">‹</button>'
    + '<div class="raffia-colors__ribbon" aria-live="polite"></div>'
    + '<button class="raffia-colors__arrow raffia-colors__arrow--next" type="button" aria-label="Следующие цвета">›</button>'
    + '</div>'
    + '</div>'
    + '<p class="raffia-colors__note">Сейчас здесь временные примеры фактуры. Реальные мотки и названия добавляет мастер.</p>';
  gallery.insertAdjacentElement('afterend', section);

  const navigation = document.querySelector('#site-navigation');
  const collectionLink = navigation?.querySelector('a[href="#gallery"]');
  if (navigation && collectionLink && !navigation.querySelector('a[href="#colors"]')) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#colors'; link.textContent = 'Цвета';
    item.append(link); collectionLink.parentElement.after(item);
  }

  const ribbon = section.querySelector('.raffia-colors__ribbon');
  const note = section.querySelector('.raffia-colors__note');
  const messageField = document.querySelector('#custom-order textarea[name="message"]');

  const step = () => Math.round(ribbon.clientWidth * 0.8);
  section.querySelector('.raffia-colors__arrow--prev')
    .addEventListener('click', () => ribbon.scrollBy({ left: -step(), behavior: 'smooth' }));
  section.querySelector('.raffia-colors__arrow--next')
    .addEventListener('click', () => ribbon.scrollBy({ left: step(), behavior: 'smooth' }));

  const render = (colors, temporary) => {
    ribbon.replaceChildren();
    // The lightbox flips through the whole palette, so a click on any spool
    // starts from that spool but can keep going.
    const shots = colors.map((color) => ({ src: color.image_url, alt: `Моток рафии «${color.name}»`, caption: color.name }));
    colors.forEach((color, position) => {
      const card = document.createElement('article');
      card.className = 'raffia-color-card';

      const photo = document.createElement('button');
      photo.type = 'button';
      photo.className = 'raffia-color-card__photo';
      photo.setAttribute('aria-label', `Открыть фото мотка «${color.name}»`);
      const image = document.createElement('img');
      image.src = color.image_url;
      image.alt = `Моток рафии «${color.name}»`;
      image.loading = 'lazy';
      image.decoding = 'async';
      photo.append(image);
      if (!temporary) photo.addEventListener('click', () => window.RAFINAD?.openLightbox?.(shots, position));

      const body = document.createElement('div');
      body.className = 'raffia-color-card__body';
      const title = document.createElement('h3');
      title.textContent = color.name;
      body.append(title);
      if (!temporary) {
        const pick = document.createElement('button');
        pick.type = 'button';
        pick.className = 'raffia-color-card__pick';
        pick.textContent = 'Обсудить цвет';
        pick.addEventListener('click', () => {
          document.querySelector('#buy')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.setTimeout(() => {
            if (messageField) { messageField.value = `Хочу обсудить сумку в цвете «${color.name}».`; messageField.focus(); }
          }, 380);
        });
        body.append(pick);
      }

      card.append(photo, body);
      ribbon.append(card);
    });
  };

  render(fallbackColors, true);
  fetch(endpoint).then((response) => (response.ok ? response.json() : [])).then((colors) => {
    if (!Array.isArray(colors) || !colors.length) return;
    render(colors, false);
    note.textContent = 'Цвета показаны по наличию у мастера. Нажмите на моток, чтобы рассмотреть его крупнее.';
  }).catch(() => {});
})();
