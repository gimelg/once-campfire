import { Controller } from "@hotwired/stimulus"
import { cable } from "@hotwired/turbo-rails"
import { throttle } from "helpers/timing_helpers"
import { pageIsTurboPreview } from "helpers/turbo_helpers"
import TypingTracker from "models/typing_tracker"
import ThinkingTracker from "models/thinking_tracker"
import { createThinkingMessageElement } from "lib/thinking_message_renderer"

export default class extends Controller {
  static targets = [ "author", "indicator" ]
  static classes = [ "active" ]

  async connect() {
    if (!pageIsTurboPreview()) {
      this.tracker = new TypingTracker(this.#update.bind(this))
      this.thinkingTracker = new ThinkingTracker(this.#updateThinking.bind(this))

      this.channel = await cable.subscribeTo(
        { channel: "TypingNotificationsChannel", room_id: Current.room.id },
        { 
          received: this.#received.bind(this)
        }
      )
    }
  }

  disconnect() {
    this.tracker?.close()
    this.channel?.unsubscribe()
  }

  start({ target }) {
    if (target.value) {
      this.#throttledSend("start")
    } else {
      this.#send("stop")
    }
  }

  stop() {
    this.#send("stop");
  }

  #received({ action, user, message }) {
    if (user.id !== Current.user.id) {
      if (action === "start") {
        this.tracker.add(user.name)
      } else if (action === "stop") {
        this.tracker.remove(user.name)
      } else if (action === "thinking") {
        this.thinkingTracker.set(user, message)
      } else if (action === "stop_thinking") {
        this.thinkingTracker.clear()
      }
    }
  }

  #send(action) {
    this.channel.send({ action })
  }

  #update(message) {
    this.authorTarget.textContent = message
    this.indicatorTarget.classList.toggle(this.activeClass, !!message)
  }

  #updateThinking(thinkingMessage) {
    // Complete any ongoing bot typewriter animations before showing thinking message
    this.#completeOngoingTypewriterEffects()
    
    // Find the messages container in the page
    let messagesContainer = document.querySelector('.messages')
    if (!messagesContainer) {
      messagesContainer = document.querySelector(`#room_${Current.room.id}_messages`)
    }
    if (!messagesContainer) {
      messagesContainer = document.querySelector(`[data-messages-target="messages"]`)
    }
    if (!messagesContainer) {
      return
    }

    // Remove any existing thinking message
    const existingThinking = messagesContainer.querySelector('.thinking-message-container')
    if (existingThinking) {
      existingThinking.remove()
    }

    if (thinkingMessage) {
      // Create and append new thinking message
      const thinkingContainer = document.createElement('div')
      thinkingContainer.className = 'thinking-message-container'
      
      const messageEl = createThinkingMessageElement(thinkingMessage)
      
      thinkingContainer.appendChild(messageEl)
      messagesContainer.appendChild(thinkingContainer)
      
      // Auto-scroll to show the thinking message
      this.#scrollToThinkingMessage(thinkingContainer)
    }
  }

  #completeOngoingTypewriterEffects() {
    // Find the messages controller and complete any active typewriters
    const messagesController = this.application.getControllerForElementAndIdentifier(
      document.querySelector('[data-controller*="messages"]'),
      "messages"
    )
    
    if (messagesController) {
      messagesController.completeOngoingBotAnimations()
    }
  }

  #scrollToThinkingMessage(element) {
    // Scroll the thinking message into view
    setTimeout(() => {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end',
        inline: 'nearest'
      })
    }, 100) // Small delay to ensure DOM is updated
  }

  #throttledSend = throttle(action => this.#send(action))
}
