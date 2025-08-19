// Load saved settings from Chrome storage
async function loadSavedSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["defaultSettings"], (data) => {
      resolve(data.defaultSettings || {});
    });
  });
}

// Initialize the popup UI
async function initialize() {
  const config = await loadSavedSettings();

  // Display saved settings in the popup
  document.getElementById("coordinator").textContent = config.coordinator || "N/A";
  document.getElementById("discipline").textContent = config.discipline || "N/A";
  document.getElementById("appointmentType").textContent = config.appointmentType || "N/A";
  document.getElementById("sessionType").textContent = config.sessionType || "N/A";
  document.getElementById("tutoringLocation").textContent = config.tutoringLocation || "N/A";

  // Show tutor list if available
  document.getElementById("tutor").innerHTML = Array.isArray(config.tutor)
    ? config.tutor.map(t => `<li>${t.name}</li>`).join("")
    : "<li>N/A</li>";

  // Open the edit defaults page when Edit button is clicked
  document.getElementById("editButton").addEventListener("click", () => {
    const editUrl = chrome.runtime.getURL("popup/editDefaults.html");
    chrome.tabs.create({ url: editUrl });
  });
}

// Run initialization once the popup is loaded
document.addEventListener("DOMContentLoaded", initialize);
