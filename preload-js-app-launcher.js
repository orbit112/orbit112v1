// Add these methods to your preload.js electronAPI object

const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  // ... your existing methods ...

  // Application launcher methods
  launchApp: (appPath) => ipcRenderer.invoke("launch-app", appPath),
  fileExists: (filePath) => ipcRenderer.invoke("file-exists", filePath),
  scanApplications: (searchPaths) => ipcRenderer.invoke("scan-applications", searchPaths),
  openWithSystem: (itemPath) => ipcRenderer.invoke("open-with-system", itemPath),

  // ... rest of your existing methods ...
})
