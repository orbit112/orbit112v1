// Online/Offline Manager for EVE
// Add this to your scripts.js file

class OnlineOfflineManager {
  constructor() {
    this.isOnline = navigator.onLine
    this.onlineFeatures = new Set()
    this.offlineFeatures = new Set()
    this.initializeFeatures()
    this.setupEventListeners()
  }

  // Initialize which features work online vs offline
  initializeFeatures() {
    // Offline features (always available)
    this.offlineFeatures.add("file_management")
    this.offlineFeatures.add("application_launcher")
    this.offlineFeatures.add("voice_recognition")
    this.offlineFeatures.add("voice_synthesis")
    this.offlineFeatures.add("calculator")
    this.offlineFeatures.add("system_info")
    this.offlineFeatures.add("settings")
    this.offlineFeatures.add("basic_chat")

    // Online features (require internet)
    this.onlineFeatures.add("web_search")
    this.onlineFeatures.add("weather")
    this.onlineFeatures.add("news")
    this.onlineFeatures.add("translations")
    this.onlineFeatures.add("ai_responses")
    this.onlineFeatures.add("cloud_sync")
    this.onlineFeatures.add("updates")
  }

  // Setup online/offline event listeners
  setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true
      this.handleOnlineStatus()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.handleOfflineStatus()
    })

    // Check connection status periodically
    setInterval(() => {
      this.checkConnectionStatus()
    }, 30000) // Check every 30 seconds
  }

  // Handle when going online
  handleOnlineStatus() {
    console.log("EVE is now online")
    if (typeof addMessage !== "undefined" && typeof t !== "undefined") {
      addMessage("🌐 " + t("Connected to internet - All features available"), false)
    }

    // Update UI to show online status
    this.updateConnectionUI(true)

    // Sync any pending offline data
    this.syncOfflineData()

    // Play connection sound
    if (typeof SoundManager !== "undefined") {
      SoundManager.play("success")
    }
  }

  // Handle when going offline
  handleOfflineStatus() {
    console.log("EVE is now offline")
    if (typeof addMessage !== "undefined" && typeof t !== "undefined") {
      addMessage("📴 " + t("Offline mode - Limited features available"), false)
    }

    // Update UI to show offline status
    this.updateConnectionUI(false)

    // Show available offline features
    this.showOfflineCapabilities()

    // Play disconnection sound
    if (typeof SoundManager !== "undefined") {
      SoundManager.play("notification")
    }
  }

  // Check actual connection status
  async checkConnectionStatus() {
    try {
      const response = await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
      })

      if (!this.isOnline) {
        this.isOnline = true
        this.handleOnlineStatus()
      }
    } catch (error) {
      if (this.isOnline) {
        this.isOnline = false
        this.handleOfflineStatus()
      }
    }
  }

  // Update UI to show connection status
  updateConnectionUI(isOnline) {
    // Add connection indicator to UI
    let indicator = document.getElementById("connection-indicator")

    if (!indicator) {
      indicator = document.createElement("div")
      indicator.id = "connection-indicator"
      indicator.className = "connection-indicator"

      // Add to header or top of app
      const header = document.querySelector(".header") || document.body
      header.appendChild(indicator)
    }

    if (typeof t !== "undefined") {
      indicator.innerHTML = isOnline
        ? `<span class="online-dot"></span> ${t("Online")}`
        : `<span class="offline-dot"></span> ${t("Offline")}`
    }

    indicator.className = `connection-indicator ${isOnline ? "online" : "offline"}`
  }

  // Show what EVE can do offline
  showOfflineCapabilities() {
    if (typeof addMessage !== "undefined" && typeof t !== "undefined") {
      addMessage("💡 " + t("Available offline features:"), false)
      addMessage("📁 " + t("File management and browsing"), false)
      addMessage("🚀 " + t("Launch applications"), false)
      addMessage("🎤 " + t("Voice commands and responses"), false)
      addMessage("🧮 " + t("Calculator and math"), false)
      addMessage("💻 " + t("System information"), false)
      addMessage("⚙️ " + t("Settings and customization"), false)
      addMessage("💬 " + t("Basic conversation"), false)
    }
  }

  // Sync offline data when back online
  async syncOfflineData() {
    try {
      // Sync settings to cloud (if implemented)
      const settings = localStorage.getItem("eveSettings")
      if (settings && window.electronAPI.syncSettings) {
        await window.electronAPI.syncSettings(JSON.parse(settings))
      }

      // Sync usage statistics
      const stats = localStorage.getItem("eveUsageStats")
      if (stats && window.electronAPI.syncStats) {
        await window.electronAPI.syncStats(JSON.parse(stats))
      }

      if (typeof addMessage !== "undefined" && typeof t !== "undefined") {
        addMessage("☁️ " + t("Data synced successfully"), false)
      }
    } catch (error) {
      console.error("Sync error:", error)
      if (typeof addMessage !== "undefined" && typeof t !== "undefined") {
        addMessage("⚠️ " + t("Sync failed - will retry later"), false)
      }
    }
  }

  // Check if a feature is available
  isFeatureAvailable(feature) {
    if (this.offlineFeatures.has(feature)) {
      return true // Always available offline
    }

    if (this.onlineFeatures.has(feature)) {
      return this.isOnline // Only available online
    }

    return false // Unknown feature
  }

  // Get appropriate response based on connection status
  getResponse(query, feature) {
    if (!this.isFeatureAvailable(feature)) {
      if (typeof t !== "undefined") {
        return {
          success: false,
          message: t("This feature requires an internet connection"),
          offline: true,
        }
      } else {
        return {
          success: false,
          message: "This feature requires an internet connection",
          offline: true,
        }
      }
    }

    return { success: true, offline: false }
  }
}

// Initialize the manager
const connectionManager = new OnlineOfflineManager()
