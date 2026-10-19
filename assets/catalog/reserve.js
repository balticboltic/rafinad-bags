(() => {
  'use strict';
  const products = window.RAFINAD_RESERVE?.products;
  const root = document.getElementById('reserve-catalog');
  if (!root || !Array.isArray(products) || !products.length) return;
  const labels = { all: 'Все', bags: 'Сумки', mini: 'Мини-сумки', clutches: 'Клатчи' };
  const singular = { bags: 'Сумка', mini: 'Мини-сумка', clutches: 'Клатч' };
  const state = { category: 'all', limit: 12, large: false, scroll: 0, opener: null };
  const price = p => Number(p.price_rub) > 0 ? `${Number(p.price_rub).toLocaleString('ru-RU')} ₽` : 'Цена по запросу';
  const availability = p => ({ available: 'В наличии', made_to_order: 'Под заказ', reserved: 'В резерве', sold: 'Продана' }[p.status] || 'Наличие уточняется');
  const title = p => p.name.replace(/ — (клатч|мини-сумка)$/u, '');
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (text, cls, action) => {
    const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', action); return b;
  };
  const photo = (url, alt, cls, lazy = true) => {
    const img = el('img', cls); img.src = url; img.alt = alt;
    img.loading = lazy ? 'lazy' : 'eager'; img.decoding = 'async'; return img;
  };
  const browse = el('div', 'rc-browse');
  const filters = el('nav', 'rc-filters'); filters.setAttribute('aria-label', 'Тип изделия');
  Object.entries(labels).forEach(([key, name]) => {
    const count = products.filter(p => key === 'all' || p.category === key).length;
    const b = button(`${name} · ${count}`, '', () => {
      state.category = key; state.limit = 12; render();
      browse.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    b.dataset.category = key; filters.append(b);
  });
  const toolbar = el('div', 'rc-toolbar');
  const count = el('p', 'rc-count'); count.setAttribute('role', 'status');
  const views = el('div', 'rc-views'); views.setAttribute('role', 'group'); views.setAttribute('aria-label', 'Размер карточек');
  const compact = button('Компактно', '', () => setView(false));
  const large = button('Крупнее', '', () => setView(true));
  views.append(compact, large); toolbar.append(count, views);
  const grid = el('div', 'rc-grid');
  const more = button('Показать ещё', 'rc-more', () => {
    const oldLimit = state.limit; state.limit += 12; render();
    grid.children[oldLimit]?.querySelector('a')?.focus({ preventScroll: true });
  });
  const detail = el('article', 'rc-detail'); detail.hidden = true;
  browse.append(filters, toolbar, grid, more); root.replaceChildren(browse, detail);
  function setView(value) {
    state.large = value; grid.classList.toggle('rc-large', value);
    compact.setAttribute('aria-pressed', String(!value)); large.setAttribute('aria-pressed', String(value));
  }
  function render() {
    const items = products.filter(p => state.category === 'all' || p.category === state.category);
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === state.category)));
    count.textContent = `Показано ${Math.min(state.limit, items.length)} из ${items.length}`;
    grid.replaceChildren(...items.slice(0, state.limit).map(p => {
      const card = el('article', 'rc-card');
      const a = el('a', 'rc-card-link'); a.href = `#product-${p.id}`;
      a.setAttribute('aria-label', `Рассмотреть: ${p.name}`);
      const frame = el('div', 'rc-photo'); frame.append(photo(p.thumbnails[0], p.name, ''));
      frame.append(el('span', 'rc-photo-count', `${p.photos.length} фото`));
      a.append(frame, el('p', 'rc-kind', singular[p.category]), el('h3', 'serif', title(p)));
      a.addEventListener('click', () => { state.scroll = window.scrollY; state.opener = p.id; });
      card.append(a, el('p', 'rc-price', price(p)));
      if (p.dimensions) card.append(el('p', 'rc-dimensions', p.dimensions));
      card.append(el('p', 'rc-availability', availability(p)));
      return card;
    }));
    more.hidden = state.limit >= items.length;
    more.textContent = `Показать ещё ${Math.min(12, items.length - state.limit)}`;
    setView(state.large);
  }
  function showProduct(p) {
    const back = button('Назад к каталогу', 'rc-back', () => {
      history.replaceState(null, '', '#gallery'); route();
    });
    const heading = el('h3', 'serif', title(p)); heading.tabIndex = -1;
    const shots = el('div', 'rc-shots');
    const hero = button('', 'rc-hero', () => {
      window.RAFINAD?.openLightbox(p.photos.map((src, i) => ({ src, alt: `${p.name} — кадр ${i + 1}`, caption: p.name })), selected);
    });
    hero.setAttribute('aria-label', `Увеличить фото: ${p.name}`);
    const main = photo(p.photos[0], p.name, '', false); hero.append(main);
    const thumbs = el('div', 'rc-thumbs'); thumbs.setAttribute('role', 'group'); thumbs.setAttribute('aria-label', 'Фотографии изделия');
    let selected = 0;
    p.photos.forEach((src, i) => {
      const b = button('', '', () => {
        selected = i; main.src = src; main.alt = `${p.name} — кадр ${i + 1}`;
        thumbs.querySelectorAll('button').forEach((x, n) => x.setAttribute('aria-pressed', String(n === i)));
      });
      b.setAttribute('aria-label', `Кадр ${i + 1} из ${p.photos.length}`); b.setAttribute('aria-pressed', String(i === 0));
      b.append(photo(p.thumbnails[i], '', '')); thumbs.append(b);
    });
    shots.append(hero, thumbs);
    const info = el('div', 'rc-info');
    info.append(el('p', 'rc-kind', singular[p.category]), heading, el('p', 'rc-detail-price', price(p)), el('p', '', availability(p)), el('p', '', p.dimensions || 'Размер уточняется'), el('p', '', p.material || 'Рафия · ручная работа'));
    const contact = el('div', 'rc-contact'); contact.append(el('p', '', 'Уточнить цену, размер и наличие у Ольги:'));
    [['Позвонить', 'tel:+79267909861'], ['Telegram', 'https://t.me/+79267909861'], ['WhatsApp', 'https://wa.me/79267909861?text=' + encodeURIComponent(`Здравствуйте! Хочу узнать об изделии «${p.name}».`)]].forEach(([text, href]) => {
      const a = el('a', '', text); a.href = href;
      if (href.startsWith('https:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      contact.append(a);
    });
    info.append(contact);
    const pair = products.find(x => x.id === p.pair_id);
    if (pair) {
      const a = el('a', 'rc-pair'); a.href = `#product-${pair.id}`;
      const text = el('span', ''); text.append(el('small', '', 'Парное изделие · продаётся отдельно'), el('strong', '', pair.name));
      a.append(photo(pair.thumbnails[0], '', ''), text); info.append(a);
    }
    const layout = el('div', 'rc-detail-layout'); layout.append(shots, info);
    detail.replaceChildren(back, layout); browse.hidden = true; detail.hidden = false;
    detail.scrollIntoView({ block: 'start', behavior: 'instant' }); heading.focus({ preventScroll: true });
  }
  root.addEventListener('click', event => {
    const a = event.target.closest('a[href^="#product-"]');
    if (!a || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); history.pushState({ rcProduct: true }, '', a.getAttribute('href')); route();
  });
  function route() {
    const p = products.find(x => `#product-${x.id}` === location.hash);
    if (p) { showProduct(p); return; }
    const wasOpen = !detail.hidden;
    detail.hidden = true; browse.hidden = false;
    if (wasOpen) {
      const opener = [...grid.querySelectorAll('a')].find(a => a.hash === `#product-${state.opener}`);
      opener?.focus({ preventScroll: true }); window.scrollTo({ top: state.scroll, behavior: 'instant' });
    }
  }
  window.addEventListener('popstate', route); window.addEventListener('hashchange', route);
  render(); route();
})();
