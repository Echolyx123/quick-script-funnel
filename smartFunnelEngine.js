/* =============================================
   smartFunnelEngine.js — Intelligent Funnel Validator & Expander
   ============================================= */

const SmartFunnelEngine = (function () {
  /**
   * Evaluate funnel answers and apply rules to determine eligibility
   * @param {Object} funnel - the full funnel object (includes steps, rules)
   * @param {Object} userAnswers - a map of step IDs to selected answers
   * @returns {Object} result payload { eligible, confidence, message, recommendation, actions }
   */
  function evaluateFunnel(funnel, userAnswers = {}) {
    const rules = funnel.rules || [];
    const steps = funnel.steps || [];
    let matchedRule = null;

    // Confidence is based on number of answered questions vs important ones
    const importantSteps = steps.filter(s => s.priority === 1 || !s.priority);
    const answered = Object.keys(userAnswers).filter(k => userAnswers[k] !== null && userAnswers[k] !== undefined);
    const clarityScore = Math.round((answered.length / importantSteps.length) * 100);

    // Match rule logic
    for (const rule of rules) {
      const expected = rule.if?.answers || {};
      let isMatch = true;

      for (const key in expected) {
        const expectedVal = expected[key];
        const userVal = userAnswers[key];

        if (userVal !== expectedVal) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matchedRule = rule.then;
        break;
      }
    }

    // Default result if no rule matched
    const fallback = {
      eligible: clarityScore >= 80 ? 'conditional' : false,
      confidence: clarityScore,
      message: clarityScore >= 80 ? "We need a little more info to decide." : "Your answers are too unclear to evaluate confidently.",
      recommendation: clarityScore >= 80 ? "Please consult a specialist for clarification." : "Restart or complete more questions for an accurate match.",
      actions: ["retry", "book-consult"]
    };

    return {
      eligible: matchedRule?.eligible ?? fallback.eligible,
      confidence: clarityScore,
      message: matchedRule?.message ?? fallback.message,
      recommendation: matchedRule?.recommendation ?? fallback.recommendation,
      actions: matchedRule?.actions ?? fallback.actions
    };
  }

  /**
   * Select next questions based on current clarity
   * @param {Array} steps - all possible steps
   * @param {Object} userAnswers - what the user has answered so far
   * @param {Number} confidence - current clarity/confidence percentage
   * @returns {Array} filtered steps to ask next
   */
  function getNextSteps(steps, userAnswers, confidence) {
    const answeredKeys = Object.keys(userAnswers);
    const unanswered = steps.filter(s => !answeredKeys.includes(s.id));

    // If confidence is too low, prioritise category = risk or clarification
    if (confidence < 70) {
      return unanswered.filter(s => s.category === 'risk' || s.category === 'clarifier').slice(0, 3);
    }

    // Otherwise allow fallback depth
    return unanswered.filter(s => s.priority >= 2 || s.category === 'context').slice(0, 2);
  }

  return {
    evaluateFunnel,
    getNextSteps
  };
})();
