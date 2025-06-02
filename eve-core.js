// EVE Core Functionality - The Brain of EVE
class EVECore {
  constructor() {
    this.isInitialized = false
    this.modules = {}
    this.commands = new Map()
    this.responses = []
    this.username = process.env.USER || process.env.USERNAME || "User"

    this.init()
  }

  async init() {
    console.log("🤖 EVE: Initializing core systems...")

    // Initialize core modules
    this.initializeCommands()
    this.initializeResponses()
    this.initializeVoice()
    this.initializeUI()

    this.isInitialized = true
    this.greetUser()

    console.log("✅ EVE: All systems online!")
  }

  initializeCommands() {
    // File & System Commands
    this.addCommand(["open calculator", "calculator", "calc"], () => this.openCalculator())
    this.addCommand(["open notepad", "notepad", "text editor"], () => this.openNotepad())
    this.addCommand(["open browser", "browser", "chrome", "firefox"], () => this.openBrowser())
    this.addCommand(["open file explorer", "explorer", "files"], () => this.openFileExplorer())
    this.addCommand(["open downloads", "downloads folder"], () => this.openDownloads())
    this.addCommand(["open documents", "documents folder"], () => this.openDocuments())
    this.addCommand(["open pictures", "pictures folder"], () => this.openPictures())

    // System Commands
    this.addCommand(["system info", "computer info", "pc info"], () => this.showSystemInfo())
    this.addCommand(["time", "what time", "current time"], () => this.showTime())
    this.addCommand(["date", "what date", "today"], () => this.showDate())
    this.addCommand(["weather", "temperature"], () => this.showWeather())

    // Math Commands
    this.addCommand(["calculate", "math", "compute"], (input) => this.calculate(input))

    // Task Commands
    this.addCommand(["create task", "new task", "add task"], (input) => this.createTask(input))
    this.addCommand(["list tasks", "show tasks", "my tasks"], () => this.listTasks())
    this.addCommand(["complete task", "finish task", "done task"], (input) => this.completeTask(input))

    // Fun Commands
    this.addCommand(["tell joke", "joke", "funny"], () => this.tellJoke())
    this.addCommand(["flip coin", "coin flip"], () => this.flipCoin())
    this.addCommand(["roll dice", "dice"], () => this.rollDice())
    this.addCommand(["random number"], (input) => this.randomNumber(input))

    // Conversation Commands
    this.addCommand(["hello", "hi", "hey"], () => this.greetUser())
    this.addCommand(["how are you"], () => this.respondToGreeting())
    this.addCommand(["help", "what can you do"], () => this.showHelp())
    this.addCommand(["thank you", "thanks"], () => this.respondToThanks())

    // Search Commands
    this.addCommand(["search", "google", "look up"], (input) => this.search(input))
    this.addCommand(["youtube", "video"], (input) => this.searchYouTube(input))

    console.log(`📝 EVE: Loaded ${this.commands.size} command patterns`)
  }

  addCommand(patterns, handler) {
    patterns.forEach((pattern) => {
      this.commands.set(pattern.toLowerCase(), handler)
    })
  }

  initializeResponses() {
    this.responses = [
      "I'm here to help!",
      "What can I do for you?",
      "Ready to assist!",
      "How may I help you today?",
      "At your service!",
      "What would you like me to do?",
      "I'm listening!",
      "How can I make your day better?",
    ]
  }

  initializeVoice() {
    if ("speechSynthesis" in window) {
      this.speech = window.speechSynthesis
      this.voices = []

      // Load voices
      this.loadVoices()
      this.speech.onvoiceschanged = () => this.loadVoices()

      console.log("🎤 EVE: Voice synthesis ready")
    }

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()

      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = "en-US"

      this.recognition.onresult = (event) => this.handleVoiceInput(event)
      this.recognition.onerror = (event) => console.error("Voice recognition error:", event.error)

      console.log("👂 EVE: Voice recognition ready")
    }
  }

  loadVoices() {
    this.voices = this.speech.getVoices()
    // Prefer female voices for EVE
    this.selectedVoice =
      this.voices.find(
        (voice) => voice.name.includes("Female") || voice.name.includes("Zira") || voice.name.includes("Samantha"),
      ) || this.voices[0]
  }

  initializeUI() {
    // Create EVE interface if it doesn't exist
    if (!document.getElementById("eve-interface")) {
      this.createEVEInterface()
    }

    // Setup event listeners
    this.setupEventListeners()
  }

  createEVEInterface() {
    const eveInterface = document.createElement("div")
    eveInterface.id = "eve-interface"
    eveInterface.innerHTML = `
      <div class="eve-container">
        <div class="eve-header">
          <h2>🤖 EVE Assistant</h2>
          <div class="eve-status">
            <span id="eve-status-indicator" class="status-online">Online</span>
          </div>
        </div>
        
        <div class="eve-chat" id="eve-chat">
          <div class="eve-message eve-message-assistant">
            <div class="message-content">
              <strong>EVE:</strong> Hello ${this.username}! I'm ready to help. Try saying "help" to see what I can do!
            </div>
          </div>
        </div>
        
        <div class="eve-input-container">
          <input type="text" id="eve-input" placeholder="Type a command or question..." />
          <button id="eve-send-btn">Send</button>
          <button id="eve-voice-btn" title="Voice Input">🎤</button>
        </div>
        
        <div class="eve-quick-actions">
          <button class="quick-action" data-command="help">Help</button>
          <button class="quick-action" data-command="time">Time</button>
          <button class="quick-action" data-command="calculator">Calculator</button>
          <button class="quick-action" data-command="list tasks">Tasks</button>
        </div>
      </div>
    `

    // Add styles
    const styles = document.createElement("style")
    styles.textContent = `
      #eve-interface {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        height: 500px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: white;
        display: flex;
        flex-direction: column;
      }
      
      .eve-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 20px;
      }
      
      .eve-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .eve-header h2 {
        margin: 0;
        font-size: 1.2em;
      }
      
      .status-online {
        background: #4CAF50;
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
      }
      
      .eve-chat {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
        backdrop-filter: blur(10px);
      }
      
      .eve-message {
        margin-bottom: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        animation: fadeIn 0.3s ease-in;
      }
      
      .eve-message-user {
        background: rgba(255,255,255,0.2);
        margin-left: 20px;
      }
      
      .eve-message-assistant {
        background: rgba(255,255,255,0.1);
        margin-right: 20px;
      }
      
      .eve-input-container {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
      }
      
      #eve-input {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 8px;
        background: rgba(255,255,255,0.9);
        color: #333;
      }
      
      #eve-send-btn, #eve-voice-btn {
        padding: 10px 15px;
        border: none;
        border-radius: 8px;
        background: rgba(255,255,255,0.2);
        color: white;
        cursor: pointer;
        transition: background 0.3s;
      }
      
      #eve-send-btn:hover, #eve-voice-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .eve-quick-actions {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
      }
      
      .quick-action {
        padding: 6px 12px;
        border: none;
        border-radius: 15px;
        background: rgba(255,255,255,0.2);
        color: white;
        cursor: pointer;
        font-size: 0.8em;
        transition: all 0.3s;
      }
      
      .quick-action:hover {
        background: rgba(255,255,255,0.3);
        transform: translateY(-2px);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .eve-chat::-webkit-scrollbar {
        width: 6px;
      }
      
      .eve-chat::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
      }
      
      .eve-chat::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 3px;
      }
    `

    document.head.appendChild(styles)
    document.body.appendChild(eveInterface)
  }

  setupEventListeners() {
    const input = document.getElementById("eve-input")
    const sendBtn = document.getElementById("eve-send-btn")
    const voiceBtn = document.getElementById("eve-voice-btn")

    // Text input
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.processInput(input.value)
        input.value = ""
      }
    })

    sendBtn.addEventListener("click", () => {
      this.processInput(input.value)
      input.value = ""
    })

    // Voice input
    voiceBtn.addEventListener("click", () => {
      this.toggleVoiceRecognition()
    })

    // Quick actions
    document.querySelectorAll(".quick-action").forEach((btn) => {
      btn.addEventListener("click", () => {
        const command = btn.getAttribute("data-command")
        this.processInput(command)
      })
    })
  }

  processInput(input) {
    if (!input.trim()) return

    this.addMessage(input, "user")

    // Find matching command
    const lowerInput = input.toLowerCase()
    let commandFound = false

    for (const [pattern, handler] of this.commands) {
      if (lowerInput.includes(pattern)) {
        try {
          handler(input)
          commandFound = true
          break
        } catch (error) {
          console.error("Command error:", error)
          this.addMessage("Sorry, I encountered an error processing that command.", "assistant")
        }
      }
    }

    if (!commandFound) {
      this.handleUnknownCommand(input)
    }
  }

  addMessage(content, sender) {
    const chat = document.getElementById("eve-chat")
    const message = document.createElement("div")
    message.className = `eve-message eve-message-${sender}`

    const prefix = sender === "user" ? `${this.username}:` : "EVE:"
    message.innerHTML = `<div class="message-content"><strong>${prefix}</strong> ${content}</div>`

    chat.appendChild(message)
    chat.scrollTop = chat.scrollHeight
  }

  speak(text) {
    if (this.speech && this.selectedVoice) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.voice = this.selectedVoice
      utterance.rate = 0.9
      utterance.pitch = 1.1
      this.speech.speak(utterance)
    }
  }

  // Command Implementations
  greetUser() {
    const greetings = [
      `Hello ${this.username}! How can I help you today?`,
      `Hi there ${this.username}! What would you like me to do?`,
      `Hey ${this.username}! I'm ready to assist you.`,
      `Good to see you ${this.username}! What's on your agenda?`,
    ]
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    this.addMessage(greeting, "assistant")
    this.speak(greeting)
  }

  openCalculator() {
    if (window.electronAPI) {
      window.electronAPI.openApp("calc")
    } else {
      window.open("https://www.google.com/search?q=calculator", "_blank")
    }
    this.addMessage("Opening calculator for you!", "assistant")
    this.speak("Opening calculator")
  }

  openNotepad() {
    if (window.electronAPI) {
      window.electronAPI.openApp("notepad")
    } else {
      // Create a simple notepad in browser
      const notepad = window.open("", "_blank")
      notepad.document.write(`
        <html>
          <head><title>EVE Notepad</title></head>
          <body>
            <textarea style="width:100%;height:100vh;font-family:monospace;font-size:14px;border:none;padding:20px;"></textarea>
          </body>
        </html>
      `)
    }
    this.addMessage("Opening notepad for you!", "assistant")
    this.speak("Opening notepad")
  }

  openBrowser() {
    window.open("https://www.google.com", "_blank")
    this.addMessage("Opening your web browser!", "assistant")
    this.speak("Opening browser")
  }

  openFileExplorer() {
    if (window.electronAPI) {
      window.electronAPI.openFolder("")
    } else {
      this.addMessage("File explorer is only available in the desktop version of EVE.", "assistant")
    }
  }

  openDownloads() {
    if (window.electronAPI) {
      window.electronAPI.openFolder("downloads")
    } else {
      this.addMessage("Downloads folder access is only available in the desktop version.", "assistant")
    }
  }

  openDocuments() {
    if (window.electronAPI) {
      window.electronAPI.openFolder("documents")
    } else {
      this.addMessage("Documents folder access is only available in the desktop version.", "assistant")
    }
  }

  openPictures() {
    if (window.electronAPI) {
      window.electronAPI.openFolder("pictures")
    } else {
      this.addMessage("Pictures folder access is only available in the desktop version.", "assistant")
    }
  }

  showSystemInfo() {
    const info = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    const infoText = `System Information:
    Platform: ${info.platform}
    Language: ${info.language}
    Screen: ${info.screenResolution}
    Online: ${info.onLine ? "Yes" : "No"}
    Timezone: ${info.timezone}`

    this.addMessage(infoText, "assistant")
    this.speak("Here's your system information")
  }

  showTime() {
    const now = new Date()
    const timeString = now.toLocaleTimeString()
    this.addMessage(`The current time is ${timeString}`, "assistant")
    this.speak(`The time is ${timeString}`)
  }

  showDate() {
    const now = new Date()
    const dateString = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    this.addMessage(`Today is ${dateString}`, "assistant")
    this.speak(`Today is ${dateString}`)
  }

  showWeather() {
    // Mock weather - in real app, you'd use a weather API
    const weather = ["It's sunny and 72°F", "Partly cloudy, 68°F", "Rainy day, 65°F", "Clear skies, 75°F"]
    const currentWeather = weather[Math.floor(Math.random() * weather.length)]
    this.addMessage(
      `Weather: ${currentWeather} (Note: This is mock data. Connect to a weather service for real data.)`,
      "assistant",
    )
    this.speak(currentWeather)
  }

  calculate(input) {
    // Extract math expression from input
    const mathExpression = input.replace(/calculate|math|compute/gi, "").trim()

    try {
      // Simple math evaluation (be careful with eval in production!)
      const result = Function('"use strict"; return (' + mathExpression + ")")()
      this.addMessage(`${mathExpression} = ${result}`, "assistant")
      this.speak(`The answer is ${result}`)
    } catch (error) {
      this.addMessage("I couldn't calculate that. Please use basic math operations like +, -, *, /", "assistant")
      this.speak("I couldn't calculate that")
    }
  }

  createTask(input) {
    const taskText = input.replace(/create task|new task|add task/gi, "").trim()
    if (!taskText) {
      this.addMessage("What task would you like me to create?", "assistant")
      return
    }

    // Store task in localStorage
    const tasks = JSON.parse(localStorage.getItem("eve_tasks") || "[]")
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      created: new Date().toISOString(),
    }

    tasks.push(newTask)
    localStorage.setItem("eve_tasks", JSON.stringify(tasks))

    this.addMessage(`Task created: "${taskText}"`, "assistant")
    this.speak(`Task created: ${taskText}`)
  }

  listTasks() {
    const tasks = JSON.parse(localStorage.getItem("eve_tasks") || "[]")

    if (tasks.length === 0) {
      this.addMessage("You have no tasks. Say 'create task' followed by what you want to do!", "assistant")
      this.speak("You have no tasks")
      return
    }

    const taskList = tasks.map((task, index) => `${index + 1}. ${task.completed ? "✅" : "⏳"} ${task.text}`).join("\n")

    this.addMessage(`Your tasks:\n${taskList}`, "assistant")
    this.speak(`You have ${tasks.length} tasks`)
  }

  completeTask(input) {
    const tasks = JSON.parse(localStorage.getItem("eve_tasks") || "[]")

    if (tasks.length === 0) {
      this.addMessage("You have no tasks to complete!", "assistant")
      return
    }

    // Try to find task by number or text
    const taskNumber = Number.parseInt(input.match(/\d+/)?.[0])

    if (taskNumber && taskNumber <= tasks.length) {
      tasks[taskNumber - 1].completed = true
      localStorage.setItem("eve_tasks", JSON.stringify(tasks))
      this.addMessage(`Task ${taskNumber} completed! ✅`, "assistant")
      this.speak(`Task ${taskNumber} completed`)
    } else {
      this.addMessage("Please specify which task number to complete, like 'complete task 1'", "assistant")
    }
  }

  tellJoke() {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the computer go to the doctor? Because it had a virus!",
      "Why don't programmers like nature? It has too many bugs!",
      "What do you call a computer that sings? A-Dell!",
      "Why was the computer cold? It left its Windows open!",
    ]
    const joke = jokes[Math.floor(Math.random() * jokes.length)]
    this.addMessage(joke, "assistant")
    this.speak(joke)
  }

  flipCoin() {
    const result = Math.random() < 0.5 ? "Heads" : "Tails"
    this.addMessage(`🪙 Coin flip result: ${result}!`, "assistant")
    this.speak(`The coin landed on ${result}`)
  }

  rollDice() {
    const result = Math.floor(Math.random() * 6) + 1
    this.addMessage(`🎲 Dice roll: ${result}!`, "assistant")
    this.speak(`You rolled a ${result}`)
  }

  randomNumber(input) {
    const match = input.match(/(\d+).*?(\d+)/)
    let min = 1,
      max = 100

    if (match) {
      min = Number.parseInt(match[1])
      max = Number.parseInt(match[2])
    }

    const result = Math.floor(Math.random() * (max - min + 1)) + min
    this.addMessage(`🎯 Random number between ${min} and ${max}: ${result}`, "assistant")
    this.speak(`Random number: ${result}`)
  }

  search(input) {
    const query = input.replace(/search|google|look up/gi, "").trim()
    if (query) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank")
      this.addMessage(`Searching for: "${query}"`, "assistant")
      this.speak(`Searching for ${query}`)
    }
  }

  searchYouTube(input) {
    const query = input.replace(/youtube|video/gi, "").trim()
    if (query) {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank")
      this.addMessage(`Searching YouTube for: "${query}"`, "assistant")
      this.speak(`Searching YouTube for ${query}`)
    }
  }

  respondToGreeting() {
    const responses = [
      "I'm doing great! Ready to help you with anything you need.",
      "Fantastic! I'm here and ready to assist you.",
      "I'm excellent! What can I help you accomplish today?",
      "Wonderful! I'm fully operational and at your service.",
    ]
    const response = responses[Math.floor(Math.random() * responses.length)]
    this.addMessage(response, "assistant")
    this.speak(response)
  }

  respondToThanks() {
    const responses = ["You're very welcome!", "Happy to help!", "Anytime!", "My pleasure!", "Glad I could assist!"]
    const response = responses[Math.floor(Math.random() * responses.length)]
    this.addMessage(response, "assistant")
    this.speak(response)
  }

  showHelp() {
    const helpText = `Here's what I can do for you:

📱 Applications:
• "open calculator" - Launch calculator
• "open notepad" - Open text editor
• "open browser" - Open web browser

📁 Files & Folders:
• "open downloads" - Open downloads folder
• "open documents" - Open documents folder
• "open pictures" - Open pictures folder

⏰ Information:
• "time" - Current time
• "date" - Today's date
• "weather" - Weather info
• "system info" - Computer details

🧮 Math:
• "calculate 2+2" - Do math
• "random number" - Generate random number

✅ Tasks:
• "create task [description]" - Add new task
• "list tasks" - Show all tasks
• "complete task [number]" - Mark task done

🎯 Fun:
• "tell joke" - Hear a joke
• "flip coin" - Flip a coin
• "roll dice" - Roll a die

🔍 Search:
• "search [query]" - Google search
• "youtube [query]" - YouTube search

Just type or speak any command!`

    this.addMessage(helpText, "assistant")
    this.speak("I can help with applications, files, math, tasks, and much more. Check the chat for a full list!")
  }

  handleUnknownCommand(input) {
    const responses = [
      "I'm not sure how to help with that. Try saying 'help' to see what I can do!",
      "I didn't understand that command. Type 'help' for a list of things I can do.",
      "Hmm, I don't recognize that. Say 'help' to see my capabilities!",
      "I'm still learning! Try 'help' to see what I can currently do.",
    ]
    const response = responses[Math.floor(Math.random() * responses.length)]
    this.addMessage(response, "assistant")
    this.speak("I didn't understand that command")
  }

  toggleVoiceRecognition() {
    if (!this.recognition) {
      this.addMessage("Voice recognition is not supported in your browser.", "assistant")
      return
    }

    if (this.isListening) {
      this.recognition.stop()
      this.isListening = false
      document.getElementById("eve-voice-btn").textContent = "🎤"
      this.addMessage("Voice recognition stopped.", "assistant")
    } else {
      this.recognition.start()
      this.isListening = true
      document.getElementById("eve-voice-btn").textContent = "🔴"
      this.addMessage("Listening... Speak your command!", "assistant")
    }
  }

  handleVoiceInput(event) {
    let finalTranscript = ""

    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript
      }
    }

    if (finalTranscript) {
      this.processInput(finalTranscript)
      this.recognition.stop()
      this.isListening = false
      document.getElementById("eve-voice-btn").textContent = "🎤"
    }
  }
}

// Initialize EVE when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.EVE = new EVECore()
})

// Make EVE globally accessible
window.startEVE = () => {
  if (!window.EVE) {
    window.EVE = new EVECore()
  }
}
