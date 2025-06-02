const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  // ... your existing methods ...

  // Settings file operations
  saveSettingsToFile: (settings) => ipcRenderer.invoke("save-settings-to-file", settings),
  loadSettingsFromFile: () => ipcRenderer.invoke("load-settings-from-file"),

  // ... rest of your existing methods ...
})
