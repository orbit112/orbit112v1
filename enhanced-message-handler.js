// Enhanced message handler for EVE
// Integrate this with your existing message processing in scripts.js

// Declare variables (assuming they are defined elsewhere in your project)
let inputField
let addMessage
let goToDownloads
let goToDocuments
let showSystemInfo
let calculateMath
let speakText
let t

// Enhanced processMessage function
function processMessage() {
  const message = inputField.value.trim()
  if (!message) return

  // Add user message to chat
  addMessage(message, true)
  inputField.value = ""

  // Check if it's an application launch command first
  if (window.EVEAppLauncher && window.EVEAppLauncher.process(message)) {
    return // Command was handled by app launcher
  }

  // Your existing message processing logic here...
  const lowerMessage = message.toLowerCase()

  // File operations
  if (lowerMessage.includes("open downloads") || lowerMessage.includes("downloads folder")) {
    goToDownloads()
    return
  }

  if (lowerMessage.includes("open documents") || lowerMessage.includes("documents folder")) {
    goToDocuments()
    return
  }

  // System information
  if (lowerMessage.includes("system info") || lowerMessage.includes("computer info")) {
    showSystemInfo()
    return
  }

  // Calculator
  if (lowerMessage.includes("calculate") || lowerMessage.includes("math")) {
    const mathExpression = message.replace(/calculate|math/gi, "").trim()
    if (mathExpression) {
      calculateMath(mathExpression)
      return
    }
  }

  // Voice commands
  if (lowerMessage.includes("speak") || lowerMessage.includes("say")) {
    const textToSpeak = message.replace(/speak|say/gi, "").trim()
    if (textToSpeak) {
      speakText(textToSpeak)
      return
    }
  }

  // Help command
  if (handleHelpCommand(message)) return

  // Default response for unrecognized commands
  addMessage(
    t(
      "I'm not sure how to help with that. Try saying 'open [app name]' to launch applications, or ask me about files, calculations, or system information.",
    ),
    false,
  )
}

// Example usage messages
function showExampleCommands() {
  addMessage("🎯 " + t("Here are some things you can ask me to do:"), false)
  addMessage("", false)
  addMessage("🚀 " + t("Launch Applications:"), false)
  addMessage("• " + t("Open FIFA 19"), false)
  addMessage("• " + t("Launch Chrome"), false)
  addMessage("• " + t("Start Spotify"), false)
  addMessage("• " + t("Run Calculator"), false)
  addMessage("", false)
  addMessage("📁 " + t("File Operations:"), false)
  addMessage("• " + t("Open Downloads"), false)
  addMessage("• " + t("Show Documents"), false)
  addMessage("", false)
  addMessage("🔧 " + t("System Commands:"), false)
  addMessage("• " + t("System Info"), false)
  addMessage("• " + t("List Apps"), false)
  addMessage("• " + t("Scan Apps"), false)
  addMessage("", false)
  addMessage("🧮 " + t("Other Features:"), false)
  addMessage("• " + t("Calculate 2 + 2"), false)
  addMessage("• " + t("Speak Hello World"), false)
}

// Add help command
function handleHelpCommand(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("help") || lowerMessage.includes("commands") || lowerMessage === "?") {
    showExampleCommands()
    return true
  }

  return false
}
