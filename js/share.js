/* =========================================================
   "Share the toolkit" link
   On phones it opens the phone's share menu (WhatsApp,
   Instagram, messages…) with the text below. On computers it
   copies the text and link, and shows "Link copied".
   Without JavaScript it's a normal link to the site.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const link = document.getElementById('share-link');
  const status = document.getElementById('share-status');
  if (!link) return;

  const url = 'https://digitaltrust.nerudaarts.ca/';
  const text = 'Check out the Digital Trust Toolkit, a free guide to AI, misleading content and creative work, made by students: digitaltrust.nerudaarts.ca #KnowThyAI';
  const isPhone = window.matchMedia('(pointer: coarse)').matches;
  let timer;

  function say(message) {
    if (!status) return;
    status.textContent = message;
    clearTimeout(timer);
    timer = setTimeout(() => { status.textContent = ''; }, 4000);
  }

  link.addEventListener('click', async event => {
    event.preventDefault();

    if (isPhone && navigator.share) {
      try {
        await navigator.share({ title: 'Digital Trust Toolkit', text, url });
      } catch (err) {
        // The person closed the share menu: nothing to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      say('Link copied!');
    } catch (err) {
      // Clipboard blocked (old browser or no permission): show the address instead.
      say('Copy this link: ' + url);
    }
  });
});
