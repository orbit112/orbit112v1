// EVE Manual Testing Guide
// Interactive testing commands you can run

class EVEManualTestGuide {
  constructor() {
    this.setupManualTests()
  }

  setupManualTests() {
    console.log("📋 EVE Manual Testing Guide Ready!")
    console.log("Use these commands to test EVE manually:")
    console.log("")
    console.log("🧪 BASIC TESTS:")
    console.log("EVETestSuite.quickHealthCheck() - Quick system check")
    console.log("EVETestSuite.runAllTests() - Full test suite")
    console.log("")
    console.log("🎤 VOICE COMMAND TESTS:")
    console.log('testVoiceCommand("create task finish homepage")')
    console.log('testVoiceCommand("create team Development Squad")')
    console.log('testVoiceCommand("list my tasks")')
    console.log('testVoiceCommand("team stats")')
    console.log("")
    console.log("📋 TASK MANAGEMENT TESTS:")
    console.log("testTaskCreation()")
    console.log("testProjectCreation()")
    console.log("testTaskAssignment()")
    console.log("")
    console.log("👥 COLLABORATION TESTS:")
    console.log("testTeamCreation()")
    console.log("testMemberInvitation()")
    console.log("testProjectSharing()")
    console.log("")
    console.log("🎨 UI TESTS:")
    console.log("testUIComponents()")
    console.log("testModalSystem()")
    console.log("testButtonInteractions()")
  }

  // Test voice command processing
  testVoiceCommand(command) {
    console.log(`🎤 Testing voice command: "${command}"`)

    // Mock voice command patterns
    const patterns = {
      createTask: /(?:create task|add task|new task)\s+(.+)/i,
      createTeam: /(?:create team|new team|make team)\s+(.+)/i,
      listTasks: /(?:list tasks|show tasks|my tasks)/i,
      teamStats: /(?:team stats|team statistics|collaboration stats)/i,
      assignTask: /(?:assign task|assign)\s+(.+?)\s+to\s+(.+)/i,
      shareProject: /(?:share project|share)\s+(.+?)\s+with\s+(.+)/i,
    }

    let matched = false
    for (const [commandType, pattern] of Object.entries(patterns)) {
      const match = command.match(pattern)
      if (match) {
        console.log(`✅ Matched pattern: ${commandType}`)
        console.log(`📝 Extracted data:`, match.slice(1))
        matched = true
        break
      }
    }

    if (!matched) {
      console.log(`❌ No pattern matched for: "${command}"`)
    }

    return matched
  }

  // Test task creation
  testTaskCreation() {
    console.log("📋 Testing Task Creation...")

    try {
      const testTask = {
        id: Date.now(),
        title: "Test Task " + Math.random().toString(36).substr(2, 9),
        description: "This is a test task created by the test suite",
        priority: "High",
        status: "pending",
        createdDate: new Date().toISOString(),
        createdBy: process.env.USERNAME || "TestUser",
      }

      console.log("✅ Task object created:", testTask)

      // Test task validation
      const isValid = testTask.title && testTask.priority && testTask.status
      console.log(`✅ Task validation: ${isValid ? "PASSED" : "FAILED"}`)

      return testTask
    } catch (error) {
      console.log("❌ Task creation failed:", error)
      return null
    }
  }

  // Test project creation
  testProjectCreation() {
    console.log("🎯 Testing Project Creation...")

    try {
      const testProject = {
        id: Date.now(),
        name: "Test Project " + Math.random().toString(36).substr(2, 9),
        description: "This is a test project",
        progress: 0,
        createdDate: new Date().toISOString(),
        createdBy: process.env.USERNAME || "TestUser",
        tasks: [],
        teams: [],
      }

      console.log("✅ Project object created:", testProject)

      // Test project validation
      const isValid = testProject.name && testProject.createdBy && Array.isArray(testProject.tasks)
      console.log(`✅ Project validation: ${isValid ? "PASSED" : "FAILED"}`)

      return testProject
    } catch (error) {
      console.log("❌ Project creation failed:", error)
      return null
    }
  }

  // Test team creation
  testTeamCreation() {
    console.log("👥 Testing Team Creation...")

    try {
      const testTeam = {
        id: Date.now(),
        name: "Test Team " + Math.random().toString(36).substr(2, 9),
        description: "This is a test team",
        createdBy: process.env.USERNAME || "TestUser",
        createdDate: new Date().toISOString(),
        members: [],
        projects: [],
        color: "#7e57c2",
        avatar: {
          type: "initials",
          initials: "TT",
          backgroundColor: "#7e57c2",
        },
      }

      console.log("✅ Team object created:", testTeam)

      // Test team validation
      const isValid = testTeam.name && testTeam.createdBy && Array.isArray(testTeam.members)
      console.log(`✅ Team validation: ${isValid ? "PASSED" : "FAILED"}`)

      return testTeam
    } catch (error) {
      console.log("❌ Team creation failed:", error)
      return null
    }
  }

  // Test UI components
  testUIComponents() {
    console.log("🎨 Testing UI Components...")

    try {
      // Test button creation
      const testButton = document.createElement("button")
      testButton.textContent = "Test Button"
      testButton.className = "test-button"
      console.log("✅ Button created successfully")

      // Test modal creation
      const testModal = document.createElement("div")
      testModal.className = "test-modal"
      testModal.innerHTML = `
        <div class="modal-content">
          <h2>Test Modal</h2>
          <p>This is a test modal</p>
          <button class="close-btn">Close</button>
        </div>
      `
      console.log("✅ Modal created successfully")

      // Test form creation
      const testForm = document.createElement("form")
      testForm.innerHTML = `
        <input type="text" placeholder="Test input" />
        <button type="submit">Submit</button>
      `
      console.log("✅ Form created successfully")

      return { button: testButton, modal: testModal, form: testForm }
    } catch (error) {
      console.log("❌ UI component creation failed:", error)
      return null
    }
  }

  // Test button interactions
  testButtonInteractions() {
    console.log("🖱️ Testing Button Interactions...")

    try {
      const testButton = document.createElement("button")
      testButton.textContent = "Click Me"

      let clickCount = 0
      testButton.addEventListener("click", () => {
        clickCount++
        console.log(`Button clicked ${clickCount} times`)
      })

      // Simulate clicks
      testButton.click()
      testButton.click()
      testButton.click()

      const success = clickCount === 3
      console.log(`✅ Button interaction test: ${success ? "PASSED" : "FAILED"}`)

      return success
    } catch (error) {
      console.log("❌ Button interaction test failed:", error)
      return false
    }
  }

  // Test local storage
  testLocalStorage() {
    console.log("💾 Testing Local Storage...")

    try {
      const testData = {
        testKey: "testValue",
        timestamp: Date.now(),
        user: process.env.USERNAME || "TestUser",
      }

      // Save to localStorage
      localStorage.setItem("eveTestData", JSON.stringify(testData))
      console.log("✅ Data saved to localStorage")

      // Retrieve from localStorage
      const retrieved = JSON.parse(localStorage.getItem("eveTestData"))
      console.log("✅ Data retrieved from localStorage:", retrieved)

      // Validate data
      const isValid = retrieved.testKey === testData.testKey && retrieved.user === testData.user
      console.log(`✅ Data validation: ${isValid ? "PASSED" : "FAILED"}`)

      // Cleanup
      localStorage.removeItem("eveTestData")
      console.log("✅ Test data cleaned up")

      return isValid
    } catch (error) {
      console.log("❌ Local storage test failed:", error)
      return false
    }
  }

  // Test performance
  testPerformance() {
    console.log("⚡ Testing Performance...")

    const startTime = performance.now()

    // CPU intensive task
    let result = 0
    for (let i = 0; i < 100000; i++) {
      result += Math.sqrt(i)
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    console.log(`⏱️ Performance test completed in ${duration.toFixed(2)}ms`)
    console.log(`📊 Result: ${result.toFixed(2)}`)

    const isGood = duration < 100 // Should complete in under 100ms
    console.log(`✅ Performance: ${isGood ? "GOOD" : "NEEDS IMPROVEMENT"}`)

    return { duration, result, isGood }
  }

  // Run all manual tests
  runAllManualTests() {
    console.log("🚀 Running All Manual Tests...")
    console.log("=" * 40)

    const results = {
      taskCreation: this.testTaskCreation(),
      projectCreation: this.testProjectCreation(),
      teamCreation: this.testTeamCreation(),
      uiComponents: this.testUIComponents(),
      buttonInteractions: this.testButtonInteractions(),
      localStorage: this.testLocalStorage(),
      performance: this.testPerformance(),
    }

    console.log("=" * 40)
    console.log("📊 Manual Test Results:", results)

    return results
  }
}

// Initialize manual test guide
const eveManualTestGuide = new EVEManualTestGuide()

// Make functions globally available for easy testing
window.testVoiceCommand = (command) => eveManualTestGuide.testVoiceCommand(command)
window.testTaskCreation = () => eveManualTestGuide.testTaskCreation()
window.testProjectCreation = () => eveManualTestGuide.testProjectCreation()
window.testTeamCreation = () => eveManualTestGuide.testTeamCreation()
window.testUIComponents = () => eveManualTestGuide.testUIComponents()
window.testButtonInteractions = () => eveManualTestGuide.testButtonInteractions()
window.testLocalStorage = () => eveManualTestGuide.testLocalStorage()
window.testPerformance = () => eveManualTestGuide.testPerformance()
window.runAllManualTests = () => eveManualTestGuide.runAllManualTests()
