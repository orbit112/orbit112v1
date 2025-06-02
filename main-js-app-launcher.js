// Add these IPC handlers to your main.js file

const { spawn, exec } = require("child_process")
const { shell, ipcMain } = require("electron")
const fs = require("fs")
const path = require("path")

// IPC handler to launch applications
ipcMain.handle("launch-app", async (_, appPath) => {
  try {
    console.log("Attempting to launch:", appPath)

    // Check if it's a direct executable path
    if (fs.existsSync(appPath)) {
      // Launch executable file
      const child = spawn(appPath, [], {
        detached: true,
        stdio: "ignore",
      })

      child.unref() // Allow the parent process to exit independently

      return { success: true, message: `Launched ${path.basename(appPath)}` }
    } else {
      // Try to launch by name (for apps in PATH)
      return new Promise((resolve, reject) => {
        exec(`start "" "${appPath}"`, (error, stdout, stderr) => {
          if (error) {
            // Try alternative method
            exec(appPath, (error2, stdout2, stderr2) => {
              if (error2) {
                reject(new Error(`Failed to launch: ${error2.message}`))
              } else {
                resolve({ success: true, message: `Launched ${appPath}` })
              }
            })
          } else {
            resolve({ success: true, message: `Launched ${appPath}` })
          }
        })
      })
    }
  } catch (error) {
    console.error("Error launching app:", error)
    throw new Error(`Failed to launch application: ${error.message}`)
  }
})

// IPC handler to check if file exists
ipcMain.handle("file-exists", async (_, filePath) => {
  try {
    // Expand environment variables
    const expandedPath = filePath.replace(/%([^%]+)%/g, (_, varName) => {
      return process.env[varName] || ""
    })

    return fs.existsSync(expandedPath)
  } catch (error) {
    return false
  }
})

// IPC handler to scan for applications
ipcMain.handle("scan-applications", async (_, searchPaths) => {
  const foundApps = []

  try {
    for (const searchPath of searchPaths) {
      // Expand environment variables
      const expandedPath = searchPath.replace(/%([^%]+)%/g, (_, varName) => {
        return process.env[varName] || ""
      })

      if (fs.existsSync(expandedPath)) {
        await scanDirectory(expandedPath, foundApps, 2) // Max depth of 2
      }
    }

    return foundApps
  } catch (error) {
    console.error("Error scanning applications:", error)
    return []
  }
})

// Helper function to scan directory for executables
async function scanDirectory(dirPath, foundApps, maxDepth, currentDepth = 0) {
  if (currentDepth >= maxDepth) return

  try {
    const items = fs.readdirSync(dirPath)

    for (const item of items) {
      const fullPath = path.join(dirPath, item)
      const stats = fs.statSync(fullPath)

      if (stats.isFile() && path.extname(item).toLowerCase() === ".exe") {
        foundApps.push({
          name: path.basename(item, ".exe"),
          path: fullPath,
          size: stats.size,
        })
      } else if (stats.isDirectory() && currentDepth < maxDepth - 1) {
        await scanDirectory(fullPath, foundApps, maxDepth, currentDepth + 1)
      }
    }
  } catch (error) {
    // Ignore permission errors and continue
    console.log(`Skipping directory ${dirPath}: ${error.message}`)
  }
}

// IPC handler to open file/folder with system default
ipcMain.handle("open-with-system", async (_, itemPath) => {
  try {
    await shell.openPath(itemPath)
    return { success: true }
  } catch (error) {
    throw new Error(`Failed to open: ${error.message}`)
  }
})
