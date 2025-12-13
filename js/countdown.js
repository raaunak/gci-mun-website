// countdown.js
document.addEventListener('DOMContentLoaded', () => {
  // === CONFIGURE TARGET DATE/TIME ===
  // Feb 14, 2025 00:00 Kathmandu time (UTC+05:45)
  const targetISO = '2026-02-19T00:00:00+05:45';
  const targetDate = new Date(targetISO);

  // DOM nodes (guard if missing)
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  const noteEl = document.getElementById('cd-note');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
    console.warn('Countdown elements not found. Make sure the HTML has #cd-days, #cd-hours, #cd-minutes, #cd-seconds.');
    return;
  }

  // Helper to pad numbers
  function pad(n) { return String(n).padStart(2, '0'); }

  // Create event banner element (hidden initially)
  let banner = document.getElementById('eventBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'eventBanner';
    banner.innerHTML = `
      <div class="banner-inner">
        <h1>GCI MUN 2025 — It's time!</h1>
        <p>Welcome to GCI Model United Nations 2025. The event has started.</p>
        <button class="banner-close" aria-label="Close banner">Close</button>
      </div>
    `;
    document.body.appendChild(banner);
    banner.querySelector('.banner-close').addEventListener('click', () => {
      banner.classList.remove('show');
    });
  }

  // state to detect changes for animation
  const lastValues = { d: null, h: null, m: null, s: null };

  function tickElement(el) {
    if (!el) return;
    el.classList.add('tick');
    // remove class after animation time
    setTimeout(() => el.classList.remove('tick'), 220);
  }

  function updateOnce() {
    const now = new Date();
    let diffMs = targetDate - now;
    const totalSec = Math.floor(diffMs / 1000);

    if (totalSec <= 0) {
      // event started
      daysEl.textContent = '0';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      if (noteEl) noteEl.innerHTML = '<strong>Event started!</strong>';
      // show banner
      banner.classList.add('show');
      // stop timer (we'll still set one to be safe)
      return false;
    }

    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    // update DOM and animate changed values
    if (lastValues.d !== days) {
      daysEl.textContent = days;
      tickElement(daysEl);
      lastValues.d = days;
    }
    if (lastValues.h !== hours) {
      hoursEl.textContent = pad(hours);
      tickElement(hoursEl);
      lastValues.h = hours;
    }
    if (lastValues.m !== minutes) {
      minutesEl.textContent = pad(minutes);
      tickElement(minutesEl);
      lastValues.m = minutes;
    }
    if (lastValues.s !== seconds) {
      secondsEl.textContent = pad(seconds);
      tickElement(secondsEl);
      lastValues.s = seconds;
    }

    if (noteEl) noteEl.innerHTML = `Event starts on <strong>February 19, 2026</strong>.`;

    return true;
  }

  // initial render
  updateOnce();
  // tick every second; if event reached, we still check once more and show banner
  const intervalId = setInterval(() => {
    const keepGoing = updateOnce();
    if (!keepGoing) {
      clearInterval(intervalId);
    }
  }, 1000);
});
