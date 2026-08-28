(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const current = document.querySelector('.page-indicator b');
  const total = document.querySelector('.page-indicator span');
  const progress = document.querySelector('.progress i');
  const dialog = document.querySelector('.overview');
  const list = document.querySelector('.overview-list');
  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));

  total.textContent = `/ ${slides.length}`;
  slides.forEach((slide, slideIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${String(slideIndex + 1).padStart(2, '0')} · ${slide.dataset.title || '슬라이드'}`;
    button.addEventListener('click', () => { show(slideIndex); dialog.close(); });
    list.append(button);
  });

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === index));
    current.textContent = String(index + 1);
    progress.style.width = `${((index + 1) / slides.length) * 100}%`;
    history.replaceState(null, '', `#${index + 1}`);
  }

  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'next') show(index + 1);
    if (action === 'prev') show(index - 1);
    if (action === 'overview') dialog.showModal();
    if (action === 'close') dialog.close();
    if (action === 'print') window.print();
  });
  document.addEventListener('keydown', (event) => {
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(index + 1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(index - 1); }
    if (event.key === 'Home') show(0);
    if (event.key === 'End') show(slides.length - 1);
    if (event.key.toLowerCase() === 'o') dialog.showModal();
    if (event.key.toLowerCase() === 'p') window.print();
  });
  const hashIndex = Number(location.hash.slice(1)) - 1;
  show(Number.isInteger(hashIndex) && hashIndex >= 0 ? hashIndex : index);
})();
