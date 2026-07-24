(() => {
  const endpoint = 'https://d5dttu513ukq6koa4l9s.628pfjdx.apigw.yandexcloud.net/api/public/products';

  // The eight cards written into the page stay as they are until the atelier
  // answers. A visitor never faces an empty gallery: a silent API, a blocked
  // request or a cold start all simply leave the page as it was served.
  const catalogue = fetch(endpoint)
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);

  const statuses = {
    available: ['В наличии', 'available'],
    made_to_order: ['Под заказ', 'made'],
    reserved: ['В резерве', 'made'],
    sold: ['Продана', 'sold'],
  };

  const price = (value) => (Number(value) > 0 ? `${Number(value).toLocaleString('ru-RU')} ₽` : 'Цена по запросу');

  function buildCard(product) {
    const name = String(product.name || '').trim() || 'Сумка';
    const photos = (Array.isArray(product.photos) && product.photos.length ? product.photos : [product.image_url]).filter(Boolean);
    const [statusText, statusTone] = statuses[product.status] || ['Наличие уточняется', 'made'];

    const card = document.createElement('div');
    card.className = 'bag-card';

    const slider = document.createElement('div');
    slider.className = 'bag-slider';
    slider.dataset.index = '0';
    const slides = document.createElement('div');
    slides.className = 'bag-slides';
    // A card is usually created before its photos are ready. An empty frame
    // reads as a broken page, so the gap is named out loud instead.
    if (!photos.length) {
      const empty = document.createElement('div');
      empty.className = 'bag-slide bag-slide--empty';
      empty.textContent = 'Фотографии скоро появятся';
      slides.append(empty);
    }
    photos.forEach((source, index) => {
      const slide = document.createElement('div');
      slide.className = 'bag-slide';
      const image = document.createElement('img');
      image.src = source;
      image.alt = index === 0 ? name : `${name} — кадр ${index + 1}`;
      image.loading = 'lazy';
      image.decoding = 'async';
      slide.append(image);
      slides.append(slide);
    });
    slider.append(slides);
    card.append(slider);

    if (photos.length > 1) {
      const arrows = document.createElement('div');
      arrows.className = 'bag-arrows';
      [['-1', '‹'], ['1', '›']].forEach(([direction, glyph]) => {
        const button = document.createElement('button');
        button.className = 'bag-arrow';
        button.type = 'button';
        button.dataset.dir = direction;
        button.textContent = glyph;
        button.setAttribute('aria-label', direction === '1' ? `Следующий кадр «${name}»` : `Предыдущий кадр «${name}»`);
        arrows.append(button);
      });
      const dots = document.createElement('div');
      dots.className = 'bag-dots';
      photos.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = index === 0 ? 'bag-dot active' : 'bag-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Кадр ${index + 1} из ${photos.length} — «${name}»`);
        dots.append(dot);
      });
      card.append(arrows, dots);
    }

    const info = document.createElement('div');
    info.className = 'bag-info';
    const title = document.createElement('div');
    title.className = 'bag-name serif';
    title.textContent = `«${name}»`;
    const description = document.createElement('div');
    description.className = 'bag-desc';
    description.textContent = product.material || 'Рафия Ispie · ручная работа';
    info.append(title, description);
    card.append(info);

    if (product.dimensions) {
      const specs = document.createElement('div');
      specs.className = 'bag-specs';
      specs.textContent = product.dimensions;
      card.append(specs);
    }

    const commerce = document.createElement('div');
    commerce.className = 'bag-commerce';
    const availability = document.createElement('span');
    availability.className = `bag-availability bag-availability--${statusTone}`;
    availability.textContent = statusText;
    const amount = document.createElement('span');
    amount.className = 'bag-price';
    amount.textContent = price(product.price_rub);
    const shop = product.livemaster_url || product.avito_url;
    const action = document.createElement(shop && product.status === 'available' ? 'a' : 'button');
    action.className = 'bag-inquiry';
    if (shop && product.status === 'available') {
      action.href = shop;
      action.target = '_blank';
      action.rel = 'noreferrer noopener';
      action.textContent = 'Купить';
    } else {
      const sold = product.status === 'sold';
      action.type = 'button';
      action.textContent = sold ? 'Хочу похожую' : 'Узнать о сумке';
      const text = sold ? `Хочу сумку, похожую на «${name}».` : `Хочу узнать о сумке «${name}».`;
      action.addEventListener('click', () => window.RAFINAD?.startInquiry(text));
    }
    commerce.append(availability, amount, action);
    card.append(commerce);

    return card;
  }

  const start = () => {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    catalogue.then((products) => {
      if (!Array.isArray(products) || !products.length) return;
      const ordered = [...products].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
      const cards = ordered.map(buildCard);
      grid.replaceChildren(...cards);
      // The gallery is revealed on scroll; a grid replaced after that moment
      // must not inherit a hidden state.
      grid.classList.add('visible');
      cards.forEach((card) => window.RAFINAD?.wireBagCard(card));
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
