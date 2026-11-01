/* =========================================================
   Video embeds (YouTube / Vimeo)

   Each <div class="video" data-provider="..." data-id="..." data-title="...">
   shows a poster and a play button. The real player (iframe) only loads
   when someone presses play, so the page stays light and visitors aren't
   tracked by YouTube or Vimeo until they choose to watch.

   Optional: add data-poster="assets/images/my-poster.jpg" to use your own
   preview image (recommended for Vimeo, which has no simple thumbnail URL).
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.video').forEach(setupVideo);
});

function setupVideo(el) {
  const provider = (el.dataset.provider || '').toLowerCase();
  const id = (el.dataset.id || '').trim();
  const title = el.dataset.title || 'Video';

  // No ID yet: show a placeholder.
  if (!id) {
    el.innerHTML = '<span class="video__soon">Video coming soon</span>';
    return;
  }

  const posterSrc =
    el.dataset.poster ||
    (provider === 'youtube' ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : '');

  if (posterSrc) {
    const img = document.createElement('img');
    img.className = 'video__poster';
    img.src = posterSrc;
    img.alt = '';
    img.loading = 'lazy';
    el.appendChild(img);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video__play';
  button.setAttribute('aria-label', `Play video: ${title}`);
  button.innerHTML =
    '<span class="video__play-icon"><svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>';
  el.appendChild(button);

  button.addEventListener('click', () => {
    const src = embedUrl(provider, id);
    if (!src) return;

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = title;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    el.innerHTML = '';
    el.appendChild(iframe);
    iframe.focus();
  });
}

function embedUrl(provider, id) {
  const safeId = encodeURIComponent(id);
  if (provider === 'youtube') {
    // youtube-nocookie.com: YouTube's privacy-enhanced mode
    return `https://www.youtube-nocookie.com/embed/${safeId}?autoplay=1&rel=0`;
  }
  if (provider === 'vimeo') {
    // Unlisted Vimeo links look like vimeo.com/123456789/abc123def0
    // Put both parts in data-id: data-id="123456789/abc123def0"
    const [videoId, hash] = id.split('/');
    const hashParam = hash ? `&h=${encodeURIComponent(hash)}` : '';
    // dnt=1 asks Vimeo not to track the viewer
    return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?autoplay=1&dnt=1${hashParam}`;
  }
  console.warn(`Unknown video provider "${provider}". Use "youtube" or "vimeo".`);
  return '';
}
