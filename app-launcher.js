// Application Launcher for EVE
// Add this functionality to your scripts.js file

// Application database - common applications and their paths
const commonApplications = {
  // Games
  "fifa 19": [
    "C:\\Program Files (x86)\\Origin Games\\FIFA 19\\FIFA19.exe",
    "C:\\Program Files\\Origin Games\\FIFA 19\\FIFA19.exe",
    "FIFA19.exe",
  ],
  "fifa 20": [
    "C:\\Program Files (x86)\\Origin Games\\FIFA 20\\FIFA20.exe",
    "C:\\Program Files\\Origin Games\\FIFA 20\\FIFA20.exe",
  ],
  "fifa 21": [
    "C:\\Program Files (x86)\\Origin Games\\FIFA 21\\FIFA21.exe",
    "C:\\Program Files\\Origin Games\\FIFA 21\\FIFA21.exe",
  ],
  steam: ["C:\\Program Files (x86)\\Steam\\steam.exe", "C:\\Program Files\\Steam\\steam.exe"],

  // Browsers
  chrome: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "chrome.exe",
  ],
  firefox: [
    "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
    "C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe",
    "firefox.exe",
  ],
  edge: ["C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "msedge.exe"],

  // Office Applications
  word: [
    "C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE",
    "C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\WINWORD.EXE",
    "WINWORD.EXE",
  ],
  excel: [
    "C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE",
    "C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\EXCEL.EXE",
    "EXCEL.EXE",
  ],
  powerpoint: [
    "C:\\Program Files\\Microsoft Office\\root\\Office16\\POWERPNT.EXE",
    "C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\POWERPNT.EXE",
    "POWERPNT.EXE",
  ],

  // Media Players
  vlc: ["C:\\Program Files\\VideoLAN\\VLC\\vlc.exe", "C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe", "vlc.exe"],
  spotify: ["C:\\Users\\%USERNAME%\\AppData\\Roaming\\Spotify\\Spotify.exe", "spotify.exe"],

  // Development Tools
  vscode: [
    "C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
    "C:\\Program Files\\Microsoft VS Code\\Code.exe",
    "code.exe",
  ],
  notepad: ["C:\\Windows\\System32\\notepad.exe", "notepad.exe"],

  // System Applications
  calculator: ["C:\\Windows\\System32\\calc.exe", "calc.exe"],
  paint: ["C:\\Windows\\System32\\mspaint.exe", "mspaint.exe"],
  cmd: ["C:\\Windows\\System32\\cmd.exe", "cmd.exe"],
  powershell: ["C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", "powershell.exe"],
}

// Function to normalize application names for matching
function normalizeAppName(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Normalize spaces
    .trim()
}

// Function to find application by name
function findApplication(appName) {
  const normalizedName = normalizeAppName(appName)

  // Direct match
  if (commonApplications[normalizedName]) {
    return commonApplications[normalizedName]
  }

  // Partial match
  for (const [key, paths] of Object.entries(commonApplications)) {
    if (key.includes(normalizedName) || normalizedName.includes(key)) {
      return paths
    }
  }

  return null
}

// Function to launch application
async function launchApplication(appName) {
  try {
    addMessage(`🔍 ${t("Searching for")} ${appName}...`, false)

    const appPaths = findApplication(appName)

    if (!appPaths) {
      // Try to launch by name directly (for apps in PATH)
      try {
        await window.electronAPI.launchApp(appName)
        addMessage(`🚀 ${t("Launched")} ${appName}`, false)
        return true
      } catch (error) {
        addMessage(`❌ ${t("Application not found")}: ${appName}`, false)
        addMessage(`💡 ${t("Try adding the full path or installing the application")}`, false)
        return false
      }
    }

    // Try each path until one works
    for (const path of appPaths) {
      try {
        const expandedPath = path.replace("%USERNAME%", process.env.USERNAME || "User")
        const exists = await window.electronAPI.fileExists(expandedPath)

        if (exists) {
          await window.electronAPI.launchApp(expandedPath)
          addMessage(`🚀 ${t("Successfully launched")} ${appName}`, false)

          // Play success sound if available
          if (typeof SoundManager !== "undefined") {
            SoundManager.play("success")
          }

          return true
        }
      } catch (error) {
        console.log(`Failed to launch from path: ${path}`, error)
        continue
      }
    }

    // If no path worked, show error
    addMessage(`❌ ${t("Could not find or launch")} ${appName}`, false)
    addMessage(`📁 ${t("Searched in common installation directories")}`, false)

    // Play error sound if available
    if (typeof SoundManager !== "undefined") {
      SoundManager.play("error")
    }

    return false
  } catch (error) {
    console.error("Error launching application:", error)
    addMessage(`❌ ${t("Error launching application")}: ${error.message}`, false)
    return false
  }
}

// Function to handle "open" commands in chat
function handleOpenCommand(message) {
  const openRegex = /^(open|launch|start|run)\s+(.+)$/i
  const match = message.match(openRegex)

  if (match) {
    const appName = match[2].trim()
    launchApplication(appName)
    return true
  }

  return false
}

// Function to scan for installed applications (advanced feature)
async function scanForApplications() {
  try {
    addMessage(`🔍 ${t("Scanning for installed applications")}...`, false)

    const commonPaths = [
      "C:\\Program Files",
      "C:\\Program Files (x86)",
      "C:\\Users\\%USERNAME%\\AppData\\Local\\Programs",
      "C:\\Users\\%USERNAME%\\AppData\\Roaming",
    ]

    const foundApps = await window.electronAPI.scanApplications(commonPaths)

    if (foundApps.length > 0) {
      addMessage(`✅ ${t("Found")} ${foundApps.length} ${t("applications")}:`, false)
      foundApps.slice(0, 10).forEach((app) => {
        addMessage(`📱 ${app.name} - ${app.path}`, false)
      })

      if (foundApps.length > 10) {
        addMessage(`... ${t("and")} ${foundApps.length - 10} ${t("more applications")}`, false)
      }
    } else {
      addMessage(`❌ ${t("No applications found in common directories")}`, false)
    }
  } catch (error) {
    console.error("Error scanning applications:", error)
    addMessage(`❌ ${t("Error scanning applications")}: ${error.message}`, false)
  }
}

// Function to add application to database
function addCustomApplication(name, path) {
  const normalizedName = normalizeAppName(name)

  if (!commonApplications[normalizedName]) {
    commonApplications[normalizedName] = []
  }

  if (!commonApplications[normalizedName].includes(path)) {
    commonApplications[normalizedName].push(path)

    // Save to localStorage for persistence
    localStorage.setItem("customApplications", JSON.stringify(commonApplications))

    addMessage(`✅ ${t("Added application")}: ${name} -> ${path}`, false)
    return true
  }

  addMessage(`ℹ️ ${t("Application already exists")}: ${name}`, false)
  return false
}

// Function to list available applications
function listAvailableApplications() {
  addMessage(`📱 ${t("Available applications")}:`, false)

  const categories = {
    "🎮 Games": ["fifa 19", "fifa 20", "fifa 21", "steam"],
    "🌐 Browsers": ["chrome", "firefox", "edge"],
    "📄 Office": ["word", "excel", "powerpoint"],
    "🎵 Media": ["vlc", "spotify"],
    "💻 Development": ["vscode", "notepad"],
    "⚙️ System": ["calculator", "paint", "cmd", "powershell"],
  }

  for (const [category, apps] of Object.entries(categories)) {
    addMessage(category, false)
    apps.forEach((app) => {
      addMessage(`  • ${app}`, false)
    })
  }

  addMessage(`\n💡 ${t("Say 'open [app name]' to launch any application")}`, false)
  addMessage(`💡 ${t("Say 'scan apps' to find more installed applications")}`, false)
}

// Load custom applications from localStorage
function loadCustomApplications() {
  try {
    const saved = localStorage.getItem("customApplications")
    if (saved) {
      const customApps = JSON.parse(saved)
      Object.assign(commonApplications, customApps)
      console.log("Loaded custom applications:", Object.keys(customApps).length)
    }
  } catch (error) {
    console.error("Error loading custom applications:", error)
  }
}

// Initialize application launcher
function initApplicationLauncher() {
  loadCustomApplications()
  console.log("Application launcher initialized with", Object.keys(commonApplications).length, "applications")
}

// Enhanced message processing to handle app launch commands
function processEnhancedMessage(message) {
  const lowerMessage = message.toLowerCase().trim()

  // Handle open commands
  if (handleOpenCommand(message)) {
    return true
  }

  // Handle scan command
  if (lowerMessage.includes("scan") && (lowerMessage.includes("app") || lowerMessage.includes("program"))) {
    scanForApplications()
    return true
  }

  // Handle list apps command
  if (
    (lowerMessage.includes("list") || lowerMessage.includes("show")) &&
    (lowerMessage.includes("app") || lowerMessage.includes("program"))
  ) {
    listAvailableApplications()
    return true
  }

  // Handle add app command
  const addAppRegex = /add\s+app\s+(.+?)\s+at\s+(.+)/i
  const addMatch = message.match(addAppRegex)
  if (addMatch) {
    addCustomApplication(addMatch[1], addMatch[2])
    return true
  }

  return false
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initApplicationLauncher)

// Export functions for use in other parts of the application
window.EVEAppLauncher = {
  launch: launchApplication,
  find: findApplication,
  add: addCustomApplication,
  list: listAvailableApplications,
  scan: scanForApplications,
  process: processEnhancedMessage,
}

console.log("EVE Application Launcher loaded successfully!")

// Mock functions for testing purposes.  These would normally be defined elsewhere in the application.
function addMessage(message, isUser) {
  console.log(message)
}

function t(key) {
  return key
}

const SoundManager = {
  play: (sound) => {
    console.log("Playing sound: " + sound)
  },
}
