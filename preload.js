const { contextBridge, ipcRenderer } = require("electron")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // App info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getUserDataPath: () => ipcRenderer.invoke("get-user-data-path"),

  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),

  // Menu events
  onMenuNewTask: (callback) => ipcRenderer.on("menu-new-task", callback),
  onMenuNewProject: (callback) => ipcRenderer.on("menu-new-project", callback),
  onMenuSettings: (callback) => ipcRenderer.on("menu-settings", callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
})

// Environment variables
contextBridge.exposeInMainWorld("process", {
  env: {
    USERNAME: process.env.USERNAME || process.env.USER || "User",
  },
})
