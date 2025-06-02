// Enhanced Personal Commands for EVE
// Add this to your scripts.js file or integrate with existing message processing

// Mock profileManager
const profileManager = {
  profile: {
    personal: {},
    contacts: [],
  },
  learnFromMessage: (message) => {
    return null
  },
  getProfileSummary: () => {
    return "Profile Summary"
  },
  addContact: (name, email) => {
    return `Added contact ${name} with email ${email}`
  },
  findContact: (query) => {
    return []
  },
  addReminder: (text) => {
    return `Added reminder: ${text}`
  },
  getPendingReminders: () => {
    return []
  },
}

// Mock emailManager
const emailManager = {
  processEmailCommand: (message) => {
    return false
  },
}

// Mock intelligentSuggestions
const intelligentSuggestions = {
  processSuggestionCommand: (message) => {
    return false
  },
  trackInteraction: (action, details) => {
    console.log(`Tracked interaction: ${action}`, details)
  },
  generateWelcomeSuggestions: () => {
    console.log("Generated welcome suggestions")
  },
}

// Enhanced message processing with personal features
function processPersonalMessage(message) {
  const lowerMessage = message.toLowerCase()

  // Profile learning
  const learningResponse = profileManager.learnFromMessage(message)
  if (learningResponse) {
    addMessage("🧠 " + learningResponse, false)
    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(learningResponse)
    }
    return true
  }

  // Email commands
  if (emailManager.processEmailCommand(message)) {
    return true
  }

  // Suggestion commands
  if (intelligentSuggestions.processSuggestionCommand(message)) {
    return true
  }

  // Personal information commands
  if (handlePersonalInfoCommands(message)) {
    return true
  }

  // Contact commands
  if (handleContactCommands(message)) {
    return true
  }

  // Reminder commands
  if (handleReminderCommands(message)) {
    return true
  }

  return false
}

// Handle personal information commands
function handlePersonalInfoCommands(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("my profile") || lowerMessage.includes("about me")) {
    const summary = profileManager.getProfileSummary()
    addMessage(summary, false)

    if (typeof voiceSystem !== "undefined") {
      const name = profileManager.profile.personal.name || t("User")
      voiceSystem.speak(t(`Here's your profile summary, ${name}`))
    }
    return true
  }

  if (lowerMessage.includes("my name")) {
    const name = profileManager.profile.personal.name
    if (name) {
      const response = t(`Your name is ${name}`)
      addMessage("👤 " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      const response = t("I don't know your name yet. What should I call you?")
      addMessage("❓ " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    }
    return true
  }

  if (lowerMessage.includes("my age")) {
    const age = profileManager.profile.personal.age
    if (age) {
      const response = t(`You are ${age} years old`)
      addMessage("🎂 " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      const response = t("I don't know your age. How old are you?")
      addMessage("❓ " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    }
    return true
  }

  if (lowerMessage.includes("my interests")) {
    const interests = profileManager.profile.interests
    if (interests.length > 0) {
      const response = t(`Your interests include: ${interests.join(", ")}`)
      addMessage("❤️ " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      const response = t("I haven't learned about your interests yet. What do you like to do?")
      addMessage("❓ " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    }
    return true
  }

  return false
}

// Handle contact commands
function handleContactCommands(message) {
  const lowerMessage = message.toLowerCase()

  // Add contact command
  const addContactMatch = message.match(/add contact (.+?) email (.+?)(?:\s|$)/i)
  if (addContactMatch) {
    const name = addContactMatch[1].trim()
    const email = addContactMatch[2].trim()
    const response = profileManager.addContact(name, email)
    addMessage("📞 " + response, false)
    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(response)
    }
    return true
  }

  // Find contact command
  if (lowerMessage.includes("find contact") || lowerMessage.includes("search contact")) {
    const query = message.replace(/find contact|search contact/gi, "").trim()
    if (query) {
      const contacts = profileManager.findContact(query)
      if (contacts.length > 0) {
        addMessage(`📞 ${t("Found contacts")}:`, false)
        contacts.forEach((contact) => {
          addMessage(`• ${contact.name} - ${contact.email}`, false)
        })
        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(t(`Found ${contacts.length} contacts for ${query}`))
        }
      } else {
        const response = t(`No contacts found for: ${query}`)
        addMessage("❌ " + response, false)
        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }
      }
      return true
    }
  }

  // List contacts command
  if (lowerMessage.includes("my contacts") || lowerMessage.includes("list contacts")) {
    const contacts = profileManager.profile.contacts
    if (contacts.length > 0) {
      addMessage(`📞 ${t("Your contacts")} (${contacts.length}):`, false)
      contacts.slice(0, 10).forEach((contact) => {
        addMessage(`• ${contact.name} - ${contact.email}`, false)
      })
      if (contacts.length > 10) {
        addMessage(`... ${t("and")} ${contacts.length - 10} ${t("more")}`, false)
      }
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${contacts.length} contacts`))
      }
    } else {
      const response = t("You don't have any contacts yet")
      addMessage("📞 " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    }
    return true
  }

  return false
}

// Handle reminder commands
function handleReminderCommands(message) {
  const lowerMessage = message.toLowerCase()

  // Add reminder command
  if (lowerMessage.includes("remind me") || lowerMessage.includes("set reminder")) {
    const reminderText = message.replace(/remind me|set reminder/gi, "").trim()
    if (reminderText) {
      const response = profileManager.addReminder(reminderText)
      addMessage("⏰ " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
      return true
    }
  }

  // Check reminders command
  if (lowerMessage.includes("my reminders") || lowerMessage.includes("check reminders")) {
    const reminders = profileManager.getPendingReminders()
    if (reminders.length > 0) {
      addMessage(`⏰ ${t("Pending reminders")}:`, false)
      reminders.forEach((reminder) => {
        addMessage(`• ${reminder.text}`, false)
      })
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${reminders.length} pending reminders`))
      }
    } else {
      const response = t("No pending reminders")
      addMessage("✅ " + response, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    }
    return true
  }

  return false
}

// Track user interactions for learning
function trackUserInteraction(action, details = {}) {
  intelligentSuggestions.trackInteraction(action, details)
}

// Initialize personal features
document.addEventListener("DOMContentLoaded", () => {
  console.log("Personal features initialized")

  // Track app startup
  trackUserInteraction("app_startup", { timestamp: new Date().toISOString() })

  // Generate initial suggestions after a delay
  setTimeout(() => {
    intelligentSuggestions.generateWelcomeSuggestions()
  }, 3000)
})

// Mock functions for testing
function addMessage(message, isUser) {
  console.log(`${isUser ? "User" : "EVE"}: ${message}`)
}

function t(text) {
  return text
}

// Mock voice system
const voiceSystem = {
  speak: (text) => console.log(`Speaking: ${text}`),
}

// Mock settings
const eveSettings = {
  voice: {
    emailNotifications: true,
    autoSpeak: true,
  },
}
