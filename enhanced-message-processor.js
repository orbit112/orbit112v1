// Enhanced Message Processor with Online/Offline Support
// Replace your existing processMessage function with this

let inputField
let addMessage
let offlineResponses
let voiceSystem
let eveSettings
let connectionManager // Declare connectionManager
let calculateMath // Declare calculateMath

// Declare the missing variables
let t
let goToDownloads
let goToDocuments
let goToPictures
let showSystemInfo

function processMessage() {
  const message = inputField.value.trim()
  if (!message) return

  // Add user message to chat
  addMessage(message, true)
  inputField.value = ""

  // Process the message through different systems
  processEnhancedMessage(message)
}

function processEnhancedMessage(message) {
  const lowerMessage = message.toLowerCase()

  // 1. Check application launcher first
  if (window.EVEAppLauncher && window.EVEAppLauncher.process(message)) {
    return
  }

  // 2. Check for file operations
  if (handleFileOperations(message)) {
    return
  }

  // 3. Check for system commands
  if (handleSystemCommands(message)) {
    return
  }

  // 4. Check for voice commands
  if (handleVoiceCommands(message)) {
    return
  }

  // 5. Check for online features
  if (handleOnlineFeatures(message)) {
    return
  }

  // 6. Use offline conversation system
  const offlineResult = offlineResponses.processOfflineMessage(message)
  if (offlineResult.handled) {
    addMessage(offlineResult.response, false)

    // Speak the response if voice is enabled
    if (voiceSystem && eveSettings?.voice?.autoSpeak) {
      voiceSystem.speak(offlineResult.response)
    }
    return
  }

  // 7. Default fallback
  const fallbackResponse = t(
    "I'm not sure how to help with that. Try asking me to open an application, manage files, or just have a conversation!",
  )
  addMessage(fallbackResponse, false)

  if (voiceSystem && eveSettings?.voice?.autoSpeak) {
    voiceSystem.speak(fallbackResponse)
  }
}

function handleFileOperations(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("open downloads") || lowerMessage.includes("downloads folder")) {
    goToDownloads()
    return true
  }

  if (lowerMessage.includes("open documents") || lowerMessage.includes("documents folder")) {
    goToDocuments()
    return true
  }

  if (lowerMessage.includes("open pictures") || lowerMessage.includes("pictures folder")) {
    goToPictures()
    return true
  }

  return false
}

function handleSystemCommands(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("system info") || lowerMessage.includes("computer info")) {
    showSystemInfo()
    return true
  }

  if (lowerMessage.includes("calculate") || lowerMessage.includes("math")) {
    const mathExpression = message.replace(/calculate|math/gi, "").trim()
    if (mathExpression) {
      calculateMath(mathExpression)
      return true
    }
  }

  return false
}

function handleVoiceCommands(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("speak") || lowerMessage.includes("say")) {
    const textToSpeak = message.replace(/speak|say/gi, "").trim()
    if (textToSpeak && voiceSystem) {
      voiceSystem.speak(textToSpeak)
      addMessage("🗣️ " + t("Speaking: ") + textToSpeak, false)
      return true
    }
  }

  if (lowerMessage.includes("stop speaking") || lowerMessage.includes("be quiet")) {
    if (voiceSystem) {
      voiceSystem.synthesis.cancel()
      addMessage("🔇 " + t("Stopped speaking"), false)
      return true
    }
  }

  return false
}

function handleOnlineFeatures(message) {
  const lowerMessage = message.toLowerCase()

  // Check if online features are requested
  const onlineFeatures = [
    "weather",
    "news",
    "search",
    "google",
    "translate",
    "email",
    "social media",
    "download",
    "update",
  ]

  const needsOnline = onlineFeatures.some((feature) => lowerMessage.includes(feature))

  if (needsOnline) {
    if (!connectionManager.isOnline) {
      const response = t(
        "That feature requires an internet connection. I'm currently offline, but I can help with many local tasks!",
      )
      addMessage("📴 " + response, false)

      if (voiceSystem && eveSettings?.voice?.autoSpeak) {
        voiceSystem.speak(response)
      }
      return true
    }

    // Handle specific online features
    if (lowerMessage.includes("weather")) {
      const response = t(
        "I'd love to check the weather, but I need to connect to a weather service first. This feature is coming soon!",
      )
      addMessage("🌤️ " + response, false)

      if (voiceSystem && eveSettings?.voice?.autoSpeak) {
        voiceSystem.speak(response)
      }
      return true
    }

    if (lowerMessage.includes("news")) {
      const response = t(
        "News feature is not implemented yet, but it's on my roadmap! For now, I can help with local tasks.",
      )
      addMessage("📰 " + response, false)

      if (voiceSystem && eveSettings?.voice?.autoSpeak) {
        voiceSystem.speak(response)
      }
      return true
    }
  }

  return false
}

// Initialize enhanced message processing
document.addEventListener("DOMContentLoaded", () => {
  console.log("Enhanced message processing initialized")
  console.log("Online status:", connectionManager.isOnline)
  console.log("Voice system ready:", !!voiceSystem)
  console.log("Offline responses ready:", !!offlineResponses)
})
