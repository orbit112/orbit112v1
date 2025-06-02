// Team Collaboration System for EVE
// Add this to your scripts.js file

// Mock dependencies for testing
const taskManager = {
  projects: [],
  tasks: [],
}

const profileManager = {
  profile: {
    personal: {
      name: "John Doe",
      email: "john@example.com",
    },
  },
}

const addMessage = (message, isUser) => console.log(message)
const t = (key) => key
const voiceSystem = { speak: (text) => console.log("Speaking:", text) }
const eveSettings = { voice: { collaborationNotifications: true } }
const intelligentSuggestions = {
  trackInteraction: (action, details) => console.log("Tracked:", action, details),
}

class TeamCollaborationSystem {
  constructor(taskManager) {
    this.taskManager = taskManager
    this.teams = []
    this.teamMembers = []
    this.sharedProjects = []
    this.sharedTasks = []
    this.collaborationSettings = {
      autoSync: true,
      notifications: true,
      realTimeUpdates: true,
      shareByDefault: false,
    }
    this.teamIdCounter = 1
    this.memberIdCounter = 1

    this.initializeCollaboration()
  }

  // Initialize collaboration system
  initializeCollaboration() {
    this.loadCollaborationData()
    this.setupRealTimeSync()
    this.setupNotifications()
  }

  // Load collaboration data from storage
  loadCollaborationData() {
    try {
      const savedTeams = localStorage.getItem("eveTeams")
      if (savedTeams) {
        this.teams = JSON.parse(savedTeams)
        this.teamIdCounter = Math.max(...this.teams.map((t) => t.id), 0) + 1
      }

      const savedMembers = localStorage.getItem("eveTeamMembers")
      if (savedMembers) {
        this.teamMembers = JSON.parse(savedMembers)
        this.memberIdCounter = Math.max(...this.teamMembers.map((m) => m.id), 0) + 1
      }

      const savedSharedProjects = localStorage.getItem("eveSharedProjects")
      if (savedSharedProjects) {
        this.sharedProjects = JSON.parse(savedSharedProjects)
      }

      const savedSharedTasks = localStorage.getItem("eveSharedTasks")
      if (savedSharedTasks) {
        this.sharedTasks = JSON.parse(savedSharedTasks)
      }

      const savedSettings = localStorage.getItem("eveCollaborationSettings")
      if (savedSettings) {
        this.collaborationSettings = { ...this.collaborationSettings, ...JSON.parse(savedSettings) }
      }

      console.log(`Loaded ${this.teams.length} teams and ${this.teamMembers.length} members`)
    } catch (error) {
      console.error("Error loading collaboration data:", error)
    }
  }

  // Save collaboration data to storage
  saveCollaborationData() {
    try {
      localStorage.setItem("eveTeams", JSON.stringify(this.teams))
      localStorage.setItem("eveTeamMembers", JSON.stringify(this.teamMembers))
      localStorage.setItem("eveSharedProjects", JSON.stringify(this.sharedProjects))
      localStorage.setItem("eveSharedTasks", JSON.stringify(this.sharedTasks))
      localStorage.setItem("eveCollaborationSettings", JSON.stringify(this.collaborationSettings))
    } catch (error) {
      console.error("Error saving collaboration data:", error)
    }
  }

  // Create new team
  createTeam(name, description = "", options = {}) {
    const team = {
      id: this.teamIdCounter++,
      name: name.trim(),
      description: description.trim(),
      createdBy: process.env.USERNAME || profileManager.profile.personal.name || "User",
      createdDate: new Date().toISOString(),
      members: [this.getCurrentUser()], // Creator is automatically a member
      admins: [this.getCurrentUser().id], // Creator is admin
      projects: [],
      settings: {
        allowMemberInvites: options.allowMemberInvites || false,
        requireApproval: options.requireApproval || true,
        visibility: options.visibility || "private", // private, team, public
      },
      avatar: options.avatar || this.generateTeamAvatar(name),
      color: options.color || this.generateTeamColor(),
    }

    this.teams.push(team)
    this.saveCollaborationData()

    // Track interaction with username
    if (typeof intelligentSuggestions !== "undefined") {
      intelligentSuggestions.trackInteraction("create_team", {
        teamName: team.name,
        memberCount: team.members.length,
        createdBy: process.env.USERNAME || "unknown",
      })
    }

    return team
  }

  // Add team member
  addTeamMember(teamId, memberInfo) {
    const team = this.teams.find((t) => t.id === teamId)
    if (!team) return null

    // Check if user is admin
    const currentUser = this.getCurrentUser()
    if (!team.admins.includes(currentUser.id)) {
      throw new Error("Only team admins can add members")
    }

    const member = {
      id: this.memberIdCounter++,
      name: memberInfo.name.trim(),
      email: memberInfo.email.toLowerCase().trim(),
      role: memberInfo.role || "member", // admin, member, viewer
      joinedDate: new Date().toISOString(),
      invitedBy: currentUser.id,
      status: "invited", // invited, active, inactive
      avatar: memberInfo.avatar || this.generateMemberAvatar(memberInfo.name),
      permissions: this.getDefaultPermissions(memberInfo.role),
    }

    this.teamMembers.push(member)
    team.members.push(member)

    this.saveCollaborationData()

    // Send invitation (mock implementation)
    this.sendTeamInvitation(member, team)

    return member
  }

  // Share project with team
  shareProject(projectId, teamId, permissions = {}) {
    const project = this.taskManager.projects.find((p) => p.id === projectId)
    const team = this.teams.find((t) => t.id === teamId)

    if (!project || !team) return null

    const sharedProject = {
      id: Date.now(),
      projectId: projectId,
      teamId: teamId,
      sharedBy: this.getCurrentUser().id,
      sharedDate: new Date().toISOString(),
      permissions: {
        canEdit: permissions.canEdit || false,
        canAddTasks: permissions.canAddTasks || true,
        canAssignTasks: permissions.canAssignTasks || false,
        canDeleteTasks: permissions.canDeleteTasks || false,
        canInviteMembers: permissions.canInviteMembers || false,
        ...permissions,
      },
      settings: {
        notifyOnUpdates: true,
        allowComments: true,
        trackChanges: true,
      },
    }

    this.sharedProjects.push(sharedProject)

    // Add team reference to project
    if (!project.teams) project.teams = []
    project.teams.push({
      teamId: teamId,
      sharedDate: sharedProject.sharedDate,
      permissions: sharedProject.permissions,
    })

    // Add project to team
    if (!team.projects.includes(projectId)) {
      team.projects.push(projectId)
    }

    this.saveCollaborationData()

    // Notify team members
    this.notifyTeamMembers(teamId, "project_shared", {
      projectName: project.name,
      sharedBy: this.getCurrentUser().name,
    })

    return sharedProject
  }

  // Share task with team member
  shareTask(taskId, memberId, permissions = {}) {
    const task = this.taskManager.tasks.find((t) => t.id === taskId)
    const member = this.teamMembers.find((m) => m.id === memberId)

    if (!task || !member) return null

    const sharedTask = {
      id: Date.now(),
      taskId: taskId,
      memberId: memberId,
      sharedBy: this.getCurrentUser().id,
      sharedDate: new Date().toISOString(),
      permissions: {
        canEdit: permissions.canEdit || false,
        canComplete: permissions.canComplete || true,
        canComment: permissions.canComment || true,
        canReassign: permissions.canReassign || false,
        ...permissions,
      },
      assignmentType: permissions.assignmentType || "shared", // shared, assigned, delegated
    }

    this.sharedTasks.push(sharedTask)

    // Add assignment to task
    if (!task.assignments) task.assignments = []
    task.assignments.push({
      memberId: memberId,
      assignedBy: this.getCurrentUser().id,
      assignedDate: sharedTask.sharedDate,
      status: "assigned", // assigned, accepted, declined, completed
      permissions: sharedTask.permissions,
    })

    this.saveCollaborationData()

    // Notify assigned member
    this.notifyMember(memberId, "task_assigned", {
      taskTitle: task.title,
      assignedBy: this.getCurrentUser().name,
    })

    return sharedTask
  }

  // Get team projects
  getTeamProjects(teamId) {
    const team = this.teams.find((t) => t.id === teamId)
    if (!team) return []

    return team.projects
      .map((projectId) => {
        const project = this.taskManager.projects.find((p) => p.id === projectId)
        if (!project) return null

        const sharedInfo = this.sharedProjects.find((sp) => sp.projectId === projectId && sp.teamId === teamId)

        return {
          ...project,
          sharedInfo,
          teamTasks: this.getProjectTeamTasks(projectId, teamId),
          collaborators: this.getProjectCollaborators(projectId),
        }
      })
      .filter(Boolean)
  }

  // Get project team tasks
  getProjectTeamTasks(projectId, teamId) {
    const team = this.teams.find((t) => t.id === teamId)
    if (!team) return []

    return this.taskManager.tasks
      .filter((task) => task.projectId === projectId)
      .map((task) => {
        const assignments = task.assignments || []
        const teamAssignments = assignments.filter((a) => team.members.some((m) => m.id === a.memberId))

        return {
          ...task,
          assignments: teamAssignments,
          assignedMembers: teamAssignments.map((a) => this.teamMembers.find((m) => m.id === a.memberId)),
        }
      })
  }

  // Get project collaborators
  getProjectCollaborators(projectId) {
    const collaborators = []
    const project = this.taskManager.projects.find((p) => p.id === projectId)

    if (!project || !project.teams) return collaborators

    project.teams.forEach((teamRef) => {
      const team = this.teams.find((t) => t.id === teamRef.teamId)
      if (team) {
        team.members.forEach((member) => {
          if (!collaborators.find((c) => c.id === member.id)) {
            collaborators.push({
              ...member,
              teamName: team.name,
              permissions: teamRef.permissions,
            })
          }
        })
      }
    })

    return collaborators
  }

  // Get member's assigned tasks
  getMemberTasks(memberId) {
    return this.sharedTasks
      .filter((st) => st.memberId === memberId)
      .map((st) => {
        const task = this.taskManager.tasks.find((t) => t.id === st.taskId)
        return task
          ? {
              ...task,
              sharedInfo: st,
              assignedBy: this.teamMembers.find((m) => m.id === st.sharedBy),
            }
          : null
      })
      .filter(Boolean)
  }

  // Get team activity feed
  getTeamActivity(teamId, limit = 20) {
    const activities = []
    const team = this.teams.find((t) => t.id === teamId)

    if (!team) return activities

    // Project activities
    team.projects.forEach((projectId) => {
      const project = this.taskManager.projects.find((p) => p.id === projectId)
      if (project) {
        activities.push({
          id: `project_${projectId}`,
          type: "project_shared",
          timestamp: project.createdDate,
          actor: project.createdBy || "Unknown",
          target: project.name,
          description: `shared project "${project.name}"`,
        })
      }
    })

    // Task activities
    this.sharedTasks
      .filter((st) => {
        const task = this.taskManager.tasks.find((t) => t.id === st.taskId)
        return task && task.projectId && team.projects.includes(task.projectId)
      })
      .forEach((st) => {
        const task = this.taskManager.tasks.find((t) => t.id === st.taskId)
        const sharedBy = this.teamMembers.find((m) => m.id === st.sharedBy)
        const assignedTo = this.teamMembers.find((m) => m.id === st.memberId)

        activities.push({
          id: `task_${st.id}`,
          type: "task_assigned",
          timestamp: st.sharedDate,
          actor: sharedBy?.name || "Unknown",
          target: assignedTo?.name || "Unknown",
          description: `assigned task "${task?.title}" to ${assignedTo?.name}`,
        })
      })

    // Sort by timestamp and limit
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit)
  }

  // Get collaboration statistics
  getCollaborationStats(teamId = null) {
    const stats = {
      totalTeams: this.teams.length,
      totalMembers: this.teamMembers.length,
      sharedProjects: this.sharedProjects.length,
      sharedTasks: this.sharedTasks.length,
      activeCollaborations: 0,
      completionRate: 0,
    }

    if (teamId) {
      const team = this.teams.find((t) => t.id === teamId)
      if (team) {
        stats.teamMembers = team.members.length
        stats.teamProjects = team.projects.length
        stats.teamTasks = this.getTeamTasks(teamId).length
        stats.completedTasks = this.getTeamTasks(teamId).filter((t) => t.status === "completed").length

        if (stats.teamTasks > 0) {
          stats.completionRate = Math.round((stats.completedTasks / stats.teamTasks) * 100)
        }
      }
    }

    return stats
  }

  // Get team tasks
  getTeamTasks(teamId) {
    const team = this.teams.find((t) => t.id === teamId)
    if (!team) return []

    const teamTasks = []

    team.projects.forEach((projectId) => {
      const projectTasks = this.taskManager.tasks.filter((t) => t.projectId === projectId)
      teamTasks.push(...projectTasks)
    })

    return teamTasks
  }

  // Setup real-time synchronization
  setupRealTimeSync() {
    if (!this.collaborationSettings.realTimeUpdates) return

    // Mock real-time sync - in a real implementation, this would use WebSockets
    setInterval(() => {
      this.syncWithServer()
    }, 30000) // Sync every 30 seconds
  }

  // Mock server synchronization
  async syncWithServer() {
    try {
      // In a real implementation, this would sync with a server
      console.log("Syncing collaboration data with server...")

      // Simulate receiving updates
      const updates = this.generateMockUpdates()
      if (updates.length > 0) {
        this.processServerUpdates(updates)
      }
    } catch (error) {
      console.error("Sync error:", error)
    }
  }

  // Generate mock updates for demonstration
  generateMockUpdates() {
    const updates = []

    // Randomly generate some updates
    if (Math.random() > 0.8) {
      updates.push({
        type: "task_completed",
        taskId: 1,
        memberId: 1,
        timestamp: new Date().toISOString(),
      })
    }

    if (Math.random() > 0.9) {
      updates.push({
        type: "project_updated",
        projectId: 1,
        changes: { progress: Math.floor(Math.random() * 100) },
        timestamp: new Date().toISOString(),
      })
    }

    return updates
  }

  // Process server updates
  processServerUpdates(updates) {
    updates.forEach((update) => {
      switch (update.type) {
        case "task_completed":
          this.handleTaskCompletion(update)
          break
        case "project_updated":
          this.handleProjectUpdate(update)
          break
        case "member_joined":
          this.handleMemberJoined(update)
          break
      }
    })

    if (updates.length > 0) {
      this.saveCollaborationData()
      this.notifyUpdates(updates)
    }
  }

  // Handle task completion from team member
  handleTaskCompletion(update) {
    const task = this.taskManager.tasks.find((t) => t.id === update.taskId)
    const member = this.teamMembers.find((m) => m.id === update.memberId)

    if (task && member) {
      task.status = "completed"
      task.completedDate = update.timestamp
      task.completedBy = member.name

      addMessage(`✅ ${member.name} completed task: "${task.title}"`, false)
    }
  }

  // Handle project update from team member
  handleProjectUpdate(update) {
    const project = this.taskManager.projects.find((p) => p.id === update.projectId)

    if (project) {
      Object.assign(project, update.changes)
      addMessage(`📊 Project "${project.name}" updated - ${update.changes.progress}% complete`, false)
    }
  }

  // Handle new member joining
  handleMemberJoined(update) {
    const team = this.teams.find((t) => t.id === update.teamId)
    const member = update.member

    if (team) {
      team.members.push(member)
      this.teamMembers.push(member)

      addMessage(`👋 ${member.name} joined team "${team.name}"`, false)
    }
  }

  // Setup notifications
  setupNotifications() {
    if (!this.collaborationSettings.notifications) return

    // Check for notifications every 5 minutes
    setInterval(() => {
      this.checkNotifications()
    }, 300000)
  }

  // Check for pending notifications
  checkNotifications() {
    const notifications = this.getPendingNotifications()

    notifications.forEach((notification) => {
      this.showNotification(notification)
    })
  }

  // Get pending notifications
  getPendingNotifications() {
    const notifications = []
    const currentUser = this.getCurrentUser()

    // Check for assigned tasks
    const assignedTasks = this.getMemberTasks(currentUser.id)
    const pendingTasks = assignedTasks.filter((t) => t.status === "pending")

    if (pendingTasks.length > 0) {
      notifications.push({
        type: "assigned_tasks",
        message: `You have ${pendingTasks.length} assigned tasks pending`,
        count: pendingTasks.length,
      })
    }

    // Check for team invitations
    const invitations = this.teamMembers.filter((m) => m.email === currentUser.email && m.status === "invited")

    if (invitations.length > 0) {
      notifications.push({
        type: "team_invitations",
        message: `You have ${invitations.length} team invitations`,
        count: invitations.length,
      })
    }

    return notifications
  }

  // Show notification
  showNotification(notification) {
    addMessage(`🔔 ${notification.message}`, false)

    if (typeof voiceSystem !== "undefined" && eveSettings?.voice?.collaborationNotifications) {
      voiceSystem.speak(notification.message)
    }
  }

  // Send team invitation (mock implementation)
  sendTeamInvitation(member, team) {
    // In a real implementation, this would send an email or push notification
    console.log(`Sending invitation to ${member.email} for team "${team.name}"`)

    addMessage(`📧 Invitation sent to ${member.name} (${member.email}) for team "${team.name}"`, false)
  }

  // Notify team members
  notifyTeamMembers(teamId, eventType, data) {
    const team = this.teams.find((t) => t.id === teamId)
    if (!team) return

    team.members.forEach((member) => {
      this.notifyMember(member.id, eventType, data)
    })
  }

  // Notify individual member
  notifyMember(memberId, eventType, data) {
    const member = this.teamMembers.find((m) => m.id === memberId)
    if (!member) return

    // Enhanced notification with username context
    const notification = {
      to: member.email,
      from: process.env.USERNAME || "EVE User",
      type: eventType,
      data: data,
      timestamp: new Date().toISOString(),
    }

    // In a real implementation, this would send notifications via email, push, etc.
    console.log(`Notifying ${member.name} from ${process.env.USERNAME}:`, eventType, data)

    // Store notification for later retrieval
    if (!this.notifications) this.notifications = []
    this.notifications.push(notification)
    this.saveCollaborationData()
  }

  // Notify about updates
  notifyUpdates(updates) {
    if (updates.length === 1) {
      addMessage(`🔄 ${t("Collaboration update received")}`, false)
    } else {
      addMessage(`🔄 ${updates.length} ${t("collaboration updates received")}`, false)
    }
  }

  // Get current user
  getCurrentUser() {
    return {
      id: 1, // In a real implementation, this would be the actual user ID
      name: process.env.USERNAME || profileManager.profile.personal.name || "User",
      email: profileManager.profile.personal.email || `${(process.env.USERNAME || "user").toLowerCase()}@company.com`,
      avatar: profileManager.profile.personal.avatar || this.generateMemberAvatar(process.env.USERNAME || "User"),
    }
  }

  // Get default permissions for role
  getDefaultPermissions(role) {
    const permissions = {
      viewer: {
        canView: true,
        canComment: false,
        canEdit: false,
        canAssign: false,
        canDelete: false,
      },
      member: {
        canView: true,
        canComment: true,
        canEdit: true,
        canAssign: false,
        canDelete: false,
      },
      admin: {
        canView: true,
        canComment: true,
        canEdit: true,
        canAssign: true,
        canDelete: true,
      },
    }

    return permissions[role] || permissions.member
  }

  // Generate team avatar
  generateTeamAvatar(name) {
    const colors = ["#7e57c2", "#03a9f4", "#4caf50", "#ff9800", "#f44336", "#9c27b0"]
    const color = colors[name.length % colors.length]
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    return {
      type: "initials",
      initials,
      backgroundColor: color,
    }
  }

  // Generate member avatar
  generateMemberAvatar(name) {
    const colors = ["#7e57c2", "#03a9f4", "#4caf50", "#ff9800", "#f44336", "#9c27b0"]
    const color = colors[name.length % colors.length]
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    return {
      type: "initials",
      initials,
      backgroundColor: color,
    }
  }

  // Generate team color
  generateTeamColor() {
    const colors = ["#7e57c2", "#03a9f4", "#4caf50", "#ff9800", "#f44336", "#9c27b0", "#795548", "#607d8b"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Add method to get user-specific collaboration summary
  getUserCollaborationSummary() {
    const currentUser = this.getCurrentUser()
    const userTeams = this.teams.filter((team) => team.members.some((member) => member.id === currentUser.id))
    const userAssignedTasks = this.getMemberTasks(currentUser.id)
    const userCreatedTeams = this.teams.filter((team) => team.createdBy === (process.env.USERNAME || currentUser.name))

    return {
      username: process.env.USERNAME || currentUser.name,
      teamsJoined: userTeams.length,
      teamsCreated: userCreatedTeams.length,
      assignedTasks: userAssignedTasks.length,
      pendingTasks: userAssignedTasks.filter((t) => t.status === "pending").length,
      completedTasks: userAssignedTasks.filter((t) => t.status === "completed").length,
      totalCollaborations: userTeams.reduce((sum, team) => sum + team.projects.length, 0),
    }
  }
}

// Initialize team collaboration system
const teamCollaboration = new TeamCollaborationSystem(taskManager)
