// Sound Manager for EVE
// Add this to your scripts.js file or create a new file

// Sound manager
const SoundManager = {
  sounds: {},

  // Initialize sounds
  init: function () {
    this.loadSounds()
  },

  // Load all sounds
  loadSounds: function () {
    const soundFiles = {
      notification: "sounds/notification.mp3",
      notification2: "sounds/notification2.mp3",
      notification3: "sounds/notification3.mp3",
      startup: "sounds/startup.mp3",
      click: "sounds/click.mp3",
      success: "sounds/success.mp3",
      error: "sounds/error.mp3",
    }

    // Preload sounds
    for (const [name, path] of Object.entries(soundFiles)) {
      this.sounds[name] = new Audio(path)
    }
  },

  // Play a sound
  play: function (soundName) {
    // Check if eveSettings is defined
    if (typeof eveSettings === "undefined" || !eveSettings || !eveSettings.sound.enabled) return

    const sound = this.sounds[soundName]
    if (sound) {
      // Clone the sound to allow overlapping playback
      const soundClone = sound.cloneNode()
      soundClone.volume = eveSettings.sound.volume
      soundClone.play().catch((err) => console.error("Error playing sound:", err))
    }
  },
}

// Initialize sound manager when the app starts
document.addEventListener("DOMContentLoaded", () => {
  SoundManager.init()

  // Play startup sound
  setTimeout(() => {
    SoundManager.play("startup")
  }, 500)
})

// Add sound effects to UI interactions
function addSoundEffects() {
  // Add click sound to buttons
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      SoundManager.play("click")
    })
  })

  // Override addMessage to play notification sound
  const originalAddMessage = window.addMessage
  window.addMessage = (message, isUser) => {
    originalAddMessage(message, isUser)
    if (!isUser) {
      SoundManager.play("notification")
    }
  }
}

// Call this after DOM is loaded
document.addEventListener("DOMContentLoaded", addSoundEffects)
