/* =========================================================
   Subscription form: sends the email to the Google Apps Script
   web app (google-apps-script/subscribe.gs), which adds it once to
   the "Subscribers" Google Sheet. The web app's URL is in the form's
   data-endpoint attribute in index.html.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('subscribe-form');
  if (!form) return;

  const email = form.querySelector('[name="email"]');
  const consent = form.querySelector('[name="consent"]');
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('subscribe-status');
  const done = document.getElementById('subscribe-done');
  const doneText = document.getElementById('subscribe-done-text');
  const again = document.getElementById('subscribe-again');

  function show(message, kind) {
    status.textContent = message;
    status.dataset.kind = kind;   // "error" or "info", for styling
  }

  // After a successful sign-up the form is replaced by the ✓ thanks message.
  // Focus moves to the message so screen readers announce it.
  function showThanks(message) {
    form.reset();
    show('', 'info');
    doneText.textContent = message;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }

  // "Add another email" brings the empty form back
  again.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    email.focus();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    email.removeAttribute('aria-invalid');

    const value = email.value.trim();
    if (!value || !email.checkValidity()) {
      email.setAttribute('aria-invalid', 'true');
      show('Please enter a valid email address.', 'error');
      email.focus();
      return;
    }
    if (!consent.checked) {
      show('Please tick the box to agree to receive emails.', 'error');
      consent.focus();
      return;
    }
    const endpoint = form.dataset.endpoint || '';
    if (!endpoint.startsWith('https://script.google.com/')) {
      show('Subscriptions aren’t set up yet. Please try again later.', 'error');
      return;
    }

    button.disabled = true;
    show('Sending…', 'info');
    try {
      // Sent as plain text: Google Apps Script can read it, and the browser
      // doesn't need an extra permission check (which Apps Script can't answer).
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          email: value,
          consent: consent.checked,
          website: form.querySelector('[name="website"]').value
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        showThanks(data.message || 'Thanks! You’re on the list.');
      } else {
        show(data.message || 'Subscriptions aren’t available right now. Please try again later.', 'error');
      }
    } catch {
      show('Couldn’t connect. Please check your connection and try again.', 'error');
    } finally {
      button.disabled = false;
    }
  });
});
