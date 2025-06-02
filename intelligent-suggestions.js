// Intelligent Suggestions System for EVE
// Add this to your scripts.js file

class IntelligentSuggestions {
  constructor() {
    this.suggestionHistory = []
    this.userBehavior = {
      mostUsedApps: {},
      timePatterns: {},
      preferences: {},
      interactions: [],
    }

    this.loadBehaviorData()
    this.setupSuggestionEngine()
  }

  // Load behavior data
  loadBehaviorData() {
    try {
      const saved = localStorage.getItem("eveBehaviorData")
      if (saved) {
        this.userBehavior = { ...this.userBehavior, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error("Error loading behavior data:", error)
    }
  }

  // Save behavior data
  saveBehaviorData() {
    try {
      localStorage.setItem("eveBehaviorData", JSON.stringify(this.userBehavior))
    } catch (error) {
      console.error("Error saving behavior data:", error)
    }
  }

  // Setup suggestion engine
  setupSuggestionEngine() {
    // Run suggestions every 30 minutes
    setInterval(() => {
      this.generateContextualSuggestions()
    }, 1800000)

    // Initial suggestions
    setTimeout(() => {
      this.generateWelcomeSuggestions()
    }, 5000)
  }

  // Track user interaction
  trackInteraction(action, details = {}) {
    const interaction = {
      action,
      details,
      timestamp: new Date().toISOString(),
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
    }

    this.userBehavior.interactions.push(interaction)

    // Keep only last 1000 interactions
    if (this.userBehavior.interactions.length > 1000) {
      this.userBehavior.interactions = this.userBehavior.interactions.slice(-1000)
    }

    // Update app usage tracking
    if (action === "launch_app" && details.appName) {
      this.userBehavior.mostUsedApps[details.appName] = (this.userBehavior.mostUsedApps[details.appName] || 0) + 1
    }

    // Update time patterns
    const hourKey = `hour_${interaction.hour}`
    this.userBehavior.timePatterns[hourKey] = (this.userBehavior.timePatterns[hourKey] || 0) + 1

    this.saveBehaviorData()
  }

  // Generate welcome suggestions
  generateWelcomeSuggestions() {
    const name = profileManager.profile.personal.name
    const suggestions = []

    if (name) {
      suggestions.push({
        type: "greeting",
        text: profileManager.getPersonalizedGreeting(),
        priority: "high",
        actions: ["check_emails", "show_schedule", "system_status"],
      })
    } else {
      suggestions.push({
        type: "introduction",
        text: t(
          "Hi! I'm EVE. What's your name? I'd love to get to know you better so I can provide personalized assistance.",
        ),
        priority: "high",
        actions: ["setup_profile"],
      })
    }

    // Add email suggestions
    const emailSuggestions = emailManager.getEmailSuggestions()
    suggestions.push(...emailSuggestions)

    // Add personalized suggestions
    const personalSuggestions = profileManager.getPersonalizedSuggestions()
    personalSuggestions.forEach((suggestion) => {
      suggestions.push({
        type: "personal",
        text: suggestion,
        priority: "medium",
      })
    })

    this.displaySuggestions(suggestions)
  }

  // Generate contextual suggestions
  generateContextualSuggestions() {
    const suggestions = []
    const hour = new Date().getHours()
    const dayOfWeek = new Date().getDay()

    // Time-based suggestions
    suggestions.push(...this.getTimeBasedSuggestions(hour, dayOfWeek))

    // Behavior-based suggestions
    suggestions.push(...this.getBehaviorBasedSuggestions())

    // Email-based suggestions
    suggestions.push(...emailManager.getEmailSuggestions())

    // Reminder suggestions
    suggestions.push(...this.getReminderSuggestions())

    // Productivity suggestions
    suggestions.push(...this.getProductivitySuggestions())

    if (suggestions.length > 0) {
      this.displaySuggestions(suggestions.slice(0, 3)) // Show top 3 suggestions
    }
  }

  // Get time-based suggestions
  getTimeBasedSuggestions(hour, dayOfWeek) {
    const suggestions = []

    // Morning suggestions (6-10 AM)
    if (hour >= 6 && hour <= 10) {
      suggestions.push({
        type: "morning",
        text: t("Good morning! Would you like me to check your emails and today's schedule?"),
        priority: "high",
        actions: ["check_emails", "show_schedule"],
      })

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Weekday
        suggestions.push({
          type: "work",
          text: t("Ready to start your workday? I can open your work applications."),
          priority: "medium",
          actions: ["open_work_apps"],
        })
      }
    }

    // Lunch time suggestions (11 AM - 2 PM)
    if (hour >= 11 && hour <= 14) {
      suggestions.push({
        type: "break",
        text: t("Time for a break! Would you like me to play some relaxing music?"),
        priority: "low",
        actions: ["play_music", "open_entertainment"],
      })
    }

    // Evening suggestions (6-10 PM)
    if (hour >= 18 && hour <= 22) {
      suggestions.push({
        type: "evening",
        text: t("Evening time! How about some entertainment or checking personal emails?"),
        priority: "medium",
        actions: ["open_entertainment", "check_personal_emails"],
      })
    }

    // Weekend suggestions
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      suggestions.push({
        type: "weekend",
        text: t("It's the weekend! Want me to suggest some fun activities or entertainment?"),
        priority: "medium",
        actions: ["suggest_entertainment", "open_games"],
      })
    }

    return suggestions
  }

  // Get behavior-based suggestions
  getBehaviorBasedSuggestions() {
    const suggestions = []

    // Most used apps
    const topApps = Object.entries(this.userBehavior.mostUsedApps)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    if (topApps.length > 0) {
      const [appName] = topApps[0]
      suggestions.push({
        type: "habit",
        text: t(`You often use ${appName}. Would you like me to open it?`),
        priority: "medium",
        actions: [`launch_${appName.toLowerCase().replace(/\s+/g, "_")}`],
      })
    }

    // Time pattern suggestions
    const currentHour = new Date().getHours()
    const hourKey = `hour_${currentHour}`
    const hourActivity = this.userBehavior.timePatterns[hourKey]

    if (hourActivity && hourActivity > 5) {
      suggestions.push({
        type: "pattern",
        text: t("Based on your usual routine at this time, here are some suggestions..."),
        priority: "medium",
      })
    }

    return suggestions
  }

  // Get reminder suggestions
  getReminderSuggestions() {
    const suggestions = []
    const pendingReminders = profileManager.getPendingReminders()

    if (pendingReminders.length > 0) {
      suggestions.push({
        type: "reminder",
        text: t(`You have ${pendingReminders.length} pending reminders. Would you like me to read them?`),
        priority: "high",
        actions: ["read_reminders"],
      })
    }

    return suggestions
  }

  // Get productivity suggestions
  getProductivitySuggestions() {
    const suggestions = []
    const hour = new Date().getHours()

    // Focus time suggestions
    if (hour >= 9 && hour <= 11) {
      suggestions.push({
        type: "productivity",
        text: t("This is typically a productive time. Would you like me to minimize distractions and open work apps?"),
        priority: "medium",
        actions: ["focus_mode", "open_work_apps"],
      })
    }

    // File organization suggestions
    const lastOrganized = localStorage.getItem("lastFileOrganization")
    const daysSinceOrganized = lastOrganized
      ? (Date.now() - Number.parseInt(lastOrganized)) / (1000 * 60 * 60 * 24)
      : 30

    if (daysSinceOrganized > 7) {
      suggestions.push({
        type: "organization",
        text: t("It's been a while since you organized your files. Would you like me to help clean up your downloads?"),
        priority: "low",
        actions: ["organize_files", "clean_downloads"],
      })
    }

    return suggestions
  }

  // Display suggestions
  displaySuggestions(suggestions) {
    if (suggestions.length === 0) return

    // Sort by priority
    suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    addMessage("💡 " + t("Smart Suggestions:"), false)

    suggestions.forEach((suggestion, index) => {
      const emoji = this.getSuggestionEmoji(suggestion.type)
      addMessage(`${emoji} ${suggestion.text}`, false)

      // Speak the first high-priority suggestion
      if (index === 0 && suggestion.priority === "high" && typeof voiceSystem !== "undefined") {
        voiceSystem.speak(suggestion.text)
      }
    })

    // Store suggestions for tracking
    this.suggestionHistory.push({
      suggestions,
      timestamp: new Date().toISOString(),
      displayed: true,
    })
  }

  // Get emoji for suggestion type
  getSuggestionEmoji(type) {
    const emojis = {
      greeting: "👋",
      introduction: "🤝",
      personal: "👤",
      morning: "🌅",
      work: "💼",
      break: "☕",
      evening: "🌆",
      weekend: "🎉",
      habit: "🔄",
      pattern: "📊",
      reminder: "⏰",
      productivity: "🎯",
      organization: "📁",
      email: "📧",
      action: "⚡",
      priority: "⭐",
      routine: "🕘",
    }

    return emojis[type] || "💡"
  }

  // Process suggestion commands
  processSuggestionCommand(command) {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes("suggestions") || lowerCommand.includes("suggest")) {
      this.generateContextualSuggestions()
      return true
    }

    if (lowerCommand.includes("smart help") || lowerCommand.includes("what should i do")) {
      this.generateContextualSuggestions()
      return true
    }

    return false
  }

  // Learn from user feedback
  learnFromFeedback(suggestionId, feedback) {
    // Track which suggestions are helpful
    this.userBehavior.preferences[suggestionId] = feedback
    this.saveBehaviorData()
  }
}

// Initialize suggestions system
const intelligentSuggestions = new IntelligentSuggestions()

// Mock profileManager, t, emailManager, addMessage, and voiceSystem for testing purposes
const profileManager = {
  profile: {
    personal: {
      name: "Test User",
    },
  },
  getPersonalizedGreeting: () => "Hello, Test User!",
  getPersonalizedSuggestions: () => ["Suggestion 1", "Suggestion 2"],
  getPendingReminders: () => [],
}

const t = (key) => key // Mock translation function

const emailManager = {
  getEmailSuggestions: () => [],
}

const addMessage = (message, isSystemMessage) => {
  console.log(message)
}

const voiceSystem = {
  speak: (text) => {
    console.log("Voice system speaking:", text)
  },
}
