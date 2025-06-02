// Task Management UI Integration for EVE
// Add this to your scripts.js file

class TaskUIIntegration {
  constructor(taskManager) {
    this.taskManager = taskManager
    this.initializeTaskUI()
  }

  // Initialize task management UI
  initializeTaskUI() {
    this.addTaskManagementButton()
    this.setupTaskNotifications()
  }

  // Add task management button to UI
  addTaskManagementButton() {
    const actionsContainer = document.querySelector(".actions-container")
    if (!actionsContainer) return

    const taskButton = document.createElement("button")
    taskButton.className = "action-button task-button"
    taskButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11H3l3-3m0 6l-3-3"></path>
        <path d="M21 12H11l3-3m0 6l-3-3"></path>
        <path d="M11 6H3l3-3m0 6l-3-3"></path>
        <path d="M21 6H11l3-3m0 6l-3-3"></path>
      </svg>
    `
    taskButton.title = t("Task Management")
    taskButton.onclick = () => this.openTaskDashboard()

    actionsContainer.appendChild(taskButton)
  }

  // Open task dashboard
  openTaskDashboard() {
    const dashboard = this.createTaskDashboard()
    document.body.appendChild(dashboard)

    // Add modal open animation
    setTimeout(() => {
      dashboard.classList.add("open")
    }, 10)
  }

  // Create task dashboard modal
  createTaskDashboard() {
    const modal = document.createElement("div")
    modal.className = "task-dashboard-modal"
    modal.innerHTML = this.getTaskDashboardHTML()

    // Add event listeners
    this.setupDashboardEventListeners(modal)

    return modal
  }

  // Get task dashboard HTML
  getTaskDashboardHTML() {
    const stats = this.taskManager.getTaskStatistics()
    const projectStats = this.taskManager.getProjectStatistics()
    const pendingTasks = this.taskManager.getTasks({ status: "pending" }).slice(0, 5)
    const activeProjects = this.taskManager.getProjects({ status: "active" }).slice(0, 3)

    return `
      <div class="task-dashboard-content">
        <div class="task-dashboard-header">
          <h2>${t("Task Management Dashboard")}</h2>
          <button class="close-dashboard">&times;</button>
        </div>
        
        <div class="task-dashboard-tabs">
          <button class="tab-button active" data-tab="overview">${t("Overview")}</button>
          <button class="tab-button" data-tab="tasks">${t("Tasks")}</button>
          <button class="tab-button" data-tab="projects">${t("Projects")}</button>
          <button class="tab-button" data-tab="add">${t("Add New")}</button>
        </div>
        
        <div class="task-dashboard-body">
          <!-- Overview Tab -->
          <div class="task-tab-content active" id="overview-tab">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${stats.pending}</div>
                <div class="stat-label">${t("Pending Tasks")}</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.completed}</div>
                <div class="stat-label">${t("Completed")}</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${stats.overdue}</div>
                <div class="stat-label">${t("Overdue")}</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${projectStats.active}</div>
                <div class="stat-label">${t("Active Projects")}</div>
              </div>
            </div>
            
            <div class="dashboard-sections">
              <div class="section">
                <h3>${t("Recent Tasks")}</h3>
                <div class="task-list">
                  ${pendingTasks
                    .map(
                      (task) => `
                    <div class="task-item" data-task-id="${task.id}">
                      <div class="task-priority ${task.priority.toLowerCase()}">${this.getPriorityEmoji(task.priority)}</div>
                      <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        <div class="task-meta">${task.category} ${task.dueDate ? `• Due: ${new Date(task.dueDate).toLocaleDateString()}` : ""}</div>
                      </div>
                      <button class="complete-task-btn" data-task-id="${task.id}">✓</button>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
              
              <div class="section">
                <h3>${t("Active Projects")}</h3>
                <div class="project-list">
                  ${activeProjects
                    .map(
                      (project) => `
                    <div class="project-item" data-project-id="${project.id}">
                      <div class="project-content">
                        <div class="project-title">${project.name}</div>
                        <div class="project-progress">
                          <div class="progress-bar">
                            <div class="progress-fill" style="width: ${project.progress}%"></div>
                          </div>
                          <span class="progress-text">${project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tasks Tab -->
          <div class="task-tab-content" id="tasks-tab">
            <div class="task-filters">
              <select id="task-status-filter">
                <option value="all">${t("All Status")}</option>
                <option value="pending">${t("Pending")}</option>
                <option value="in-progress">${t("In Progress")}</option>
                <option value="completed">${t("Completed")}</option>
              </select>
              <select id="task-category-filter">
                <option value="all">${t("All Categories")}</option>
                ${this.taskManager.categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
              </select>
              <select id="task-priority-filter">
                <option value="all">${t("All Priorities")}</option>
                ${this.taskManager.priorities.map((pri) => `<option value="${pri}">${pri}</option>`).join("")}
              </select>
            </div>
            <div id="filtered-tasks-list" class="task-list">
              <!-- Tasks will be populated here -->
            </div>
          </div>
          
          <!-- Projects Tab -->
          <div class="task-tab-content" id="projects-tab">
            <div class="project-filters">
              <select id="project-status-filter">
                <option value="all">${t("All Status")}</option>
                <option value="active">${t("Active")}</option>
                <option value="completed">${t("Completed")}</option>
                <option value="on-hold">${t("On Hold")}</option>
              </select>
            </div>
            <div id="filtered-projects-list" class="project-list">
              <!-- Projects will be populated here -->
            </div>
          </div>
          
          <!-- Add New Tab -->
          <div class="task-tab-content" id="add-tab">
            <div class="add-forms">
              <div class="form-section">
                <h3>${t("Add New Task")}</h3>
                <form id="add-task-form">
                  <input type="text" id="task-title" placeholder="${t("Task title")}" required>
                  <textarea id="task-description" placeholder="${t("Description (optional)")}" rows="3"></textarea>
                  <select id="task-category">
                    ${this.taskManager.categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
                  </select>
                  <select id="task-priority">
                    ${this.taskManager.priorities.map((pri) => `<option value="${pri}">${pri}</option>`).join("")}
                  </select>
                  <input type="date" id="task-due-date">
                  <button type="submit">${t("Add Task")}</button>
                </form>
              </div>
              
              <div class="form-section">
                <h3>${t("Add New Project")}</h3>
                <form id="add-project-form">
                  <input type="text" id="project-name" placeholder="${t("Project name")}" required>
                  <textarea id="project-description" placeholder="${t("Description (optional)")}" rows="3"></textarea>
                  <select id="project-category">
                    ${this.taskManager.categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
                  </select>
                  <select id="project-priority">
                    ${this.taskManager.priorities.map((pri) => `<option value="${pri}">${pri}</option>`).join("")}
                  </select>
                  <input type="date" id="project-due-date">
                  <button type="submit">${t("Add Project")}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Setup dashboard event listeners
  setupDashboardEventListeners(modal) {
    // Close button
    modal.querySelector(".close-dashboard").addEventListener("click", () => {
      this.closeDashboard(modal)
    })

    // Tab switching
    modal.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        this.switchDashboardTab(modal, e.target.dataset.tab)
      })
    })

    // Complete task buttons
    modal.querySelectorAll(".complete-task-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const taskId = Number.parseInt(e.target.dataset.taskId)
        this.completeTaskFromUI(taskId, modal)
      })
    })

    // Task filters
    const taskFilters = modal.querySelectorAll("#task-status-filter, #task-category-filter, #task-priority-filter")
    taskFilters.forEach((filter) => {
      filter.addEventListener("change", () => {
        this.updateTasksList(modal)
      })
    })

    // Project filters
    modal.querySelector("#project-status-filter").addEventListener("change", () => {
      this.updateProjectsList(modal)
    })

    // Add task form
    modal.querySelector("#add-task-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTaskFromForm(modal)
    })

    // Add project form
    modal.querySelector("#add-project-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addProjectFromForm(modal)
    })

    // Initial population
    this.updateTasksList(modal)
    this.updateProjectsList(modal)
  }

  // Switch dashboard tab
  switchDashboardTab(modal, tabId) {
    // Update tab buttons
    modal.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tabId)
    })

    // Update tab content
    modal.querySelectorAll(".task-tab-content").forEach((content) => {
      content.classList.remove("active")
    })

    modal.querySelector(`#${tabId}-tab`).classList.add("active")
  }

  // Update tasks list based on filters
  updateTasksList(modal) {
    const statusFilter = modal.querySelector("#task-status-filter").value
    const categoryFilter = modal.querySelector("#task-category-filter").value
    const priorityFilter = modal.querySelector("#task-priority-filter").value

    const filter = {}
    if (statusFilter !== "all") filter.status = statusFilter
    if (categoryFilter !== "all") filter.category = categoryFilter
    if (priorityFilter !== "all") filter.priority = priorityFilter

    const tasks = this.taskManager.getTasks(filter)
    const tasksList = modal.querySelector("#filtered-tasks-list")

    tasksList.innerHTML = tasks
      .map(
        (task) => `
      <div class="task-item" data-task-id="${task.id}">
        <div class="task-priority ${task.priority.toLowerCase()}">${this.getPriorityEmoji(task.priority)}</div>
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            ${task.category} • ${task.status}
            ${task.dueDate ? ` • Due: ${new Date(task.dueDate).toLocaleDateString()}` : ""}
          </div>
          ${task.description ? `<div class="task-description">${task.description}</div>` : ""}
        </div>
        ${task.status === "pending" ? `<button class="complete-task-btn" data-task-id="${task.id}">✓</button>` : ""}
      </div>
    `,
      )
      .join("")

    // Add event listeners to new complete buttons
    tasksList.querySelectorAll(".complete-task-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const taskId = Number.parseInt(e.target.dataset.taskId)
        this.completeTaskFromUI(taskId, modal)
      })
    })
  }

  // Update projects list based on filters
  updateProjectsList(modal) {
    const statusFilter = modal.querySelector("#project-status-filter").value

    const filter = {}
    if (statusFilter !== "all") filter.status = statusFilter

    const projects = this.taskManager.getProjects(filter)
    const projectsList = modal.querySelector("#filtered-projects-list")

    projectsList.innerHTML = projects
      .map(
        (project) => `
      <div class="project-item" data-project-id="${project.id}">
        <div class="project-content">
          <div class="project-title">${project.name}</div>
          <div class="project-meta">${project.category} • ${project.status}</div>
          ${project.description ? `<div class="project-description">${project.description}</div>` : ""}
          <div class="project-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${project.progress}%"></div>
            </div>
            <span class="progress-text">${project.progress}%</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  // Complete task from UI
  completeTaskFromUI(taskId, modal) {
    const task = this.taskManager.completeTask(taskId)
    if (task) {
      addMessage(`✅ ${t("Task completed")}: "${task.title}"`, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`Task completed: ${task.title}`))
      }

      // Refresh the UI
      this.updateTasksList(modal)
      this.refreshOverviewTab(modal)
    }
  }

  // Add task from form
  addTaskFromForm(modal) {
    const title = modal.querySelector("#task-title").value.trim()
    const description = modal.querySelector("#task-description").value.trim()
    const category = modal.querySelector("#task-category").value
    const priority = modal.querySelector("#task-priority").value
    const dueDate = modal.querySelector("#task-due-date").value

    if (!title) return

    const task = this.taskManager.addTask(title, {
      description,
      category,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    })

    addMessage(`✅ ${t("Task added")}: "${task.title}"`, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(t(`Task added: ${task.title}`))
    }

    // Clear form
    modal.querySelector("#add-task-form").reset()

    // Refresh UI
    this.updateTasksList(modal)
    this.refreshOverviewTab(modal)
  }

  // Add project from form
  addProjectFromForm(modal) {
    const name = modal.querySelector("#project-name").value.trim()
    const description = modal.querySelector("#project-description").value.trim()
    const category = modal.querySelector("#project-category").value
    const priority = modal.querySelector("#project-priority").value
    const dueDate = modal.querySelector("#project-due-date").value

    if (!name) return

    const project = this.taskManager.addProject(name, {
      description,
      category,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    })

    addMessage(`🎯 ${t("Project created")}: "${project.name}"`, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(t(`Project created: ${project.name}`))
    }

    // Clear form
    modal.querySelector("#add-project-form").reset()

    // Refresh UI
    this.updateProjectsList(modal)
    this.refreshOverviewTab(modal)
  }

  // Refresh overview tab
  refreshOverviewTab(modal) {
    // This would update the overview statistics and lists
    // For now, we'll just close and reopen the dashboard
    this.closeDashboard(modal)
    setTimeout(() => {
      this.openTaskDashboard()
    }, 100)
  }

  // Close dashboard
  closeDashboard(modal) {
    modal.classList.remove("open")
    setTimeout(() => {
      modal.remove()
    }, 300)
  }

  // Setup task notifications
  setupTaskNotifications() {
    // Show task summary on app startup
    setTimeout(() => {
      this.showTaskSummary()
    }, 10000) // 10 seconds after startup
  }

  // Show task summary
  showTaskSummary() {
    const stats = this.taskManager.getTaskStatistics()

    if (stats.pending > 0 || stats.overdue > 0) {
      let summary = `📋 ${t("Task Summary")}: `

      if (stats.pending > 0) {
        summary += `${stats.pending} ${t("pending")}`
      }

      if (stats.overdue > 0) {
        summary += `${stats.pending > 0 ? ", " : ""}${stats.overdue} ${t("overdue")}`
      }

      addMessage(summary, false)

      if (typeof voiceSystem !== "undefined" && eveSettings?.voice?.taskSummary) {
        voiceSystem.speak(summary)
      }
    }
  }

  // Get priority emoji
  getPriorityEmoji(priority) {
    const emojis = {
      Urgent: "🚨",
      High: "🔴",
      Medium: "🟡",
      Low: "🟢",
    }
    return emojis[priority] || "⚪"
  }
}

// Mock dependencies
const addMessage = (message, isUser) => console.log(message)
const t = (key) => key
const voiceSystem = { speak: (text) => console.log("Speaking:", text) }
const eveSettings = { voice: { taskSummary: true } }

// Initialize task UI integration
const taskManager = {
  getTaskStatistics: () => ({ pending: 2, completed: 5, overdue: 1 }),
  getProjectStatistics: () => ({ active: 3 }),
  getTasks: (filter) => [
    { id: 1, title: "Task 1", category: "Work", dueDate: new Date(), priority: "High", status: "pending" },
    { id: 2, title: "Task 2", category: "Personal", dueDate: new Date(), priority: "Medium", status: "pending" },
  ],
  getProjects: (filter) => [
    { id: 1, name: "Project 1", progress: 50, category: "Work", status: "active" },
    { id: 2, name: "Project 2", progress: 75, category: "Personal", status: "active" },
  ],
  categories: ["Work", "Personal", "Home"],
  priorities: ["High", "Medium", "Low"],
  completeTask: (taskId) => {
    console.log(`Task ${taskId} completed`)
    return {
      id: taskId,
      title: `Task ${taskId}`,
      category: "Work",
      dueDate: new Date(),
      priority: "High",
      status: "completed",
    }
  },
  addTask: (title, details) => {
    console.log(`Task ${title} added with details:`, details)
    return { id: 3, title: title, ...details }
  },
  addProject: (name, details) => {
    console.log(`Project ${name} added with details:`, details)
    return { id: 3, name: name, ...details }
  },
}

const taskUI = new TaskUIIntegration(taskManager)
