/* =======================
   base.js — Clinic Smart Funnel App Infrastructure
   ======================= */

// ---- Global App Namespace ----
window.ClinicFunnel = window.ClinicFunnel || {};

// ---- App DOM Utilities ----
ClinicFunnel.$ = (selector, root=document) => root.querySelector(selector);
ClinicFunnel.$$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));

ClinicFunnel.addClass = (el, cls) => { if (el && !el.classList.contains(cls)) el.classList.add(cls); }
ClinicFunnel.removeClass = (el, cls) => { if (el && el.classList.contains(cls)) el.classList.remove(cls); }
ClinicFunnel.toggleClass = (el, cls, cond) => { 
  if (el) cond ? el.classList.add(cls) : el.classList.remove(cls); 
};

ClinicFunnel.isVisible = el => el && (el.offsetParent !== null || (el.offsetWidth + el.offsetHeight > 0));
ClinicFunnel.safeFocus = el => { try { el && typeof el.focus === "function" && el.focus(); } catch(e){} };

ClinicFunnel.trapFocus = (container) => {
  if (!container) return;
  const focusEls = ClinicFunnel.$$('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])', container)
    .filter(el => !el.disabled && ClinicFunnel.isVisible(el));
  if (!focusEls.length) return;
  let first = focusEls[0], last = focusEls[focusEls.length - 1];
  container.addEventListener('keydown', function(e) {
    if (e.key === "Tab") {
      if (e.shiftKey) { if (document.activeElement === first) { last.focus(); e.preventDefault(); } }
      else { if (document.activeElement === last) { first.focus(); e.preventDefault(); } }
    }
  });
};

ClinicFunnel.safeSetText = (el, text) => { if (el) el.textContent = text ?? ""; };
ClinicFunnel.safeSetHTML = (el, html) => { if (el) el.innerHTML = html ?? ""; };

ClinicFunnel.fadeIn = (el, animation = 'fade-in-up') => {
  if (!el) return;
  ClinicFunnel.removeClass(el, 'hidden');
  ClinicFunnel.addClass(el, animation);
  el.addEventListener('animationend', () => { ClinicFunnel.removeClass(el, animation); }, { once: true });
};

ClinicFunnel.fadeOut = (el, animation = 'fade-out-down') => {
  if (!el) return;
  ClinicFunnel.addClass(el, animation);
  el.addEventListener('animationend', () => { 
    ClinicFunnel.addClass(el, 'hidden');
    ClinicFunnel.removeClass(el, animation);
  }, { once: true });
};

ClinicFunnel.toggleModal = (modalId, show=true) => {
  const modal = ClinicFunnel.$(modalId);
  if (!modal) return;
  if (show) {
    ClinicFunnel.removeClass(modal, 'hidden');
    ClinicFunnel.trapFocus(modal);
    setTimeout(() => ClinicFunnel.safeFocus(ClinicFunnel.$('button, [tabindex]', modal)), 80);
  } else {
    ClinicFunnel.addClass(modal, 'hidden');
  }
};

ClinicFunnel.toggleDrawer = (drawerId, show=true) => {
  const drawer = ClinicFunnel.$(drawerId);
  if (!drawer) return;
  if (show) {
    ClinicFunnel.addClass(drawer, 'open');
    ClinicFunnel.trapFocus(drawer);
    setTimeout(() => ClinicFunnel.safeFocus(ClinicFunnel.$('button, [tabindex]', drawer)), 80);
  } else {
    ClinicFunnel.removeClass(drawer, 'open');
  }
};

// ---- App State Management Skeleton ----
ClinicFunnel.state = {
  step: 0,
  answers: {},
  funnelId: null,
  // …more as needed
};

ClinicFunnel.resetState = function() {
  ClinicFunnel.state = { step: 0, answers: {}, funnelId: null };
};

// ---- Safe Event Listener Utility ----
ClinicFunnel.on = (el, evt, fn, opts={}) => { if (el) el.addEventListener(evt, fn, opts); };

// ---- Error Handling Utility ----
ClinicFunnel.handleError = function(message, err) {
  console.error("ClinicFunnel Error:", message, err || "");
};

// ---- Accessibility: Focus ring on keyboard only ----
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') document.body.classList.add('user-tabbing');
});
document.addEventListener('mousedown', e => {
  document.body.classList.remove('user-tabbing');
});

// ---- Funnel Loader for quiz.js integration ----
ClinicFunnel.loadFunnel = function (funnelObj) {
  ClinicFunnel.state.funnelId = funnelObj.id;
  ClinicFunnel.state.funnelProfile = funnelObj.clinicProfile;
  ClinicFunnel.state.funnelSteps = funnelObj.steps;
  ClinicFunnel.state.funnelResults = funnelObj.results;
};

// ---- NEW: Central View Switcher ----
ClinicFunnel.switchView = function(targetId, options = {}) {
  const views = [
    "#splash",
    "#funnel-chooser",
    "#funnel-creator",
    "#funnel",
    "#result",
    "#faq-drawer"
  ];

  views.forEach(id => {
    const el = ClinicFunnel.$(id);
    if (el) ClinicFunnel.addClass(el, "hidden");
  });

  if (targetId) {
    const main = ClinicFunnel.$(targetId);
    if (main) {
      ClinicFunnel.removeClass(main, "hidden");
      ClinicFunnel.fadeIn(main, "fade-in-up");
    }
  }

  if (Array.isArray(options.alsoShow)) {
    options.alsoShow.forEach(extraId => {
      const el = ClinicFunnel.$(extraId);
      if (el) ClinicFunnel.removeClass(el, "hidden");
    });
  }
};
