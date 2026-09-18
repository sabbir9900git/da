/* =========================================================
   DATE INVITATION WEBSITE — SCRIPT
   Vanilla JS only. No dependencies, no backend.
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------
     STATE — kept in memory while navigating between pages
  --------------------------------------------------- */
  const state = {
    dateValue: null,   // 'YYYY-MM-DD'
    hour: 7,           // 1-12
    minute: 0,          // 0-59
    period: 'PM'        // 'AM' | 'PM'
  };

  /* ---------------------------------------------------
     PAGE NAVIGATION
  --------------------------------------------------- */
  const pages = {
    1: document.getElementById('page1'),
    2: document.getElementById('page2'),
    3: document.getElementById('page3'),
    4: document.getElementById('page4')
  };

  function goToPage(num) {
    Object.values(pages).forEach((el) => el.classList.remove('page--active'));
    pages[num].classList.add('page--active');
    // Move focus to the new page's heading for accessibility
    const heading = pages[num].querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =====================================================
     FLOATING HEARTS / SPARKLES BACKGROUND
  ===================================================== */
  const floatyLayer = document.getElementById('floatyLayer');
  const floatyEmojis = ['💗', '💕', '✨', '🌸', '💫'];

  function spawnFloaty() {
    const el = document.createElement('span');
    el.className = 'floaty-item';
    el.textContent = floatyEmojis[Math.floor(Math.random() * floatyEmojis.length)];
    const leftPercent = Math.random() * 100;
    const size = 1 + Math.random() * 1.4;
    const duration = 9 + Math.random() * 8;
    const drift = (Math.random() * 80 - 40).toFixed(0) + 'px';

    el.style.left = leftPercent + '%';
    el.style.fontSize = size + 'rem';
    el.style.animationDuration = duration + 's';
    el.style.setProperty('--drift', drift);

    floatyLayer.appendChild(el);

    // Clean up after animation completes to avoid memory buildup
    setTimeout(() => el.remove(), duration * 1000 + 500);
  }

  // Respect reduced-motion preference: fewer / no floaties
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    for (let i = 0; i < 6; i++) {
      setTimeout(spawnFloaty, i * 700);
    }
    setInterval(spawnFloaty, 1400);
  }

  /* =====================================================
     PAGE 1 — THE INVITATION
  ===================================================== */
  const noBtn = document.getElementById('noBtn');
  const yesBtn1 = document.getElementById('yesBtn1');
  const buttonRow = document.getElementById('buttonRow');
  const noReaction = document.getElementById('noReaction');
  const successOverlay = document.getElementById('successOverlay');

  const noReactions = [
    'Nope, try again! 😆',
    'Nice try! 😜',
    'Not so fast! 🙈',
    'Almost! ...not really. 😂',
    'Keep dreaming! 💫',
    'The universe says no. 🌙',
    'Nu-uh! 🚫💕'
  ];

  let noMoveCount = 0;

  function moveNoButtonRandomly() {
    // Switch the button to fixed positioning the first time it flees,
    // so its coordinates are relative to the viewport (not its parent).
    if (!noBtn.classList.contains('is-fleeing')) {
      const rect = noBtn.getBoundingClientRect();
      noBtn.style.left = rect.left + 'px';
      noBtn.style.top = rect.top + 'px';
      noBtn.classList.add('is-fleeing');
    }

    const btnRect = noBtn.getBoundingClientRect();
    const btnWidth = btnRect.width || 120;
    const btnHeight = btnRect.height || 52;

    // Keep a small safe margin so the button never touches the edge
    // or triggers horizontal/vertical scrollbars.
    const margin = 12;
    const maxX = Math.max(margin, window.innerWidth - btnWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - btnHeight - margin);

    const newX = margin + Math.random() * (maxX - margin);
    const newY = margin + Math.random() * (maxY - margin);

    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';

    noMoveCount += 1;
    noReaction.textContent = noReactions[noMoveCount % noReactions.length];

    // Little playful wiggle
    noBtn.animate(
      [
        { transform: 'scale(1) rotate(0deg)' },
        { transform: 'scale(0.85) rotate(-8deg)' },
        { transform: 'scale(1.05) rotate(6deg)' },
        { transform: 'scale(1) rotate(0deg)' }
      ],
      { duration: 320, easing: 'ease-out' }
    );
  }

  // Desktop: dodge as soon as the cursor gets close (hover)
  noBtn.addEventListener('mouseenter', moveNoButtonRandomly);

  // Mobile / any pointer: dodge on the actual tap attempt too,
  // and always prevent the click from "succeeding".
  noBtn.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      moveNoButtonRandomly();
    },
    { passive: false }
  );

  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButtonRandomly();
  });

  // Keep the fleeing button inside the viewport if the window is resized
  window.addEventListener('resize', () => {
    if (!noBtn.classList.contains('is-fleeing')) return;
    const rect = noBtn.getBoundingClientRect();
    const margin = 12;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
    noBtn.style.left = Math.min(rect.left, maxX) + 'px';
    noBtn.style.top = Math.min(rect.top, maxY) + 'px';
  });

  function handleYes() {
    successOverlay.classList.add('is-visible');
    successOverlay.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      successOverlay.classList.remove('is-visible');
      successOverlay.setAttribute('aria-hidden', 'true');
      goToPage(2);
    }, 1700);
  }

  yesBtn1.addEventListener('click', handleYes);

  /* =====================================================
     PAGE 2 — CHOOSE THE DAY
  ===================================================== */
  const dateInput = document.getElementById('dateInput');
  const datePreview = document.getElementById('datePreview');
  const dateHint = document.getElementById('dateHint');
  const continueToTimeBtn = document.getElementById('continueToTime');
  const backTo1Btn = document.getElementById('backTo1');

  function todayISO() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Prevent past dates from being selected
  const minDate = todayISO();
  dateInput.setAttribute('min', minDate);
  dateHint.textContent = 'Pick today or any day after. 🌷';

  function formatDatePretty(isoString) {
    // isoString is 'YYYY-MM-DD'; parse manually to avoid timezone shifting
    const [y, m, d] = isoString.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  dateInput.addEventListener('change', () => {
    const value = dateInput.value;

    if (!value) {
      datePreview.textContent = '';
      continueToTimeBtn.disabled = true;
      return;
    }

    if (value < minDate) {
      dateHint.textContent = 'Oops, that day already passed! Pick today or later. 🥺';
      datePreview.textContent = '';
      continueToTimeBtn.disabled = true;
      dateInput.value = '';
      return;
    }

    dateHint.textContent = 'Perfect choice! 💗';
    state.dateValue = value;
    datePreview.textContent = '✨ ' + formatDatePretty(value);
    continueToTimeBtn.disabled = false;
  });

  backTo1Btn.addEventListener('click', () => goToPage(1));

  continueToTimeBtn.addEventListener('click', () => {
    if (!state.dateValue) return;
    updateChosenDateChip();
    goToPage(3);
  });

  /* =====================================================
     PAGE 3 — CHOOSE THE TIME
  ===================================================== */
  const hourSelect = document.getElementById('hourSelect');
  const minuteSelect = document.getElementById('minuteSelect');
  const amBtn = document.getElementById('amBtn');
  const pmBtn = document.getElementById('pmBtn');
  const timePreview = document.getElementById('timePreview');
  const chosenDateChip = document.getElementById('chosenDateChip');
  const backTo2Btn = document.getElementById('backTo2');
  const confirmDateBtn = document.getElementById('confirmDate');

  // Populate hour options 1-12
  for (let h = 1; h <= 12; h++) {
    const opt = document.createElement('option');
    opt.value = String(h);
    opt.textContent = String(h);
    hourSelect.appendChild(opt);
  }
  hourSelect.value = String(state.hour);

  // Populate minute options in 5-minute steps for a clean, premium picker
  for (let m = 0; m < 60; m += 5) {
    const opt = document.createElement('option');
    const padded = String(m).padStart(2, '0');
    opt.value = padded;
    opt.textContent = padded;
    minuteSelect.appendChild(opt);
  }
  minuteSelect.value = String(state.minute).padStart(2, '0');

  function updateChosenDateChip() {
    if (state.dateValue) {
      chosenDateChip.textContent = '📅 ' + formatDatePretty(state.dateValue);
    }
  }

  function updateTimePreview() {
    const h = String(hourSelect.value).padStart(2, '0');
    const m = minuteSelect.value;
    timePreview.textContent = `🕰️ ${h}:${m} ${state.period}`;
  }

  hourSelect.addEventListener('change', () => {
    state.hour = Number(hourSelect.value);
    updateTimePreview();
  });

  minuteSelect.addEventListener('change', () => {
    state.minute = Number(minuteSelect.value);
    updateTimePreview();
  });

  function setPeriod(period) {
    state.period = period;
    amBtn.classList.toggle('ampm-btn--active', period === 'AM');
    pmBtn.classList.toggle('ampm-btn--active', period === 'PM');
    updateTimePreview();
  }

  amBtn.addEventListener('click', () => setPeriod('AM'));
  pmBtn.addEventListener('click', () => setPeriod('PM'));

  backTo2Btn.addEventListener('click', () => goToPage(2));

  confirmDateBtn.addEventListener('click', () => {
    // Validation: hour/minute always have valid values because they come
    // from the <select> options themselves, so this simply guards against
    // any unexpected empty state.
    if (!hourSelect.value || minuteSelect.value === '') return;
    renderFinalPage();
    goToPage(4);
    launchConfetti();
  });

  // Initialize the preview on load
  updateTimePreview();

  /* =====================================================
     PAGE 4 — FINAL CONFIRMATION
  ===================================================== */
  const finalDate = document.getElementById('finalDate');
  const finalTime = document.getElementById('finalTime');
  const changeDateBtn = document.getElementById('changeDateBtn');
  const changeTimeBtn = document.getElementById('changeTimeBtn');
  const copyBtn = document.getElementById('copyBtn');
  const shareBtn = document.getElementById('shareBtn');
  const startAgainBtn = document.getElementById('startAgainBtn');

  function getTimeString() {
    const h = String(hourSelect.value).padStart(2, '0');
    const m = minuteSelect.value;
    return `${h}:${m} ${state.period}`;
  }

  function renderFinalPage() {
    finalDate.textContent = formatDatePretty(state.dateValue);
    finalTime.textContent = getTimeString();
  }

  changeDateBtn.addEventListener('click', () => goToPage(2));
  changeTimeBtn.addEventListener('click', () => goToPage(3));

  copyBtn.addEventListener('click', async () => {
    const text = `Our date: ${formatDatePretty(state.dateValue)} at ${getTimeString()} 💗`;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied! ✅';
    } catch (err) {
      copyBtn.textContent = 'Could not copy 😅';
    }
    setTimeout(() => { copyBtn.textContent = 'Copy details 📋'; }, 2000);
  });

  shareBtn.addEventListener('click', () => {
    const text = `It's a date! 🥹💗 ${formatDatePretty(state.dateValue)} at ${getTimeString()}. Can't wait! 💕`;
    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  startAgainBtn.addEventListener('click', () => {
    // Reset everything and go back to the very beginning
    state.dateValue = null;
    dateInput.value = '';
    datePreview.textContent = '';
    dateHint.textContent = 'Pick today or any day after. 🌷';
    continueToTimeBtn.disabled = true;

    // Reset the No button back to its original spot in the layout
    noBtn.classList.remove('is-fleeing');
    noBtn.style.left = '';
    noBtn.style.top = '';
    noReaction.textContent = '';
    noMoveCount = 0;

    goToPage(1);
  });

  /* =====================================================
     CONFETTI (lightweight canvas animation, no dependencies)
  ===================================================== */
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  const confettiColors = ['#E8A0A8', '#D4A574', '#F7D9DD', '#D9808C', '#FFFFFF'];

  function launchConfetti() {
    if (prefersReducedMotion) return; // respect user preference

    confettiParticles = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * confettiCanvas.height * 0.5,
        size: 5 + Math.random() * 6,
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        shape: Math.random() > 0.5 ? 'circle' : 'rect'
      });
    }

    let elapsed = 0;
    const maxDuration = 3200;
    const startTime = performance.now();

    function frame(now) {
      elapsed = now - startTime;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      confettiParticles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      });

      if (elapsed < maxDuration) {
        confettiAnimationId = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        cancelAnimationFrame(confettiAnimationId);
      }
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = requestAnimationFrame(frame);
  }
})();
