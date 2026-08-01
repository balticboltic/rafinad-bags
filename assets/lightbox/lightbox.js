(() => {
  // One lightbox for the whole site. Callers pass a list of images and a start
  // index; it enlarges the photo and lets the visitor move through the list.
  // window.RAFINAD is merged, not replaced, so load order with the other
  // scripts does not matter.
  window.RAFINAD = window.RAFINAD || {};

  let overlay, imgEl, capEl, counterEl;
  let items = [];
  let index = 0;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dy = 0;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'rf-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<button class="rf-lb-close" type="button" aria-label="Закрыть">×</button>'
      + '<button class="rf-lb-nav rf-lb-prev" type="button" aria-label="Предыдущее фото">‹</button>'
      + '<figure class="rf-lb-stage"><img class="rf-lb-img" alt=""><figcaption class="rf-lb-cap"></figcaption></figure>'
      + '<button class="rf-lb-nav rf-lb-next" type="button" aria-label="Следующее фото">›</button>'
      + '<div class="rf-lb-counter"></div>';
    document.body.appendChild(overlay);

    imgEl = overlay.querySelector('.rf-lb-img');
    capEl = overlay.querySelector('.rf-lb-cap');
    counterEl = overlay.querySelector('.rf-lb-counter');
    const stage = overlay.querySelector('.rf-lb-stage');

    overlay.querySelector('.rf-lb-close').addEventListener('click', close);
    overlay.querySelector('.rf-lb-prev').addEventListener('click', (event) => { event.stopPropagation(); go(-1); });
    overlay.querySelector('.rf-lb-next').addEventListener('click', (event) => { event.stopPropagation(); go(1); });
    // A click on the dark area around the photo closes; a click on the photo
    // itself does not, so a mobile tap-and-swipe on the image can navigate.
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target === stage) close();
    });

    stage.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      startX = touch.clientX; startY = touch.clientY; dx = 0; dy = 0;
    }, { passive: true });
    stage.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      dx = touch.clientX - startX; dy = touch.clientY - startY;
    }, { passive: true });
    stage.addEventListener('touchend', () => {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
      else if (dy > 80) close();
    });

    document.addEventListener('keydown', (event) => {
      if (!overlay.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowLeft') go(-1);
      else if (event.key === 'ArrowRight') go(1);
    });
  }

  function render() {
    const item = items[index] || {};
    imgEl.src = item.src || '';
    imgEl.alt = item.alt || '';
    capEl.textContent = item.caption || '';
    capEl.style.display = item.caption ? '' : 'none';
    const many = items.length > 1;
    counterEl.textContent = many ? (index + 1) + ' / ' + items.length : '';
    overlay.querySelectorAll('.rf-lb-nav').forEach((button) => { button.style.display = many ? '' : 'none'; });
  }

  function go(step) {
    if (items.length < 2) return;
    index = (index + step + items.length) % items.length;
    render();
  }

  function open(list, start) {
    if (!Array.isArray(list) || !list.length) return;
    if (!overlay) build();
    items = list;
    index = Math.max(0, Math.min(list.length - 1, start || 0));
    render();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    imgEl.src = '';
  }

  window.RAFINAD.openLightbox = open;
})();
