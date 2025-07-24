// Global Choices instances
let tutorChoices;
let disciplineChoice;
let appointmentTypeChoice;
let sessionTypeChoice;
let coordinatorChoice;
let tutoringLocationChoice;

// Load default options from default-options.json
async function readDefaultsOptions() {
  const res = await fetch(chrome.runtime.getURL("default-options.json"));
  return await res.json();
}

// Load saved selected values from config.json
async function readConfig() {
  try {
    const res = await fetch(chrome.runtime.getURL("config.json"));
    return await res.json();
  } catch (err) {
    console.error("Failed to load config.json", err);
    return null;
  }
}

// Populate single select dropdown options
function populateSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
}

// Populate multi-select dropdown (tutors)
function populateMultiSelect(id, tutors) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  tutors.forEach(tutor => {
    const option = document.createElement("option");
    option.value = tutor.id;
    option.textContent = tutor.name;
    select.appendChild(option);
  });
}

// Load options and initialize Choices.js on selects
async function loadOptions() {
  const defaults = await readDefaultsOptions();

  // Populate raw <select> elements from defaults
  populateMultiSelect("tutor", defaults.tutors);
  populateSelect("discipline", defaults.disciplines);
  populateSelect("appointmentType", defaults.appointmentTypes);
  populateSelect("sessionType", defaults.sessionTypes);
  populateSelect("coordinator", defaults.coordinators);
  populateSelect("tutoringLocation", defaults.tutoringLocations);

  // Destroy previous Choices instances if any
  if (tutorChoices) tutorChoices.destroy();
  if (disciplineChoice) disciplineChoice.destroy();
  if (appointmentTypeChoice) appointmentTypeChoice.destroy();
  if (sessionTypeChoice) sessionTypeChoice.destroy();
  if (coordinatorChoice) coordinatorChoice.destroy();
  if (tutoringLocationChoice) tutoringLocationChoice.destroy();

  // Initialize Choices.js instances
  tutorChoices = new Choices('#tutor', {
    removeItemButton: true,
    shouldSort: false,
    placeholder: true,
    placeholderValue: "Select tutors"
  });

  disciplineChoice = new Choices('#discipline', {
    shouldSort: false,
    searchEnabled: false
  });

  appointmentTypeChoice = new Choices('#appointmentType', {
    shouldSort: false,
    searchEnabled: false
  });

  sessionTypeChoice = new Choices('#sessionType', {
    shouldSort: false,
    searchEnabled: false
  });

  coordinatorChoice = new Choices('#coordinator', {
    shouldSort: false,
    searchEnabled: false
  });

  tutoringLocationChoice = new Choices('#tutoringLocation', {
    shouldSort: false,
    searchEnabled: false
  });
}

// Load saved selected values from config.json and apply to selects
async function loadSavedSettings() {
  const config = await readConfig();
  if (!config) return;

  if (config.tutor && tutorChoices) {
    // config.tutor is an array of tutor objects
    // Select only those tutors whose IDs exist in the loaded defaults (tutorChoices.options)
    const defaultTutorIds = tutorChoices.getValue(true); // returns array of selected values

    const validTutorIds = [];


    console.log("List of valid tutors", validTutorIds);

    config.tutor.forEach(savedTutor => {
        console.log("Saved tutor", savedTutor);


      if (defaultTutorIds.includes(savedTutor.id)) {
        validTutorIds.push(savedTutor.id);
      } else {
        console.error(`Tutor with id "${savedTutor.id}" not found in default tutors.`);
      }
    });

    tutorChoices.setValue(validTutorIds);
  }

  if (config.discipline && disciplineChoice) {
    disciplineChoice.setValue(config.discipline);
  }

  if (config.appointmentType && appointmentTypeChoice) {
    appointmentTypeChoice.setValue(config.appointmentType);
  }

  if (config.sessionType && sessionTypeChoice) {
    sessionTypeChoice.setValue(config.sessionType);
  }

  if (config.coordinator && coordinatorChoice) {
    coordinatorChoice.setValue(config.coordinator);
  }

  if (config.tutoringLocation && tutoringLocationChoice) {
    tutoringLocationChoice.setValue(config.coordinator);
  }
}

// Save current selections to chrome.storage.local (or wherever you want)
function saveSettings() {
  if (!tutorChoices || !disciplineChoice || !appointmentTypeChoice || !sessionTypeChoice || !coordinatorChoice || !tutoringLocationChoice) {
    alert("Form not ready");
    return;
  }

  const settings = {
    tutor: tutorChoices.getValue(true),          // Array of tutor ids
    discipline: disciplineChoice.getValue(true),  // String
    appointmentType: appointmentTypeChoice.getValue(true),
    sessionType: sessionTypeChoice.getValue(true),
    coordinator: coordinatorChoice.getValue(true),
    tutoringLocation: tutoringLocationChoice.getValue(true)
  };

  chrome.storage.local.set({ defaultSettings: settings }, () => {
    alert("Settings saved!");
  });
}

// Refresh options by reloading defaults and re-applying saved values
async function refreshOptions() {
  await loadOptions();
  await loadSavedSettings();
  alert("Options refreshed!");
}

// Set up button event listeners (make sure buttons exist in your HTML)
function setupEventListeners() {
  const saveBtn = document.getElementById("saveSettings");
  if (saveBtn) saveBtn.addEventListener("click", saveSettings);

  const refreshBtn = document.getElementById("refreshOptions");
  if (refreshBtn) refreshBtn.addEventListener("click", refreshOptions);
}

// Initialize all on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  await loadOptions();
  setupEventListeners();
  await loadSavedSettings();
});
