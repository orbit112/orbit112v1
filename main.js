const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell, dialog } = require("electron")
const path = require("path")
const fs = require("fs")

// Keep a global reference of the window object
let mainWindow
let tray = null

// Enable live reload for development
if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
  })
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    titleBarStyle: "default",
    frame: true,
  })

  // Load the app
  mainWindow.loadFile("index.html")

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()

    // Focus on window
    if (process.platform === "darwin") {
      app.dock.show()
    }
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Handle window minimize
  mainWindow.on("minimize", (event) => {
    if (process.platform === "win32") {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  // Create system tray
  createTray()

  // Set up menu
  createMenu()
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "tray-icon.png")
  const trayIcon = nativeImage.createFromPath(iconPath)

  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show EVE",
      click: () => {
        mainWindow.show()
        if (process.platform === "darwin") {
          app.dock.show()
        }
      },
    },
    {
      label: "Hide EVE",
      click: () => {
        mainWindow.hide()
        if (process.platform === "darwin") {
          app.dock.hide()
        }
      },
    },
    { type: "separator" },
    {
      label: "Quit EVE",
      click: () => {
        app.isQuiting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip("EVE Assistant")
  tray.setContextMenu(contextMenu)

  // Show window on tray click
  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Task",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.send("menu-new-task")
          },
        },
        {
          label: "New Project",
          accelerator: "CmdOrCtrl+Shift+N",
          click: () => {
            mainWindow.webContents.send("menu-new-project")
          },
        },
        { type: "separator" },
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            mainWindow.webContents.send("menu-settings")
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit()
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About EVE",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About EVE Assistant",
              message: "EVE Assistant v1.0.0",
              detail: "Enhanced Virtual Executive Assistant\nBuilt with Electron",
            })
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// App event handlers
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// IPC handlers
ipcMain.handle("get-app-version", () => {
  return app.getVersion()
})

ipcMain.handle("get-user-data-path", () => {
  return app.getPath("userData")
})

ipcMain.handle("show-save-dialog", async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options)
  return result
})

ipcMain.handle("show-open-dialog", async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options)
  return result
})

// Auto-updater (optional)
if (process.env.NODE_ENV === "production") {
  const { autoUpdater } = require("electron-updater")

  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on("update-available", () => {
    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update available",
      message: "A new version of EVE is available. It will be downloaded in the background.",
      buttons: ["OK"],
    })
  })
}
