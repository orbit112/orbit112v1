// Voice Commands for Task Management
// Add this to your scripts.js file

class TaskVoiceCommands {
  constructor(taskManager) {
    this.taskManager = taskManager
    this.setupVoicePatterns()
  }

  // Setup voice command patterns
  setupVoicePatterns() {
    this.patterns = {
      addTask: /(?:add task|create task|new task)\s+(.+)/i,
      addProject: /(?:add project|create project|new project)\s+(.+)/i,
      completeTask: /(?:complete task|finish task|done task)\s+(.+)/i,
      listTasks: /(?:list tasks|show tasks|my tasks|what tasks)/i,
      listProjects: /(?:list projects|show projects|my projects)/i,
      taskStats: /(?:task stats|task statistics|task summary)/i,
      projectStats: /(?:project stats|project statistics|project summary)/i,
      dueTasks: /(?:due tasks|tasks due|what's due)/i,
      overdueTask: /(?:overdue tasks|late tasks)/i,
      searchTasks: /(?:search tasks|find task)\s+(.+)/i,
      todayTasks: /(?:today's tasks|tasks for today|what do i need to do today)/i,
      highPriorityTasks: /(?:high priority tasks|urgent tasks|important tasks)/i,
      workTasks: /(?:work tasks|office tasks)/i,
      personalTasks: /(?:personal tasks|home tasks)/i,
      productivity: /(?:productivity|how am i doing|task insights)/i,
    }
  }

  // Process task-related voice commands
  processTaskCommand(message) {
    const lowerMessage = message.toLowerCase().trim()

    // Check each pattern
    for (const [command, pattern] of Object.entries(this.patterns)) {
      const match = lowerMessage.match(pattern)
      if (match) {
        return this.executeCommand(command, match, message)
      }
    }

    return false
  }

  // Execute specific command
  executeCommand(command, match, originalMessage) {
    switch (command) {
      case "addTask":
        return this.handleAddTask(match[1])

      case "addProject":
        return this.handleAddProject(match[1])

      case "completeTask":
        return this.handleCompleteTask(match[1])

      case "listTasks":
        return this.handleListTasks()

      case "listProjects":
        return this.handleListProjects()

      case "taskStats":
        return this.handleTaskStats()

      case "projectStats":
        return this.handleProjectStats()

      case "dueTasks":
        return this.handleDueTasks()

      case "overdueTask":
        return this.handleOverdueTasks()

      case "searchTasks":
        return this.handleSearchTasks(match[1])

      case "todayTasks":
        return this.handleTodayTasks()

      case "highPriorityTasks":
        return this.handleHighPriorityTasks()

      case "workTasks":
        return this.handleWorkTasks()

      case "personalTasks":
        return this.handlePersonalTasks()

      case "productivity":
        return this.handleProductivityInsights()

      default:
        return false
    }
  }

  // Handle add task command
  handleAddTask(taskTitle) {
    // Parse additional details from title
    const { title, category, priority, dueDate } = this.parseTaskDetails(taskTitle)

    const task = this.taskManager.addTask(title, {
      category,
      priority,
      dueDate,
    })

    const response = t(`Task added: "${task.title}" in ${task.category} category with ${task.priority} priority`)
    addMessage("✅ " + response, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(response)
    }

    return true
  }

  // Handle add project command
  handleAddProject(projectName) {
    const { name, category, priority } = this.parseProjectDetails(projectName)

    const project = this.taskManager.addProject(name, {
      category,
      priority,
    })

    const response = t(`Project created: "${project.name}" in ${project.category} category`)
    addMessage("🎯 " + response, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(response)
    }

    return true
  }

  // Handle complete task command
  handleCompleteTask(taskQuery) {
    const tasks = this.taskManager.getTasks({ status: "pending" })
    const matchingTask = tasks.find((task) => task.title.toLowerCase().includes(taskQuery.toLowerCase()))

    if (matchingTask) {
      this.taskManager.completeTask(matchingTask.id)
      const response = t(`Task completed: "${matchingTask.title}"`)
      addMessage("🎉 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      const response = t(`Could not find task: "${taskQuery}"`)
      addMessage("❌ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    }

    return true
  }

  // Handle list tasks command
  handleListTasks() {
    const pendingTasks = this.taskManager.getTasks({ status: "pending" })

    if (pendingTasks.length === 0) {
      const response = t("You have no pending tasks. Great job!")
      addMessage("✨ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`📋 ${t("Your pending tasks")} (${pendingTasks.length}):`, false)

      pendingTasks.slice(0, 5).forEach((task, index) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        const dueText = task.dueDate ? ` - ${t("Due")}: ${new Date(task.dueDate).toLocaleDateString()}` : ""
        addMessage(`${priorityEmoji} ${task.title} [${task.category}]${dueText}`, false)
      })

      if (pendingTasks.length > 5) {
        addMessage(`... ${t("and")} ${pendingTasks.length - 5} ${t("more tasks")}`, false)
      }

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${pendingTasks.length} pending tasks`))
      }
    }

    return true
  }

  // Handle list projects command
  handleListProjects() {
    const activeProjects = this.taskManager.getProjects({ status: "active" })

    if (activeProjects.length === 0) {
      const response = t("You have no active projects")
      addMessage("📁 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`🎯 ${t("Your active projects")} (${activeProjects.length}):`, false)

      activeProjects.forEach((project) => {
        addMessage(`• ${project.name} - ${project.progress}% ${t("complete")} [${project.category}]`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${activeProjects.length} active projects`))
      }
    }

    return true
  }

  // Handle task statistics command
  handleTaskStats() {
    const stats = this.taskManager.getTaskStatistics()

    const statsText = `📊 ${t("Task Statistics")}:
📝 ${t("Total tasks")}: ${stats.total}
⏳ ${t("Pending")}: ${stats.pending}
🔄 ${t("In progress")}: ${stats.inProgress}
✅ ${t("Completed")}: ${stats.completed}
🚨 ${t("Overdue")}: ${stats.overdue}
📅 ${t("Due today")}: ${stats.dueToday}`

    addMessage(statsText, false)

    if (typeof voiceSystem !== "undefined") {
      const spokenStats = t(
        `You have ${stats.pending} pending tasks, ${stats.completed} completed, and ${stats.overdue} overdue`,
      )
      voiceSystem.speak(spokenStats)
    }

    return true
  }

  // Handle project statistics command
  handleProjectStats() {
    const stats = this.taskManager.getProjectStatistics()

    const statsText = `🎯 ${t("Project Statistics")}:
📁 ${t("Total projects")}: ${stats.total}
🔥 ${t("Active")}: ${stats.active}
✅ ${t("Completed")}: ${stats.completed}
⏸️ ${t("On hold")}: ${stats.onHold}
📈 ${t("Average progress")}: ${stats.averageProgress}%`

    addMessage(statsText, false)

    if (typeof voiceSystem !== "undefined") {
      const spokenStats = t(`You have ${stats.active} active projects with ${stats.averageProgress}% average progress`)
      voiceSystem.speak(spokenStats)
    }

    return true
  }

  // Handle due tasks command
  handleDueTasks() {
    const dueTasks = this.taskManager.getTasks({ dueToday: true })

    if (dueTasks.length === 0) {
      const response = t("No tasks due today")
      addMessage("✨ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`📅 ${t("Tasks due today")} (${dueTasks.length}):`, false)

      dueTasks.forEach((task) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        addMessage(`${priorityEmoji} ${task.title} [${task.category}]`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${dueTasks.length} tasks due today`))
      }
    }

    return true
  }

  // Handle overdue tasks command
  handleOverdueTasks() {
    const overdueTasks = this.taskManager.getTasks({ overdue: true })

    if (overdueTasks.length === 0) {
      const response = t("No overdue tasks. You're on track!")
      addMessage("🎉 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`🚨 ${t("Overdue tasks")} (${overdueTasks.length}):`, false)

      overdueTasks.forEach((task) => {
        const daysOverdue = Math.floor((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))
        addMessage(`⚠️ ${task.title} - ${daysOverdue} ${t("days overdue")} [${task.category}]`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${overdueTasks.length} overdue tasks that need attention`))
      }
    }

    return true
  }

  // Handle search tasks command
  handleSearchTasks(query) {
    const results = this.taskManager.search(query)
    const totalResults = results.tasks.length + results.projects.length

    if (totalResults === 0) {
      const response = t(`No results found for: "${query}"`)
      addMessage("❌ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`🔍 ${t("Search results for")}: "${query}"`, false)

      if (results.tasks.length > 0) {
        addMessage(`📋 ${t("Tasks")} (${results.tasks.length}):`, false)
        results.tasks.slice(0, 5).forEach((task) => {
          const statusEmoji = task.status === "completed" ? "✅" : "⏳"
          addMessage(`${statusEmoji} ${task.title} [${task.category}]`, false)
        })
      }

      if (results.projects.length > 0) {
        addMessage(`🎯 ${t("Projects")} (${results.projects.length}):`, false)
        results.projects.slice(0, 3).forEach((project) => {
          addMessage(`• ${project.name} - ${project.progress}% [${project.category}]`, false)
        })
      }

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`Found ${totalResults} results for ${query}`))
      }
    }

    return true
  }

  // Handle today's tasks command
  handleTodayTasks() {
    const todayTasks = this.taskManager.getTasks({ dueToday: true })
    const pendingTasks = this.taskManager.getTasks({ status: "pending" }).slice(0, 5)

    addMessage(`📅 ${t("Today's Focus")}:`, false)

    if (todayTasks.length > 0) {
      addMessage(`⏰ ${t("Due today")} (${todayTasks.length}):`, false)
      todayTasks.forEach((task) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        addMessage(`${priorityEmoji} ${task.title}`, false)
      })
    }

    if (pendingTasks.length > 0) {
      addMessage(`📋 ${t("Top pending tasks")}:`, false)
      pendingTasks.forEach((task) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        addMessage(`${priorityEmoji} ${task.title}`, false)
      })
    }

    if (todayTasks.length === 0 && pendingTasks.length === 0) {
      const response = t("No tasks for today. Time to relax or plan ahead!")
      addMessage("✨ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      if (typeof voiceSystem !== "undefined") {
        const totalToday = todayTasks.length + Math.min(pendingTasks.length, 3)
        voiceSystem.speak(t(`You have ${totalToday} tasks to focus on today`))
      }
    }

    return true
  }

  // Handle high priority tasks command
  handleHighPriorityTasks() {
    const highPriorityTasks = this.taskManager.getTasks({ priority: "High" })
    const urgentTasks = this.taskManager.getTasks({ priority: "Urgent" })
    const allImportant = [...urgentTasks, ...highPriorityTasks]

    if (allImportant.length === 0) {
      const response = t("No high priority tasks. Good job staying on top of things!")
      addMessage("🌟 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`⭐ ${t("High Priority Tasks")} (${allImportant.length}):`, false)

      allImportant.forEach((task) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        const dueText = task.dueDate ? ` - ${t("Due")}: ${new Date(task.dueDate).toLocaleDateString()}` : ""
        addMessage(`${priorityEmoji} ${task.title} [${task.category}]${dueText}`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${allImportant.length} high priority tasks`))
      }
    }

    return true
  }

  // Handle work tasks command
  handleWorkTasks() {
    const workTasks = this.taskManager.getTasks({ category: "Work", status: "pending" })

    if (workTasks.length === 0) {
      const response = t("No pending work tasks")
      addMessage("💼 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`💼 ${t("Work Tasks")} (${workTasks.length}):`, false)

      workTasks.forEach((task) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        const dueText = task.dueDate ? ` - ${t("Due")}: ${new Date(task.dueDate).toLocaleDateString()}` : ""
        addMessage(`${priorityEmoji} ${task.title}${dueText}`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${workTasks.length} work tasks`))
      }
    }

    return true
  }

  // Handle personal tasks command
  handlePersonalTasks() {
    const personalTasks = this.taskManager.getTasks({ category: "Personal", status: "pending" })

    if (personalTasks.length === 0) {
      const response = t("No pending personal tasks")
      addMessage("🏠 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`🏠 ${t("Personal Tasks")} (${personalTasks.length}):`, false)

      personalTasks.forEach((task) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        const dueText = task.dueDate ? ` - ${t("Due")}: ${new Date(task.dueDate).toLocaleDateString()}` : ""
        addMessage(`${priorityEmoji} ${task.title}${dueText}`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${personalTasks.length} personal tasks`))
      }
    }

    return true
  }

  // Handle productivity insights command
  handleProductivityInsights() {
    const insights = this.taskManager.getProductivityInsights()

    addMessage(`📈 ${t("Productivity Insights")}:`, false)

    insights.forEach((insight) => {
      const emoji = this.getInsightEmoji(insight.type)
      addMessage(`${emoji} ${insight.text}`, false)
    })

    if (insights.length === 0) {
      addMessage(`💡 ${t("Complete more tasks to get productivity insights!")}`, false)
    }

    if (typeof voiceSystem !== "undefined" && insights.length > 0) {
      voiceSystem.speak(insights[0].text)
    }

    return true
  }

  // Parse task details from voice input
  parseTaskDetails(input) {
    let title = input
    let category = "Personal"
    let priority = "Medium"
    let dueDate = null

    // Extract category
    const categoryMatch = input.match(/(?:in|for|category)\s+(work|personal|health|learning|shopping|home)/i)
    if (categoryMatch) {
      category = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1).toLowerCase()
      title = title.replace(categoryMatch[0], "").trim()
    }

    // Extract priority
    const priorityMatch = input.match(/(?:priority|urgent|high|medium|low)\s+(urgent|high|medium|low)/i)
    if (priorityMatch) {
      priority = priorityMatch[1].charAt(0).toUpperCase() + priorityMatch[1].slice(1).toLowerCase()
      title = title.replace(priorityMatch[0], "").trim()
    } else if (input.includes("urgent")) {
      priority = "Urgent"
      title = title.replace(/urgent/gi, "").trim()
    } else if (input.includes("high priority")) {
      priority = "High"
      title = title.replace(/high priority/gi, "").trim()
    }

    // Extract due date (basic parsing)
    const dueDateMatch = input.match(
      /(?:due|by)\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    )
    if (dueDateMatch) {
      const dateStr = dueDateMatch[1].toLowerCase()
      if (dateStr === "today") {
        dueDate = new Date().toISOString()
      } else if (dateStr === "tomorrow") {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        dueDate = tomorrow.toISOString()
      }
      title = title.replace(dueDateMatch[0], "").trim()
    }

    return { title, category, priority, dueDate }
  }

  // Parse project details from voice input
  parseProjectDetails(input) {
    let name = input
    let category = "Personal"
    let priority = "Medium"

    // Extract category
    const categoryMatch = input.match(/(?:in|for|category)\s+(work|personal|health|learning|shopping|home)/i)
    if (categoryMatch) {
      category = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1).toLowerCase()
      name = name.replace(categoryMatch[0], "").trim()
    }

    // Extract priority
    const priorityMatch = input.match(/(?:priority|urgent|high|medium|low)\s+(urgent|high|medium|low)/i)
    if (priorityMatch) {
      priority = priorityMatch[1].charAt(0).toUpperCase() + priorityMatch[1].slice(1).toLowerCase()
      name = name.replace(priorityMatch[0], "").trim()
    }

    return { name, category, priority }
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

  // Get insight emoji
  getInsightEmoji(type) {
    const emojis = {
      completion: "📊",
      overdue: "⚠️",
      category: "📂",
      projects: "🎯",
    }
    return emojis[type] || "💡"
  }
}

// Initialize task voice commands
const taskManager = {
  addTask: (title, details) => {
    console.log(`Adding task: ${title} with details:`, details)
    return { title: title, category: details.category, priority: details.priority }
  },
  addProject: (name, details) => {
    console.log(`Adding project: ${name} with details:`, details)
    return { name: name, category: details.category }
  },
  getTasks: (filter) => {
    console.log(`Getting tasks with filter:`, filter)
    return []
  },
  getProjects: (filter) => {
    console.log(`Getting projects with filter:`, filter)
    return []
  },
  getTaskStatistics: () => {
    console.log("Getting task statistics")
    return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0, dueToday: 0 }
  },
  getProjectStatistics: () => {
    console.log("Getting project statistics")
    return { total: 0, active: 0, completed: 0, onHold: 0, averageProgress: 0 }
  },
  search: (query) => {
    console.log(`Searching for: ${query}`)
    return { tasks: [], projects: [] }
  },
  getProductivityInsights: () => {
    console.log("Getting productivity insights")
    return []
  },
  completeTask: (taskId) => {
    console.log(`Completing task with ID: ${taskId}`)
  },
}

const taskVoiceCommands = new TaskVoiceCommands(taskManager)

// Mock dependencies
const addMessage = (message, isUser) => console.log(message)
const t = (key) => key
const voiceSystem = { speak: (text) => console.log("Speaking:", text) }
