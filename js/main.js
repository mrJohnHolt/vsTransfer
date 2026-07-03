/* ===================================================================
   vsTransfer Training — main.js
   Module data, state, rendering, knowledge check validation
   =================================================================== */

(() => {
  "use strict";

  const STORAGE_KEY = "vstransfer-training-progress";

  const MODULES = [
    {
      id: 1,
      title: "What is vsTransfer?",
      objective: "Share large files securely with external recipients.",
      keyMessages: [
        "vsTransfer replaces WeTransfer",
        "Use it for large file transfers",
        "Files are stored in SharePoint",
        "External recipients can access files using a secure link"
      ],
      steps: [],
      check: {
        question: "When should you use vsTransfer?",
        options: [
          "For any file sharing",
          "For large file transfers to external recipients",
          "Only for internal files",
          "For replacing email"
        ],
        correct: 1
      }
    },
    {
      id: 2,
      title: "ZIP Files Are Mandatory",
      objective: "Prevent upload issues and keep files organised.",
      keyMessages: [
        "Only upload ZIP files",
        "Never upload individual files",
        "Never upload folders",
        "Combine all documents into a single ZIP file before upload"
      ],
      steps: [],
      check: {
        question: "What file type should be uploaded to vsTransfer?",
        options: [
          "Individual files",
          "Folders",
          "ZIP files only",
          "Any file type"
        ],
        correct: 2
      },
      note: "Using ZIP files ensures the recipient has to download the files."
    },
    {
      id: 3,
      title: "Upload and Share",
      objective: "Upload the ZIP and create the sharing link.",
      keyMessages: [],
      steps: [
        "Open vsTransfer",
        "Upload the ZIP file",
        "Locate the file",
        "Select the three dots (...)",
        "Select Copy Link",
        "Select Settings"
      ],
      check: {
        question: "Where do you access link settings?",
        options: [
          "From the main menu",
          "By selecting the three dots next to the file",
          "In Outlook settings",
          "In SharePoint"
        ],
        correct: 1
      }
    },
    {
      id: 4,
      title: "Security Settings",
      objective: "Ensure the recipient can access the file.",
      keyMessages: [
        "Default expiry is 15 days",
        "Password protection can be applied",
        "Can View should normally be used"
      ],
      steps: [
        "Ensure “The link works for” = Anyone",
        "Ensure permissions are “Can View”",
        "Review the expiry date",
        "Adjust the expiry date if required",
        "Add a password if required",
        "Apply changes",
        "Copy the link"
      ],
      check: {
        question: "What is the default expiry date for vsTransfer links?",
        options: [
          "7 days",
          "15 days",
          "30 days",
          "60 days"
        ],
        correct: 1
      }
    },
    {
      id: 5,
      title: "Send to Recipient",
      objective: "Complete the transfer.",
      keyMessages: [],
      steps: [
        "Open Outlook",
        "Create email",
        "Paste the link",
        "Provide any password separately if required",
        "Send"
      ],
      check: {
        question: "Should the password be sent in the same message as the link?",
        options: [
          "Yes always",
          "No, send it separately",
          "Only if requested",
          "Use email encryption instead"
        ],
        correct: 1
      }
    }
  ];

  const els = {
    sidebar: document.getElementById("sidebar"),
    sidebarScrim: document.getElementById("sidebar-scrim"),
    burgerToggle: document.getElementById("burger-toggle"),
    moduleList: document.getElementById("module-list"),
    progressFill: document.getElementById("progress-fill"),
    progressText: document.getElementById("progress-text"),
    progressPercent: document.getElementById("progress-percent"),
    progressBarWrap: document.querySelector(".progress-bar"),
    breadcrumbList: document.getElementById("breadcrumb-list"),
    modulePanel: document.getElementById("module-panel"),
    prevButton: document.getElementById("prev-button"),
    nextButton: document.getElementById("next-button"),
    bottomNavStatus: document.getElementById("bottom-nav-status"),
    resetButton: document.getElementById("reset-button"),
    toast: document.getElementById("toast")
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { completed: [], current: 1 };
      const parsed = JSON.parse(raw);
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        current: Number.isInteger(parsed.current) ? parsed.current : 1
      };
    } catch {
      return { completed: [], current: 1 };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();

  function isUnlocked(moduleId) {
    if (moduleId === 1) return true;
    return state.completed.includes(moduleId - 1);
  }

  function isComplete(moduleId) {
    return state.completed.includes(moduleId);
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => { els.toast.hidden = true; }, 2600);
  }

  function renderSidebar() {
    els.moduleList.innerHTML = "";
    MODULES.forEach((mod) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      const unlocked = isUnlocked(mod.id);
      const complete = isComplete(mod.id);

      button.type = "button";
      button.className = "module-list__link";
      if (complete) button.classList.add("is-complete");
      button.disabled = !unlocked;
      if (mod.id === state.current) button.setAttribute("aria-current", "step");

      const marker = document.createElement("span");
      marker.className = "module-list__marker";
      marker.setAttribute("aria-hidden", "true");
      marker.innerHTML = complete
        ? '<i class="fa-solid fa-check"></i>'
        : unlocked
          ? String(mod.id)
          : '<i class="fa-solid fa-lock"></i>';

      const label = document.createElement("span");
      label.textContent = `Module ${mod.id}: ${mod.title}`;

      button.appendChild(marker);
      button.appendChild(label);
      button.addEventListener("click", () => goToModule(mod.id));

      li.appendChild(button);
      els.moduleList.appendChild(li);
    });
  }

  function renderProgress() {
    const percent = Math.round((state.completed.length / MODULES.length) * 100);
    els.progressFill.style.width = `${percent}%`;
    els.progressText.textContent = `${state.completed.length} of ${MODULES.length} complete`;
    els.progressPercent.textContent = `${percent}%`;
    els.progressBarWrap.setAttribute("aria-valuenow", String(percent));
  }

  function renderBreadcrumb(mod) {
    els.breadcrumbList.innerHTML = "";
    const home = document.createElement("li");
    home.textContent = "vsTransfer Training";
    const current = document.createElement("li");
    current.textContent = `Module ${mod.id}: ${mod.title}`;
    els.breadcrumbList.appendChild(home);
    els.breadcrumbList.appendChild(current);
  }

  function renderModule(mod) {
    const complete = isComplete(mod.id);

    const keyMessagesHtml = mod.keyMessages.length
      ? `
        <h3 class="module__section-title">Key messages</h3>
        <ul class="key-messages">
          ${mod.keyMessages.map((msg) => `<li><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>${msg}</span></li>`).join("")}
        </ul>
      `
      : "";

    const stepsHtml = mod.steps.length
      ? `
        <h3 class="module__section-title">Steps</h3>
        <ol class="steps">
          ${mod.steps.map((step) => `<li><span>${step}</span></li>`).join("")}
        </ol>
      `
      : "";

    const optionsHtml = mod.check.options.map((opt, i) => `
      <li class="kc-option" data-option-index="${i}">
        <input class="kc-option__input" type="radio" name="kc-option" id="kc-option-${i}" value="${i}">
        <label class="kc-option__label" for="kc-option-${i}">
          <span class="kc-option__marker" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
          <span>${opt}</span>
        </label>
      </li>
    `).join("");

    els.modulePanel.innerHTML = `
      <p class="module__eyebrow"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i> Module ${mod.id} of ${MODULES.length}</p>
      <h2 class="module__title">${mod.title}</h2>
      <p class="module__objective"><i class="fa-solid fa-bullseye" aria-hidden="true"></i> ${mod.objective}</p>
      ${keyMessagesHtml}
      ${stepsHtml}
      <section class="knowledge-check" aria-labelledby="kc-heading-${mod.id}">
        <p class="knowledge-check__title" id="kc-heading-${mod.id}"><i class="fa-solid fa-circle-question" aria-hidden="true"></i> Knowledge check</p>
        <p class="kc-question">${mod.check.question}</p>
        <ul class="kc-options">${optionsHtml}</ul>
        <p class="kc-feedback" id="kc-feedback" hidden></p>
        <div class="kc-actions">
          <button type="button" class="button button--primary" id="kc-submit">
            <span>Check answer</span>
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </section>
      ${mod.note ? `
        <p class="module__note"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i> ${mod.note}</p>
      ` : ""}
      ${complete ? `
        <p class="module__complete-banner"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Nice work, module ${mod.id} is complete. ${mod.id < MODULES.length ? "Move on when you're ready." : "You've finished the training."}</p>
      ` : ""}
    `;

    if (complete) {
      lockOptions(mod, mod.check.correct);
    } else {
      wireKnowledgeCheck(mod);
    }
  }

  function lockOptions(mod, correctIndex) {
    const items = els.modulePanel.querySelectorAll(".kc-option");
    items.forEach((item, i) => {
      const input = item.querySelector(".kc-option__input");
      input.disabled = true;
      if (i === correctIndex) item.classList.add("kc-option--correct");
    });
    const submit = document.getElementById("kc-submit");
    submit.disabled = true;
    submit.innerHTML = '<span>Answered correctly</span> <i class="fa-solid fa-check" aria-hidden="true"></i>';
  }

  function wireKnowledgeCheck(mod) {
    const submit = document.getElementById("kc-submit");
    const feedback = document.getElementById("kc-feedback");

    submit.addEventListener("click", () => {
      const checked = els.modulePanel.querySelector('input[name="kc-option"]:checked');
      if (!checked) {
        feedback.hidden = false;
        feedback.className = "kc-feedback kc-feedback--incorrect";
        feedback.textContent = "Select an answer before continuing.";
        return;
      }

      const selectedIndex = Number(checked.value);
      const items = els.modulePanel.querySelectorAll(".kc-option");

      items.forEach((item) => item.classList.remove("kc-option--correct", "kc-option--incorrect"));

      if (selectedIndex === mod.check.correct) {
        items[selectedIndex].classList.add("kc-option--correct");
        feedback.hidden = false;
        feedback.className = "kc-feedback kc-feedback--correct";
        feedback.textContent = "Correct. You can now move to the next module.";
        lockOptions(mod, mod.check.correct);
        markComplete(mod.id);
      } else {
        items[selectedIndex].classList.add("kc-option--incorrect");
        feedback.hidden = false;
        feedback.className = "kc-feedback kc-feedback--incorrect";
        feedback.textContent = "Not quite. Review the module content and try again.";
      }
    });
  }

  function markComplete(moduleId) {
    if (!state.completed.includes(moduleId)) {
      state.completed.push(moduleId);
      saveState();
      renderSidebar();
      renderProgress();
      updateBottomNav();
      showToast(`Module ${moduleId} complete`);
    }
  }

  function updateBottomNav() {
    const mod = MODULES.find((m) => m.id === state.current);
    els.prevButton.disabled = state.current === 1;
    els.nextButton.disabled = !isComplete(state.current) || state.current === MODULES.length;
    els.bottomNavStatus.textContent = `Module ${state.current} of ${MODULES.length}`;

    if (state.current === MODULES.length && isComplete(state.current)) {
      els.nextButton.innerHTML = '<span>Complete</span> <i class="fa-solid fa-flag-checkered" aria-hidden="true"></i>';
    } else {
      els.nextButton.innerHTML = '<span>Next</span> <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
    }
  }

  function goToModule(moduleId) {
    if (!isUnlocked(moduleId)) {
      showToast("Complete the previous module first.");
      return;
    }
    state.current = moduleId;
    saveState();
    render();
    closeSidebar();
    els.modulePanel.focus?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function render() {
    const mod = MODULES.find((m) => m.id === state.current);
    renderSidebar();
    renderProgress();
    renderBreadcrumb(mod);
    renderModule(mod);
    updateBottomNav();
  }

  function openSidebar() {
    els.sidebar.classList.add("is-open");
    els.sidebarScrim.hidden = false;
    els.burgerToggle.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    els.sidebar.classList.remove("is-open");
    els.sidebarScrim.hidden = true;
    els.burgerToggle.setAttribute("aria-expanded", "false");
  }

  function toggleSidebar() {
    if (els.sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  els.burgerToggle.addEventListener("click", toggleSidebar);
  els.sidebarScrim.addEventListener("click", closeSidebar);

  els.prevButton.addEventListener("click", () => {
    if (state.current > 1) goToModule(state.current - 1);
  });

  els.nextButton.addEventListener("click", () => {
    if (state.current < MODULES.length && isComplete(state.current)) {
      goToModule(state.current + 1);
    }
  });

  els.resetButton.addEventListener("click", () => {
    const confirmed = window.confirm("Reset all progress? This cannot be undone.");
    if (!confirmed) return;
    state = { completed: [], current: 1 };
    saveState();
    render();
    showToast("Progress reset");
  });

  render();
})();
