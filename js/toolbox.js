/* =========================================================
   Hero toolbox: click (or Space/Enter) to open or close it.
   The button's aria-expanded says whether it's open; the CSS
   fades between the closed and open pictures (no animation
   for people who turn on reduced motion).
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('toolbox');
  if (!box) return;

  box.addEventListener('click', () => {
    const open = box.getAttribute('aria-expanded') !== 'true';
    box.setAttribute('aria-expanded', String(open));
    box.setAttribute('aria-label', open ? 'Close the toolbox' : 'Open the toolbox');
  });
});
