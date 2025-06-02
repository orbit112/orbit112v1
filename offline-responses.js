// Offline Response System for EVE
// Add this to your scripts.js file

class OfflineResponseSystem {
  constructor() {
    this.responses = this.initializeResponses()
    this.conversationPatterns = this.initializePatterns()
  }

  // Initialize offline responses
  initializeResponses() {
    return {
      greetings: [
        t("Hello! I'm EVE, your desktop assistant."),
        t("Hi there! How can I help you today?"),
        t("Hey! Ready to assist you with your computer."),
        t("Hello! What would you like me to do?"),
      ],

      farewells: [
        t("Goodbye! Have a great day!"),
        t("See you later! I'll be here when you need me."),
        t("Bye! Feel free to ask for help anytime."),
        t("Take care! I'm always ready to assist."),
      ],

      thanks: [
        t("You're welcome! Happy to help."),
        t("No problem! That's what I'm here for."),
        t("Glad I could help! Anything else?"),
        t("You're welcome! Let me know if you need more help."),
      ],

      compliments: [
        t("Thank you! I try my best to be helpful."),
        t("That's very kind! I'm here to make your life easier."),
        t("Thanks! I'm always learning to serve you better."),
        t("I appreciate that! Your feedback helps me improve."),
      ],

      capabilities: [
        t(
          "I can help you manage files, launch applications, do calculations, get system information, and have conversations - all without internet!",
        ),
        t(
          "I'm capable of file management, app launching, voice commands, math calculations, and much more, even offline!",
        ),
        t(
          "My offline features include file browsing, application control, voice interaction, system monitoring, and basic conversations.",
        ),
      ],

      confusion: [
        t("I'm not sure I understand. Could you rephrase that?"),
        t("Could you be more specific? I want to help you properly."),
        t("I didn't quite catch that. Can you try asking differently?"),
        t("I'm having trouble understanding. Could you clarify?"),
      ],

      offline_limitations: [
        t("I'm currently offline, so I can't access web services, but I can still help with local tasks!"),
        t("That feature requires internet access. However, I can assist with many offline tasks."),
        t("I need an internet connection for that, but there's plenty I can do offline!"),
      ],

      encouragement: [
        t("You're doing great! Keep going!"),
        t("Excellent work! I'm here if you need any help."),
        t("That's fantastic! You're really getting the hang of this."),
        t("Well done! I'm impressed with your progress."),
      ],
    }
  }

  // Initialize conversation patterns
  initializePatterns() {
    return {
      greetings: /\b(hello|hi|hey|good morning|good afternoon|good evening|greetings)\b/i,
      farewells: /\b(goodbye|bye|see you|farewell|good night|talk to you later|ttyl)\b/i,
      thanks: /\b(thank you|thanks|appreciate|grateful)\b/i,
      compliments: /\b(good job|well done|excellent|amazing|awesome|great|fantastic|wonderful|brilliant)\b/i,
      questions_about_eve: /\b(what can you do|what are you|who are you|your capabilities|help me|what's possible)\b/i,
      confusion: /\b(what|huh|confused|don't understand|unclear|explain)\b/i,
      time_queries: /\b(what time|current time|time is it)\b/i,
      date_queries: /\b(what date|today's date|what day)\b/i,
      weather_queries: /\b(weather|temperature|forecast|rain|sunny|cloudy)\b/i,
      how_are_you: /\b(how are you|how do you feel|are you okay|how's it going)\b/i,
      jokes: /\b(tell me a joke|make me laugh|something funny|joke)\b/i,
      stories: /\b(tell me a story|story time|once upon a time)\b/i,
    }
  }

  // Get appropriate response for user input
  getResponse(userInput) {
    const input = userInput.toLowerCase().trim()

    // Check each pattern
    for (const [category, pattern] of Object.entries(this.conversationPatterns)) {
      if (pattern.test(input)) {
        return this.generateResponse(category, input)
      }
    }

    // Default response for unmatched input
    return this.generateResponse("confusion", input)
  }

  // Generate response based on category
  generateResponse(category, input) {
    switch (category) {
      case "greetings":
        return this.getRandomResponse("greetings")

      case "farewells":
        return this.getRandomResponse("farewells")

      case "thanks":
        return this.getRandomResponse("thanks")

      case "compliments":
        return this.getRandomResponse("compliments")

      case "questions_about_eve":
        return this.getRandomResponse("capabilities")

      case "how_are_you":
        return t("I'm functioning perfectly! All my systems are running smoothly. How are you doing?")

      case "time_queries":
        const time = new Date().toLocaleTimeString()
        return t("The current time is") + " " + time

      case "date_queries":
        const date = new Date().toLocaleDateString()
        return t("Today's date is") + " " + date

      case "weather_queries":
        if (typeof connectionManager !== "undefined" && !connectionManager.isOnline) {
          return this.getRandomResponse("offline_limitations")
        }
        return t("I'd love to check the weather for you, but I need to connect to a weather service first.")

      case "jokes":
        return this.getTechJoke()

      case "stories":
        return this.getTechStory()

      default:
        return this.getRandomResponse("confusion")
    }
  }

  // Get random response from category
  getRandomResponse(category) {
    const responses = this.responses[category]
    if (!responses || responses.length === 0) {
      return t("I'm not sure how to respond to that.")
    }

    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Get a tech-related joke
  getTechJoke() {
    const jokes = [
      t("Why do programmers prefer dark mode? Because light attracts bugs! 🐛"),
      t("How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡"),
      t("Why do computers never get cold? They have Windows! 🪟"),
      t("What's a computer's favorite snack? Microchips! 🍟"),
      t("Why was the computer tired? It had a hard drive! 💾"),
      t("What do you call a computer superhero? A screensaver! 🦸‍♂️"),
    ]

    return jokes[Math.floor(Math.random() * jokes.length)]
  }

  // Get a tech-related story
  getTechStory() {
    const stories = [
      t(
        "Once upon a time, in a computer far, far away, there lived a little program named EVE who loved helping users with their daily tasks...",
      ),
      t(
        "In the digital realm of your computer, files and folders live in harmony, organized in their directories like a well-planned city...",
      ),
      t(
        "Long ago, computers were room-sized machines. Now I fit in your device and can talk to you! Technology is amazing, isn't it?",
      ),
      t(
        "Every time you click a button, millions of electrical signals race through circuits at the speed of light. It's like magic, but it's science!",
      ),
    ]

    return stories[Math.floor(Math.random() * stories.length)]
  }

  // Check if input needs online features
  requiresOnline(input) {
    const onlineKeywords = [
      "weather",
      "news",
      "search",
      "google",
      "internet",
      "web",
      "online",
      "email",
      "social media",
      "facebook",
      "twitter",
      "youtube",
      "download",
      "update",
      "sync",
      "cloud",
      "translate",
    ]

    return onlineKeywords.some((keyword) => input.toLowerCase().includes(keyword))
  }

  // Process message with offline intelligence
  processOfflineMessage(message) {
    // Check if it requires online features
    if (this.requiresOnline(message) && typeof connectionManager !== "undefined" && !connectionManager.isOnline) {
      return {
        response: this.getRandomResponse("offline_limitations"),
        handled: true,
      }
    }

    // Get conversational response
    const response = this.getResponse(message)

    return {
      response: response,
      handled: true,
    }
  }
}

// Initialize offline response system
const offlineResponses = new OfflineResponseSystem()

// Mock t function for testing purposes
function t(str) {
  return str
}

// Mock connectionManager for testing purposes
const connectionManager = {
  isOnline: false,
}
