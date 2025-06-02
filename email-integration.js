// Email Integration for EVE
// Add this to your scripts.js file

// Mocked dependencies for demonstration purposes
const addMessage = (message, isError) => console.log(message)
const t = (key) => key // Simple translation function
let voiceSystem
let eveSettings

class EmailManager {
  constructor() {
    this.emails = []
    this.emailAccounts = []
    this.emailSettings = {
      autoCheck: true,
      checkInterval: 300000, // 5 minutes
      notifications: true,
      readReceipts: false,
    }

    this.initializeEmailSystem()
  }

  // Initialize email system
  initializeEmailSystem() {
    this.loadEmailSettings()
    this.setupEmailChecking()
  }

  // Load email settings
  loadEmailSettings() {
    try {
      const saved = localStorage.getItem("eveEmailSettings")
      if (saved) {
        this.emailSettings = { ...this.emailSettings, ...JSON.parse(saved) }
      }

      const accounts = localStorage.getItem("eveEmailAccounts")
      if (accounts) {
        this.emailAccounts = JSON.parse(accounts)
      }
    } catch (error) {
      console.error("Error loading email settings:", error)
    }
  }

  // Save email settings
  saveEmailSettings() {
    try {
      localStorage.setItem("eveEmailSettings", JSON.stringify(this.emailSettings))
      localStorage.setItem("eveEmailAccounts", JSON.stringify(this.emailAccounts))
    } catch (error) {
      console.error("Error saving email settings:", error)
    }
  }

  // Setup automatic email checking
  setupEmailChecking() {
    if (this.emailSettings.autoCheck) {
      setInterval(() => {
        this.checkEmails()
      }, this.emailSettings.checkInterval)
    }
  }

  // Add email account
  async addEmailAccount(email, password, provider = "gmail") {
    try {
      // In a real implementation, this would connect to email APIs
      const account = {
        id: Date.now(),
        email: email.toLowerCase(),
        provider,
        addedDate: new Date().toISOString(),
        lastChecked: null,
        unreadCount: 0,
      }

      this.emailAccounts.push(account)
      this.saveEmailSettings()

      addMessage(`✅ ${t("Email account added")}: ${email}`, false)
      return true
    } catch (error) {
      addMessage(`❌ ${t("Error adding email account")}: ${error.message}`, false)
      return false
    }
  }

  // Check emails (mock implementation)
  async checkEmails() {
    try {
      if (this.emailAccounts.length === 0) {
        return { success: false, message: t("No email accounts configured") }
      }

      // Mock email checking - in real implementation, this would use email APIs
      const mockEmails = this.generateMockEmails()
      this.emails = [...mockEmails, ...this.emails].slice(0, 100) // Keep last 100 emails

      const unreadCount = this.emails.filter((email) => !email.read).length

      if (unreadCount > 0 && this.emailSettings.notifications) {
        addMessage(`📧 ${t("You have")} ${unreadCount} ${t("unread emails")}`, false)

        if (typeof voiceSystem !== "undefined" && eveSettings?.voice?.emailNotifications) {
          voiceSystem.speak(t(`You have ${unreadCount} new emails`))
        }
      }

      return { success: true, unreadCount }
    } catch (error) {
      console.error("Error checking emails:", error)
      return { success: false, error: error.message }
    }
  }

  // Generate mock emails for demonstration
  generateMockEmails() {
    const senders = ["work@company.com", "friend@email.com", "newsletter@service.com", "support@app.com"]
    const subjects = [
      "Meeting reminder for tomorrow",
      "Your weekly report is ready",
      "New features in your favorite app",
      "Weekend plans?",
      "Important: Account security update",
      "Invoice for your recent purchase",
    ]

    const mockEmails = []
    const emailCount = Math.floor(Math.random() * 3) + 1 // 1-3 new emails

    for (let i = 0; i < emailCount; i++) {
      const email = {
        id: Date.now() + i,
        from: senders[Math.floor(Math.random() * senders.length)],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        body: this.generateEmailBody(),
        date: new Date().toISOString(),
        read: false,
        important: Math.random() > 0.8,
        attachments: Math.random() > 0.7 ? ["document.pdf"] : [],
      }
      mockEmails.push(email)
    }

    return mockEmails
  }

  // Generate mock email body
  generateEmailBody() {
    const bodies = [
      "Hi there! Just wanted to follow up on our previous conversation...",
      "Hope you're doing well. I wanted to share some exciting news with you...",
      "This is a reminder about the upcoming meeting scheduled for tomorrow...",
      "Thank you for your recent purchase. Here are the details...",
      "We've updated our privacy policy. Please review the changes...",
      "Your monthly report is now available for download...",
    ]

    return bodies[Math.floor(Math.random() * bodies.length)]
  }

  // Read emails
  getEmails(filter = "all") {
    let filteredEmails = this.emails

    switch (filter) {
      case "unread":
        filteredEmails = this.emails.filter((email) => !email.read)
        break
      case "important":
        filteredEmails = this.emails.filter((email) => email.important)
        break
      case "today":
        const today = new Date().toDateString()
        filteredEmails = this.emails.filter((email) => new Date(email.date).toDateString() === today)
        break
    }

    return filteredEmails
  }

  // Read specific email
  readEmail(emailId) {
    const email = this.emails.find((e) => e.id === emailId)
    if (email) {
      email.read = true
      return email
    }
    return null
  }

  // Get email summary
  getEmailSummary() {
    const total = this.emails.length
    const unread = this.emails.filter((e) => !e.read).length
    const important = this.emails.filter((e) => e.important && !e.read).length
    const today = this.emails.filter((e) => {
      const emailDate = new Date(e.date).toDateString()
      const todayDate = new Date().toDateString()
      return emailDate === todayDate
    }).length

    return {
      total,
      unread,
      important,
      today,
      accounts: this.emailAccounts.length,
    }
  }

  // Smart email suggestions
  getEmailSuggestions() {
    const suggestions = []
    const summary = this.getEmailSummary()

    if (summary.unread > 0) {
      suggestions.push({
        type: "action",
        text: t(`You have ${summary.unread} unread emails. Would you like me to read them to you?`),
        action: "read_emails",
      })
    }

    if (summary.important > 0) {
      suggestions.push({
        type: "priority",
        text: t(`${summary.important} important emails need your attention.`),
        action: "read_important",
      })
    }

    if (summary.today > 5) {
      suggestions.push({
        type: "productivity",
        text: t("You've received many emails today. Would you like me to summarize them?"),
        action: "summarize_today",
      })
    }

    // Time-based suggestions
    const hour = new Date().getHours()
    if (hour === 9) {
      suggestions.push({
        type: "routine",
        text: t("Good morning! Would you like me to check your emails for today?"),
        action: "morning_email_check",
      })
    }

    return suggestions
  }

  // Process email commands
  processEmailCommand(command) {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes("check email") || lowerCommand.includes("new emails")) {
      this.checkEmails()
      return true
    }

    if (lowerCommand.includes("read emails") || lowerCommand.includes("read my emails")) {
      this.readEmailsAloud()
      return true
    }

    if (lowerCommand.includes("email summary") || lowerCommand.includes("email status")) {
      this.showEmailSummary()
      return true
    }

    if (lowerCommand.includes("important emails")) {
      this.readImportantEmails()
      return true
    }

    if (lowerCommand.includes("unread emails")) {
      this.readUnreadEmails()
      return true
    }

    return false
  }

  // Read emails aloud
  readEmailsAloud(filter = "unread") {
    const emails = this.getEmails(filter)

    if (emails.length === 0) {
      const message = t("No emails to read")
      addMessage("📧 " + message, false)
      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(message)
      }
      return
    }

    addMessage(`📧 ${t("Reading")} ${emails.length} ${filter} ${t("emails")}:`, false)

    emails.slice(0, 5).forEach((email, index) => {
      const emailText = `${t("Email")} ${index + 1}: ${t("From")} ${email.from}. ${t("Subject")}: ${email.subject}`
      addMessage(emailText, false)

      if (typeof voiceSystem !== "undefined") {
        setTimeout(() => {
          voiceSystem.speak(emailText)
        }, index * 3000) // 3 second delay between emails
      }
    })

    if (emails.length > 5) {
      addMessage(`... ${t("and")} ${emails.length - 5} ${t("more emails")}`, false)
    }
  }

  // Show email summary
  showEmailSummary() {
    const summary = this.getEmailSummary()
    const summaryText = `📧 ${t("Email Summary")}:
📬 ${t("Total emails")}: ${summary.total}
📩 ${t("Unread")}: ${summary.unread}
⭐ ${t("Important unread")}: ${summary.important}
📅 ${t("Today")}: ${summary.today}
📱 ${t("Accounts")}: ${summary.accounts}`

    addMessage(summaryText, false)

    if (typeof voiceSystem !== "undefined") {
      const spokenSummary = t(
        `You have ${summary.unread} unread emails, ${summary.important} important, and ${summary.today} received today`,
      )
      voiceSystem.speak(spokenSummary)
    }
  }

  // Read important emails
  readImportantEmails() {
    this.readEmailsAloud("important")
  }

  // Read unread emails
  readUnreadEmails() {
    this.readEmailsAloud("unread")
  }
}

// Initialize email manager
const emailManager = new EmailManager()
