// Add these IPC handlers to your main.js file for personal features

const { ipcMain, app } = require("electron")
const fs = require("fs")
const path = require("path")
const os = require("os")

// Get user data directory
const userDataPath = app.getPath("userData")
const profilePath = path.join(userDataPath, "profile.json")
const emailDataPath = path.join(userDataPath, "emails.json")

// IPC handler for saving profile data
ipcMain.handle("save-profile-data", async (_, profileData) => {
  try {
    fs.writeFileSync(profilePath, JSON.stringify(profileData, null, 2))
    return { success: true }
  } catch (error) {
    console.error("Failed to save profile:", error)
    return { success: false, error: error.message }
  }
})

// IPC handler for loading profile data
ipcMain.handle("load-profile-data", async () => {
  try {
    if (fs.existsSync(profilePath)) {
      const data = fs.readFileSync(profilePath, "utf8")
      return { success: true, profile: JSON.parse(data) }
    } else {
      return { success: false, error: "Profile file does not exist" }
    }
  } catch (error) {
    console.error("Failed to load profile:", error)
    return { success: false, error: error.message }
  }
})

// IPC handler for getting system user info
ipcMain.handle("get-system-user-info", async () => {
  try {
    const userInfo = {
      username: os.userInfo().username,
      homedir: os.homedir(),
      platform: os.platform(),
      hostname: os.hostname(),
    }
    return { success: true, userInfo }
  } catch (error) {
    console.error("Failed to get user info:", error)
    return { success: false, error: error.message }
  }
})

// IPC handler for email operations (mock implementation)
ipcMain.handle("check-emails", async (_, accountInfo) => {
  try {
    // This is a mock implementation
    // In a real app, you would connect to email APIs like Gmail, Outlook, etc.

    const mockEmails = [
      {
        id: Date.now(),
        from: "work@company.com",
        subject: "Meeting reminder for tomorrow",
        body: "Don't forget about our team meeting at 10 AM tomorrow.",
        date: new Date().toISOString(),
        read: false,
        important: true,
      },
      {
        id: Date.now() + 1,
        from: "friend@email.com",
        subject: "Weekend plans?",
        body: "Hey! Want to hang out this weekend?",
        date: new Date().toISOString(),
        read: false,
        important: false,
      },
    ]

    // Save mock emails
    fs.writeFileSync(emailDataPath, JSON.stringify(mockEmails, null, 2))

    return { success: true, emails: mockEmails }
  } catch (error) {
    console.error("Failed to check emails:", error)
    return { success: false, error: error.message }
  }
})

// IPC handler for reading saved emails
ipcMain.handle("get-saved-emails", async () => {
  try {
    if (fs.existsSync(emailDataPath)) {
      const data = fs.readFileSync(emailDataPath, "utf8")
      return { success: true, emails: JSON.parse(data) }
    } else {
      return { success: true, emails: [] }
    }
  } catch (error) {
    console.error("Failed to get emails:", error)
    return { success: false, error: error.message }
  }
})

// IPC handler for getting user documents and files for suggestions
ipcMain.handle("analyze-user-files", async () => {
  try {
    const userHome = os.homedir()
    const documentsPath = path.join(userHome, "Documents")
    const downloadsPath = path.join(userHome, "Downloads")

    const analysis = {
      recentFiles: [],
      fileTypes: {},
      suggestions: [],
    }

    // Analyze Documents folder
    if (fs.existsSync(documentsPath)) {
      const files = fs.readdirSync(documentsPath).slice(0, 10) // Get first 10 files
      files.forEach((file) => {
        const filePath = path.join(documentsPath, file)
        const stats = fs.statSync(filePath)
        if (stats.isFile()) {
          const ext = path.extname(file).toLowerCase()
          analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1
          analysis.recentFiles.push({
            name: file,
            path: filePath,
            modified: stats.mtime,
            size: stats.size,
          })
        }
      })
    }

    // Generate suggestions based on file analysis
    if (analysis.fileTypes[".pdf"] > 5) {
      analysis.suggestions.push("You have many PDF files. Would you like me to help organize them?")
    }

    if (analysis.fileTypes[".docx"] > 3) {
      analysis.suggestions.push("I notice you work with Word documents. Should I open Word for you?")
    }

    return { success: true, analysis }
  } catch (error) {
    console.error("Failed to analyze files:", error)
    return { success: false, error: error.message }
  }
})
