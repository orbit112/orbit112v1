// Enhanced Message Processor with Team Collaboration Integration
// Add this to your existing message processing system

// Enhanced processMessage function with team collaboration
function processEnhancedMessageWithCollaboration(message) {
  const lowerMessage = message.toLowerCase()

  // 1. Check team collaboration voice commands first
  if (teamCollaborationVoiceCommands.processCollaborationCommand(message)) {
    return true
  }

  // 2. Check task voice commands
  if (taskVoiceCommands.processTaskCommand(message)) {
    return true
  }

  // 3. Check application launcher
  if (window.EVEAppLauncher && window.EVEAppLauncher.process(message)) {
    return true
  }

  // 4. Check personal commands (profile, email, etc.)
  if (typeof processPersonalMessage !== "undefined" && processPersonalMessage(message)) {
    return true
  }

  // 5. Check for file operations
  if (handleFileOperations(message)) {
    return true
  }

  // 6. Check for system commands
  if (handleSystemCommands(message)) {
    return true
  }

  // 7. Check for voice commands
  if (handleVoiceCommands(message)) {
    return true
  }

  // 8. Check for online features
  if (handleOnlineFeatures(message)) {
    return true
  }

  // 9. Use offline conversation system
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

  // 10. Default fallback
  const fallbackResponse = t(
    "I'm not sure how to help with that. Try asking me to manage tasks, collaborate with teams, open applications, or just have a conversation!",
  )
  addMessage(fallbackResponse, false)

  if (typeof voiceSystem !== "undefined" && eveSettings?.voice?.autoSpeak) {
    voiceSystem.speak(fallbackResponse)
  }

  return true
}

// Update collaboration suggestions to use USERNAME
function getCollaborationSuggestions() {
  const suggestions = []
  const stats = teamCollaboration.getCollaborationStats()
  const currentUser = teamCollaboration.getCurrentUser()
  const assignedTasks = teamCollaboration.getMemberTasks(currentUser.id)
  const pendingTasks = assignedTasks.filter((t) => t.status === "pending")
  const userSummary = teamCollaboration.getUserCollaborationSummary()
  const username = process.env.USERNAME || currentUser.name
  const hour = new Date().getHours()

  // Morning collaboration suggestions
  if (hour >= 8 && hour <= 10) {
    if (pendingTasks.length > 0) {
      suggestions.push({
        type: "collaboration",
        text: t(
          `Good morning, ${username}! You have ${pendingTasks.length} tasks assigned by team members. Ready to collaborate?`,
        ),
        priority: "high",
        actions: ["list_assigned_tasks"],
      })
    }

    if (userSummary.teamsJoined > 0) {
      suggestions.push({
        type: "team_sync",
        text: t(
          `${username}, time to sync with your ${userSummary.teamsJoined} teams! Check for updates and new assignments.`,
        ),
        priority: "medium",
        actions: ["team_activity", "collaboration_status"],
      })
    }
  }

  // Collaboration reminders
  if (userSummary.teamsJoined > 0 && userSummary.totalCollaborations === 0) {
    suggestions.push({
      type: "sharing",
      text: t(`${username}, you have teams but no shared projects. Consider sharing a project to start collaborating!`),
      priority: "medium",
      actions: ["share_project"],
    })
  }

  // Team activity suggestions
  if (userSummary.teamsJoined > 0 && hour >= 14 && hour <= 16) {
    suggestions.push({
      type: "team_check",
      text: t(`${username}, afternoon check-in: How are your ${userSummary.teamsJoined} team projects progressing?`),
      priority: "low",
      actions: ["team_stats", "team_projects"],
    })
  }

  // End of day collaboration wrap-up
  if (hour >= 17 && hour <= 19 && (pendingTasks.length > 0 || userSummary.totalCollaborations > 0)) {
    suggestions.push({
      type: "collaboration_wrap",
      text: t(`${username}, end of day: Update your teams on progress and check tomorrow's collaborative tasks.`),
      priority: "medium",
      actions: ["update_team", "tomorrow_tasks"],
    })
  }

  // Achievement suggestions
  if (userSummary.completedTasks > 0 && userSummary.completedTasks % 5 === 0) {
    suggestions.push({
      type: "achievement",
      text: t(
        `Great job, ${username}! You've completed ${userSummary.completedTasks} collaborative tasks. Keep up the excellent teamwork!`,
      ),
      priority: "low",
      actions: ["team_stats"],
    })
  }

  return suggestions
}

// Update the initialization message
document.addEventListener("DOMContentLoaded", () => {
  const username = process.env.USERNAME || "User"
  console.log(`Team collaboration system initialized for ${username}`)

  // Add collaboration suggestions to intelligent suggestions
  if (typeof intelligentSuggestions !== "undefined") {
    // Override the existing suggestion generation to include collaboration
    const originalGetSuggestions = intelligentSuggestions.generateContextualSuggestions
    intelligentSuggestions.generateContextualSuggestions = function () {
      const originalSuggestions = originalGetSuggestions.call(this)
      const collaborationSuggestions = getCollaborationSuggestions()

      // Combine and prioritize suggestions
      const allSuggestions = [...collaborationSuggestions, ...originalSuggestions]

      if (allSuggestions.length > 0) {
        this.displaySuggestions(allSuggestions.slice(0, 3))
      }
    }
  }

  // Show initial collaboration summary after a delay
  setTimeout(() => {
    if (typeof teamCollaborationUI !== "undefined") {
      teamCollaborationUI.showCollaborationSummary()
    }
  }, 18000) // 18 seconds after startup
})

// Mock dependencies for testing
const teamCollaborationVoiceCommands = { processCollaborationCommand: () => false }
const taskVoiceCommands = { processTaskCommand: () => false }
const processPersonalMessage = () => false
const offlineResponses = { processOfflineMessage: () => ({ handled: false, response: "" }) }
const teamCollaboration = {
  getCollaborationStats: () => ({ totalTeams: 0, sharedProjects: 0 }),
  getCurrentUser: () => ({ id: 1, name: "User" }),
  getMemberTasks: () => [],
  getUserCollaborationSummary: () => ({ teamsJoined: 0, totalCollaborations: 0, completedTasks: 0 }),
}
const intelligentSuggestions = {
  generateContextualSuggestions: () => [],
  displaySuggestions: () => {},
}
const teamCollaborationUI = { showCollaborationSummary: () => {} }
const addMessage = (message, isUser) => console.log(message)
const t = (key) => key
const handleFileOperations = () => false
const handleSystemCommands = () => false
const handleVoiceCommands = () => false
const handleOnlineFeatures = () => false
const voiceSystem = { speak: (text) => console.log("Speaking:", text) }
const eveSettings = { voice: { autoSpeak: true } }
