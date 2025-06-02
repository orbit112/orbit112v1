// Main application initialization
class EVEApp {
  constructor() {
    this.currentView = "dashboard"
    this.username = process.env.USERNAME || "User"
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadUserData()
    this.initializeModules()
    this.updateUI()
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const view = e.target.getAttribute("href").substring(1)
        this.switchView(view)
      })
    })

    // Voice toggle
    document.getElementById("voice-toggle").addEventListener("click", () => {
      this.toggleVoiceInterface()
    })

    // Settings
    document.getElementById("settings-btn").addEventListener("click", () => {
      this.openSettings()
    })

    // New item buttons
    document.getElementById("new-task-btn")?.addEventListener("click", () => {
      window.taskManager?.showTaskModal()
    })

    document.getElementById("new-project-btn")?.addEventListener("click", () => {
      window.taskManager?.showProjectModal()
    })

    document.getElementById("new-team-btn")?.addEventListener("click", () => {
      window.teamCollaboration?.showTeamModal()
    })

    // Menu events from Electron
    if (window.electronAPI) {
      window.electronAPI.onMenuNewTask(() => {
        this.switchView("tasks")
        window.taskManager?.showTaskModal()
      })

      window.electronAPI.onMenuNewProject(() => {
        this.switchView("projects")
        window.taskManager?.showProjectModal()
      })

      window.electronAPI.onMenuSettings(() => {
        this.openSettings()
      })
    }
  }

  switchView(viewName) {
    // Hide all views
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.remove("active")
    })

    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`)
    if (targetView) {
      targetView.classList.add("active")
    }

    // Update navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
    })

    const activeLink = document.querySelector(`[href="#${viewName}"]`)
    if (activeLink) {
      activeLink.classList.add("active")
    }

    this.currentView = viewName
    this.updateViewContent(viewName)
  }

  updateViewContent(viewName) {
    switch (viewName) {
      case "dashboard":
        this.updateDashboard()
        break
      case "tasks":
        window.taskManager?.updateTaskDashboard()
        break
      case "projects":
        window.taskManager?.updateProjectDashboard()
        break
      case "teams":
        window.teamCollaboration?.updateTeamDashboard()
        break
      case "analytics":
        this.updateAnalytics()
        break
    }
  }

  updateDashboard() {
    // Update username
    document.getElementById("username").textContent = this.username

    // Update quick stats
    const quickStats = document.getElementById("quick-stats")
    const tasks = JSON.parse(localStorage.getItem("eve_tasks") || "[]")
    const projects = JSON.parse(localStorage.getItem("eve_projects") || "[]")
    const teams = JSON.parse(localStorage.getItem("eve_teams") || "[]")

    quickStats.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${tasks.length}</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${projects.length}</div>
                <div class="stat-label">Active Projects</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${teams.length}</div>
                <div class="stat-label">Teams</div>
            </div>
        `

    // Update recent tasks
    const recentTasks = document.getElementById("recent-tasks")
    const recentTasksList = tasks.slice(-5).reverse()

    recentTasks.innerHTML =
      recentTasksList.length > 0
        ? recentTasksList
            .map(
              (task) => `
                <div class="recent-item">
                    <div class="recent-title">${task.title}</div>
                    <div class="recent-status status-${task.status}">${task.status}</div>
                </div>
            `,
            )
            .join("")
        : '<div class="empty-state">No recent tasks</div>'

    // Update team activity
    const teamActivity = document.getElementById("team-activity")
    teamActivity.innerHTML =
      teams.length > 0
        ? teams
            .slice(0, 3)
            .map(
              (team) => `
                <div class="activity-item">
                    <div class="activity-title">${team.name}</div>
                    <div class="activity-detail">${team.members.length} members</div>
                </div>
            `,
            )
            .join("")
        : '<div class="empty-state">No team activity</div>'
  }

  updateAnalytics() {
    const analyticsContainer = document.getElementById("analytics-dashboard")

    // Get data for analytics
    const tasks = JSON.parse(localStorage.getItem("eve_tasks") || "[]")
    const projects = JSON.parse(localStorage.getItem("eve_projects") || "[]")
    const teams = JSON.parse(localStorage.getItem("eve_teams") || "[]")

    // Calculate analytics
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
    const pendingTasks = tasks.filter((task) => task.status === "pending").length

    analyticsContainer.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>Task Completion Rate</h3>
                    <div class="analytics-chart">
                        <div class="progress-ring">
                            <div class="progress-value">${tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</div>
                        </div>
                    </div>
                </div>
                <div class="analytics-card">
                    <h3>Task Distribution</h3>
                    <div class="task-distribution">
                        <div class="distribution-item">
                            <span class="distribution-label">Completed</span>
                            <span class="distribution-value">${completedTasks}</span>
                        </div>
                        <div class="distribution-item">
                            <span class="distribution-label">In Progress</span>
                            <span class="distribution-value">${inProgressTasks}</span>
                        </div>
                        <div class="distribution-item">
                            <span class="distribution-label">Pending</span>
                            <span class="distribution-value">${pendingTasks}</span>
                        </div>
                    </div>
                </div>
                <div class="analytics-card">
                    <h3>Project Overview</h3>
                    <div class="project-overview">
                        <div class="overview-stat">
                            <div class="overview-number">${projects.length}</div>
                            <div class="overview-label">Total Projects</div>
                        </div>
                        <div class="overview-stat">
                            <div class="overview-number">${teams.length}</div>
                            <div class="overview-label">Active Teams</div>
                        </div>
                    </div>
                </div>
            </div>
        `
  }

  toggleVoiceInterface() {
    const voiceInterface = document.getElementById("voice-interface")
    if (voiceInterface.classList.contains("hidden")) {
      this.startVoiceRecognition()
    } else {
      this.stopVoiceRecognition()
    }
  }

  startVoiceRecognition() {
    const voiceInterface = document.getElementById("voice-interface")
    voiceInterface.classList.remove("hidden")

    if (window.voiceResponseSystem) {
      window.voiceResponseSystem.startListening()
    }
  }

  stopVoiceRecognition() {
    const voiceInterface = document.getElementById("voice-interface")
    voiceInterface.classList.add("hidden")

    if (window.voiceResponseSystem) {
      window.voiceResponseSystem.stopListening()
    }
  }

  openSettings() {
    if (window.settingsUI) {
      window.settingsUI.showSettings()
    }
  }

  loadUserData() {
    // Load user preferences
    const preferences = JSON.parse(localStorage.getItem("eve_preferences") || "{}")

    // Apply theme
    if (preferences.theme) {
      document.body.setAttribute("data-theme", preferences.theme)
    }

    // Apply other preferences
    if (preferences.username) {
      this.username = preferences.username
    }
  }

  initializeModules() {
    // Initialize all EVE modules
    console.log("Initializing EVE modules...")

    // Task management will initialize itself
    // Team collaboration will initialize itself
    // Voice system will initialize itself
    // Settings will initialize itself

    console.log("EVE modules initialized successfully")
  }

  updateUI() {
    // Update the initial view
    this.updateDashboard()

    // Set up periodic updates
    setInterval(() => {
      if (this.currentView === "dashboard") {
        this.updateDashboard()
      }
    }, 30000) // Update every 30 seconds
  }
}

// Initialize EVE when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("Starting EVE Assistant...")
  window.eveApp = new EVEApp()
  console.log("EVE Assistant started successfully!")
})

// Handle app focus/blur
window.addEventListener("focus", () => {
  if (window.eveApp && window.eveApp.currentView === "dashboard") {
    window.eveApp.updateDashboard()
  }
})
