// Voice Commands for Team Collaboration
// Add this to your scripts.js file

class TeamCollaborationVoiceCommands {
  constructor(teamCollaboration) {
    this.teamCollaboration = teamCollaboration
    this.setupVoicePatterns()
  }

  // Setup voice command patterns
  setupVoicePatterns() {
    this.patterns = {
      createTeam: /(?:create team|new team|make team)\s+(.+)/i,
      addMember: /(?:add member|invite)\s+(.+?)\s+to\s+(.+)/i,
      shareProject: /(?:share project|share)\s+(.+?)\s+with\s+(.+)/i,
      assignTask: /(?:assign task|assign)\s+(.+?)\s+to\s+(.+)/i,
      listTeams: /(?:list teams|show teams|my teams)/i,
      listMembers: /(?:list members|show members|team members)\s*(?:of|in)?\s*(.+)?/i,
      teamStats: /(?:team stats|team statistics|collaboration stats)\s*(.+)?/i,
      teamActivity: /(?:team activity|team updates|what's happening)\s*(?:in|with)?\s*(.+)?/i,
      myTasks: /(?:my assigned tasks|assigned to me|my team tasks)/i,
      teamProjects: /(?:team projects|shared projects)\s*(?:in|of)?\s*(.+)?/i,
      collaborationStatus: /(?:collaboration status|team status|sync status)/i,
      collaborationGreeting: /(?:collaboration hello|team hello|collaboration greeting|how are my teams)/i,
      joinTeam: /(?:join team|accept invitation)\s+(.+)/i,
      leaveTeam: /(?:leave team|quit team)\s+(.+)/i,
    }
  }

  // Process team collaboration voice commands
  processCollaborationCommand(message) {
    const lowerMessage = message.toLowerCase().trim()

    // Check each pattern
    for (const [command, pattern] of Object.entries(this.patterns)) {
      const match = lowerMessage.match(pattern)
      if (match) {
        return this.executeCollaborationCommand(command, match, message)
      }
    }

    return false
  }

  // Execute specific collaboration command
  executeCollaborationCommand(command, match, originalMessage) {
    switch (command) {
      case "createTeam":
        return this.handleCreateTeam(match[1])

      case "addMember":
        return this.handleAddMember(match[1], match[2])

      case "shareProject":
        return this.handleShareProject(match[1], match[2])

      case "assignTask":
        return this.handleAssignTask(match[1], match[2])

      case "listTeams":
        return this.handleListTeams()

      case "listMembers":
        return this.handleListMembers(match[1])

      case "teamStats":
        return this.handleTeamStats(match[1])

      case "teamActivity":
        return this.handleTeamActivity(match[1])

      case "myTasks":
        return this.handleMyTasks()

      case "teamProjects":
        return this.handleTeamProjects(match[1])

      case "collaborationStatus":
        return this.handleCollaborationStatus()

      case "collaborationGreeting":
        return this.handleCollaborationGreeting()

      case "joinTeam":
        return this.handleJoinTeam(match[1])

      case "leaveTeam":
        return this.handleLeaveTeam(match[1])

      default:
        return false
    }
  }

  // Handle create team command
  handleCreateTeam(teamName) {
    try {
      const team = this.teamCollaboration.createTeam(teamName.trim())
      const username = process.env.USERNAME || "User"
      const response = t(`${username}, team "${team.name}" created successfully! You are the admin.`)

      addMessage("🎯 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      // Personalized next steps
      addMessage(`💡 ${t("Next steps for")} ${username}: ${t("Add members with 'invite [name] to [team]'")}`, false)

      return true
    } catch (error) {
      const response = t(`Error creating team: ${error.message}`)
      addMessage("❌ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      return true
    }
  }

  // Handle add member command
  handleAddMember(memberInfo, teamName) {
    try {
      // Parse member info (name and email)
      const { name, email } = this.parseMemberInfo(memberInfo)
      const team = this.findTeamByName(teamName)

      if (!team) {
        const response = t(`Team "${teamName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }

      const member = this.teamCollaboration.addTeamMember(team.id, { name, email })
      const response = t(`${member.name} invited to team "${team.name}"`)

      addMessage("👥 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      return true
    } catch (error) {
      const response = t(`Error adding member: ${error.message}`)
      addMessage("❌ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      return true
    }
  }

  // Handle share project command
  handleShareProject(projectName, teamName) {
    try {
      const project = this.findProjectByName(projectName)
      const team = this.findTeamByName(teamName)

      if (!project) {
        const response = t(`Project "${projectName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }

      if (!team) {
        const response = t(`Team "${teamName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }

      const sharedProject = this.teamCollaboration.shareProject(project.id, team.id, {
        canEdit: true,
        canAddTasks: true,
        canAssignTasks: true,
      })

      const response = t(`Project "${project.name}" shared with team "${team.name}"`)
      addMessage("🤝 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      return true
    } catch (error) {
      const response = t(`Error sharing project: ${error.message}`)
      addMessage("❌ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      return true
    }
  }

  // Handle assign task command
  handleAssignTask(taskName, memberName) {
    try {
      const task = this.findTaskByName(taskName)
      const member = this.findMemberByName(memberName)

      if (!task) {
        const response = t(`Task "${taskName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }

      if (!member) {
        const response = t(`Team member "${memberName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }

      const sharedTask = this.teamCollaboration.shareTask(task.id, member.id, {
        canEdit: true,
        canComplete: true,
        canComment: true,
      })

      const response = t(`Task "${task.title}" assigned to ${member.name}`)
      addMessage("📋 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      return true
    } catch (error) {
      const response = t(`Error assigning task: ${error.message}`)
      addMessage("❌ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      return true
    }
  }

  // Handle list teams command
  handleListTeams() {
    const teams = this.teamCollaboration.teams

    if (teams.length === 0) {
      const response = t("You are not part of any teams yet")
      addMessage("👥 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      addMessage(`💡 ${t("Create a team with 'create team [name]'")}`, false)
    } else {
      addMessage(`👥 ${t("Your teams")} (${teams.length}):`, false)

      teams.forEach((team) => {
        const memberCount = team.members.length
        const projectCount = team.projects.length
        addMessage(`• ${team.name} - ${memberCount} ${t("members")}, ${projectCount} ${t("projects")}`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You are part of ${teams.length} teams`))
      }
    }

    return true
  }

  // Handle list members command
  handleListMembers(teamName) {
    let team = null

    if (teamName) {
      team = this.findTeamByName(teamName)
      if (!team) {
        const response = t(`Team "${teamName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }
    } else {
      // If no team specified, use the first team
      team = this.teamCollaboration.teams[0]
      if (!team) {
        const response = t("No teams found")
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }
    }

    addMessage(`👥 ${t("Members of")} "${team.name}" (${team.members.length}):`, false)

    team.members.forEach((member) => {
      const roleText = team.admins.includes(member.id) ? ` (${t("Admin")})` : ""
      addMessage(`• ${member.name} - ${member.email}${roleText}`, false)
    })

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(t(`Team ${team.name} has ${team.members.length} members`))
    }

    return true
  }

  // Handle team stats command
  handleTeamStats(teamName) {
    let team = null

    if (teamName) {
      team = this.findTeamByName(teamName)
      if (!team) {
        const response = t(`Team "${teamName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }
    } else {
      // Show overall collaboration stats
      const stats = this.teamCollaboration.getCollaborationStats()

      const statsText = `📊 ${t("Collaboration Statistics")}:
👥 ${t("Total teams")}: ${stats.totalTeams}
🤝 ${t("Total members")}: ${stats.totalMembers}
🎯 ${t("Shared projects")}: ${stats.sharedProjects}
📋 ${t("Shared tasks")}: ${stats.sharedTasks}`

      addMessage(statsText, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(
          t(
            `You have ${stats.totalTeams} teams, ${stats.sharedProjects} shared projects, and ${stats.sharedTasks} shared tasks`,
          ),
        )
      }

      return true
    }

    // Show specific team stats
    const stats = this.teamCollaboration.getCollaborationStats(team.id)

    const statsText = `📊 ${t("Statistics for")} "${team.name}":
👥 ${t("Members")}: ${stats.teamMembers}
🎯 ${t("Projects")}: ${stats.teamProjects}
📋 ${t("Tasks")}: ${stats.teamTasks}
✅ ${t("Completed")}: ${stats.completedTasks}
📈 ${t("Completion rate")}: ${stats.completionRate}%`

    addMessage(statsText, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(
        t(`Team ${team.name} has ${stats.teamProjects} projects and ${stats.completionRate}% completion rate`),
      )
    }

    return true
  }

  // Handle team activity command
  handleTeamActivity(teamName) {
    let team = null

    if (teamName) {
      team = this.findTeamByName(teamName)
      if (!team) {
        const response = t(`Team "${teamName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }
    } else {
      team = this.teamCollaboration.teams[0]
      if (!team) {
        const response = t("No teams found")
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }
    }

    const activities = this.teamCollaboration.getTeamActivity(team.id, 5)

    if (activities.length === 0) {
      const response = t(`No recent activity in team "${team.name}"`)
      addMessage("📊 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`📊 ${t("Recent activity in")} "${team.name}":`, false)

      activities.forEach((activity) => {
        const timeAgo = this.getTimeAgo(activity.timestamp)
        addMessage(`• ${activity.actor} ${activity.description} (${timeAgo})`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`Team ${team.name} has ${activities.length} recent activities`))
      }
    }

    return true
  }

  // Handle my tasks command
  handleMyTasks() {
    const currentUser = this.teamCollaboration.getCurrentUser()
    const assignedTasks = this.teamCollaboration.getMemberTasks(currentUser.id)

    if (assignedTasks.length === 0) {
      const response = t("You have no assigned tasks from team members")
      addMessage("📋 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`📋 ${t("Your assigned tasks")} (${assignedTasks.length}):`, false)

      assignedTasks.slice(0, 5).forEach((task) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        const assignedBy = task.assignedBy ? ` (${t("by")} ${task.assignedBy.name})` : ""
        const dueText = task.dueDate ? ` - ${t("Due")}: ${new Date(task.dueDate).toLocaleDateString()}` : ""

        addMessage(`${priorityEmoji} ${task.title}${assignedBy}${dueText}`, false)
      })

      if (assignedTasks.length > 5) {
        addMessage(`... ${t("and")} ${assignedTasks.length - 5} ${t("more tasks")}`, false)
      }

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`You have ${assignedTasks.length} assigned tasks`))
      }
    }

    return true
  }

  // Handle team projects command
  handleTeamProjects(teamName) {
    let team = null

    if (teamName) {
      team = this.findTeamByName(teamName)
      if (!team) {
        const response = t(`Team "${teamName}" not found`)
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }
    } else {
      team = this.teamCollaboration.teams[0]
      if (!team) {
        const response = t("No teams found")
        addMessage("❌ " + response, false)

        if (typeof voiceSystem !== "undefined") {
          voiceSystem.speak(response)
        }

        return true
      }
    }

    const teamProjects = this.teamCollaboration.getTeamProjects(team.id)

    if (teamProjects.length === 0) {
      const response = t(`No shared projects in team "${team.name}"`)
      addMessage("🎯 " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }
    } else {
      addMessage(`🎯 ${t("Shared projects in")} "${team.name}" (${teamProjects.length}):`, false)

      teamProjects.forEach((project) => {
        const collaboratorCount = project.collaborators.length
        addMessage(`• ${project.name} - ${project.progress}% (${collaboratorCount} ${t("collaborators")})`, false)
      })

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`Team ${team.name} has ${teamProjects.length} shared projects`))
      }
    }

    return true
  }

  // Handle collaboration status command
  handleCollaborationStatus() {
    const stats = this.teamCollaboration.getCollaborationStats()
    const currentUser = this.teamCollaboration.getCurrentUser()
    const assignedTasks = this.teamCollaboration.getMemberTasks(currentUser.id)
    const pendingTasks = assignedTasks.filter((t) => t.status === "pending")
    const userSummary = this.teamCollaboration.getUserCollaborationSummary()

    const statusText = `🤝 ${t("Collaboration Status for")} ${userSummary.username}:
👥 ${t("Teams joined")}: ${userSummary.teamsJoined}
🎯 ${t("Teams created")}: ${userSummary.teamsCreated}
📋 ${t("Assigned to you")}: ${assignedTasks.length}
⏳ ${t("Pending")}: ${pendingTasks.length}
✅ ${t("Completed")}: ${userSummary.completedTasks}
🔄 ${t("Sync")}: ${this.teamCollaboration.collaborationSettings.realTimeUpdates ? t("Active") : t("Disabled")}`

    addMessage(statusText, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(
        t(
          `${userSummary.username}, you have ${userSummary.teamsJoined} teams, ${stats.sharedProjects} shared projects, and ${pendingTasks.length} pending assigned tasks`,
        ),
      )
    }

    return true
  }

  // Handle join team command
  handleJoinTeam(teamName) {
    // Mock implementation - in reality, this would handle team invitations
    const response = t(`Looking for invitation to join team "${teamName}"`)
    addMessage("🔍 " + response, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(response)
    }

    // Simulate finding invitation
    setTimeout(() => {
      addMessage(`✅ ${t("Joined team")} "${teamName}" ${t("successfully")}!`, false)
    }, 2000)

    return true
  }

  // Handle leave team command
  handleLeaveTeam(teamName) {
    const team = this.findTeamByName(teamName)

    if (!team) {
      const response = t(`Team "${teamName}" not found`)
      addMessage("❌ " + response, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(response)
      }

      return true
    }

    // Mock implementation - in reality, this would remove the user from the team
    const response = t(`Left team "${team.name}" successfully`)
    addMessage("👋 " + response, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(response)
    }

    return true
  }

  // Add personalized greeting command
  handleCollaborationGreeting() {
    const userSummary = this.teamCollaboration.getUserCollaborationSummary()
    const hour = new Date().getHours()
    let greeting = ""

    if (hour < 12) {
      greeting = t("Good morning")
    } else if (hour < 17) {
      greeting = t("Good afternoon")
    } else {
      greeting = t("Good evening")
    }

    const response = `${greeting}, ${userSummary.username}! ${t("You're part of")} ${userSummary.teamsJoined} ${t("teams")} ${t("with")} ${userSummary.pendingTasks} ${t("pending tasks")}.`

    addMessage("👋 " + response, false)

    if (typeof voiceSystem !== "undefined") {
      voiceSystem.speak(response)
    }

    return true
  }

  // Helper methods
  parseMemberInfo(memberInfo) {
    // Try to extract name and email from the input
    const emailMatch = memberInfo.match(/([^\s]+@[^\s]+)/i)
    const email = emailMatch ? emailMatch[1] : `${memberInfo.toLowerCase().replace(/\s+/g, "")}@example.com`
    let name = memberInfo.replace(emailMatch ? emailMatch[0] : "", "").trim()

    if (!name) {
      name = email.split("@")[0]
    }

    return { name, email }
  }

  findTeamByName(teamName) {
    return this.teamCollaboration.teams.find((team) => team.name.toLowerCase().includes(teamName.toLowerCase()))
  }

  findProjectByName(projectName) {
    return this.teamCollaboration.taskManager.projects.find((project) =>
      project.name.toLowerCase().includes(projectName.toLowerCase()),
    )
  }

  findTaskByName(taskName) {
    return this.teamCollaboration.taskManager.tasks.find((task) =>
      task.title.toLowerCase().includes(taskName.toLowerCase()),
    )
  }

  findMemberByName(memberName) {
    return this.teamCollaboration.teamMembers.find((member) =>
      member.name.toLowerCase().includes(memberName.toLowerCase()),
    )
  }

  getPriorityEmoji(priority) {
    const emojis = {
      Urgent: "🚨",
      High: "🔴",
      Medium: "🟡",
      Low: "🟢",
    }
    return emojis[priority] || "⚪"
  }

  getTimeAgo(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t("just now")
    if (diffMins < 60) return t(`${diffMins} minutes ago`)
    if (diffHours < 24) return t(`${diffHours} hours ago`)
    return t(`${diffDays} days ago`)
  }
}

// Mock dependencies for testing
const teamCollaboration = {
  teams: [],
  taskManager: { projects: [], tasks: [] },
  teamMembers: [],
  getCurrentUser: () => ({ id: "user1" }),
  getCollaborationStats: () => ({ totalTeams: 0, totalMembers: 0, sharedProjects: 0, sharedTasks: 0 }),
  getTeamActivity: () => [],
  getMemberTasks: () => [],
  getTeamProjects: () => [],
  collaborationSettings: { realTimeUpdates: true },
  createTeam: (name) => ({ id: "team1", name: name, members: [], projects: [] }),
  addTeamMember: (teamId, member) => ({ id: "member1", name: member.name, email: member.email }),
  shareProject: (projectId, teamId, options) => ({
    id: "sharedProject1",
    projectId: projectId,
    teamId: teamId,
    options: options,
  }),
  shareTask: (taskId, memberId, options) => ({
    id: "sharedTask1",
    taskId: taskId,
    memberId: memberId,
    options: options,
  }),
  getUserCollaborationSummary: () => ({
    username: process.env.USERNAME || "User",
    teamsJoined: 0,
    teamsCreated: 0,
    completedTasks: 0,
    pendingTasks: 0,
  }),
}

const teamCollaborationVoiceCommands = new TeamCollaborationVoiceCommands(teamCollaboration)

// Mock dependencies for testing
const addMessage = (message, isUser) => console.log(message)
const t = (key) => key
const voiceSystem = { speak: (text) => console.log("Speaking:", text) }
