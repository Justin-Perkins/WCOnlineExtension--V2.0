// Load saved settings from Chrome storage
async function loadSavedSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["defaultSettings"], (data) => {
      resolve(data.defaultSettings || {});
    });
  });
}

// Helper to safely set text content in the popup
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "N/A";
}

// Initialize the popup UI
async function initialize() {
  const config = await loadSavedSettings();

  // Display saved settings in the popup
  setText("coordinator", config.coordinator);
  setText("discipline", config.discipline);
  setText("appointmentType", config.appointmentType);
  setText("sessionType", config.sessionType);
  setText("tutoringLocation", config.tutoringLocation);

  // Show tutor list if available
  const tutorEl = document.getElementById("tutor");
  if (tutorEl) {
    tutorEl.innerHTML = Array.isArray(config.tutors)
      ? config.tutors.map((t) => `<li>${t.name}</li>`).join("")
      : "<li>N/A</li>";
  }

  // Open the edit defaults page when Edit button is clicked
  const editButton = document.getElementById("editButton");
  if (editButton) {
    editButton.addEventListener("click", () => {
      const editUrl = chrome.runtime.getURL("popup/editDefaults.html");
      chrome.tabs.create({ url: editUrl });
    });
  }
}

// Run initialization once the popup is loaded
document.addEventListener("DOMContentLoaded", initialize);
