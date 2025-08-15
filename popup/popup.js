let config = {}

async function loadSettings() {
  try {
    const response = await fetch(chrome.runtime.getURL('config.json'));
    config = await response.json();
    console.log("Settings loaded:", config);
  } catch (err) {
    console.error("Failed to load settings", err);
  }
}

async function initialize() {
  await loadSettings();

  // Safely set values in the popup
  document.getElementById("coordinator").textContent = config.coordinator || "N/A";
  document.getElementById("discipline").textContent = config.discipline || "N/A";
  document.getElementById("appointmentType").textContent = config.appointmentType || "N/A";
  document.getElementById("sessionType").textContent = config.sessionType || "N/A";
  document.getElementById("tutoringLocation").textContent = config.tutoringLocation || "N/A";

  // Tutor array (join if it exists)
  document.getElementById("tutor").textContent = Array.isArray(config.tutor)
  ? config.tutor.map(t => t.name).join(", ")
  : "N/A";

  document.getElementById("editButton").addEventListener("click", () => {
  const editUrl = chrome.runtime.getURL("popup/editDefaults.html");
  chrome.tabs.create({ url: editUrl });
});

}

initialize();
