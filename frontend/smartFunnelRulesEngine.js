/* =====================================================
   smartFunnelRulesEngine.js — Weighted, Dynamic Rule Processor
   ===================================================== */

const SmartFunnelRulesEngine = (function () {
  /**
   * Evaluates user answers against weighted conditions and returns eligibility
   * @param {Object} funnel - Funnel object including logicBlocks[] and thresholds
   * @param {Object} answers - Map of question IDs to user-selected answers
   * @returns {Object} - eligibility outcome, score, confidence, message, recommendation
   */
  function evaluateWeighted(funnel, answers = {}) {
    const blocks = funnel.logicBlocks || [];
    const thresholds = funnel.thresholds || {
      eligible: 50,
      conditional: 10,
      ineligible: 0
    };

    let score = 0;
    let firedBlocks = [];

    for (const block of blocks) {
      let localScore = 0;
      let matched = false;

      for (const condition of block.conditions) {
        const userVal = answers[condition.id];
        if (userVal === condition.value) {
          localScore += condition.weight || 0;
          matched = true;
        }
      }

      if (matched) {
        score += localScore;
        firedBlocks.push({ id: block.id, localScore, message: block.message });
      }
    }

    let eligibility = "ineligible";
    if (score >= thresholds.eligible) {
      eligibility = true;
    } else if (score >= thresholds.conditional) {
      eligibility = "conditional";
    }

    return {
      eligible: eligibility,
      score,
      confidence: Math.min(100, Math.max(0, score + 50)),
      triggers: firedBlocks,
      message: firedBlocks.length > 0 ? firedBlocks.map(b => b.message).join("\n") : "Outcome based on combined logic analysis.",
      recommendation: eligibility === true ? "Proceed to booking." : eligibility === "conditional" ? "Further review needed." : "Please consult a clinician before proceeding."
    };
  }

  return {
    evaluateWeighted
  };
})();
