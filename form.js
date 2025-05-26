/* =======================
   form.js — Clinic Smart Funnel App: Funnel Creation Logic (with switchView)
   ======================= */

(function() {
  const $ = ClinicFunnel.$;
  const on = ClinicFunnel.on;
  const safeSetText = ClinicFunnel.safeSetText;
  const safeFocus = ClinicFunnel.safeFocus;

  const formSection = $('#funnel-creator');
  const splashSection = $('#splash');
  const createBtn = $('#create-funnel-btn');
  const cancelBtn = $('#cancel-create-funnel');
  const form = $('#funnel-create-form');
  const startBtn = $('#start-btn');

  let errorMessageEl = null;

  // Show funnel creation form
  function showForm() {
    ClinicFunnel.switchView("#funnel-creator");
    form.scrollIntoView({ behavior: "smooth" });
    safeFocus($('#clinic-name'));
  }

  // Hide funnel creation form and return to splash
  function hideForm() {
    ClinicFunnel.switchView("#splash");
    form.reset();
    removeErrorMessage();
    safeFocus(startBtn);
  }

  // Display form error
  function showErrorMessage(msg) {
    if (!errorMessageEl) {
      errorMessageEl = document.createElement('div');
      errorMessageEl.className = "form-error-message";
      form.prepend(errorMessageEl);
    }
    safeSetText(errorMessageEl, msg);
    errorMessageEl.style.display = "block";
  }

  // Remove error from form
  function removeErrorMessage() {
    if (errorMessageEl) errorMessageEl.style.display = "none";
  }

  // Handle form submission
  function handleFormSubmit(e) {
    e.preventDefault();
    removeErrorMessage();

    const clinicName = $('#clinic-name').value.trim();
    const clinicType = $('#clinic-type').value;
    const clinicTone = $('#clinic-tone').value;
    const treatmentChecks = Array.from(form.querySelectorAll('input[name="treatments"]:checked'));
    const treatments = treatmentChecks.map(cb => cb.value);

    if (!clinicName) {
      showErrorMessage("Please enter your clinic or brand name.");
      $('#clinic-name').focus();
      return;
    }
    if (!clinicType) {
      showErrorMessage("Please select your clinic type.");
      $('#clinic-type').focus();
      return;
    }
    if (treatments.length < 1) {
      showErrorMessage("Please select at least one treatment.");
      (form.querySelector('input[name="treatments"]') || form).focus();
      return;
    }
    if (!clinicTone) {
      showErrorMessage("Please choose a preferred tone.");
      $('#clinic-tone').focus();
      return;
    }

    const funnelProfile = {
      clinicName,
      clinicType,
      treatments,
      clinicTone
    };

    ClinicFunnel.state.funnelProfile = funnelProfile;

    // For now, alert - will be replaced with preview or live generation
    alert(`Funnel generated!\n\nClinic: ${clinicName}\nType: ${clinicType}\nTreatments: ${treatments.join(", ")}\nTone: ${clinicTone}`);

    ClinicFunnel.switchView("#splash");
  }

  // Hook buttons
  on(createBtn, "click", showForm);
  on(cancelBtn, "click", hideForm);
  on(form, "submit", handleFormSubmit);

  // ESC key closes the form
  on(document, "keydown", e => {
    if (!formSection.classList.contains("hidden") && e.key === "Escape") hideForm();
  });

  // Clear error when input changes
  ClinicFunnel.$$('#funnel-create-form input, #funnel-create-form select').forEach(input => {
    on(input, "input", removeErrorMessage);
    on(input, "change", removeErrorMessage);
  });

})();
