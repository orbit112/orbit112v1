// Settings UI Component for EVE
// Add this to your scripts.js file

// Global settings object
let eveSettings = {
  theme: {
    primary: "#7e57c2", // Default purple
    secondary: "#03a9f4",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    textColor: "#ffffff",
  },
  sound: {
    enabled: true,
    volume: 0.8,
    notificationSound: "notification.mp3",
    startupSound: "startup.mp3",
  },
  interface: {
    fontSize: "medium", // small, medium, large
    animations: true,
    compactMode: false,
    language: "en", // en, sw
  },
}

// Declare missing variables
const t = (key) => key // Dummy translation function
const addMessage = (message, isError) => console.log(message) // Dummy addMessage function
let currentLanguage = "en" // Default language
const updateUILanguage = () => {} // Dummy updateUILanguage function

// Initialize settings
function initSettings() {
  // Load settings from localStorage
  const savedSettings = localStorage.getItem("eveSettings")
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings)
      eveSettings = { ...eveSettings, ...parsedSettings }
      console.log("Settings loaded:", eveSettings)
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  // Apply settings on startup
  applySettings()

  // Add settings button to UI
  addSettingsButton()
}

// Add settings button to the UI
function addSettingsButton() {
  const actionsContainer = document.querySelector(".actions-container")
  if (!actionsContainer) return

  const settingsButton = document.createElement("button")
  settingsButton.className = "action-button settings-button"
  settingsButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  `
  settingsButton.title = t("Settings")
  settingsButton.onclick = openSettings

  actionsContainer.appendChild(settingsButton)
}

// Open settings modal
function openSettings() {
  // Create settings modal
  const settingsModal = document.createElement("div")
  settingsModal.className = "settings-modal"
  settingsModal.innerHTML = `
    <div class="settings-content">
      <div class="settings-header">
        <h2>${t("Settings")}</h2>
        <button class="close-settings">&times;</button>
      </div>
      
      <div class="settings-tabs">
        <button class="tab-button active" data-tab="theme">${t("Theme")}</button>
        <button class="tab-button" data-tab="sound">${t("Sound")}</button>
        <button class="tab-button" data-tab="interface">${t("Interface")}</button>
      </div>
      
      <div class="settings-body">
        <!-- Theme Settings -->
        <div class="settings-tab-content active" id="theme-settings">
          <div class="setting-group">
            <label>${t("Primary Color")}</label>
            <input type="color" id="primary-color" value="${eveSettings.theme.primary}">
          </div>
          
          <div class="setting-group">
            <label>${t("Secondary Color")}</label>
            <input type="color" id="secondary-color" value="${eveSettings.theme.secondary}">
          </div>
          
          <div class="setting-group">
            <label>${t("Text Color")}</label>
            <input type="color" id="text-color" value="${eveSettings.theme.textColor}">
          </div>
          
          <div class="setting-group">
            <label>${t("Preset Themes")}</label>
            <div class="theme-presets">
              <button class="theme-preset" data-theme="default" style="background: linear-gradient(135deg, #7e57c2 0%, #03a9f4 100%)"></button>
              <button class="theme-preset" data-theme="dark" style="background: linear-gradient(135deg, #212121 0%, #424242 100%)"></button>
              <button class="theme-preset" data-theme="light" style="background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)"></button>
              <button class="theme-preset" data-theme="nature" style="background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)"></button>
              <button class="theme-preset" data-theme="sunset" style="background: linear-gradient(135deg, #ff9800 0%, #f44336 100%)"></button>
            </div>
          </div>
        </div>
        
        <!-- Sound Settings -->
        <div class="settings-tab-content" id="sound-settings">
          <div class="setting-group">
            <label>${t("Enable Sounds")}</label>
            <label class="switch">
              <input type="checkbox" id="sound-enabled" ${eveSettings.sound.enabled ? "checked" : ""}>
              <span class="slider round"></span>
            </label>
          </div>
          
          <div class="setting-group">
            <label>${t("Volume")}: <span id="volume-value">${Math.round(eveSettings.sound.volume * 100)}%</span></label>
            <input type="range" id="sound-volume" min="0" max="1" step="0.1" value="${eveSettings.sound.volume}">
          </div>
          
          <div class="setting-group">
            <label>${t("Notification Sound")}</label>
            <select id="notification-sound">
              <option value="notification.mp3" ${eveSettings.sound.notificationSound === "notification.mp3" ? "selected" : ""}>${t("Default")}</option>
              <option value="notification2.mp3" ${eveSettings.sound.notificationSound === "notification2.mp3" ? "selected" : ""}>${t("Soft")}</option>
              <option value="notification3.mp3" ${eveSettings.sound.notificationSound === "notification3.mp3" ? "selected" : ""}>${t("Classic")}</option>
            </select>
            <button id="test-sound" class="small-button">${t("Test")}</button>
          </div>
        </div>
        
        <!-- Interface Settings -->
        <div class="settings-tab-content" id="interface-settings">
          <div class="setting-group">
            <label>${t("Font Size")}</label>
            <select id="font-size">
              <option value="small" ${eveSettings.interface.fontSize === "small" ? "selected" : ""}>${t("Small")}</option>
              <option value="medium" ${eveSettings.interface.fontSize === "medium" ? "selected" : ""}>${t("Medium")}</option>
              <option value="large" ${eveSettings.interface.fontSize === "large" ? "selected" : ""}>${t("Large")}</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>${t("Enable Animations")}</label>
            <label class="switch">
              <input type="checkbox" id="animations-enabled" ${eveSettings.interface.animations ? "checked" : ""}>
              <span class="slider round"></span>
            </label>
          </div>
          
          <div class="setting-group">
            <label>${t("Compact Mode")}</label>
            <label class="switch">
              <input type="checkbox" id="compact-mode" ${eveSettings.interface.compactMode ? "checked" : ""}>
              <span class="slider round"></span>
            </label>
          </div>
          
          <div class="setting-group">
            <label>${t("Language")}</label>
            <select id="language-select">
              <option value="en" ${eveSettings.interface.language === "en" ? "selected" : ""}>English</option>
              <option value="sw" ${eveSettings.interface.language === "sw" ? "selected" : ""}>Swahili</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="settings-footer">
        <button id="reset-settings" class="secondary-button">${t("Reset to Default")}</button>
        <button id="save-settings" class="primary-button">${t("Save Changes")}</button>
      </div>
    </div>
  `

  document.body.appendChild(settingsModal)

  // Add event listeners
  document.querySelector(".close-settings").addEventListener("click", closeSettings)
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (e) => switchSettingsTab(e.target.dataset.tab))
  })

  // Theme settings events
  document.getElementById("primary-color").addEventListener("input", (e) => {
    eveSettings.theme.primary = e.target.value
    previewSettings()
  })

  document.getElementById("secondary-color").addEventListener("input", (e) => {
    eveSettings.theme.secondary = e.target.value
    previewSettings()
  })

  document.getElementById("text-color").addEventListener("input", (e) => {
    eveSettings.theme.textColor = e.target.value
    previewSettings()
  })

  // Theme presets
  document.querySelectorAll(".theme-preset").forEach((preset) => {
    preset.addEventListener("click", () => applyThemePreset(preset.dataset.theme))
  })

  // Sound settings events
  document.getElementById("sound-enabled").addEventListener("change", (e) => {
    eveSettings.sound.enabled = e.target.checked
  })

  document.getElementById("sound-volume").addEventListener("input", (e) => {
    eveSettings.sound.volume = Number.parseFloat(e.target.value)
    document.getElementById("volume-value").textContent = Math.round(eveSettings.sound.volume * 100) + "%"
  })

  document.getElementById("notification-sound").addEventListener("change", (e) => {
    eveSettings.sound.notificationSound = e.target.value
  })

  document.getElementById("test-sound").addEventListener("click", playTestSound)

  // Interface settings events
  document.getElementById("font-size").addEventListener("change", (e) => {
    eveSettings.interface.fontSize = e.target.value
    previewSettings()
  })

  document.getElementById("animations-enabled").addEventListener("change", (e) => {
    eveSettings.interface.animations = e.target.checked
    previewSettings()
  })

  document.getElementById("compact-mode").addEventListener("change", (e) => {
    eveSettings.interface.compactMode = e.target.checked
    previewSettings()
  })

  document.getElementById("language-select").addEventListener("change", (e) => {
    eveSettings.interface.language = e.target.value
    // Language change requires page reload to take effect
  })

  // Footer buttons
  document.getElementById("reset-settings").addEventListener("click", resetSettings)
  document.getElementById("save-settings").addEventListener("click", saveSettings)

  // Add modal open animation
  setTimeout(() => {
    settingsModal.classList.add("open")
  }, 10)
}

// Close settings modal
function closeSettings() {
  const settingsModal = document.querySelector(".settings-modal")
  settingsModal.classList.remove("open")

  // Remove modal after animation
  setTimeout(() => {
    settingsModal.remove()
  }, 300)
}

// Switch between settings tabs
function switchSettingsTab(tabId) {
  // Update tab buttons
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId)
  })

  // Update tab content
  document.querySelectorAll(".settings-tab-content").forEach((content) => {
    content.classList.remove("active")
  })

  document.getElementById(`${tabId}-settings`).classList.add("active")
}

// Apply theme preset
function applyThemePreset(presetName) {
  switch (presetName) {
    case "default":
      eveSettings.theme.primary = "#7e57c2"
      eveSettings.theme.secondary = "#03a9f4"
      eveSettings.theme.background = "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
      eveSettings.theme.textColor = "#ffffff"
      break
    case "dark":
      eveSettings.theme.primary = "#424242"
      eveSettings.theme.secondary = "#212121"
      eveSettings.theme.background = "linear-gradient(135deg, #121212 0%, #212121 100%)"
      eveSettings.theme.textColor = "#ffffff"
      break
    case "light":
      eveSettings.theme.primary = "#5c6bc0"
      eveSettings.theme.secondary = "#26c6da"
      eveSettings.theme.background = "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)"
      eveSettings.theme.textColor = "#212121"
      break
    case "nature":
      eveSettings.theme.primary = "#4caf50"
      eveSettings.theme.secondary = "#8bc34a"
      eveSettings.theme.background = "linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)"
      eveSettings.theme.textColor = "#ffffff"
      break
    case "sunset":
      eveSettings.theme.primary = "#ff9800"
      eveSettings.theme.secondary = "#f44336"
      eveSettings.theme.background = "linear-gradient(135deg, #bf360c 0%, #e64a19 100%)"
      eveSettings.theme.textColor = "#ffffff"
      break
  }

  // Update color inputs
  document.getElementById("primary-color").value = eveSettings.theme.primary
  document.getElementById("secondary-color").value = eveSettings.theme.secondary
  document.getElementById("text-color").value = eveSettings.theme.textColor

  // Preview changes
  previewSettings()
}

// Play test sound
function playTestSound() {
  if (!eveSettings.sound.enabled) return

  const sound = new Audio(`sounds/${eveSettings.sound.notificationSound}`)
  sound.volume = eveSettings.sound.volume
  sound.play()
}

// Reset settings to default
function resetSettings() {
  eveSettings = {
    theme: {
      primary: "#7e57c2",
      secondary: "#03a9f4",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      textColor: "#ffffff",
    },
    sound: {
      enabled: true,
      volume: 0.8,
      notificationSound: "notification.mp3",
      startupSound: "startup.mp3",
    },
    interface: {
      fontSize: "medium",
      animations: true,
      compactMode: false,
      language: "en",
    },
  }

  // Update UI
  document.getElementById("primary-color").value = eveSettings.theme.primary
  document.getElementById("secondary-color").value = eveSettings.theme.secondary
  document.getElementById("text-color").value = eveSettings.theme.textColor
  document.getElementById("sound-enabled").checked = eveSettings.sound.enabled
  document.getElementById("sound-volume").value = eveSettings.sound.volume
  document.getElementById("volume-value").textContent = Math.round(eveSettings.sound.volume * 100) + "%"
  document.getElementById("notification-sound").value = eveSettings.sound.notificationSound
  document.getElementById("font-size").value = eveSettings.interface.fontSize
  document.getElementById("animations-enabled").checked = eveSettings.interface.animations
  document.getElementById("compact-mode").checked = eveSettings.interface.compactMode
  document.getElementById("language-select").value = eveSettings.interface.language

  // Preview changes
  previewSettings()

  // Show confirmation
  addMessage("✅ " + t("Settings reset to default"), false)
}

// Save settings
function saveSettings() {
  // Save to localStorage
  localStorage.setItem("eveSettings", JSON.stringify(eveSettings))

  // Apply settings
  applySettings()

  // Close modal
  closeSettings()

  // Show confirmation
  addMessage("✅ " + t("Settings saved successfully"), false)
}

// Preview settings without saving
function previewSettings() {
  // Apply CSS variables for theme
  document.documentElement.style.setProperty("--primary-color", eveSettings.theme.primary)
  document.documentElement.style.setProperty("--secondary-color", eveSettings.theme.secondary)
  document.documentElement.style.setProperty("--text-color", eveSettings.theme.textColor)

  // Apply font size
  document.documentElement.style.setProperty(
    "--font-size-factor",
    eveSettings.interface.fontSize === "small" ? "0.9" : eveSettings.interface.fontSize === "large" ? "1.2" : "1",
  )

  // Apply animations setting
  document.body.classList.toggle("no-animations", !eveSettings.interface.animations)

  // Apply compact mode
  document.body.classList.toggle("compact-mode", eveSettings.interface.compactMode)
}

// Apply settings permanently
function applySettings() {
  // Apply theme
  document.documentElement.style.setProperty("--primary-color", eveSettings.theme.primary)
  document.documentElement.style.setProperty("--secondary-color", eveSettings.theme.secondary)
  document.documentElement.style.setProperty("--text-color", eveSettings.theme.textColor)
  document.documentElement.style.setProperty("--background", eveSettings.theme.background)

  // Apply font size
  document.documentElement.style.setProperty(
    "--font-size-factor",
    eveSettings.interface.fontSize === "small" ? "0.9" : eveSettings.interface.fontSize === "large" ? "1.2" : "1",
  )

  // Apply animations setting
  document.body.classList.toggle("no-animations", !eveSettings.interface.animations)

  // Apply compact mode
  document.body.classList.toggle("compact-mode", eveSettings.interface.compactMode)

  // Apply language
  currentLanguage = eveSettings.interface.language
  updateUILanguage()
}

// Call initSettings() when the app starts
document.addEventListener("DOMContentLoaded", initSettings)
