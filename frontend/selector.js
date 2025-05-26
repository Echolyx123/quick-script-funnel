/* =========================
   selector.js — Funnel Selection Logic (with switchView & quiz sync)
   ========================= */
(function () {
  const $ = ClinicFunnel.$;
  const scrollContainer = $("#funnel-scroll-container");
  const backBtn = $("#back-to-splash");

  let funnelData = [];

  // Load funnels from JSON file
  function loadFunnelData() {
    fetch("clinic_funnels.json")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.funnels)) {
          funnelData = data.funnels;
          window.ClinicFunnel.funnelLibrary = funnelData;
          bindUI();
        } else {
          console.error("Invalid funnel structure.");
        }
      })
      .catch(err => console.error("Failed to load funnels:", err));
  }

  // Render cards with attached logic
  function renderFunnels() {
    scrollContainer.innerHTML = "";

    funnelData.forEach((funnel, index) => {
      const card = document.createElement("div");
      card.className = "funnel-card";

      const title = document.createElement("h3");
      title.textContent = funnel.previewName;

      const tags = document.createElement("div");
      tags.className = "tags";
      tags.textContent = funnel.tags.join(", ");

      const btn = document.createElement("button");
      btn.className = "preview-btn primary-btn";
      btn.textContent = "Start Funnel";
      btn.onclick = () => {
        const selected = funnelData[index];
        if (!selected) return;

        ClinicFunnel.loadFunnel(selected);

        // Start the quiz immediately after funnel is loaded
        if (typeof window.startQuiz === "function") {
          window.startQuiz();
        } else {
          console.error("startQuiz function is not available.");
        }
      };

      card.appendChild(title);
      card.appendChild(tags);
      card.appendChild(btn);
      scrollContainer.appendChild(card);
    });
  }

  // Show funnel selector screen
  function showSelector() {
    ClinicFunnel.switchView("#funnel-chooser");
    renderFunnels();
  }

  // Return to splash
  function returnToSplash() {
    ClinicFunnel.switchView("#splash");
  }

  // Bind only splash/return buttons
  function bindUI() {
    const splashBtn = $("#start-btn");
    if (splashBtn) splashBtn.addEventListener("click", showSelector);
    if (backBtn) backBtn.addEventListener("click", returnToSplash);
  }

  loadFunnelData(); // Init dataset and bind
})();
