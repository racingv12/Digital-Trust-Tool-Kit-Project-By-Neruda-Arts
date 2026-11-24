/* =========================================================
   Phone menu: the ☰ button opens a sidebar with every section.
   Closes on a link tap, the ✕ button, a tap outside, or Esc.
   While it's open, keyboard focus stays inside it and the page
   behind is hidden from screen readers.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.getElementById('site-menu');
  if (!toggle || !drawer) return;

  const panel = drawer.querySelector('.drawer__panel');
  const background = [document.querySelector('.site-header'), document.getElementById('main'), document.querySelector('.site-footer')].filter(Boolean);
  const phone = window.matchMedia('(max-width: 880px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let closeTimer = null;

  toggle.hidden = false;   // only show the button when this script runs

  function open() {
    clearTimeout(closeTimer);
    drawer.hidden = false;
    void drawer.offsetWidth;   // apply the closed position first, so the slide-in runs
    drawer.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-open');
    background.forEach(el => (el.inert = true));
    drawer.querySelector('.drawer__close').focus();
  }

  function close(returnFocus = true) {
    if (drawer.hidden) return;
    drawer.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-open');
    background.forEach(el => (el.inert = false));
    closeTimer = setTimeout(() => (drawer.hidden = true), reduceMotion.matches ? 0 : 260);
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', open);

  drawer.addEventListener('click', e => {
    if (e.target.closest('[data-menu-close]')) close();
    // A section link: close and let the browser jump to the section
    else if (e.target.closest('.drawer__links a')) close(false);
  });

  document.addEventListener('keydown', e => {
    if (drawer.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    // Keep Tab inside the sidebar
    const items = [...panel.querySelectorAll('a, button')];
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // If the screen gets wider (e.g. a phone is turned sideways), close it
  phone.addEventListener('change', e => { if (!e.matches) close(false); });
});
