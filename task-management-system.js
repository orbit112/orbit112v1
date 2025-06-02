// Task Management System for EVE
// Add this to your scripts.js file

class TaskManagementSystem {
  constructor() {
    this.tasks = []
    this.projects = []
    this.categories = ["Personal", "Work", "Health", "Learning", "Shopping", "Home"]
    this.priorities = ["Low", "Medium", "High", "Urgent"]
    this.taskIdCounter = 1
    this.projectIdCounter = 1

    this.initializeTaskSystem()
  }

  // Initialize task management system
  initializeTaskSystem() {
    this.loadTaskData()
    this.setupTaskReminders()
    this.createDefaultCategories()
  }

  // Load task data from storage
  loadTaskData() {
    try {
      const savedTasks = localStorage.getItem("eveTasks")
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks)
        this.taskIdCounter = Math.max(...this.tasks.map((t) => t.id), 0) + 1
      }

      const savedProjects = localStorage.getItem("eveProjects")
      if (savedProjects) {
        this.projects = JSON.parse(savedProjects)
        this.projectIdCounter = Math.max(...this.projects.map((p) => p.id), 0) + 1
      }

      console.log(`Loaded ${this.tasks.length} tasks and ${this.projects.length} projects`)
    } catch (error) {
      console.error("Error loading task data:", error)
    }
  }

  // Save task data to storage
  saveTaskData() {
    try {
      localStorage.setItem("eveTasks", JSON.stringify(this.tasks))
      localStorage.setItem("eveProjects", JSON.stringify(this.projects))
    } catch (error) {
      console.error("Error saving task data:", error)
    }
  }

  // Create default categories if none exist
  createDefaultCategories() {
    const savedCategories = localStorage.getItem("eveTaskCategories")
    if (savedCategories) {
      this.categories = JSON.parse(savedCategories)
    } else {
      this.saveCategories()
    }
  }

  // Save categories
  saveCategories() {
    localStorage.setItem("eveTaskCategories", JSON.stringify(this.categories))
  }

  // Setup task reminders
  setupTaskReminders() {
    // Check for due tasks every 30 minutes
    setInterval(() => {
      this.checkDueTasks()
    }, 1800000)

    // Initial check after 5 seconds
    setTimeout(() => {
      this.checkDueTasks()
    }, 5000)
  }

  // Add new task
  addTask(title, options = {}) {
    const task = {
      id: this.taskIdCounter++,
      title: title.trim(),
      description: options.description || "",
      category: options.category || "Personal",
      priority: options.priority || "Medium",
      status: "pending", // pending, in-progress, completed, cancelled
      projectId: options.projectId || null,
      dueDate: options.dueDate || null,
      createdDate: new Date().toISOString(),
      completedDate: null,
      estimatedTime: options.estimatedTime || null, // in minutes
      actualTime: null,
      tags: options.tags || [],
      subtasks: [],
      notes: [],
    }

    this.tasks.push(task)
    this.saveTaskData()

    // Track interaction
    if (typeof intelligentSuggestions !== "undefined") {
      intelligentSuggestions.trackInteraction("add_task", {
        category: task.category,
        priority: task.priority,
      })
    }

    return task
  }

  // Add new project
  addProject(name, options = {}) {
    const project = {
      id: this.projectIdCounter++,
      name: name.trim(),
      description: options.description || "",
      category: options.category || "Personal",
      status: "active", // active, completed, on-hold, cancelled
      priority: options.priority || "Medium",
      startDate: options.startDate || new Date().toISOString(),
      dueDate: options.dueDate || null,
      completedDate: null,
      progress: 0, // 0-100
      color: options.color || "#7e57c2",
      tags: options.tags || [],
      teamMembers: options.teamMembers || [],
      milestones: [],
      notes: [],
    }

    this.projects.push(project)
    this.saveTaskData()

    // Track interaction
    if (typeof intelligentSuggestions !== "undefined") {
      intelligentSuggestions.trackInteraction("add_project", {
        category: project.category,
      })
    }

    return project
  }

  // Complete task
  completeTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.status = "completed"
      task.completedDate = new Date().toISOString()
      this.saveTaskData()

      // Update project progress if task belongs to a project
      if (task.projectId) {
        this.updateProjectProgress(task.projectId)
      }

      return task
    }
    return null
  }

  // Update project progress
  updateProjectProgress(projectId) {
    const project = this.projects.find((p) => p.id === projectId)
    if (project) {
      const projectTasks = this.tasks.filter((t) => t.projectId === projectId)
      const completedTasks = projectTasks.filter((t) => t.status === "completed")

      if (projectTasks.length > 0) {
        project.progress = Math.round((completedTasks.length / projectTasks.length) * 100)

        // Mark project as completed if all tasks are done
        if (project.progress === 100 && project.status === "active") {
          project.status = "completed"
          project.completedDate = new Date().toISOString()
        }
      }

      this.saveTaskData()
    }
  }

  // Get tasks by filter
  getTasks(filter = {}) {
    let filteredTasks = [...this.tasks]

    if (filter.status) {
      filteredTasks = filteredTasks.filter((t) => t.status === filter.status)
    }

    if (filter.category) {
      filteredTasks = filteredTasks.filter((t) => t.category === filter.category)
    }

    if (filter.priority) {
      filteredTasks = filteredTasks.filter((t) => t.priority === filter.priority)
    }

    if (filter.projectId) {
      filteredTasks = filteredTasks.filter((t) => t.projectId === filter.projectId)
    }

    if (filter.dueToday) {
      const today = new Date().toDateString()
      filteredTasks = filteredTasks.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === today)
    }

    if (filter.overdue) {
      const now = new Date()
      filteredTasks = filteredTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed")
    }

    // Sort by priority and due date
    filteredTasks.sort((a, b) => {
      const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      // If same priority, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate)
      }

      return 0
    })

    return filteredTasks
  }

  // Get projects by filter
  getProjects(filter = {}) {
    let filteredProjects = [...this.projects]

    if (filter.status) {
      filteredProjects = filteredProjects.filter((p) => p.status === filter.status)
    }

    if (filter.category) {
      filteredProjects = filteredProjects.filter((p) => p.category === filter.category)
    }

    return filteredProjects
  }

  // Check for due tasks
  checkDueTasks() {
    const now = new Date()
    const dueTasks = this.tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") return false

      const dueDate = new Date(task.dueDate)
      const timeDiff = dueDate - now

      // Alert for tasks due within 1 hour
      return timeDiff > 0 && timeDiff <= 3600000
    })

    const overdueTasks = this.tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") return false
      return new Date(task.dueDate) < now
    })

    if (dueTasks.length > 0) {
      addMessage(`⏰ ${t("Reminder")}: ${dueTasks.length} ${t("tasks due soon")}!`, false)

      if (typeof voiceSystem !== "undefined" && eveSettings?.voice?.taskReminders) {
        voiceSystem.speak(t(`You have ${dueTasks.length} tasks due soon`))
      }
    }

    if (overdueTasks.length > 0) {
      addMessage(`🚨 ${t("Alert")}: ${overdueTasks.length} ${t("overdue tasks")}!`, false)
    }
  }

  // Get task statistics
  getTaskStatistics() {
    const stats = {
      total: this.tasks.length,
      pending: this.tasks.filter((t) => t.status === "pending").length,
      inProgress: this.tasks.filter((t) => t.status === "in-progress").length,
      completed: this.tasks.filter((t) => t.status === "completed").length,
      overdue: this.tasks.filter((t) => {
        if (!t.dueDate || t.status === "completed") return false
        return new Date(t.dueDate) < new Date()
      }).length,
      dueToday: this.tasks.filter((t) => {
        if (!t.dueDate) return false
        return new Date(t.dueDate).toDateString() === new Date().toDateString()
      }).length,
      byCategory: {},
      byPriority: {},
    }

    // Count by category
    this.categories.forEach((category) => {
      stats.byCategory[category] = this.tasks.filter((t) => t.category === category).length
    })

    // Count by priority
    this.priorities.forEach((priority) => {
      stats.byPriority[priority] = this.tasks.filter((t) => t.priority === priority).length
    })

    return stats
  }

  // Get project statistics
  getProjectStatistics() {
    const stats = {
      total: this.projects.length,
      active: this.projects.filter((p) => p.status === "active").length,
      completed: this.projects.filter((p) => p.status === "completed").length,
      onHold: this.projects.filter((p) => p.status === "on-hold").length,
      averageProgress: 0,
      byCategory: {},
    }

    if (this.projects.length > 0) {
      const totalProgress = this.projects.reduce((sum, p) => sum + p.progress, 0)
      stats.averageProgress = Math.round(totalProgress / this.projects.length)
    }

    // Count by category
    this.categories.forEach((category) => {
      stats.byCategory[category] = this.projects.filter((p) => p.category === category).length
    })

    return stats
  }

  // Add subtask
  addSubtask(taskId, subtaskTitle) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      const subtask = {
        id: Date.now(),
        title: subtaskTitle.trim(),
        completed: false,
        createdDate: new Date().toISOString(),
      }

      task.subtasks.push(subtask)
      this.saveTaskData()
      return subtask
    }
    return null
  }

  // Add note to task or project
  addNote(id, noteText, type = "task") {
    const item = type === "task" ? this.tasks.find((t) => t.id === id) : this.projects.find((p) => p.id === id)

    if (item) {
      const note = {
        id: Date.now(),
        text: noteText.trim(),
        createdDate: new Date().toISOString(),
      }

      item.notes.push(note)
      this.saveTaskData()
      return note
    }
    return null
  }

  // Search tasks and projects
  search(query) {
    const lowerQuery = query.toLowerCase()

    const matchingTasks = this.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery) ||
        task.category.toLowerCase().includes(lowerQuery) ||
        task.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )

    const matchingProjects = this.projects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery) ||
        project.category.toLowerCase().includes(lowerQuery) ||
        project.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )

    return { tasks: matchingTasks, projects: matchingProjects }
  }

  // Get productivity insights
  getProductivityInsights() {
    const insights = []
    const stats = this.getTaskStatistics()
    const projectStats = this.getProjectStatistics()

    // Completion rate insight
    if (stats.total > 0) {
      const completionRate = Math.round((stats.completed / stats.total) * 100)
      insights.push({
        type: "completion",
        text: t(`Your task completion rate is ${completionRate}%`),
        value: completionRate,
      })
    }

    // Overdue tasks insight
    if (stats.overdue > 0) {
      insights.push({
        type: "overdue",
        text: t(`You have ${stats.overdue} overdue tasks that need attention`),
        priority: "high",
      })
    }

    // Most productive category
    const topCategory = Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a)[0]

    if (topCategory && topCategory[1] > 0) {
      insights.push({
        type: "category",
        text: t(`Most of your tasks are in ${topCategory[0]} category`),
        category: topCategory[0],
      })
    }

    // Project progress insight
    if (projectStats.total > 0) {
      insights.push({
        type: "projects",
        text: t(`Your projects are ${projectStats.averageProgress}% complete on average`),
        value: projectStats.averageProgress,
      })
    }

    return insights
  }
}

// Initialize task management system
const taskManager = new TaskManagementSystem()

// Mock dependencies for testing
const addMessage = (message, isUser) => console.log(message)
const t = (key) => key
const voiceSystem = { speak: (text) => console.log("Speaking:", text) }
const eveSettings = { voice: { taskReminders: true } }
const intelligentSuggestions = {
  trackInteraction: (action, details) => console.log("Tracked:", action, details),
}
