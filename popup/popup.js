async function loadSavedSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["defaultSettings"], (data) => {
      resolve(data.defaultSettings || {});
    });
  });
}

async function initialize() {
  const config = await loadSavedSettings();

  // Safely set values in the popup
  document.getElementById("coordinator").textContent = config.coordinator || "N/A";
  document.getElementById("discipline").textContent = config.discipline || "N/A";
  document.getElementById("appointmentType").textContent = config.appointmentType || "N/A";
  document.getElementById("sessionType").textContent = config.sessionType || "N/A";
  document.getElementById("tutoringLocation").textContent = config.tutoringLocation || "N/A";

  // Tutor array (join names if it exists)
  document.getElementById("tutor").innerHTML = Array.isArray(config.tutor)
  ? config.tutor.map(t => `<li>${t.name}</li>`).join("")
  : "<li>N/A</li>";

  // Edit button opens the editDefaults tab
  document.getElementById("editButton").addEventListener("click", () => {
    const editUrl = chrome.runtime.getURL("popup/editDefaults.html");
    chrome.tabs.create({ url: editUrl });
  });
}

// Initialize popup
document.addEventListener("DOMContentLoaded", initialize);
