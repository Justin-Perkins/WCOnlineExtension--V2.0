// ---- GLOBAL SELECTORS ----
const selectors = {
    appStart: 'select[name="app_start"]',
    appEnd: 'select[name="app_end"]',
    tutor: 'select[name="tutor"]',
    discipline: 'select[name="cq7"]',
    appointmentType: 'select[name="cq3"]',
    sessionType: 'select[name="cq1"]',
    coordinator: 'select[name="cq4"]',
    location: 'select[name="cq5"]'
};

// ---- FUNCTION: Edit form ----
function editForm(formDoc, settings) {
    const appStartSelect = formDoc.querySelector(selectors.appStart);
    const appEndSelect = formDoc.querySelector(selectors.appEnd);
    const tutorSelect = formDoc.querySelector(selectors.tutor);
    const disciplineSelect = formDoc.querySelector(selectors.discipline);
    const appointmentTypeSelect = formDoc.querySelector(selectors.appointmentType);
    const sessionTypeSelect = formDoc.querySelector(selectors.sessionType);
    const coordinatorSelect = formDoc.querySelector(selectors.coordinator);
    const locationSelect = formDoc.querySelector(selectors.location);

    // ---- TIME OPTIONS ----
    const time = new Date();
    const currentMinutes = time.getHours() * 60 + time.getMinutes();
    const closestTimeIndex = Math.round(currentMinutes / 5) * 5;

    if (appStartSelect) {
        Array.from(appStartSelect.options).forEach(opt => {
            const val = parseInt(opt.value);
            if (val < 480 || val > 1200 || val % 5 !== 0) opt.hidden = true;
        });
        appStartSelect.value = (closestTimeIndex - 60 >= 480 && closestTimeIndex - 60 <= 1200)
            ? closestTimeIndex - 60 : 840;
    }

    if (appEndSelect) {
        Array.from(appEndSelect.options).forEach(opt => {
            const val = parseInt(opt.value);
            if (val < 480 || val > 1200 || val % 5 !== 0) opt.hidden = true;
        });
        appEndSelect.value = (closestTimeIndex >= 480 && closestTimeIndex <= 1200)
            ? closestTimeIndex : 840;
    }

    // ---- TUTOR ----
    if (tutorSelect && settings.tutor) {
        const tutorIds = settings.tutor.map(t => t.id); // extract ids
        Array.from(tutorSelect.options).forEach(opt => {
            if (!tutorIds.includes(opt.value)) opt.hidden = true;
        });
        tutorSelect.value = tutorIds[0]; // set first tutor
    }


    // ---- OTHER SETTINGS ----
    console.log("Tutoring Location from settings:", settings.tutorLocation);
    console.log("Available options:", Array.from(locationSelect.options).map(o => o.value));


    if (disciplineSelect && settings.discipline) disciplineSelect.value = settings.discipline;
    if (appointmentTypeSelect && settings.appointmentType) appointmentTypeSelect.value = settings.appointmentType;
    if (sessionTypeSelect && settings.sessionType) sessionTypeSelect.value = settings.sessionType;
    if (coordinatorSelect && settings.coordinator) coordinatorSelect.value = settings.coordinator;
    if (locationSelect && settings.tutoringLocation) locationSelect.value = settings.tutoringLocation;
}

// ---- FUNCTION: Save all options to Chrome Local Storage ----
function saveDefaults(formDoc) {
    const selectNames = ['tutor', 'cq7', 'cq3', 'cq1', 'cq4', 'cq5'];
    const defaultsObj = {};

    selectNames.forEach(name => {
        const selectEl = formDoc.querySelector(`select[name="${name}"]`);
        if (!selectEl) return;

        const options = Array.from(selectEl.options)
            .filter(opt => opt.value.trim() !== "") // remove "-- please select --"
            .map(opt => ({ id: opt.value, name: opt.textContent.trim() }));

        // Map to correct defaults key
        switch (name) {
            case 'tutor':
                defaultsObj.tutors = options.map(o => ({ id: o.id, name: o.name }));
                break;
            case 'cq7':
                defaultsObj.disciplines = options.map(o => o.name);
                break;
            case 'cq3':
                defaultsObj.appointmentTypes = options.map(o => o.name);
                break;
            case 'cq1':
                defaultsObj.sessionTypes = options.map(o => o.name);
                break;
            case 'cq4':
                defaultsObj.coordinators = options.map(o => o.name);
                break;
            case 'cq5':
                defaultsObj.tutoringLocations = options.map(o => o.name);
                break;
        }
    });

    chrome.storage.local.set({ defaultOptions: defaultsObj }, () => {
        console.log("Defaults updated in Chrome storage");
    });
}

// ---- FUNCTION: Load saved settings ----
function loadSavedSettings(callback) {
    chrome.storage.local.get(["defaultSettings"], data => {
        callback(data.defaultSettings || {});
    });
}

// ---- MAIN: Listen for page/form load ----
window.addEventListener('load', () => {
    const button = document.querySelector('a[data-bs-resid="CRF_OFFSCH"]');
    if (!button) return;

    button.addEventListener('click', () => {
        const iframe = document.getElementById('dynamicIframe');
        if (!iframe) return;

        iframe.addEventListener('load', () => {
            const formDoc = iframe.contentDocument.querySelector("body > form");
            if (!formDoc) {
                console.log('Client report form not found');
                return;
            }

            // Delay slightly to make sure options have rendered
            setTimeout(() => {
                saveDefaults(formDoc); // Save all options
                loadSavedSettings(settings => editForm(formDoc, settings)); // Apply saved settings dynamically
            }, 400);
        });
    });
});
