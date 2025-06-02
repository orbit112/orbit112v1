// Personal Profile Manager for EVE
// Add this to your scripts.js file

class PersonalProfileManager {
  constructor() {
    this.profile = {
      personal: {
        name: "",
        nickname: "",
        age: "",
        occupation: "",
        location: "",
        timezone: "",
        birthday: "",
        preferences: {},
      },
      contacts: [],
      schedule: [],
      interests: [],
      habits: [],
      goals: [],
      reminders: [],
    }

    this.loadProfile()
    this.setupProfileLearning()
  }

  // Load profile from storage
  loadProfile() {
    try {
      const savedProfile = localStorage.getItem("evePersonalProfile")
      if (savedProfile) {
        this.profile = { ...this.profile, ...JSON.parse(savedProfile) }
        console.log("Profile loaded for:", this.profile.personal.name || "User")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  // Save profile to storage
  saveProfile() {
    try {
      localStorage.setItem("evePersonalProfile", JSON.stringify(this.profile))
      console.log("Profile saved successfully")
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  // Setup learning from conversations
  setupProfileLearning() {
    // Learn from user interactions
    this.learningPatterns = {
      name: /my name is (\w+)|i'm (\w+)|call me (\w+)|i am (\w+)/i,
      age: /i'm (\d+) years old|i am (\d+)|my age is (\d+)/i,
      occupation: /i work as|i'm a|i am a|my job is|i work at/i,
      location: /i live in|i'm from|i'm located in|my location is/i,
      interests: /i like|i love|i enjoy|i'm interested in|my hobby is/i,
      birthday: /my birthday is|i was born on|born in/i,
    }
  }

  // Learn from user message
  learnFromMessage(message) {
    const lowerMessage = message.toLowerCase()

    // Learn name
    const nameMatch = lowerMessage.match(this.learningPatterns.name)
    if (nameMatch) {
      const name = nameMatch[1] || nameMatch[2] || nameMatch[3] || nameMatch[4]
      if (name && name.length > 1) {
        this.profile.personal.name = this.capitalizeFirst(name)
        this.saveProfile()
        return `Nice to meet you, ${this.profile.personal.name}! I'll remember your name.`
      }
    }

    // Learn age
    const ageMatch = lowerMessage.match(this.learningPatterns.age)
    if (ageMatch) {
      const age = ageMatch[1] || ageMatch[2] || ageMatch[3]
      if (age && Number.parseInt(age) > 0 && Number.parseInt(age) < 150) {
        this.profile.personal.age = age
        this.saveProfile()
        return `Got it! I'll remember that you're ${age} years old.`
      }
    }

    // Learn interests
    if (lowerMessage.includes("i like") || lowerMessage.includes("i love") || lowerMessage.includes("i enjoy")) {
      const interest = this.extractInterest(lowerMessage)
      if (interest && !this.profile.interests.includes(interest)) {
        this.profile.interests.push(interest)
        this.saveProfile()
        return `Interesting! I'll remember that you like ${interest}.`
      }
    }

    return null
  }

  // Extract interest from message
  extractInterest(message) {
    const patterns = [
      /i like (.+?)(?:\.|$|,)/,
      /i love (.+?)(?:\.|$|,)/,
      /i enjoy (.+?)(?:\.|$|,)/,
      /i'm interested in (.+?)(?:\.|$|,)/,
    ]

    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return null
  }

  // Get personalized greeting
  getPersonalizedGreeting() {
    const name = this.profile.personal.name
    const hour = new Date().getHours()

    let timeGreeting = ""
    if (hour < 12) timeGreeting = this.translate("Good morning")
    else if (hour < 17) timeGreeting = this.translate("Good afternoon")
    else timeGreeting = this.translate("Good evening")

    if (name) {
      return `${timeGreeting}, ${name}! ${this.translate("How can I help you today?")}`
    } else {
      return `${timeGreeting}! ${this.translate("What's your name? I'd love to get to know you better.")}`
    }
  }

  // Get personalized suggestions
  getPersonalizedSuggestions() {
    const suggestions = []
    const name = this.profile.personal.name || this.translate("there")

    // Time-based suggestions
    const hour = new Date().getHours()
    if (hour >= 9 && hour <= 17) {
      suggestions.push(this.translate("Would you like me to check your work applications?"))
      suggestions.push(this.translate("Should I help you organize your files for today?"))
    } else if (hour >= 18 && hour <= 22) {
      suggestions.push(this.translate("Time to relax! Want me to open your entertainment apps?"))
      suggestions.push(this.translate("How about some music or videos?"))
    }

    // Interest-based suggestions
    if (this.profile.interests.length > 0) {
      const randomInterest = this.profile.interests[Math.floor(Math.random() * this.profile.interests.length)]
      suggestions.push(this.translate(`Since you like ${randomInterest}, want me to find related apps?`))
    }

    // Habit-based suggestions
    if (this.profile.habits.length > 0) {
      suggestions.push(this.translate("Based on your usual routine, here's what I suggest..."))
    }

    return suggestions
  }

  // Add contact
  addContact(name, email, phone = "", relationship = "") {
    const contact = {
      id: Date.now(),
      name: this.capitalizeFirst(name),
      email: email.toLowerCase(),
      phone,
      relationship,
      addedDate: new Date().toISOString(),
    }

    this.profile.contacts.push(contact)
    this.saveProfile()

    return `Added ${name} to your contacts!`
  }

  // Find contact
  findContact(query) {
    const lowerQuery = query.toLowerCase()
    return this.profile.contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.relationship.toLowerCase().includes(lowerQuery),
    )
  }

  // Add reminder
  addReminder(text, datetime = null) {
    const reminder = {
      id: Date.now(),
      text,
      datetime: datetime || new Date().toISOString(),
      completed: false,
      createdDate: new Date().toISOString(),
    }

    this.profile.reminders.push(reminder)
    this.saveProfile()

    return `Reminder set: ${text}`
  }

  // Get pending reminders
  getPendingReminders() {
    const now = new Date()
    return this.profile.reminders.filter((reminder) => !reminder.completed && new Date(reminder.datetime) <= now)
  }

  // Capitalize first letter
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  // Get profile summary
  getProfileSummary() {
    const { personal, contacts, interests, reminders } = this.profile
    const name = personal.name || this.translate("User")

    let summary = `👤 ${this.translate("Profile for")} ${name}\n\n`

    if (personal.age) summary += `🎂 ${this.translate("Age")}: ${personal.age}\n`
    if (personal.occupation) summary += `💼 ${this.translate("Occupation")}: ${personal.occupation}\n`
    if (personal.location) summary += `📍 ${this.translate("Location")}: ${personal.location}\n`

    if (interests.length > 0) {
      summary += `\n❤️ ${this.translate("Interests")}: ${interests.join(", ")}\n`
    }

    summary += `\n📞 ${this.translate("Contacts")}: ${contacts.length}`
    summary += `\n⏰ ${this.translate("Active Reminders")}: ${reminders.filter((r) => !r.completed).length}`

    return summary
  }

  // Update profile field
  updateProfile(field, value) {
    if (field in this.profile.personal) {
      this.profile.personal[field] = value
      this.saveProfile()
      return `Updated ${field} to: ${value}`
    }
    return `Unknown profile field: ${field}`
  }

  // Translate text (replace with your actual translation function)
  translate(text) {
    // This is a placeholder. Replace with your actual translation logic.
    return text
  }
}

// Initialize profile manager
const profileManager = new PersonalProfileManager()
