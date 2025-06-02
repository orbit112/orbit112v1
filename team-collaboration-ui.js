// Team Collaboration UI Integration for EVE
// Add this to your scripts.js file

class TeamCollaborationUI {
  constructor(teamCollaboration) {
    this.teamCollaboration = teamCollaboration
    this.initializeCollaborationUI()
  }

  // Initialize collaboration UI
  initializeCollaborationUI() {
    this.addCollaborationButton()
    this.setupCollaborationNotifications()
  }

  // Add collaboration button to UI
  addCollaborationButton() {
    const actionsContainer = document.querySelector(".actions-container")
    if (!actionsContainer) return

    const collaborationButton = document.createElement("button")
    collaborationButton.className = "action-button collaboration-button"
    collaborationButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    `
    collaborationButton.title = t("Team Collaboration")
    collaborationButton.onclick = () => this.openCollaborationDashboard()

    actionsContainer.appendChild(collaborationButton)
  }

  // Open collaboration dashboard
  openCollaborationDashboard() {
    const dashboard = this.createCollaborationDashboard()
    document.body.appendChild(dashboard)

    // Add modal open animation
    setTimeout(() => {
      dashboard.classList.add("open")
    }, 10)
  }

  // Create collaboration dashboard modal
  createCollaborationDashboard() {
    const modal = document.createElement("div")
    modal.className = "collaboration-dashboard-modal"
    modal.innerHTML = this.getCollaborationDashboardHTML()

    // Add event listeners
    this.setupCollaborationEventListeners(modal)

    return modal
  }

  // Update the collaboration dashboard to show personalized information
  getCollaborationDashboardHTML() {
    const stats = this.teamCollaboration.getCollaborationStats()
    const teams = this.teamCollaboration.teams.slice(0, 3)
    const currentUser = this.teamCollaboration.getCurrentUser()
    const assignedTasks = this.teamCollaboration.getMemberTasks(currentUser.id).slice(0, 5)
    const userSummary = this.teamCollaboration.getUserCollaborationSummary()

    return `
    <div class="collaboration-dashboard-content">
      <div class="collaboration-dashboard-header">
        <h2>${t("Team Collaboration")} - ${userSummary.username}</h2>
        <button class="close-collaboration-dashboard">&times;</button>
      </div>
      
      <div class="user-collaboration-summary">
        <div class="user-info">
          <div class="user-avatar" style="background-color: #7e57c2">
            ${userSummary.username.substring(0, 2).toUpperCase()}
          </div>
          <div class="user-details">
            <div class="user-name">${userSummary.username}</div>
            <div class="user-stats">
              ${userSummary.teamsCreated} ${t("teams created")} • ${userSummary.teamsJoined} ${t("teams joined")} • ${userSummary.completedTasks} ${t("tasks completed")}
            </div>
          </div>
        </div>
      </div>
      
      <div class="collaboration-dashboard-tabs">
        <button class="tab-button active" data-tab="overview">${t("Overview")}</button>
        <button class="tab-button" data-tab="teams">${t("Teams")}</button>
        <button class="tab-button" data-tab="projects">${t("Shared Projects")}</button>
        <button class="tab-button" data-tab="tasks">${t("Assigned Tasks")}</button>
        <button class="tab-button" data-tab="create">${t("Create & Share")}</button>
      </div>
      
      <div class="collaboration-dashboard-body">
        <!-- Overview Tab -->
        <div class="collaboration-tab-content active" id="overview-tab">
          <div class="collaboration-stats-grid">
            <div class="collaboration-stat-card">
              <div class="stat-number">${userSummary.teamsJoined}</div>
              <div class="stat-label">${t("Teams Joined")}</div>
            </div>
            <div class="collaboration-stat-card">
              <div class="stat-number">${userSummary.teamsCreated}</div>
              <div class="stat-label">${t("Teams Created")}</div>
            </div>
            <div class="collaboration-stat-card">
              <div class="stat-number">${userSummary.totalCollaborations}</div>
              <div class="stat-label">${t("Shared Projects")}</div>
            </div>
            <div class="collaboration-stat-card">
              <div class="stat-number">${assignedTasks.length}</div>
              <div class="stat-label">${t("Assigned to You")}</div>
            </div>
          </div>
          
          <div class="collaboration-sections">
            <div class="collaboration-section">
              <h3>${t("Your Teams")}</h3>
              <div class="team-list">
                ${teams
                  .map(
                    (team) => `
                  <div class="team-item" data-team-id="${team.id}">
                    <div class="team-avatar" style="background-color: ${team.color}">
                      ${team.avatar.initials}
                    </div>
                    <div class="team-content">
                      <div class="team-name">${team.name}</div>
                      <div class="team-meta">
                        ${team.members.length} ${t("members")} • ${team.projects.length} ${t("projects")}
                        ${team.createdBy === userSummary.username ? ` • ${t("Created by you")}` : ""}
                      </div>
                    </div>
                    <button class="team-action-btn" data-team-id="${team.id}" data-action="view">👁️</button>
                  </div>
                `,
                  )
                  .join("")}
                ${teams.length === 0 ? `<div class="empty-state">${t("No teams yet.")} ${userSummary.username}, ${t("create your first team!")}</div>` : ""}
              </div>
            </div>
            
            <div class="collaboration-section">
              <h3>${t("Tasks Assigned to")} ${userSummary.username}</h3>
              <div class="assigned-task-list">
                ${assignedTasks
                  .map(
                    (task) => `
                  <div class="assigned-task-item" data-task-id="${task.id}">
                    <div class="task-priority ${task.priority.toLowerCase()}">${this.getPriorityEmoji(task.priority)}</div>
                    <div class="task-content">
                      <div class="task-title">${task.title}</div>
                      <div class="task-meta">
                        ${task.assignedBy ? `${t("Assigned by")} ${task.assignedBy.name}` : ""}
                        ${task.dueDate ? ` • ${t("Due")}: ${new Date(task.dueDate).toLocaleDateString()}` : ""}
                      </div>
                    </div>
                    <button class="complete-assigned-task-btn" data-task-id="${task.id}">✓</button>
                  </div>
                `,
                  )
                  .join("")}
                ${assignedTasks.length === 0 ? `<div class="empty-state">${userSummary.username}, ${t("you have no assigned tasks")}</div>` : ""}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Rest of the tabs remain the same -->
        ${this.getRestOfTabsHTML(teams, userSummary)}
      </div>
    </div>
  `
  }

  // Helper method to get the rest of the tabs HTML
  getRestOfTabsHTML(teams, userSummary) {
    return `
    <!-- Teams Tab -->
    <div class="collaboration-tab-content" id="teams-tab">
      <div class="teams-header">
        <h3>${userSummary.username}'s ${t("Teams")}</h3>
        <button id="create-team-btn" class="primary-button">${t("Create Team")}</button>
      </div>
      <div id="teams-list" class="teams-grid">
        <!-- Teams will be populated here -->
      </div>
    </div>
    
    <!-- Shared Projects Tab -->
    <div class="collaboration-tab-content" id="projects-tab">
      <div class="projects-header">
        <h3>${t("Projects Shared with")} ${userSummary.username}</h3>
        <select id="project-team-filter">
          <option value="all">${t("All Teams")}</option>
          ${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join("")}
        </select>
      </div>
      <div id="shared-projects-list" class="shared-projects-grid">
        <!-- Shared projects will be populated here -->
      </div>
    </div>
    
    <!-- Assigned Tasks Tab -->
    <div class="collaboration-tab-content" id="tasks-tab">
      <div class="tasks-header">
        <h3>${t("Tasks Assigned to")} ${userSummary.username}</h3>
        <select id="assigned-task-filter">
          <option value="all">${t("All Tasks")}</option>
          <option value="pending">${t("Pending")}</option>
          <option value="in-progress">${t("In Progress")}</option>
          <option value="completed">${t("Completed")}</option>
        </select>
      </div>
      <div id="assigned-tasks-list" class="assigned-tasks-list">
        <!-- Assigned tasks will be populated here -->
      </div>
    </div>
    
    <!-- Create & Share Tab -->
    <div class="collaboration-tab-content" id="create-tab">
      <div class="create-share-forms">
        <div class="form-section">
          <h3>${t("Create Team as")} ${userSummary.username}</h3>
          <form id="create-team-form">
            <input type="text" id="team-name" placeholder="${t("Team name")}" required>
            <textarea id="team-description" placeholder="${t("Description (optional)")}" rows="3"></textarea>
            <div class="form-row">
              <label>
                <input type="checkbox" id="allow-member-invites"> ${t("Allow members to invite others")}
              </label>
            </div>
            <button type="submit">${t("Create Team")}</button>
          </form>
        </div>
        
        <div class="form-section">
          <h3>${t("Share Project")}</h3>
          <form id="share-project-form">
            <select id="project-to-share" required>
              <option value="">${t("Select project")}</option>
              ${this.teamCollaboration.taskManager.projects
                .map((project) => `<option value="${project.id}">${project.name}</option>`)
                .join("")}
            </select>
            <select id="team-to-share-with" required>
              <option value="">${t("Select team")}</option>
              ${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join("")}
            </select>
            <div class="permissions-section">
              <h4>${t("Permissions")}</h4>
              <label><input type="checkbox" id="can-edit" checked> ${t("Can edit project")}</label>
              <label><input type="checkbox" id="can-add-tasks" checked> ${t("Can add tasks")}</label>
              <label><input type="checkbox" id="can-assign-tasks"> ${t("Can assign tasks")}</label>
              <label><input type="checkbox" id="can-invite-members"> ${t("Can invite members")}</label>
            </div>
            <button type="submit">${t("Share Project")}</button>
          </form>
        </div>
        
        <div class="form-section">
          <h3>${t("Invite Team Member")}</h3>
          <form id="invite-member-form">
            <select id="team-for-member" required>
              <option value="">${t("Select team")}</option>
              ${teams.map((team) => `<option value="${team.id}">${team.name}</option>`).join("")}
            </select>
            <input type="text" id="member-name" placeholder="${t("Member name")}" required>
            <input type="email" id="member-email" placeholder="${t("Email address")}" required>
            <select id="member-role">
              <option value="member">${t("Member")}</option>
              <option value="admin">${t("Admin")}</option>
              <option value="viewer">${t("Viewer")}</option>
            </select>
            <button type="submit">${t("Send Invitation")}</button>
          </form>
        </div>
      </div>
    </div>
  `
  }

  // Setup collaboration event listeners
  setupCollaborationEventListeners(modal) {
    // Close button
    modal.querySelector(".close-collaboration-dashboard").addEventListener("click", () => {
      this.closeCollaborationDashboard(modal)
    })

    // Tab switching
    modal.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        this.switchCollaborationTab(modal, e.target.dataset.tab)
      })
    })

    // Complete assigned task buttons
    modal.querySelectorAll(".complete-assigned-task-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const taskId = Number.parseInt(e.target.dataset.taskId)
        this.completeAssignedTask(taskId, modal)
      })
    })

    // Create team form
    modal.querySelector("#create-team-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.createTeamFromForm(modal)
    })

    // Share project form
    modal.querySelector("#share-project-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.shareProjectFromForm(modal)
    })

    // Invite member form
    modal.querySelector("#invite-member-form").addEventListener("submit", (e) => {
      e.preventDefault()
      this.inviteMemberFromForm(modal)
    })

    // Filters
    modal.querySelector("#project-team-filter").addEventListener("change", () => {
      this.updateSharedProjectsList(modal)
    })

    modal.querySelector("#assigned-task-filter").addEventListener("change", () => {
      this.updateAssignedTasksList(modal)
    })

    // Initial population
    this.updateTeamsList(modal)
    this.updateSharedProjectsList(modal)
    this.updateAssignedTasksList(modal)
  }

  // Switch collaboration tab
  switchCollaborationTab(modal, tabId) {
    // Update tab buttons
    modal.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tabId)
    })

    // Update tab content
    modal.querySelectorAll(".collaboration-tab-content").forEach((content) => {
      content.classList.remove("active")
    })

    modal.querySelector(`#${tabId}-tab`).classList.add("active")
  }

  // Update teams list
  updateTeamsList(modal) {
    const teamsList = modal.querySelector("#teams-list")
    const teams = this.teamCollaboration.teams

    teamsList.innerHTML = teams
      .map(
        (team) => `
        <div class="team-card" data-team-id="${team.id}">
          <div class="team-card-header">
            <div class="team-avatar" style="background-color: ${team.color}">
              ${team.avatar.initials}
            </div>
            <div class="team-info">
              <div class="team-name">${team.name}</div>
              <div class="team-description">${team.description || t("No description")}</div>
            </div>
          </div>
          <div class="team-card-stats">
            <div class="team-stat">
              <span class="stat-number">${team.members.length}</span>
              <span class="stat-label">${t("Members")}</span>
            </div>
            <div class="team-stat">
              <span class="stat-number">${team.projects.length}</span>
              <span class="stat-label">${t("Projects")}</span>
            </div>
          </div>
          <div class="team-card-actions">
            <button class="team-action-btn" data-team-id="${team.id}" data-action="view">${t("View")}</button>
            <button class="team-action-btn" data-team-id="${team.id}" data-action="manage">${t("Manage")}</button>
          </div>
        </div>
      `,
      )
      .join("")

    if (teams.length === 0) {
      teamsList.innerHTML = `<div class="empty-state">${t("No teams yet. Create your first team to start collaborating!")}</div>`
    }

    // Add event listeners to team action buttons
    teamsList.querySelectorAll(".team-action-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const teamId = Number.parseInt(e.target.dataset.teamId)
        const action = e.target.dataset.action
        this.handleTeamAction(teamId, action, modal)
      })
    })
  }

  // Update shared projects list
  updateSharedProjectsList(modal) {
    const projectsList = modal.querySelector("#shared-projects-list")
    const teamFilter = modal.querySelector("#project-team-filter").value

    let sharedProjects = []

    if (teamFilter === "all") {
      this.teamCollaboration.teams.forEach((team) => {
        const teamProjects = this.teamCollaboration.getTeamProjects(team.id)
        sharedProjects.push(...teamProjects.map((p) => ({ ...p, teamName: team.name })))
      })
    } else {
      const teamId = Number.parseInt(teamFilter)
      const team = this.teamCollaboration.teams.find((t) => t.id === teamId)
      if (team) {
        sharedProjects = this.teamCollaboration.getTeamProjects(teamId).map((p) => ({ ...p, teamName: team.name }))
      }
    }

    projectsList.innerHTML = sharedProjects
      .map(
        (project) => `
        <div class="shared-project-card" data-project-id="${project.id}">
          <div class="project-header">
            <div class="project-title">${project.name}</div>
            <div class="project-team">${project.teamName}</div>
          </div>
          <div class="project-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${project.progress}%"></div>
            </div>
            <span class="progress-text">${project.progress}%</span>
          </div>
          <div class="project-collaborators">
            <div class="collaborator-avatars">
              ${project.collaborators
                .slice(0, 3)
                .map(
                  (c) => `
                <div class="collaborator-avatar" style="background-color: ${c.avatar.backgroundColor}" title="${c.name}">
                  ${c.avatar.initials}
                </div>
              `,
                )
                .join("")}
              ${project.collaborators.length > 3 ? `<div class="collaborator-count">+${project.collaborators.length - 3}</div>` : ""}
            </div>
          </div>
          <div class="project-actions">
            <button class="project-action-btn" data-project-id="${project.id}" data-action="view">${t("View")}</button>
            <button class="project-action-btn" data-project-id="${project.id}" data-action="tasks">${t("Tasks")}</button>
          </div>
        </div>
      `,
      )
      .join("")

    if (sharedProjects.length === 0) {
      projectsList.innerHTML = `<div class="empty-state">${t("No shared projects found")}</div>`
    }

    // Add event listeners to project action buttons
    projectsList.querySelectorAll(".project-action-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const projectId = Number.parseInt(e.target.dataset.projectId)
        const action = e.target.dataset.action
        this.handleProjectAction(projectId, action, modal)
      })
    })
  }

  // Update assigned tasks list
  updateAssignedTasksList(modal) {
    const tasksList = modal.querySelector("#assigned-tasks-list")
    const statusFilter = modal.querySelector("#assigned-task-filter").value
    const currentUser = this.teamCollaboration.getCurrentUser()

    let assignedTasks = this.teamCollaboration.getMemberTasks(currentUser.id)

    if (statusFilter !== "all") {
      assignedTasks = assignedTasks.filter((task) => task.status === statusFilter)
    }

    tasksList.innerHTML = assignedTasks
      .map(
        (task) => `
        <div class="assigned-task-card" data-task-id="${task.id}">
          <div class="task-priority ${task.priority.toLowerCase()}">${this.getPriorityEmoji(task.priority)}</div>
          <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              ${task.assignedBy ? `${t("Assigned by")} ${task.assignedBy.name}` : ""}
              ${task.category ? ` • ${task.category}` : ""}
              ${task.dueDate ? ` • ${t("Due")}: ${new Date(task.dueDate).toLocaleDateString()}` : ""}
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ""}
          </div>
          <div class="task-status">
            <span class="status-badge ${task.status}">${t(task.status)}</span>
          </div>
          ${
            task.status === "pending"
              ? `
            <div class="task-actions">
              <button class="complete-assigned-task-btn" data-task-id="${task.id}">✓</button>
              <button class="task-action-btn" data-task-id="${task.id}" data-action="comment">💬</button>
            </div>
          `
              : ""
          }
        </div>
      `,
      )
      .join("")

    if (assignedTasks.length === 0) {
      tasksList.innerHTML = `<div class="empty-state">${t("No assigned tasks found")}</div>`
    }

    // Add event listeners to task action buttons
    tasksList.querySelectorAll(".complete-assigned-task-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const taskId = Number.parseInt(e.target.dataset.taskId)
        this.completeAssignedTask(taskId, modal)
      })
    })

    tasksList.querySelectorAll(".task-action-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const taskId = Number.parseInt(e.target.dataset.taskId)
        const action = e.target.dataset.action
        this.handleTaskAction(taskId, action, modal)
      })
    })
  }

  // Handle team actions
  handleTeamAction(teamId, action, modal) {
    const team = this.teamCollaboration.teams.find((t) => t.id === teamId)
    if (!team) return

    switch (action) {
      case "view":
        this.showTeamDetails(team, modal)
        break
      case "manage":
        this.showTeamManagement(team, modal)
        break
    }
  }

  // Handle project actions
  handleProjectAction(projectId, action, modal) {
    const project = this.teamCollaboration.taskManager.projects.find((p) => p.id === projectId)
    if (!project) return

    switch (action) {
      case "view":
        addMessage(`📊 ${t("Viewing project")}: "${project.name}"`, false)
        break
      case "tasks":
        this.showProjectTasks(project, modal)
        break
    }
  }

  // Handle task actions
  handleTaskAction(taskId, action, modal) {
    const currentUser = this.teamCollaboration.getCurrentUser()
    const task = this.teamCollaboration.getMemberTasks(currentUser.id).find((t) => t.id === taskId)
    if (!task) return

    switch (action) {
      case "comment":
        this.showTaskComments(task, modal)
        break
    }
  }

  // Complete assigned task
  completeAssignedTask(taskId, modal) {
    const task = this.teamCollaboration.taskManager.tasks.find((t) => t.id === taskId)
    if (task) {
      task.status = "completed"
      task.completedDate = new Date().toISOString()

      addMessage(`✅ ${t("Task completed")}: "${task.title}"`, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`Task completed: ${task.title}`))
      }

      // Refresh the UI
      this.updateAssignedTasksList(modal)
      this.refreshCollaborationOverview(modal)
    }
  }

  // Create team from form
  createTeamFromForm(modal) {
    const name = modal.querySelector("#team-name").value.trim()
    const description = modal.querySelector("#team-description").value.trim()
    const allowMemberInvites = modal.querySelector("#allow-member-invites").checked

    if (!name) return

    try {
      const team = this.teamCollaboration.createTeam(name, description, {
        allowMemberInvites,
      })

      addMessage(`🎯 ${t("Team created")}: "${team.name}"`, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`Team ${team.name} created successfully`))
      }

      // Clear form
      modal.querySelector("#create-team-form").reset()

      // Refresh UI
      this.updateTeamsList(modal)
      this.refreshCollaborationOverview(modal)
    } catch (error) {
      addMessage(`❌ ${t("Error creating team")}: ${error.message}`, false)
    }
  }

  // Share project from form
  shareProjectFromForm(modal) {
    const projectId = Number.parseInt(modal.querySelector("#project-to-share").value)
    const teamId = Number.parseInt(modal.querySelector("#team-to-share-with").value)
    const canEdit = modal.querySelector("#can-edit").checked
    const canAddTasks = modal.querySelector("#can-add-tasks").checked
    const canAssignTasks = modal.querySelector("#can-assign-tasks").checked
    const canInviteMembers = modal.querySelector("#can-invite-members").checked

    if (!projectId || !teamId) return

    try {
      const sharedProject = this.teamCollaboration.shareProject(projectId, teamId, {
        canEdit,
        canAddTasks,
        canAssignTasks,
        canInviteMembers,
      })

      const project = this.teamCollaboration.taskManager.projects.find((p) => p.id === projectId)
      const team = this.teamCollaboration.teams.find((t) => t.id === teamId)

      addMessage(`🤝 ${t("Project shared")}: "${project.name}" ${t("with team")} "${team.name}"`, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`Project ${project.name} shared with team ${team.name}`))
      }

      // Clear form
      modal.querySelector("#share-project-form").reset()

      // Refresh UI
      this.updateSharedProjectsList(modal)
      this.refreshCollaborationOverview(modal)
    } catch (error) {
      addMessage(`❌ ${t("Error sharing project")}: ${error.message}`, false)
    }
  }

  // Invite member from form
  inviteMemberFromForm(modal) {
    const teamId = Number.parseInt(modal.querySelector("#team-for-member").value)
    const name = modal.querySelector("#member-name").value.trim()
    const email = modal.querySelector("#member-email").value.trim()
    const role = modal.querySelector("#member-role").value

    if (!teamId || !name || !email) return

    try {
      const member = this.teamCollaboration.addTeamMember(teamId, {
        name,
        email,
        role,
      })

      const team = this.teamCollaboration.teams.find((t) => t.id === teamId)

      addMessage(`👥 ${t("Invitation sent")}: ${member.name} ${t("invited to")} "${team.name}"`, false)

      if (typeof voiceSystem !== "undefined") {
        voiceSystem.speak(t(`Invitation sent to ${member.name}`))
      }

      // Clear form
      modal.querySelector("#invite-member-form").reset()

      // Refresh UI
      this.updateTeamsList(modal)
      this.refreshCollaborationOverview(modal)
    } catch (error) {
      addMessage(`❌ ${t("Error inviting member")}: ${error.message}`, false)
    }
  }

  // Show team details
  showTeamDetails(team, modal) {
    const activity = this.teamCollaboration.getTeamActivity(team.id, 10)
    const stats = this.teamCollaboration.getCollaborationStats(team.id)

    addMessage(`👥 ${t("Team Details")}: "${team.name}"`, false)
    addMessage(
      `📊 ${stats.teamMembers} ${t("members")}, ${stats.teamProjects} ${t("projects")}, ${stats.completionRate}% ${t("completion rate")}`,
      false,
    )

    if (activity.length > 0) {
      addMessage(`📈 ${t("Recent Activity")}:`, false)
      activity.slice(0, 3).forEach((act) => {
        addMessage(`• ${act.actor} ${act.description}`, false)
      })
    }
  }

  // Show project tasks
  showProjectTasks(project, modal) {
    const projectTasks = this.teamCollaboration.taskManager.tasks.filter((t) => t.projectId === project.id)

    addMessage(`📋 ${t("Tasks in project")}: "${project.name}"`, false)

    if (projectTasks.length === 0) {
      addMessage(`${t("No tasks in this project yet")}`, false)
    } else {
      projectTasks.slice(0, 5).forEach((task) => {
        const priorityEmoji = this.getPriorityEmoji(task.priority)
        const statusEmoji = task.status === "completed" ? "✅" : "⏳"
        addMessage(`${statusEmoji} ${priorityEmoji} ${task.title}`, false)
      })

      if (projectTasks.length > 5) {
        addMessage(`... ${t("and")} ${projectTasks.length - 5} ${t("more tasks")}`, false)
      }
    }
  }

  // Show task comments (mock implementation)
  showTaskComments(task, modal) {
    addMessage(`💬 ${t("Comments for task")}: "${task.title}"`, false)
    addMessage(`${t("Comment feature coming soon!")}`, false)
  }

  // Refresh collaboration overview
  refreshCollaborationOverview(modal) {
    // Close and reopen the dashboard to refresh all data
    this.closeCollaborationDashboard(modal)
    setTimeout(() => {
      this.openCollaborationDashboard()
    }, 100)
  }

  // Close collaboration dashboard
  closeCollaborationDashboard(modal) {
    modal.classList.remove("open")
    setTimeout(() => {
      modal.remove()
    }, 300)
  }

  // Update the collaboration summary to be more personalized
  showCollaborationSummary() {
    const stats = this.teamCollaboration.getCollaborationStats()
    const currentUser = this.teamCollaboration.getCurrentUser()
    const assignedTasks = this.teamCollaboration.getMemberTasks(currentUser.id)
    const pendingTasks = assignedTasks.filter((t) => t.status === "pending")
    const userSummary = this.teamCollaboration.getUserCollaborationSummary()

    if (userSummary.teamsJoined > 0 || pendingTasks.length > 0) {
      let summary = `🤝 ${t("Welcome back")}, ${userSummary.username}! `

      if (userSummary.teamsJoined > 0) {
        summary += `${t("You're collaborating in")} ${userSummary.teamsJoined} ${t("teams")}`
      }

      if (pendingTasks.length > 0) {
        summary += `${userSummary.teamsJoined > 0 ? " " + t("with") + " " : ""}${pendingTasks.length} ${t("tasks waiting for you")}`
      }

      addMessage(summary, false)

      if (typeof voiceSystem !== "undefined" && eveSettings?.voice?.collaborationSummary) {
        voiceSystem.speak(summary)
      }
    }
  }

  // Get priority emoji
  getPriorityEmoji(priority) {
    const emojis = {
      Urgent: "🚨",
      High: "🔴",
      Medium: "🟡",
      Low: "🟢",
    }
    return emojis[priority] || "⚪"
  }
}

// Mock dependencies for testing
const addMessage = (message, isUser) => console.log(message)
const t = (key) => key
const voiceSystem = { speak: (text) => console.log("Speaking:", text) }
const eveSettings = { voice: { collaborationSummary: true } }

// Initialize team collaboration UI
const teamCollaboration = {
  getCollaborationStats: () => ({ totalTeams: 2, totalMembers: 15, sharedProjects: 5, completionRate: 80 }),
  teams: [
    {
      id: 1,
      name: "Alpha Team",
      members: [1, 2, 3],
      projects: [1, 2],
      color: "#FF5733",
      avatar: { initials: "AT" },
      createdBy: "John Doe",
    },
    {
      id: 2,
      name: "Beta Team",
      members: [4, 5, 6],
      projects: [3, 4],
      color: "#3498DB",
      avatar: { initials: "BT" },
      createdBy: "Jane Smith",
    },
  ],
  getCurrentUser: () => ({ id: 1, name: "John Doe" }),
  getMemberTasks: (userId) => [
    {
      id: 101,
      title: "Design Sprint",
      priority: "High",
      assignedBy: { name: "Jane Smith" },
      dueDate: "2024-07-15",
      status: "pending",
    },
    {
      id: 102,
      title: "Code Review",
      priority: "Medium",
      assignedBy: { name: "Alice Johnson" },
      dueDate: "2024-07-20",
      status: "in-progress",
    },
  ],
  getTeamProjects: (teamId) => [
    {
      id: 201,
      name: "Project Phoenix",
      progress: 60,
      collaborators: [{ name: "John Doe", avatar: { initials: "JD", backgroundColor: "#2ecc71" } }],
    },
    {
      id: 202,
      name: "Project Nova",
      progress: 30,
      collaborators: [{ name: "Jane Smith", avatar: { initials: "JS", backgroundColor: "#e74c3c" } }],
    },
  ],
  createTeam: (name, description, options) => ({
    id: 3,
    name,
    description,
    ...options,
    color: "#8e44ad",
    avatar: { initials: name.substring(0, 2).toUpperCase() },
    createdBy: "John Doe",
  }),
  shareProject: (projectId, teamId, permissions) => ({ projectId, teamId, permissions }),
  addTeamMember: (teamId, member) => ({ teamId, ...member }),
  getTeamActivity: (teamId, limit) => [{ actor: "John Doe", description: "updated project status" }],
  taskManager: {
    projects: [
      {
        id: 301,
        name: "Marketing Campaign",
        progress: 40,
        collaborators: [{ name: "Alice Johnson", avatar: { initials: "AJ", backgroundColor: "#f39c12" } }],
      },
      {
        id: 302,
        name: "Product Launch",
        progress: 80,
        collaborators: [{ name: "Bob Williams", avatar: { initials: "BW", backgroundColor: "#9b59b6" } }],
      },
    ],
    tasks: [
      { id: 401, title: "Finalize Presentation", priority: "Urgent", projectId: 301, status: "pending" },
      { id: 402, title: "Prepare Demo", priority: "High", projectId: 302, status: "completed" },
    ],
  },
  getUserCollaborationSummary: () => ({
    username: "John Doe",
    teamsCreated: 1,
    teamsJoined: 2,
    completedTasks: 10,
    totalCollaborations: 5,
  }),
}

const teamCollaborationUI = new TeamCollaborationUI(teamCollaboration)
