// Add these methods to your preload.js electronAPI object

const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  // ... your existing methods ...

  // Personal profile methods
  saveProfileData: (profileData) => ipcRenderer.invoke("save-profile-data", profileData),
  loadProfileData: () => ipcRenderer.invoke("load-profile-data"),
  getSystemUserInfo: () => ipcRenderer.invoke("get-system-user-info"),

  // Email methods
  checkEmails: (accountInfo) => ipcRenderer.invoke("check-emails", accountInfo),
  getSavedEmails: () => ipcRenderer.invoke("get-saved-emails"),

  // File analysis methods
  analyzeUserFiles: () => ipcRenderer.invoke("analyze-user-files"),

  // ... rest of your existing methods ...
})
