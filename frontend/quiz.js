/* =======================
   quiz.js — Clinic Smart Funnel App: Quiz Engine (enhanced with SmartFunnelEngine)
   ======================= */

(function () {
  const $ = ClinicFunnel.$;
  const $$ = ClinicFunnel.$$;
  const safeSetText = ClinicFunnel.safeSetText;
  const on = ClinicFunnel.on;

  const funnelSection = $('#funnel');
  const resultSection = $('#result');
  const faqDrawer = $('#faq-drawer');

  const progressInner = $('#progress-inner');
  const stepNum = $('#step-num');
  const stepTotal = $('#step-total');
  const questionIcon = $('#question-icon');
  const questionText = $('#question-text');
  const answersDiv = $('#answers');
  const guideText = $('#question-guide');
  const tipArea = $('#tip-area');
  const backBtn = $('#back-btn');
  const nextBtn = $('#next-btn');

  const resultIcon = $('#result-icon');
  const resultTitle = $('#result-title');
  const resultMessage = $('#result-message');
  const recommendationsDiv = $('#recommendations');
  const restartBtn = $('#restart-btn');

  let quizSteps = [];
  let userAnswers = {};
  let currentStep = 0;

  function startQuiz() {
    const steps = ClinicFunnel.state.funnelSteps;
    const profile = ClinicFunnel.state.funnelProfile;

    if (!Array.isArray(steps) || steps.length < 1) {
      alert("Sorry, this funnel is not correctly formatted. Please select another.");
      return;
    }

    quizSteps = steps;
    userAnswers = {};
    currentStep = 0;

    updateStep();
    ClinicFunnel.switchView("#funnel");
    updateProgress();
  }

  function updateStep() {
    const step = quizSteps[currentStep];
    if (!step) return;

    safeSetText(stepNum, (currentStep + 1).toString());
    safeSetText(stepTotal, quizSteps.length.toString());
    updateProgress();

    questionIcon.textContent = step.icon || "";
    safeSetText(questionText, step.text || "");
    safeSetText(guideText, step.guide || "");

    answersDiv.innerHTML = "";
    tipArea.style.display = "none";

    if (step.type === "choice" && Array.isArray(step.options)) {
      step.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "answer-option";
        btn.textContent = option;
        btn.tabIndex = 0;
        btn.onclick = () => {
          $$(".answer-option", answersDiv).forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          userAnswers[step.id] = option;
          nextBtn.disabled = false;
        };
        answersDiv.appendChild(btn);
      });

      if (userAnswers[step.id]) {
        $$(".answer-option", answersDiv).forEach(btn => {
          if (btn.textContent === userAnswers[step.id]) btn.classList.add("selected");
        });
        nextBtn.disabled = false;
      } else {
        nextBtn.disabled = true;
      }

      backBtn.disabled = (currentStep === 0);
    } else {
      userAnswers[step.id] = null;
      nextBtn.disabled = false;
      backBtn.disabled = (currentStep === 0);
    }
  }

  function updateProgress() {
    const percent = Math.round(100 * currentStep / (quizSteps.length - 1));
    progressInner.style.width = percent + "%";
  }

  function nextStep() {
    if (currentStep < quizSteps.length - 1) {
      currentStep++;
      updateStep();
    } else {
      showResult();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      updateStep();
    }
  }

  function showResult() {
    renderResult();
    ClinicFunnel.switchView("#result");
  }

  function renderResult() {
    const funnel = ClinicFunnel.state.selectedFunnel || {
      steps: quizSteps,
      rules: ClinicFunnel.state.funnelRules || []
    };

    const result = SmartFunnelEngine.evaluateFunnel(funnel, userAnswers);

    const iconMap = {
      true: "✅",
      false: "⛔",
      conditional: "⚠️"
    };

    resultIcon.textContent = iconMap[result.eligible] || "ℹ️";
    safeSetText(resultTitle, result.message || "Result Summary");
    safeSetText(resultMessage, `Confidence: ${result.confidence || 0}%`);
    safeSetText(recommendationsDiv, result.recommendation || "No recommendation available.");
  }

  function restartQuiz() {
    userAnswers = {};
    currentStep = 0;
    ClinicFunnel.switchView("#splash");
  }

  on(nextBtn, "click", nextStep);
  on(backBtn, "click", prevStep);
  on(restartBtn, "click", restartQuiz);

  answersDiv && on(answersDiv, "keydown", function (e) {
    if (e.key === "Enter") {
      const selected = $(".answer-option.selected", answersDiv);
      if (selected && !nextBtn.disabled) nextStep();
    }
  });

  const faqBtn = $('#faq-btn');
  const closeFaq = $('#close-faq');
  on(faqBtn, "click", () => {
    ClinicFunnel.removeClass(faqDrawer, "hidden");
    ClinicFunnel.trapFocus(faqDrawer);
    setTimeout(() => ClinicFunnel.safeFocus(closeFaq), 60);
  });
  on(closeFaq, "click", () => ClinicFunnel.addClass(faqDrawer, "hidden"));

  // Expose for selector.js use
  window.startQuiz = startQuiz;
})();
