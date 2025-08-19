// GLOBAL SELECTORS
const selectors = {
  appStart: 'select[name="app_start"]',
  appEnd: 'select[name="app_end"]',
  tutor: 'select[name="tutor"]',
  discipline: 'select[name="cq7"]',
  appointmentType: 'select[name="cq3"]',
  sessionType: 'select[name="cq1"]',
  coordinator: 'select[name="cq4"]',
  location: 'select[name="cq5"]',
};

// TIME CONSTANTS
const TIME_START = 480; // 8:00 AM
const TIME_END = 1200; // 8:00 PM
const TIME_DEFAULT = 840; // 2:00 PM fallback

// Helper to safely apply saved values
function applySetting(field, value) {
  if (field && value) field.value = value;
}

// Edit the form by hiding/removing options and applying saved settings
function editForm(formDoc, settings) {
  const appStartSelect = formDoc.querySelector(selectors.appStart);
  const appEndSelect = formDoc.querySelector(selectors.appEnd);
  const tutorSelect = formDoc.querySelector(selectors.tutor);
  const disciplineSelect = formDoc.querySelector(selectors.discipline);
  const appointmentTypeSelect = formDoc.querySelector(
    selectors.appointmentType
  );
  const sessionTypeSelect = formDoc.querySelector(selectors.sessionType);
  const coordinatorSelect = formDoc.querySelector(selectors.coordinator);
  const locationSelect = formDoc.querySelector(selectors.location);

  // Time options: constrain available times between 8 AM (480) and 8 PM (1200)
  const time = new Date();
  const currentMinutes = time.getHours() * 60 + time.getMinutes();
  const closestTimeIndex = Math.round(currentMinutes / 5) * 5;

  if (appStartSelect) {
    Array.from(appStartSelect.options).forEach((opt) => {
      const val = parseInt(opt.value, 10);
      if (isNaN(val) || val < TIME_START || val > TIME_END || val % 5 !== 0)
        opt.hidden = true;
    });
    appStartSelect.value =
      closestTimeIndex - 60 >= TIME_START && closestTimeIndex - 60 <= TIME_END
        ? closestTimeIndex - 60
        : TIME_DEFAULT;
  }

  if (appEndSelect) {
    Array.from(appEndSelect.options).forEach((opt) => {
      const val = parseInt(opt.value, 10);
      if (isNaN(val) || val < TIME_START || val > TIME_END || val % 5 !== 0)
        opt.hidden = true;
    });
    appEndSelect.value =
      closestTimeIndex >= TIME_START && closestTimeIndex <= TIME_END
        ? closestTimeIndex
        : TIME_DEFAULT;
  }

  // Tutor field: restrict options and select the first saved tutor
  if (tutorSelect && settings.tutors) {
    const tutorIds = settings.tutors.map((t) => t.id);
    Array.from(tutorSelect.options).forEach((opt) => {
      if (!tutorIds.includes(opt.value)) opt.hidden = true;
    });
    tutorSelect.value = tutorIds[0];
  }

  // Apply saved defaults to other fields
  applySetting(disciplineSelect, settings.discipline);
  applySetting(appointmentTypeSelect, settings.appointmentType);
  applySetting(sessionTypeSelect, settings.sessionType);
  applySetting(coordinatorSelect, settings.coordinator);
  applySetting(locationSelect, settings.tutoringLocation);
}

// Save available options into Chrome local storage
function saveDefaults(formDoc) {
  const selectNames = ["tutor", "cq7", "cq3", "cq1", "cq4", "cq5"];
  const defaultsObj = {};

  selectNames.forEach((name) => {
    const selectEl = formDoc.querySelector(`select[name="${name}"]`);
    if (!selectEl) return;

    const options = Array.from(selectEl.options)
      .filter((opt) => opt.value.trim() !== "")
      .map((opt) => ({ id: opt.value, name: opt.textContent.trim() }));

    switch (name) {
      case "tutor":
        defaultsObj.tutors = options.map((o) => ({ id: o.id, name: o.name }));
        break;
      case "cq7":
        defaultsObj.disciplines = options.map((o) => o.name);
        break;
      case "cq3":
        defaultsObj.appointmentTypes = options.map((o) => o.name);
        break;
      case "cq1":
        defaultsObj.sessionTypes = options.map((o) => o.name);
        break;
      case "cq4":
        defaultsObj.coordinators = options.map((o) => o.name);
        break;
      case "cq5":
        defaultsObj.tutoringLocations = options.map((o) => o.name);
        break;
    }
  });

  chrome.storage.local.set({ defaultOptions: defaultsObj });
}

// Load saved user settings from Chrome storage
function loadSavedSettings(callback) {
  chrome.storage.local.get(["defaultSettings"], (data) => {
    callback(data.defaultSettings || {});
  });
}

// Main: listen for the "Off-Schedule Report" form being opened
window.addEventListener("load", () => {
  const button = document.querySelector('a[data-bs-resid="CRF_OFFSCH"]');
  if (!button) return;

  button.addEventListener("click", () => {
    const iframe = document.getElementById("dynamicIframe");
    if (!iframe) return;
    
    iframe.addEventListener("load", () => {
        const formDoc = iframe.contentDocument.querySelector("body > form");
        if (!formDoc) {
          console.debug("Client report form not found");
          return;
        }

        // Small delay ensures all options are rendered before applying defaults
        setTimeout(() => {
          saveDefaults(formDoc);
          loadSavedSettings((settings) => editForm(formDoc, settings));
        }, 400);
      }
    );
  });
});
