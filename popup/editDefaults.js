// Global Choices.js instances for each select element
let tutorChoices;
let disciplineChoice;
let appointmentTypeChoice;
let sessionTypeChoice;
let coordinatorChoice;
let tutoringLocationChoice;

// Populate a single-select dropdown with options
function populateSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
}

// Populate a multi-select dropdown (tutors)
function populateMultiSelect(id, tutors) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  tutors.forEach((tutor) => {
    const option = document.createElement("option");
    option.value = tutor.id;
    option.textContent = tutor.name;
    select.appendChild(option);
  });
}

// Read default option lists from Chrome storage
async function readDefaults() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["defaultOptions"], (data) => {
      resolve(
        data.defaultOptions || {
          tutors: [],
          disciplines: [],
          appointmentTypes: [],
          sessionTypes: [],
          coordinators: [],
          tutoringLocations: [],
        }
      );
    });
  });
}

// Read saved user settings from Chrome storage
async function readSavedSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["defaultSettings"], (data) => {
      resolve(data.defaultSettings || {});
    });
  });
}

// Save current selections into Chrome storage
function saveSettings() {
  if (
    !tutorChoices ||
    !disciplineChoice ||
    !appointmentTypeChoice ||
    !sessionTypeChoice ||
    !coordinatorChoice ||
    !tutoringLocationChoice
  ) {
    alert("Form not ready");
    return;
  }

  const tutorOptions = tutorChoices.getValue();
  const tutors = tutorOptions.map((t) => ({ id: t.value, name: t.label }));

  const settings = {
    tutors, // match your main script naming
    discipline: disciplineChoice.getValue(true),
    appointmentType: appointmentTypeChoice.getValue(true),
    sessionType: sessionTypeChoice.getValue(true),
    coordinator: coordinatorChoice.getValue(true),
    tutoringLocation: tutoringLocationChoice.getValue(true),
  };

  chrome.storage.local.set({ defaultSettings: settings }, () => {
    alert("Settings saved!");
  });
}

// Load default option lists and initialize Choices.js instances
async function loadOptions() {
  const defaults = await readDefaults();

  populateMultiSelect("tutor", defaults.tutors);
  populateSelect("discipline", defaults.disciplines);
  populateSelect("appointmentType", defaults.appointmentTypes);
  populateSelect("sessionType", defaults.sessionTypes);
  populateSelect("coordinator", defaults.coordinators);
  populateSelect("tutoringLocation", defaults.tutoringLocations);

  // Destroy existing Choices instances if reloaded
  [
    tutorChoices,
    disciplineChoice,
    appointmentTypeChoice,
    sessionTypeChoice,
    coordinatorChoice,
    tutoringLocationChoice,
  ].forEach((choice) => choice?.destroy());

  // Initialize new Choices instances
  tutorChoices = new Choices("#tutor", {
    removeItemButton: true,
    shouldSort: false,
    placeholder: true,
    placeholderValue: "Select tutors",
  });
  disciplineChoice = new Choices("#discipline", {
    shouldSort: false,
    searchEnabled: false,
  });
  appointmentTypeChoice = new Choices("#appointmentType", {
    shouldSort: false,
    searchEnabled: false,
  });
  sessionTypeChoice = new Choices("#sessionType", {
    shouldSort: false,
    searchEnabled: false,
  });
  coordinatorChoice = new Choices("#coordinator", {
    shouldSort: false,
    searchEnabled: false,
  });
  tutoringLocationChoice = new Choices("#tutoringLocation", {
    shouldSort: false,
    searchEnabled: false,
  });
}

// Apply saved user selections back into the form
async function loadSavedSettings() {
  const config = await readSavedSettings();
  if (!config) return;

  if (config.tutors && tutorChoices)
    tutorChoices.setChoiceByValue(config.tutors.map((t) => t.id));
  if (config.discipline && disciplineChoice)
    disciplineChoice.setChoiceByValue(config.discipline);
  if (config.appointmentType && appointmentTypeChoice)
    appointmentTypeChoice.setChoiceByValue(config.appointmentType);
  if (config.sessionType && sessionTypeChoice)
    sessionTypeChoice.setChoiceByValue(config.sessionType);
  if (config.coordinator && coordinatorChoice)
    coordinatorChoice.setChoiceByValue(config.coordinator);
  if (config.tutoringLocation && tutoringLocationChoice)
    tutoringLocationChoice.setChoiceByValue(config.tutoringLocation);
}

// Refresh dropdowns from saved defaults
async function refreshOptions() {
  await loadOptions();
  await loadSavedSettings();
  alert("Options refreshed from saved defaults!");
}

// Set up event listeners for save and refresh buttons
function setupEventListeners() {
  document
    .getElementById("saveSettings")
    ?.addEventListener("click", saveSettings);
  document
    .getElementById("refreshOptions")
    ?.addEventListener("click", refreshOptions);
}

// Initialize page: load defaults, attach events, and restore saved settings
document.addEventListener("DOMContentLoaded", async () => {
  await loadOptions();
  await loadSavedSettings();
  setupEventListeners();
});
