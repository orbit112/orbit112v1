// Add these to your main.js file

const { app, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")

// Get user data path for settings
const userDataPath = app.getPath("userData")
const settingsPath = path.join(userDataPath, "settings.json")

// IPC handler for saving settings to file
ipcMain.handle("save-settings-to-file", async (_, settings) => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    return { success: true }
  } catch (error) {
    console.error("Failed to save settings:", error)
    return { success: false, error: error.message }
  }
})

// IPC handler for loading settings from file
ipcMain.handle("load-settings-from-file", async () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf8")
      return { success: true, settings: JSON.parse(data) }
    } else {
      return { success: false, error: "Settings file does not exist" }
    }
  } catch (error) {
    console.error("Failed to load settings:", error)
    return { success: false, error: error.message }
  }
})
