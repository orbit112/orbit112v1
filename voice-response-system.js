// Advanced Voice Response System for EVE
// Add this to your scripts.js file

// Declare missing variables (assuming global scope or imported elsewhere)
let addMessage
let t
let currentLanguage
let connectionManager
let eveSettings

class VoiceResponseSystem {
  constructor() {
    this.isListening = false
    this.isSpeaking = false
    this.recognition = null
    this.synthesis = window.speechSynthesis
    this.voices = []
    this.currentVoice = null
    this.conversationContext = []
    this.wakeWords = ["eve", "eva", "hey eve", "ok eve"]
    this.isWakeWordMode = false

    this.initializeVoiceRecognition()
    this.initializeVoiceSynthesis()
    this.setupVoiceCommands()
  }

  // Initialize speech recognition
  initializeVoiceRecognition() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.error("Speech recognition not supported")
      addMessage("❌ " + t("Voice recognition not supported in this browser"), false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    // Configure recognition
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = currentLanguage === "sw" ? "sw-KE" : "en-US"

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true
      this.updateVoiceUI(true)
      console.log("Voice recognition started")
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.updateVoiceUI(false)
      console.log("Voice recognition ended")

      // Restart if in wake word mode
      if (this.isWakeWordMode) {
        setTimeout(() => this.startListening(), 1000)
      }
    }

    this.recognition.onresult = (event) => {
      this.handleVoiceResult(event)
    }

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      this.handleVoiceError(event.error)
    }
  }

  // Initialize voice synthesis
  initializeVoiceSynthesis() {
    // Load available voices
    this.loadVoices()

    // Reload voices when they change
    this.synthesis.onvoiceschanged = () => {
      this.loadVoices()
    }
  }

  // Load available voices
  loadVoices() {
    this.voices = this.synthesis.getVoices()

    // Find best voice for current language
    const preferredVoices = currentLanguage === "sw" ? ["Swahili", "sw-KE", "sw"] : ["English", "en-US", "en-GB", "en"]

    for (const preferred of preferredVoices) {
      const voice = this.voices.find((v) => v.lang.includes(preferred) || v.name.includes(preferred))
      if (voice) {
        this.currentVoice = voice
        break
      }
    }

    // Fallback to first available voice
    if (!this.currentVoice && this.voices.length > 0) {
      this.currentVoice = this.voices[0]
    }

    console.log("Available voices:", this.voices.length)
    console.log("Selected voice:", this.currentVoice?.name)
  }

  // Handle voice recognition results
  handleVoiceResult(event) {
    let finalTranscript = ""
    let interimTranscript = ""

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript

      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    // Show interim results
    if (interimTranscript) {
      this.showInterimResult(interimTranscript)
    }

    // Process final results
    if (finalTranscript) {
      this.processFinalResult(finalTranscript.trim())
    }
  }

  // Show interim speech recognition results
  showInterimResult(text) {
    let interimElement = document.getElementById("interim-speech")

    if (!interimElement) {
      interimElement = document.createElement("div")
      interimElement.id = "interim-speech"
      interimElement.className = "interim-speech"

      const chatContainer = document.querySelector(".chat-container")
      chatContainer.appendChild(interimElement)
    }

    interimElement.textContent = `🎤 ${text}...`
    interimElement.style.display = "block"
  }

  // Process final speech recognition result
  processFinalResult(text) {
    // Remove interim display
    const interimElement = document.getElementById("interim-speech")
    if (interimElement) {
      interimElement.style.display = "none"
    }

    console.log("Voice input:", text)

    // Check for wake words if in wake word mode
    if (this.isWakeWordMode) {
      const hasWakeWord = this.wakeWords.some((word) => text.toLowerCase().includes(word.toLowerCase()))

      if (!hasWakeWord) {
        return // Ignore if no wake word
      }

      // Remove wake word from text
      for (const wakeWord of this.wakeWords) {
        text = text.replace(new RegExp(wakeWord, "gi"), "").trim()
      }
    }

    if (text) {
      // Add to conversation context
      this.conversationContext.push({
        type: "user",
        text: text,
        timestamp: Date.now(),
      })

      // Process the voice command
      this.processVoiceCommand(text)
    }
  }

  // Process voice commands
  processVoiceCommand(text) {
    // Add user message to chat
    addMessage(`🎤 ${text}`, true)

    // Check for voice-specific commands first
    if (this.handleVoiceSpecificCommands(text)) {
      return
    }

    // Use existing message processing
    if (window.EVEAppLauncher && window.EVEAppLauncher.process(text)) {
      return
    }

    // Handle other commands
    this.handleGeneralCommands(text)
  }

  // Handle voice-specific commands
  handleVoiceSpecificCommands(text) {
    const lowerText = text.toLowerCase()

    // Voice control commands
    if (lowerText.includes("stop listening") || lowerText.includes("stop voice")) {
      this.stopListening()
      this.speak(t("Voice recognition stopped"))
      return true
    }

    if (lowerText.includes("start listening") || lowerText.includes("listen")) {
      this.startListening()
      this.speak(t("I'm listening"))
      return true
    }

    if (lowerText.includes("wake word mode")) {
      this.toggleWakeWordMode()
      return true
    }

    if (lowerText.includes("change voice") || lowerText.includes("different voice")) {
      this.changeVoice()
      return true
    }

    if (lowerText.includes("speak slower")) {
      this.adjustSpeechRate(0.8)
      this.speak(t("I'll speak slower now"))
      return true
    }

    if (lowerText.includes("speak faster")) {
      this.adjustSpeechRate(1.2)
      this.speak(t("I'll speak faster now"))
      return true
    }

    if (lowerText.includes("louder") || lowerText.includes("volume up")) {
      this.adjustVolume(1.0)
      this.speak(t("Volume increased"))
      return true
    }

    if (lowerText.includes("quieter") || lowerText.includes("volume down")) {
      this.adjustVolume(0.5)
      this.speak(t("Volume decreased"))
      return true
    }

    return false
  }

  // Handle general commands with voice responses
  handleGeneralCommands(text) {
    const lowerText = text.toLowerCase()

    // Greetings
    if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey")) {
      const responses = [
        t("Hello! How can I help you today?"),
        t("Hi there! What would you like me to do?"),
        t("Hey! I'm here to assist you."),
        t("Hello! Ready to help with anything you need."),
      ]
      const response = responses[Math.floor(Math.random() * responses.length)]
      addMessage(response, false)
      this.speak(response)
      return
    }

    // How are you
    if (lowerText.includes("how are you")) {
      const response = t("I'm doing great! Ready to help you with files, applications, or anything else you need.")
      addMessage(response, false)
      this.speak(response)
      return
    }

    // Time
    if (lowerText.includes("what time") || lowerText.includes("current time")) {
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      const response = t("The current time is") + " " + timeString
      addMessage("🕐 " + response, false)
      this.speak(response)
      return
    }

    // Date
    if (lowerText.includes("what date") || lowerText.includes("today's date")) {
      const now = new Date()
      const dateString = now.toLocaleDateString()
      const response = t("Today's date is") + " " + dateString
      addMessage("📅 " + response, false)
      this.speak(response)
      return
    }

    // Weather (offline fallback)
    if (lowerText.includes("weather")) {
      if (connectionManager.isOnline) {
        // Online weather would go here
        const response = t("I would check the weather for you, but I need to connect to a weather service first.")
        addMessage("🌤️ " + response, false)
        this.speak(response)
      } else {
        const response = t("I can't check the weather while offline. Please connect to the internet.")
        addMessage("📴 " + response, false)
        this.speak(response)
      }
      return
    }

    // Help
    if (lowerText.includes("help") || lowerText.includes("what can you do")) {
      this.provideVoiceHelp()
      return
    }

    // Default response
    const response = t("I heard you say: ") + text + ". " + t("How can I help you with that?")
    addMessage(response, false)
    this.speak(response)
  }

  // Provide voice help
  provideVoiceHelp() {
    const helpText = t(
      "I can help you with many things using voice commands. You can ask me to open applications, manage files, do calculations, get system information, or just have a conversation. Try saying 'open calculator' or 'show my documents'.",
    )

    addMessage("🎤 " + helpText, false)
    this.speak(helpText)
  }

  // Speak text with current voice settings
  speak(text, options = {}) {
    if (this.isSpeaking) {
      this.synthesis.cancel() // Stop current speech
    }

    const utterance = new SpeechSynthesisUtterance(text)

    // Apply voice settings
    if (this.currentVoice) {
      utterance.voice = this.currentVoice
    }

    utterance.rate = options.rate || eveSettings?.voice?.rate || 1.0
    utterance.pitch = options.pitch || eveSettings?.voice?.pitch || 1.0
    utterance.volume = options.volume || eveSettings?.voice?.volume || 1.0

    // Event handlers
    utterance.onstart = () => {
      this.isSpeaking = true
      this.updateSpeechUI(true)
    }

    utterance.onend = () => {
      this.isSpeaking = false
      this.updateSpeechUI(false)
    }

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error)
      this.isSpeaking = false
      this.updateSpeechUI(false)
    }

    // Add to conversation context
    this.conversationContext.push({
      type: "assistant",
      text: text,
      timestamp: Date.now(),
    })

    this.synthesis.speak(utterance)
  }

  // Start listening for voice input
  startListening() {
    if (!this.recognition) {
      addMessage("❌ " + t("Voice recognition not available"), false)
      return
    }

    try {
      this.recognition.start()
      addMessage("🎤 " + t("Listening for voice commands..."), false)
    } catch (error) {
      console.error("Error starting recognition:", error)
      addMessage("❌ " + t("Error starting voice recognition"), false)
    }
  }

  // Stop listening for voice input
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      addMessage("🔇 " + t("Voice recognition stopped"), false)
    }
  }

  // Toggle wake word mode
  toggleWakeWordMode() {
    this.isWakeWordMode = !this.isWakeWordMode

    if (this.isWakeWordMode) {
      this.startListening()
      const response = t("Wake word mode enabled. Say 'Hey EVE' followed by your command.")
      addMessage("👂 " + response, false)
      this.speak(response)
    } else {
      this.stopListening()
      const response = t("Wake word mode disabled.")
      addMessage("🔇 " + response, false)
      this.speak(response)
    }
  }

  // Change voice
  changeVoice() {
    const currentIndex = this.voices.indexOf(this.currentVoice)
    const nextIndex = (currentIndex + 1) % this.voices.length
    this.currentVoice = this.voices[nextIndex]

    const response = t("Voice changed to") + " " + this.currentVoice.name
    addMessage("🗣️ " + response, false)
    this.speak(response)
  }

  // Adjust speech rate
  adjustSpeechRate(rate) {
    if (!eveSettings.voice) eveSettings.voice = {}
    eveSettings.voice.rate = rate
    localStorage.setItem("eveSettings", JSON.stringify(eveSettings))
  }

  // Adjust volume
  adjustVolume(volume) {
    if (!eveSettings.voice) eveSettings.voice = {}
    eveSettings.voice.volume = volume
    localStorage.setItem("eveSettings", JSON.stringify(eveSettings))
  }

  // Handle voice recognition errors
  handleVoiceError(error) {
    let message = ""

    switch (error) {
      case "no-speech":
        message = t("No speech detected. Please try again.")
        break
      case "audio-capture":
        message = t("Microphone not accessible. Please check permissions.")
        break
      case "not-allowed":
        message = t("Microphone permission denied. Please allow microphone access.")
        break
      case "network":
        message = t("Network error. Voice recognition may not work offline.")
        break
      default:
        message = t("Voice recognition error: ") + error
    }

    addMessage("❌ " + message, false)
  }

  // Update voice UI indicators
  updateVoiceUI(isListening) {
    let indicator = document.getElementById("voice-indicator")

    if (!indicator) {
      indicator = document.createElement("div")
      indicator.id = "voice-indicator"
      indicator.className = "voice-indicator"

      const inputContainer = document.querySelector(".input-container")
      inputContainer.appendChild(indicator)
    }

    if (isListening) {
      indicator.innerHTML = `<span class="listening-dot"></span> ${t("Listening...")}`
      indicator.className = "voice-indicator listening"
    } else {
      indicator.innerHTML = `<span class="idle-dot"></span> ${t("Voice Ready")}`
      indicator.className = "voice-indicator idle"
    }
  }

  // Update speech UI indicators
  updateSpeechUI(isSpeaking) {
    let indicator = document.getElementById("speech-indicator")

    if (!indicator) {
      indicator = document.createElement("div")
      indicator.id = "speech-indicator"
      indicator.className = "speech-indicator"

      const inputContainer = document.querySelector(".input-container")
      inputContainer.appendChild(indicator)
    }

    if (isSpeaking) {
      indicator.innerHTML = `<span class="speaking-dot"></span> ${t("Speaking...")}`
      indicator.className = "speech-indicator speaking"
    } else {
      indicator.style.display = "none"
    }
  }
}

// Initialize voice response system
const voiceSystem = new VoiceResponseSystem()

// Add voice control buttons to UI
function addVoiceControls() {
  const actionsContainer = document.querySelector(".actions-container")
  if (!actionsContainer) return

  // Voice toggle button
  const voiceButton = document.createElement("button")
  voiceButton.className = "action-button voice-button"
  voiceButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  `
  voiceButton.title = t("Toggle Voice Recognition")
  voiceButton.onclick = () => {
    if (voiceSystem.isListening) {
      voiceSystem.stopListening()
    } else {
      voiceSystem.startListening()
    }
  }

  // Wake word button
  const wakeWordButton = document.createElement("button")
  wakeWordButton.className = "action-button wake-word-button"
  wakeWordButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 12l2 2 4-4"></path>
      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
      <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
      <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
    </svg>
  `
  wakeWordButton.title = t("Toggle Wake Word Mode")
  wakeWordButton.onclick = () => voiceSystem.toggleWakeWordMode()

  actionsContainer.appendChild(voiceButton)
  actionsContainer.appendChild(wakeWordButton)
}

// Initialize voice controls when DOM is loaded
document.addEventListener("DOMContentLoaded", addVoiceControls)
