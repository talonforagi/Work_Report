(() => {
  const deck = document.querySelector('.deck');
  const slides = [...document.querySelectorAll('.slide')];
  const chapters = [...document.querySelectorAll('.progress-nav a')];
  const chapter = Number(document.body.dataset.page);
  const dots = [...document.querySelectorAll('.screen-dots a')];
  const previous = document.querySelector('.previous-screen');
  const next = document.querySelector('.next-screen');
  const fullscreen = document.querySelector('.fullscreen-button');
  document.querySelector('.current-screen > span').textContent = '/ ' + String(slides.length).padStart(2, '0');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1, pending = false, toastTimer;
  function update() {
    pending = false;
    const bounds = deck.getBoundingClientRect();
    // The upper third identifies the current slide even when a slide is taller than the viewport.
    const marker = bounds.top + Math.min(bounds.height * .35, 250);
    let index = 0;
    slides.forEach((slide, i) => { if (slide.getBoundingClientRect().top <= marker) index = i; });
    if (deck.scrollTop + deck.clientHeight >= deck.scrollHeight - 3) index = slides.length - 1;
    if (active === index) return;
    active = index;
    dots.forEach((dot, i) => { if (i === index) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current'); });
    document.querySelector('.chapter-count strong').textContent = String(chapter + 1).padStart(2, '0');
    document.querySelector('.current-screen strong').textContent = String(index + 1).padStart(2, '0');
    document.querySelector('.screen-label').textContent = slides[index].dataset.label;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    const nav = document.querySelector('.progress-nav');
    const selected = chapters[chapter];
    if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({left:selected.offsetLeft-nav.offsetLeft-12,behavior:reduced.matches?'auto':'smooth'});
  }
  function go(index) {
    const slide = slides[Math.max(0, Math.min(index, slides.length - 1))];
    const top = slide.getBoundingClientRect().top - deck.getBoundingClientRect().top + deck.scrollTop;
    deck.scrollTo({top,behavior:reduced.matches?'auto':'smooth'});
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const index = slides.findIndex(slide => '#' + slide.id === link.getAttribute('href'));
    if (index < 0) return;
    event.preventDefault();
    go(index);
    // Keep a deep link without adding a history entry for every scroll movement.
    try { history.replaceState(null, '', '#' + slides[index].id); } catch {}
    if (link.classList.contains('skip-link')) deck.focus({preventScroll:true});
  }));
  deck.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, {passive:true});
  window.addEventListener('resize', update);
  previous.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  function notify(message) { const toast = document.querySelector('.toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3500); }
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else notify('请使用浏览器菜单进入全屏演示'); }
    catch { notify('请使用浏览器菜单进入全屏演示'); }
  }
  fullscreen.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => { const text = document.fullscreenElement ? '退出全屏' : '全屏演示'; fullscreen.setAttribute('aria-label', text); fullscreen.title = text + '（F）'; update(); });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,video,audio,[role="slider"],[contenteditable="true"]')) return;
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); return; }
    if (event.target.closest('a,button')) return;
    // Preserve native scrolling on tall slides, so keyboard users can reach every line.
    const tall = slides[active].offsetHeight > deck.clientHeight + 20;
    if (tall && ['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(event.key)) { deck.focus({preventScroll:true}); return; }
    if (['ArrowDown','PageDown',' '].includes(event.key)) { event.preventDefault(); go(active + (event.shiftKey ? -1 : 1)); }
    else if (['ArrowUp','PageUp'].includes(event.key)) { event.preventDefault(); go(active - 1); }
    else if (event.key === 'Home') { event.preventDefault(); go(0); }
    else if (event.key === 'End') { event.preventDefault(); go(slides.length - 1); }
  });
  const initial = slides.findIndex(slide => '#' + slide.id === location.hash);
  if (initial >= 0) {
    const slide = slides[initial];
    const top = slide.getBoundingClientRect().top - deck.getBoundingClientRect().top + deck.scrollTop;
    deck.scrollTo({top, behavior:'instant'});
  }
  update();
})();
