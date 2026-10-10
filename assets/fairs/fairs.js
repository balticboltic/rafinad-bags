(() => {
  const section = document.getElementById('fairs');
  if (!section) return;

  // The fair dates are local to Podolsk (Moscow time). Keep the report after
  // the last day, including for visitors in a different time zone.
  const reportAt = Date.parse('2026-10-12T00:00:00+03:00');
  function updateStatus() {
    const ended = Date.now() >= reportAt;
    section.querySelector('[data-fair-status]').textContent = ended ? 'ДНЕВНИК МАСТЕРСКОЙ' : 'ВСТРЕЧАЕМСЯ ВЖИВУЮ';
    section.querySelector('[data-fair-date]').textContent = ended ? '10 и 11 октября 2026 · Подольск' : '10 и 11 октября · Подольск';
    section.querySelector('[data-fair-intro]').textContent = ended
      ? '10 и 11 октября мы участвовали в маркете «Бочка» в Подольске.'
      : 'Приходите познакомиться с Ольгой и посмотреть её работы вживую.';
  }
  updateStatus();
  const remaining = reportAt - Date.now();
  if (remaining > 0 && remaining <= 2147483647) setTimeout(updateStatus, remaining);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateStatus(); });

  const links = [...section.querySelectorAll('[data-fair-photo]')];
  const photos = links.map(link => ({ src: link.href, alt: link.querySelector('img').alt }));
  links.forEach((link, index) => {
    link.addEventListener('click', event => {
      // The link remains a usable full-size image if the viewer is unavailable.
      if (!window.RAFINAD?.openLightbox || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.RAFINAD.openLightbox(photos, index);
    });
  });
})();
