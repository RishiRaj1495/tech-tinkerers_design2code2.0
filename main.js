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
  const FADE_DURATION_MS = 300;

  qsa('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      qsa('.filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter ?? 'all';

      qsa('.project-card').forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;

        if (matches) {
          card.classList.remove('hide-card');
          // Allow display to register, then fade in
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => card.classList.add('hide-card'), FADE_DURATION_MS);
        }
      });
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
  const sendBtn = el('sendBtn');
  if (!sendBtn) return;

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
      loading: { text: 'Sending Message…', disabled: true, bg: '#6B7280' },
      success: { text: 'Message Sent ✓', disabled: true, bg: '#22C55E' },
    };
    const s = states[state];
    sendBtn.textContent = s.text;
    sendBtn.disabled = s.disabled;
    sendBtn.style.background = s.bg;
  }

  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetErrors();

    if (!validate()) {
      showToast('Form Validation Failed', 'Please fill in all fields with valid information.', 'error');
      return;
    }

    setButtonState('loading');

    setTimeout(() => {
      showToast('Message Sent Successfully!', 'Thanks for connecting. I will get back to you shortly.');
      clearFields();
      setButtonState('success');

      setTimeout(() => setButtonState('idle'), 2500);
    }, 1200);
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
});
