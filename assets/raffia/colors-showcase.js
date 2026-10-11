(() => {
  const endpoint = 'https://d5dttu513ukq6koa4l9s.628pfjdx.apigw.yandexcloud.net/api/public/colors';
  // Real local photos remain usable when the cabinet or photo storage is offline.
  const fallbackColors = [
    {
      "name": "Осенний песок",
      "image_url": "assets/raffia/spools/01-large.webp",
      "thumbnail_url": "assets/raffia/spools/01.webp"
    },
    {
      "name": "Ива",
      "image_url": "assets/raffia/spools/02-large.webp",
      "thumbnail_url": "assets/raffia/spools/02.webp"
    },
    {
      "name": "Тигровая лилия",
      "image_url": "assets/raffia/spools/03-large.webp",
      "thumbnail_url": "assets/raffia/spools/03.webp"
    },
    {
      "name": "Коралл",
      "image_url": "assets/raffia/spools/04-large.webp",
      "thumbnail_url": "assets/raffia/spools/04.webp"
    },
    {
      "name": "Крафт",
      "image_url": "assets/raffia/spools/05-large.webp",
      "thumbnail_url": "assets/raffia/spools/05.webp"
    },
    {
      "name": "Лайм",
      "image_url": "assets/raffia/spools/06-large.webp",
      "thumbnail_url": "assets/raffia/spools/06.webp"
    },
    {
      "name": "Овсяный крем",
      "image_url": "assets/raffia/spools/07-large.webp",
      "thumbnail_url": "assets/raffia/spools/07.webp"
    },
    {
      "name": "Фуксия",
      "image_url": "assets/raffia/spools/08-large.webp",
      "thumbnail_url": "assets/raffia/spools/08.webp"
    },
    {
      "name": "Древесная кора",
      "image_url": "assets/raffia/spools/09-large.webp",
      "thumbnail_url": "assets/raffia/spools/09.webp"
    },
    {
      "name": "Золото",
      "image_url": "assets/raffia/spools/10-large.webp",
      "thumbnail_url": "assets/raffia/spools/10.webp"
    },
    {
      "name": "Тёплое дерево",
      "image_url": "assets/raffia/spools/11-large.webp",
      "thumbnail_url": "assets/raffia/spools/11.webp"
    },
    {
      "name": "Колибри",
      "image_url": "assets/raffia/spools/12-large.webp",
      "thumbnail_url": "assets/raffia/spools/12.webp"
    }
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
    + '<p class="raffia-colors__note">Нажмите на моток, чтобы рассмотреть его крупнее.</p>';
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
  const messageField = document.querySelector('#custom-order textarea[name="message"]');

  const step = () => Math.round(ribbon.clientWidth * 0.8);
  section.querySelector('.raffia-colors__arrow--prev')
    .addEventListener('click', () => ribbon.scrollBy({ left: -step(), behavior: 'smooth' }));
  section.querySelector('.raffia-colors__arrow--next')
    .addEventListener('click', () => ribbon.scrollBy({ left: step(), behavior: 'smooth' }));

  const render = (colors) => {
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
      image.src = color.thumbnail_url || color.image_url;
      image.alt = `Моток рафии «${color.name}»`;
      image.loading = 'lazy';
      image.decoding = 'async';
      photo.append(image);
      photo.addEventListener('click', () => window.RAFINAD?.openLightbox?.(shots, position));

      const body = document.createElement('div');
      body.className = 'raffia-color-card__body';
      const title = document.createElement('h3');
      title.textContent = color.name;
      body.append(title);
      {
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

  render(fallbackColors);

  // Keep the local palette until both the cabinet data AND all its photos load.
  const imageReady = (src) => new Promise((resolve) => {
    const image = new Image();
    const finish = (ready) => {
      window.clearTimeout(timer);
      image.onload = image.onerror = null;
      if (!ready) image.removeAttribute('src');
      resolve(ready);
    };
    const timer = window.setTimeout(() => finish(false), 8000);
    image.onload = () => finish(image.naturalWidth > 0);
    image.onerror = () => finish(false);
    image.src = src;
  });

  const controller = new AbortController();
  const requestTimer = window.setTimeout(() => controller.abort(), 8000);
  fetch(endpoint, { signal: controller.signal })
    .then((response) => (response.ok ? response.json() : []))
    .then(async (colors) => {
      if (!Array.isArray(colors) || !colors.length ||
          !colors.every((color) => color && typeof color.name === 'string' &&
            color.name.trim() && typeof color.image_url === 'string' && color.image_url.trim())) return;
      const photoUrls = [...new Set(colors.flatMap((color) => [color.image_url, color.thumbnail_url || color.image_url]))];
      const ready = await Promise.all(photoUrls.map(imageReady));
      if (ready.every(Boolean)) render(colors);
    })
    .catch(() => {})
    .finally(() => window.clearTimeout(requestTimer));
})();
