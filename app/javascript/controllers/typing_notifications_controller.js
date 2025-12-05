import { Controller } from "@hotwired/stimulus"
import { cable } from "@hotwired/turbo-rails"
import { throttle } from "helpers/timing_helpers"
import { pageIsTurboPreview } from "helpers/turbo_helpers"
import TypingTracker from "models/typing_tracker"
import ThinkingTracker from "models/thinking_tracker"
import { createThinkingMessageElement } from "lib/thinking_message_renderer"

export default class extends Controller {
  static targets = [ "author", "indicator", "thinkingContainer" ]
  static classes = [ "active" ]

  async connect() {
    if (!pageIsTurboPreview()) {
      this.tracker = new TypingTracker(this.#update.bind(this))
      this.thinkingTracker = new ThinkingTracker(this.#updateThinking.bind(this))

      this.channel = await cable.subscribeTo(
        { channel: "TypingNotificationsChannel", room_id: Current.room.id },
        { received: this.#received.bind(this) }
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
        this.thinkingTracker.set(user.name, message)
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
    if (thinkingMessage) {
      // Clear existing thinking message and show new one
      this.thinkingContainerTarget.innerHTML = ""
      
      const messageEl = createThinkingMessageElement(thinkingMessage.name, thinkingMessage.message)
      this.thinkingContainerTarget.appendChild(messageEl)
      
      this.thinkingContainerTarget.classList.add("thinking-messages--active")
    } else {
      this.thinkingContainerTarget.classList.remove("thinking-messages--active")
    }
  }

  #throttledSend = throttle(action => this.#send(action))
}
