// ---- TEMP CONFIG: Your preset selections ----
const preset = {
    tutors: ["sc67058e55b7026"], // can be multiple
    discipline: "Science/Technology/Engineering",
    appointmentType: "Drop-in",
    sessionType: "Tutoring",
    coordinator: "Cristy Rodrick",
    tutorLocation: "LC-205"
};

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

// ---- FUNCTION: Edit form (hide invalid options, set preset values) ----
function editForm(formDoc) {
    const time = new Date();
    const currentMinutes = time.getHours() * 60 + time.getMinutes();
    const closestTimeIndex = Math.round(currentMinutes / 5) * 5;

    // ---- TIME SELECTS ----
    ['appStart', 'appEnd'].forEach(key => {
        const selectEl = formDoc.querySelector(selectors[key]);
        if (!selectEl) return;

        Array.from(selectEl.options).forEach(opt => {
            const val = parseInt(opt.value);
            if (val < 480 || val > 1200 || val % 5 !== 0) opt.hidden = true;
        });

        if (key === 'appStart') {
            selectEl.value = (closestTimeIndex - 60 >= 480 && closestTimeIndex - 60 <= 1200)
                ? closestTimeIndex - 60 : 840;
        } else {
            selectEl.value = (closestTimeIndex >= 480 && closestTimeIndex <= 1200)
                ? closestTimeIndex : 840;
        }
    });

    // ---- TUTOR ----
    const tutorSelect = formDoc.querySelector(selectors.tutor);
    if (tutorSelect) {
        Array.from(tutorSelect.options).forEach(opt => {
            if (!preset.tutors.includes(opt.value)) opt.hidden = true;
        });
        tutorSelect.value = preset.tutors[0];
    }

    // ---- OTHER PRESETS ----
    const presetMapping = {
        discipline: preset.discipline,
        appointmentType: preset.appointmentType,
        sessionType: preset.sessionType,
        coordinator: preset.coordinator,
        location: preset.tutorLocation
    };

    for (const [key, value] of Object.entries(presetMapping)) {
        const selectEl = formDoc.querySelector(selectors[key]);
        if (selectEl) selectEl.value = value;
    }
}

// ---- FUNCTION: Save all options to Chrome Local Storage ----
function saveDefaults(formDoc) {
    chrome.storage.local.get(["defaultOptions"], data => {
        const defaults = data.defaultOptions || {
            tutors: [],
            disciplines: [],
            appointmentTypes: [],
            sessionTypes: [],
            coordinators: [],
            tutoringLocations: []
        };

        for (const [key, sel] of Object.entries(selectors)) {
            const selectEl = formDoc.querySelector(sel);
            if (!selectEl) continue;

            const options = Array.from(selectEl.options)
                .filter(opt => opt.value.trim() !== "") // exclude empty value options
                .map(opt => ({ id: opt.value, name: opt.textContent.trim() }));

            // Save array for multi-selects, single value array for single selects
            if (key === 'tutor') {
                defaults.tutors = options;
            } else if (key === 'discipline') {
                defaults.disciplines = options.map(o => o.name);
            } else if (key === 'appointmentType') {
                defaults.appointmentTypes = options.map(o => o.name);
            } else if (key === 'sessionType') {
                defaults.sessionTypes = options.map(o => o.name);
            } else if (key === 'coordinator') {
                defaults.coordinators = options.map(o => o.name);
            } else if (key === 'location') {
                defaults.tutoringLocations = options.map(o => o.name);
            }
        }

        chrome.storage.local.set({ defaultOptions: defaults }, () => {
            console.log("Default options updated in Chrome storage");
        });
    });
}

// ---- MAIN: Listen for form load ----
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

            // Small delay to ensure options are fully rendered
            setTimeout(() => {
                saveDefaults(formDoc); // Save all options to Chrome storage
                editForm(formDoc);     // Hide invalid options and set preset values
            }, 400);
        });
    });
});
