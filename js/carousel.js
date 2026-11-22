/* =========================================================
   Image carousel (used for "Meet the team").
   The slides sit in a horizontally scrolling track, so they can be
   swiped on phones even without JavaScript. This script adds the
   arrow buttons, the dots, and arrow-key support. No auto-play.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-carousel]').forEach(setUp);

  function setUp(carousel) {
    const track = carousel.querySelector('.carousel__track');
    const slides = [...track.querySelectorAll('.carousel__slide')];
    const controls = carousel.querySelector('.carousel__controls');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const dotsWrap = carousel.querySelector('[data-carousel-dots]');
    if (!slides.length) return;

    // One dot per slide, labelled with the slide's name
    const dots = slides.map((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      const name = (slide.getAttribute('aria-label') || '').split(': ')[1] || `slide ${i + 1}`;
      dot.setAttribute('aria-label', `Show ${name}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
      return dot;
    });
    controls.hidden = false;

    let current = 0;

    function goTo(i) {
      const index = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior: smooth() });
      update(index);
    }

    function update(index) {
      current = index;
      dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      // Only the visible slide's image is read out when tabbing through the page
      slides.forEach((s, i) => s.setAttribute('aria-hidden', i === index ? 'false' : 'true'));
    }

    function smooth() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    }

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));

    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    });

    // Keep the dots in step when the track is swiped or scrolled
    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // The slide whose left edge is closest to the track's scroll position
        const left = track.scrollLeft;
        let index = 0;
        slides.forEach((s, i) => {
          const d = Math.abs(s.offsetLeft - track.offsetLeft - left);
          if (d < Math.abs(slides[index].offsetLeft - track.offsetLeft - left)) index = i;
        });
        if (index !== current) update(index);
      }, 80);
    }, { passive: true });

    update(0);
  }
});
