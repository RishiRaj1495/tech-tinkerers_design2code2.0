/**
 * Tech Tinkerers — Portfolio
 * main.js
 *
 * Modules:
 *  1. Smooth Scroll
 *  2. Nav Drawer (hamburger)
 *  3. Modal System
 *  4. Resume Download
 *  5. Project Filtering
 *  6. Availability Toggle
 *  7. Toast Notifications
 *  8. Contact Form
 *  9. Mobile Preview Simulator
 * 10. Cross-frame Status Sync
 */

/* ─────────────────────────────────────────
   UTILITIES
───────────────────────────────────────── */

/** @param {string} id @returns {HTMLElement|null} */
const el = (id) => document.getElementById(id);

/** @param {string} selector @returns {NodeListOf<Element>} */
const qsa = (selector) => document.querySelectorAll(selector);

/**
 * Lock/unlock body scroll.
 * @param {boolean} lock
 */
function setBodyScroll(lock) {
  document.body.style.overflow = lock ? 'hidden' : '';
}

/* ─────────────────────────────────────────
   1. SMOOTH SCROLL
───────────────────────────────────────── */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ─────────────────────────────────────────
   2. NAV DRAWER
───────────────────────────────────────── */
function initNavDrawer() {
  const hamburger = el('hamburger');
  const drawer = el('navDrawer');
  if (!hamburger || !drawer) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    drawer.classList.toggle('open');
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
    });
  });
}

/* ─────────────────────────────────────────
   3. MODAL SYSTEM
───────────────────────────────────────── */

/**
 * @param {string[]} triggerIds  - IDs of elements that open the modal
 * @param {string}   modalId     - ID of the modal overlay
 * @param {string[]} closeIds    - IDs of elements that close the modal
 */
function setupModal(triggerIds, modalId, closeIds) {
  const modal = el(modalId);
  if (!modal) return;

  const openModal = (e) => {
    e.preventDefault();
    modal.classList.add('open');
    setBodyScroll(true);
  };

  const closeModal = (e) => {
    if (e) e.preventDefault();
    modal.classList.remove('open');
    setBodyScroll(false);
  };

  triggerIds.forEach((id) => el(id)?.addEventListener('click', openModal));
  closeIds.forEach((id) => el(id)?.addEventListener('click', closeModal));

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function initModals() {
  setupModal(
    ['desktopResumeBtn', 'mobileResumeBtn'],
    'resumeModal',
    ['closeResumeBtn', 'closeResumeFooterBtn']
  );
  setupModal(
    ['readBioBtn'],
    'bioModal',
    ['closeBioBtn', 'closeBioFooterBtn']
  );
}

/* ─────────────────────────────────────────
   4. RESUME DOWNLOAD
───────────────────────────────────────── */
const RESUME_CONTENT = `
=========================================
          RISHI RAJ - RESUME
=========================================

EDUCATION:
- VIT Bhopal University (2024 - Present)
  B.Tech in Computer Science & Engineering (Spec. in Gaming Technology)

EXPERIENCE:
- UX Club, VIT Bhopal (2024 - Present)
  Core Member / UI-UX Lead & Strategist
  Organized interaction design workshops, drafted college-level guidelines,
  led visual design strategy for local hackathons.

- Freelance Interaction Designer (2023 - Present)
  Created functional web UI prototypes, wireframes, and design components.

SKILLS:
- UI/UX: Wireframing, Prototyping, Figma, User Research, Visual Design
- Dev: HTML5, CSS3, JavaScript (ES6+), React.js core, GitHub, Responsive Design

CONTACT:
- Email: placeholder@designer.com
- LinkedIn: linkedin.com/company/uxclub/
- Location: VIT Bhopal, India
=========================================
`;

function initResumeDownload() {
  el('downloadResumeBtn')?.addEventListener('click', () => {
    const blob = new Blob([RESUME_CONTENT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RishiRaj_Resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download Triggered', 'RishiRaj_Resume.txt has been downloaded successfully.');
  });
}

/* ─────────────────────────────────────────
   5. PROJECT FILTERING
───────────────────────────────────────── */
function initProjectFilter() {
  const FADE_OUT_MS = 250;  // matches .projects-grid.filtering transition

  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  qsa('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      // Update active tab
      qsa('.filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter ?? 'all';

      // Phase 1: fade entire grid out
      grid.classList.add('filtering');

      // Phase 2: after fade-out, toggle cards and fade grid back in
      setTimeout(() => {
        qsa('.project-card').forEach((card) => {
          const matches = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('hide-card', !matches);

          // Re-trigger the per-card entry animation
          if (matches) {
            card.style.animation = 'none';
            void card.offsetHeight; // force reflow
            card.style.animation = '';
          }
        });

        // Fade grid back in
        grid.classList.remove('filtering');
      }, FADE_OUT_MS);
    });
  });
}

/* ─────────────────────────────────────────
   6. AVAILABILITY TOGGLE
───────────────────────────────────────── */

/**
 * Apply toggle state to DOM elements without triggering side-effects.
 * @param {boolean} isOff
 */
function applyToggleState(isOff) {
  const toggle = el('statusToggle');
  const label = el('availabilityStatus');
  if (!toggle || !label) return;

  toggle.classList.toggle('off', isOff);
  label.textContent = isOff ? 'Busy / Booked' : 'Available for Projects';
  label.style.color = isOff ? 'var(--text-light)' : 'var(--blue)';
}

function initAvailabilityToggle() {
  const toggle = el('statusToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isOff = !toggle.classList.contains('off');
    applyToggleState(isOff);

    const isInsideIframe = window.parent !== window;

    if (isInsideIframe) {
      // Notify parent to sync
      window.parent.postMessage({ type: 'STATUS_TOGGLE', isOff }, '*');
    } else {
      // Notify iframe to sync
      const iframe = el('previewIframe');
      iframe?.contentWindow?.postMessage({ type: 'SYNC_FROM_PARENT', isOff }, '*');

      showToast(
        'Status Updated',
        isOff ? 'You have set your status to Busy.' : 'You are now Available for projects!'
      );
    }
  });
}

/* ─────────────────────────────────────────
   7. TOAST NOTIFICATIONS
───────────────────────────────────────── */
const TOAST_VISIBLE_MS = 4000;
const TOAST_TRANSITION_MS = 400;

const SUCCESS_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>`;

const ERROR_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>`;

/**
 * @param {string} title
 * @param {string} message
 * @param {'success'|'error'} [type='success']
 */
function showToast(title, message, type = 'success') {
  const container = el('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' toast--error' : ''}`;
  toast.innerHTML = `
    <div class="toast-icon">${type === 'error' ? ERROR_ICON_SVG : SUCCESS_ICON_SVG}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>`;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Animate out and remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), TOAST_TRANSITION_MS);
  }, TOAST_VISIBLE_MS);
}

/* ─────────────────────────────────────────
   8. CONTACT FORM
───────────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initContactForm() {
  const form = el('contactForm');
  const sendBtn = el('sendBtn');
  if (!form || !sendBtn) return;

  const fields = {
    name: el('contactName'),
    email: el('contactEmail'),
    subject: el('contactSubject'),
    message: el('contactMessage'),
  };

  function resetErrors() {
    Object.values(fields).forEach((f) => f?.classList.remove('error-field'));
  }

  function validate() {
    let valid = true;

    if (!fields.name?.value.trim()) {
      fields.name?.classList.add('error-field');
      valid = false;
    }

    if (!fields.email || !EMAIL_REGEX.test(fields.email.value.trim())) {
      fields.email?.classList.add('error-field');
      valid = false;
    }

    if (!fields.subject?.value.trim()) {
      fields.subject?.classList.add('error-field');
      valid = false;
    }

    if (!fields.message?.value.trim()) {
      fields.message?.classList.add('error-field');
      valid = false;
    }

    return valid;
  }

  function clearFields() {
    Object.values(fields).forEach((f) => { if (f) f.value = ''; });
  }

  function setButtonState(state) {
    const states = {
      idle: { text: 'Send Message', disabled: false, bg: '' },
      loading: { text: 'Sending Message\u2026', disabled: true, bg: '#6B7280' },
      success: { text: 'Message Sent \u2713', disabled: true, bg: '#22C55E' },
      error: { text: 'Failed \u2014 Retry', disabled: false, bg: '#EF4444' },
    };
    const s = states[state];
    sendBtn.textContent = s.text;
    sendBtn.disabled = s.disabled;
    sendBtn.style.background = s.bg;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetErrors();

    if (!validate()) {
      showToast('Form Validation Failed', 'Please fill in all fields with valid information.', 'error');
      return;
    }

    // Sync the user-facing subject into the hidden Web3Forms subject field
    const hiddenSubject = el('hiddenSubject');
    if (hiddenSubject && fields.subject) {
      hiddenSubject.value = fields.subject.value.trim();
    }

    setButtonState('loading');

    try {
      const formData = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        showToast('Message Sent Successfully!', 'Thanks for connecting. I will get back to you shortly.');
        clearFields();
        setButtonState('success');
        setTimeout(() => setButtonState('idle'), 2500);
      } else {
        showToast('Submission Failed', result.message || 'Something went wrong. Please try again.', 'error');
        setButtonState('error');
        setTimeout(() => setButtonState('idle'), 3000);
      }
    } catch (err) {
      showToast('Network Error', 'Could not reach the server. Check your connection and try again.', 'error');
      setButtonState('error');
      setTimeout(() => setButtonState('idle'), 3000);
    }
  });
}

/* ─────────────────────────────────────────
   9. MOBILE PREVIEW SIMULATOR
───────────────────────────────────────── */
function initMobilePreview() {
  const previewOverlay = el('mobilePreviewOverlay');
  const previewBtn = el('mobilePreviewBtn');
  const rotateBtn = el('rotatePreviewBtn');
  const closeBtn = el('closePreviewBtn');
  const phoneShell = el('phoneShell');
  const iframe = el('previewIframe');

  if (!previewOverlay || !previewBtn || !iframe) return;

  // ── Dynamic Island ──
  let islandTimer = null;

  /**
   * @param {string} text
   * @param {string} [iconHtml='']
   * @param {number} [duration=2500]
   */
  function triggerDynamicIsland(text, iconHtml = '', duration = 2500) {
    const island = el('phoneDynamicIsland');
    const txt = el('islandText');
    if (!island || !txt) return;

    clearTimeout(islandTimer);
    txt.innerHTML = `${iconHtml} ${text}`;
    island.classList.add('expanded');

    islandTimer = setTimeout(() => {
      island.classList.remove('expanded');
      setTimeout(() => { txt.innerHTML = ''; }, 500);
    }, duration);
  }

  // ── Status Bar Clock ──
  function updateClock() {
    const timeSpan = el('statusBarTime');
    if (!timeSpan) return;
    const now = new Date();
    const hh = now.getHours();
    const mm = String(now.getMinutes()).padStart(2, '0');
    timeSpan.textContent = `${hh}:${mm}`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  // ── Open / Close ──
  function openPreview() {
    previewOverlay.classList.add('open');
    setBodyScroll(true);
    iframe.src = window.location.href;

    setTimeout(() => {
      triggerDynamicIsland(
        'Tech Tinkerers',
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--blue)"><circle cx="12" cy="12" r="10"/></svg>',
        2500
      );
    }, 600);
  }

  function closePreview() {
    previewOverlay.classList.remove('open');
    setBodyScroll(false);
    iframe.src = 'about:blank';
  }

  previewBtn.addEventListener('click', (e) => { e.preventDefault(); openPreview(); });
  closeBtn?.addEventListener('click', closePreview);
  previewOverlay.addEventListener('click', (e) => { if (e.target === previewOverlay) closePreview(); });

  // ── Rotate ──
  const ROTATE_MID_MS = 200;
  const ROTATE_END_MS = 600;

  const PORTRAIT_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/></svg>';
  const LANDSCAPE_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(90deg)"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/></svg>';

  rotateBtn?.addEventListener('click', () => {
    if (!phoneShell) return;
    const wasLandscape = phoneShell.classList.contains('landscape');

    phoneShell.classList.add('rotating');

    setTimeout(() => {
      phoneShell.classList.toggle('landscape');
      const isNowLandscape = !wasLandscape;
      triggerDynamicIsland(
        isNowLandscape ? 'Landscape Mode' : 'Portrait Mode',
        isNowLandscape ? LANDSCAPE_ICON : PORTRAIT_ICON,
        1800
      );
    }, ROTATE_MID_MS);

    setTimeout(() => phoneShell.classList.remove('rotating'), ROTATE_END_MS);
  });
}

/* ─────────────────────────────────────────
   10. CROSS-FRAME STATUS SYNC
───────────────────────────────────────── */
function initCrossFrameSync() {
  window.addEventListener('message', (event) => {
    if (!event.data?.type) return;

    // Iframe → Parent: user toggled status inside the iframe
    if (event.data.type === 'STATUS_TOGGLE') {
      const { isOff } = event.data;
      applyToggleState(isOff);

      showToast(
        'Status Synced',
        isOff ? 'Status updated to Busy.' : 'Status updated to Available!'
      );

      const dot = isOff
        ? '<span style="display:inline-block;width:8px;height:8px;background:#FF3B30;border-radius:50%"></span>'
        : '<span style="display:inline-block;width:8px;height:8px;background:#34C759;border-radius:50%"></span>';

      const island = document.getElementById('phoneDynamicIsland');
      if (island) {
        // Only trigger island animation when preview is open
        const overlay = document.getElementById('mobilePreviewOverlay');
        if (overlay?.classList.contains('open')) {
          // Re-use the same triggerDynamicIsland by dispatching a synthetic call
          const txt = document.getElementById('islandText');
          if (txt) {
            txt.innerHTML = `${dot} ${isOff ? 'Status: Busy' : 'Status: Available'}`;
            island.classList.add('expanded');
            setTimeout(() => {
              island.classList.remove('expanded');
              setTimeout(() => { txt.innerHTML = ''; }, 500);
            }, 2200);
          }
        }
      }
    }

    // Parent → Iframe: sync toggle state silently
    if (event.data.type === 'SYNC_FROM_PARENT') {
      applyToggleState(event.data.isOff);
    }
  });
}

/* ─────────────────────────────────────────
   11. SCROLL REVEAL
───────────────────────────────────────── */
function initScrollReveal() {
  // Don't animate inside iframes (mobile preview)
  if (window.parent !== window) return;

  // Elements to reveal on scroll (single items)
  const revealSelectors = [
    '.hero-left',
    '.hero-right',
    '.about h2',
    '.about-lead',
    '.about-link',
    '.section-header',
    '.section-header-row',
    '.contact h2',
    '.contact-lead',
    '.contact-form',
    '.expertise-divider',
  ];

  // Grid children to reveal with stagger
  const staggerSelectors = [
    '.about-card',
    '.project-card',
    '.expertise-card',
    '.contact-item',
  ];

  // Add .reveal class to single items
  revealSelectors.forEach((sel) => {
    qsa(sel).forEach((el) => el.classList.add('reveal'));
  });

  // Add .reveal + stagger delay classes to grid children
  staggerSelectors.forEach((sel) => {
    qsa(sel).forEach((el, i) => {
      el.classList.add('reveal');
      const delay = Math.min(i + 1, 4); // cap at delay-4
      el.classList.add(`reveal-delay-${delay}`);
    });
  });

  // Observe
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  qsa('.reveal').forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────────────
   12. SCROLL PROGRESS BAR
───────────────────────────────────────── */
function initScrollProgress() {
  if (window.parent !== window) return;
  const bar = el('scrollProgress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/* ─────────────────────────────────────────
   13. SMOOTH PAGE ENTRANCE
───────────────────────────────────────── */
function initPageEntrance() {
  if (window.parent !== window) return;
  document.body.classList.remove('page-loading');
  document.body.classList.add('page-loaded');
}

/* ─────────────────────────────────────────
   14. BUTTON RIPPLE EFFECT
───────────────────────────────────────── */
function initRippleEffect() {
  const rippleSelectors = '.btn-primary, .btn-outline, .btn-send, .nav-resume-btn, .filter-tab';

  document.addEventListener('click', (e) => {
    const btn = e.target.closest(rippleSelectors);
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const circle = document.createElement('span');
    circle.className = 'ripple-circle';
    circle.style.width = circle.style.height = size + 'px';
    circle.style.left = x + 'px';
    circle.style.top = y + 'px';

    btn.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
  });
}

/* ─────────────────────────────────────────
   15. MAGNETIC HOVER ON BUTTONS
───────────────────────────────────────── */
function initMagneticButtons() {
  if (window.parent !== window) return;

  const magneticEls = qsa('.btn-primary, .btn-outline, .btn-send, .nav-resume-btn');
  const STRENGTH = 0.3; // how much the button follows the cursor

  magneticEls.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * STRENGTH;
      const dy = (e.clientY - cy) * STRENGTH;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────
   16. 3D TILT ON CARDS
───────────────────────────────────────── */
function initCardTilt() {
  if (window.parent !== window) return;

  const cards = qsa('.project-card, .expertise-card, .about-card');
  const MAX_TILT = 6; // degrees

  cards.forEach((card) => {
    card.classList.add('tilt-card');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateY = ((x - midX) / midX) * MAX_TILT;
      const rotateX = ((midY - y) / midY) * MAX_TILT;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────
   17. PARALLAX HERO
───────────────────────────────────────── */
function initParallaxHero() {
  if (window.parent !== window) return;

  const photoCard = document.querySelector('.hero-photo-card');
  const heroSection = document.querySelector('.hero');
  if (!photoCard || !heroSection) return;

  function onScroll() {
    const rect = heroSection.getBoundingClientRect();
    // Only apply parallax while hero is visible
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const scrolled = window.scrollY;
    const offset = scrolled * 0.15; // subtle parallax factor
    photoCard.style.transform = `translateY(${offset}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initNavDrawer();
  initModals();
  initResumeDownload();
  initProjectFilter();
  initAvailabilityToggle();
  initContactForm();
  initMobilePreview();
  initCrossFrameSync();
  initScrollReveal();
  initScrollProgress();
  initPageEntrance();
  initRippleEffect();
  initMagneticButtons();
  initCardTilt();
  initParallaxHero();
});
