// Enhanced Message Processor with Task Management Integration
// Add this to your existing message processing system

// Mock dependencies for testing
const taskVoiceCommands = { processTaskCommand: () => false }
const processPersonalMessage = () => false
const offlineResponses = { processOfflineMessage: () => ({ handled: false, response: "" }) }
const taskManager = { getTaskStatistics: () => ({ dueToday: 0, pending: 0, completed: 0, overdue: 0 }) }
const intelligentSuggestions = { generateContextualSuggestions: () => [], displaySuggestions: () => {} }

// Enhanced processMessage function with task management
function processEnhancedMessageWithTasks(message) {
  const lowerMessage = message.toLowerCase()

  // 1. Check task voice commands first
  if (taskVoiceCommands.processTaskCommand(message)) {
    return true
  }

  // 2. Check application launcher
  if (window.EVEAppLauncher && window.EVEAppLauncher.process(message)) {
    return true
  }

  // 3. Check personal commands (profile, email, etc.)
  if (typeof processPersonalMessage !== "undefined" && processPersonalMessage(message)) {
    return true
  }

  // 4. Check for file operations
  if (handleFileOperations(message)) {
    return true
  }

  // 5. Check for system commands
  if (handleSystemCommands(message)) {
    return true
  }

  // 6. Check for voice commands
  if (handleVoiceCommands(message)) {
    return true
  }

  // 7. Check for online features
  if (handleOnlineFeatures(message)) {
    return true
  }

  // 8. Use offline conversation system
  if (typeof offlineResponses !== "undefined") {
    const offlineResult = offlineResponses.processOfflineMessage(message)
    if (offlineResult.handled) {
      addMessage(offlineResult.response, false)

      // Speak the response if voice is enabled
      if (typeof voiceSystem !== "undefined" && eveSettings?.voice?.autoSpeak) {
        voiceSystem.speak(offlineResult.response)
      }
      return true
    }
  }

  // 9. Default fallback
  const fallbackResponse = t(
    "I'm not sure how to help with that. Try asking me to manage tasks, open applications, or just have a conversation!",
  )
  addMessage(fallbackResponse, false)

  if (typeof voiceSystem !== "undefined" && eveSettings?.voice?.autoSpeak) {
    voiceSystem.speak(fallbackResponse)
  }

  return true
}

// Task-related suggestions for intelligent suggestions system
function getTaskSuggestions() {
  const suggestions = []
  const stats = taskManager.getTaskStatistics()
  const hour = new Date().getHours()

  // Morning task suggestions
  if (hour >= 6 && hour <= 10) {
    if (stats.dueToday > 0) {
      suggestions.push({
        type: "tasks",
        text: t(`Good morning! You have ${stats.dueToday} tasks due today. Would you like me to list them?`),
        priority: "high",
        actions: ["list_due_tasks"],
      })
    }

    if (stats.pending > 0) {
      suggestions.push({
        type: "productivity",
        text: t(`Ready to be productive? You have ${stats.pending} pending tasks to tackle.`),
        priority: "medium",
        actions: ["list_tasks"],
      })
    }
  }

  // Evening task review
  if (hour >= 17 && hour <= 20) {
    if (stats.completed > 0) {
      suggestions.push({
        type: "review",
        text: t(`Great job today! You completed ${stats.completed} tasks. Want to see what's left for tomorrow?`),
        priority: "medium",
        actions: ["task_summary"],
      })
    }
  }

  // Overdue task alerts
  if (stats.overdue > 0) {
    suggestions.push({
      type: "urgent",
      text: t(`You have ${stats.overdue} overdue tasks that need immediate attention.`),
      priority: "high",
      actions: ["list_overdue"],
    })
  }

  return suggestions
}

// Mock taskUI for testing purposes
const taskUI = { showTaskSummary: () => console.log("Showing task summary") }

// Initialize task management integration
document.addEventListener("DOMContentLoaded", () => {
  console.log("Task management system initialized")

  // Add task suggestions to intelligent suggestions
  if (typeof intelligentSuggestions !== "undefined") {
    // Override the existing suggestion generation to include tasks
    const originalGetSuggestions = intelligentSuggestions.generateContextualSuggestions
    intelligentSuggestions.generateContextualSuggestions = function () {
      const originalSuggestions = originalGetSuggestions.call(this)
      const taskSuggestions = getTaskSuggestions()

      // Combine and prioritize suggestions
      const allSuggestions = [...taskSuggestions, ...originalSuggestions]

      if (allSuggestions.length > 0) {
        this.displaySuggestions(allSuggestions.slice(0, 3))
      }
    }
  }

  // Show initial task summary after a delay
  setTimeout(() => {
    if (typeof taskUI !== "undefined") {
      taskUI.showTaskSummary()
    }
  }, 15000) // 15 seconds after startup
})

// Mock dependencies for testing
const addMessage = (message, isUser) => console.log(message)
const t = (key) => key
const handleFileOperations = () => false
const handleSystemCommands = () => false
const handleVoiceCommands = () => false
const handleOnlineFeatures = () => false
const voiceSystem = { speak: (text) => console.log("Speaking:", text) }
const eveSettings = { voice: { autoSpeak: true } }
