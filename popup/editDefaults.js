// Global Choices instances
let tutorChoices;
let disciplineChoice;
let appointmentTypeChoice;
let sessionTypeChoice;
let coordinatorChoice;
let tutoringLocationChoice;

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

// Load saved defaults from chrome.storage.local
async function readDefaults() {
    return new Promise(resolve => {
        chrome.storage.local.get(["defaultOptions"], data => {
            if (!data.defaultOptions) {
                // Initialize empty structure if nothing saved
                resolve({
                    tutors: [],
                    disciplines: [],
                    appointmentTypes: [],
                    sessionTypes: [],
                    coordinators: [],
                    tutoringLocations: []
                });
            } else {
                resolve(data.defaultOptions);
            }
        });
    });
}

// Load saved selected settings from chrome.storage.local
async function readSavedSettings() {
    return new Promise(resolve => {
        chrome.storage.local.get(["defaultSettings"], data => {
            resolve(data.defaultSettings || {});
        });
    });
}

// Save current selections to chrome.storage.local
function saveSettings() {
    if (!tutorChoices || !disciplineChoice || !appointmentTypeChoice || !sessionTypeChoice || !coordinatorChoice || !tutoringLocationChoice) {
        alert("Form not ready");
        return;
    }

    const settings = {
        tutor: tutorChoices.getValue(true),
        discipline: disciplineChoice.getValue(true),
        appointmentType: appointmentTypeChoice.getValue(true),
        sessionType: sessionTypeChoice.getValue(true),
        coordinator: coordinatorChoice.getValue(true),
        tutoringLocation: tutoringLocationChoice.getValue(true)
    };

    chrome.storage.local.set({ defaultSettings: settings }, () => {
        alert("Settings saved!");
    });
}

// Load options and initialize Choices.js
async function loadOptions() {
    const defaults = await readDefaults();

    populateMultiSelect("tutor", defaults.tutors);
    populateSelect("discipline", defaults.disciplines);
    populateSelect("appointmentType", defaults.appointmentTypes);
    populateSelect("sessionType", defaults.sessionTypes);
    populateSelect("coordinator", defaults.coordinators);
    populateSelect("tutoringLocation", defaults.tutoringLocations);

    if (tutorChoices) tutorChoices.destroy();
    if (disciplineChoice) disciplineChoice.destroy();
    if (appointmentTypeChoice) appointmentTypeChoice.destroy();
    if (sessionTypeChoice) sessionTypeChoice.destroy();
    if (coordinatorChoice) coordinatorChoice.destroy();
    if (tutoringLocationChoice) tutoringLocationChoice.destroy();

    tutorChoices = new Choices('#tutor', { removeItemButton: true, shouldSort: false, placeholder: true, placeholderValue: "Select tutors" });
    disciplineChoice = new Choices('#discipline', { shouldSort: false, searchEnabled: false });
    appointmentTypeChoice = new Choices('#appointmentType', { shouldSort: false, searchEnabled: false });
    sessionTypeChoice = new Choices('#sessionType', { shouldSort: false, searchEnabled: false });
    coordinatorChoice = new Choices('#coordinator', { shouldSort: false, searchEnabled: false });
    tutoringLocationChoice = new Choices('#tutoringLocation', { shouldSort: false, searchEnabled: false });
}

// Apply saved selections to Choices.js
async function loadSavedSettings() {
    const config = await readSavedSettings();
    if (!config) return;

    if (config.tutor && tutorChoices) tutorChoices.setChoiceByValue(config.tutor);
    if (config.discipline && disciplineChoice) disciplineChoice.setChoiceByValue(config.discipline);
    if (config.appointmentType && appointmentTypeChoice) appointmentTypeChoice.setChoiceByValue(config.appointmentType);
    if (config.sessionType && sessionTypeChoice) sessionTypeChoice.setChoiceByValue(config.sessionType);
    if (config.coordinator && coordinatorChoice) coordinatorChoice.setChoiceByValue(config.coordinator);
    if (config.tutoringLocation && tutoringLocationChoice) tutoringLocationChoice.setChoiceByValue(config.tutoringLocation);
}

// Refresh options by reloading from chrome local storage
async function refreshOptions() {
    await loadOptions();
    await loadSavedSettings();
    alert("Options refreshed from saved defaults!");
}

// Set up button event listeners
function setupEventListeners() {
    const saveBtn = document.getElementById("saveSettings");
    if (saveBtn) saveBtn.addEventListener("click", saveSettings);

    const refreshBtn = document.getElementById("refreshOptions");
    if (refreshBtn) refreshBtn.addEventListener("click", refreshOptions);
}

// Initialize everything on popup load
document.addEventListener("DOMContentLoaded", async () => {
    await loadOptions();
    setupEventListeners();
    await loadSavedSettings();
});
