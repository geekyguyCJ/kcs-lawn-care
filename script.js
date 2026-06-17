/* K.C.'s Lawn Care — site behaviour */
(function () {
  'use strict';

  // Footer year + seasonal year (kept current so copy never goes stale)
  var thisYear = String(new Date().getFullYear());
  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = thisYear;
  var sEl = document.getElementById('season-year');
  if (sEl) sEl.textContent = thisYear;

  // Encode form data as application/x-www-form-urlencoded (Netlify Forms)
  function encode(data) {
    return Object.keys(data)
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]); })
      .join('&');
  }

  // Basic phone validation: at least 10 digits
  function validPhone(v) {
    return (v.replace(/\D/g, '').length >= 10);
  }

  function setStatus(form, msg, ok) {
    var s = form.querySelector('.form-status');
    if (!s) return;
    s.hidden = false;
    s.textContent = msg;
    s.classList.remove('ok', 'bad');
    s.classList.add(ok ? 'ok' : 'bad');
  }

  var forms = document.querySelectorAll('.js-netlify-form');
  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot — if filled, silently drop (likely a bot)
      var hp = form.querySelector('[name="company_url"]');
      if (hp && hp.value) { return; }

      // Validate required fields
      var ok = true;
      var nameEl = form.querySelector('[name="name"]');
      var phoneEl = form.querySelector('[name="phone"]');

      if (nameEl && !nameEl.value.trim()) { ok = false; markInvalid(nameEl, true); }
      else if (nameEl) { markInvalid(nameEl, false); }

      if (phoneEl && !validPhone(phoneEl.value)) {
        ok = false; markInvalid(phoneEl, true); toggleErr(form, phoneEl, true);
      } else if (phoneEl) {
        markInvalid(phoneEl, false); toggleErr(form, phoneEl, false);
      }

      if (!ok) { setStatus(form, 'Please add your name and a valid phone number.', false); return; }

      // Gather all named fields
      var data = {};
      Array.prototype.forEach.call(form.querySelectorAll('input,select,textarea'), function (el) {
        if (el.name) data[el.name] = el.value;
      });

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
      form.setAttribute('aria-busy', 'true');
      setStatus(form, 'Sending your request…', true);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(data)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('Network');
          form.reset();
          setStatus(form, 'Thanks! Your request is in — Kyle will get back to you to book a visit.', true);
        })
        .catch(function () {
          setStatus(form, 'Sorry, something went wrong. Please call (705) 822-9015 instead.', false);
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Send'; }
          form.removeAttribute('aria-busy');
        });
    });
  });

  function markInvalid(el, on) {
    var f = el.closest('.field');
    if (f) f.classList.toggle('invalid', on);
    el.setAttribute('aria-invalid', on ? 'true' : 'false');
  }
  function toggleErr(form, el, on) {
    var err = form.querySelector('[data-err-for="' + el.id + '"]');
    if (err) err.hidden = !on;
  }
})();
