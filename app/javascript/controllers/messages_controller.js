import { Controller } from "@hotwired/stimulus"
import { nextEventLoopTick } from "helpers/timing_helpers"
import ClientMessage from "models/client_message"
import MessageFormatter, { ThreadStyle } from "models/message_formatter"
import MessagePaginator from "models/message_paginator"
import ScrollManager from "models/scroll_manager"

export default class extends Controller {
  static targets = [ "latest", "message", "body", "messages", "template" ]
  static classes = [ "firstOfDay", "formatted", "me", "mentioned", "threaded" ]
  static values = { pageUrl: String }

  #clientMessage
  #paginator
  #formatter
  #scrollManager

  // Lifecycle

  initialize() {
    this.#formatter = new MessageFormatter(Current.user.id, {
      firstOfDay: this.firstOfDayClass,
      formatted: this.formattedClass,
      me: this.meClass,
      mentioned: this.mentionedClass,
      threaded: this.threadedClass,
    })
  }

  connect() {
    this.#clientMessage = new ClientMessage(this.templateTarget)
    this.#paginator = new MessagePaginator(this.messagesTarget, this.pageUrlValue, this.#formatter, this.#allContentViewed.bind(this))
    this.#scrollManager = new ScrollManager(this.messagesTarget)

    if (this.#hasSearchResult) {
      this.#highlightSearchResult()
    } else {
      this.#scrollManager.autoscroll(true)
    }

    this.#paginator.monitor()
  }

  disconnect() {
    this.#paginator.disconnect()
  }

  messageTargetConnected(target) {
    this.#formatter.format(target, ThreadStyle.thread)
  }

  bodyTargetConnected(target) {
    this.#formatter.formatBody(target)
    this.#setupBotResponseAnimation(target)
  }

  // Actions

  async beforeStreamRender(event) {
    const target = event.detail.newStream.getAttribute("target")

    if (target === this.messagesTarget.id) {
      // Complete any ongoing bot animations before new message arrives
      this.completeOngoingBotAnimations()
      
      const render = event.detail.render
      const upToDate = this.#paginator.upToDate

      if (upToDate) {
        event.detail.render = async (streamElement) => {
          const didScroll = await this.#scrollManager.autoscroll(false, async () => {
            await render(streamElement)
            await nextEventLoopTick()

            this.#positionLastMessage()
            this.#playSoundForLastMessage()
            this.#paginator.trimExcessMessages(true)
          })
          if (!didScroll) {
            this.latestTarget.hidden = false
          }
        }
      } else {
        this.latestTarget.hidden = false
      }
    }
  }

  async returnToLatest() {
    this.latestTarget.hidden = true
    await this.#ensureUpToDate()
    this.#scrollManager.autoscroll(true)
  }

  async editMyLastMessage() {
    const editorEmpty = document.querySelector("#composer trix-editor").matches(":empty")

    if (editorEmpty && this.#paginator.upToDate) {
      this.#myLastMessage?.querySelector(".message__edit-btn")?.click()
    }
  }


  // Outlet actions

  async insertPendingMessage(clientMessageId, node) {
    await this.#ensureUpToDate()

    return this.#scrollManager.autoscroll(true, async () => {
      const message = this.#clientMessage.render(clientMessageId, node)
      this.messagesTarget.insertAdjacentHTML("beforeend", message)
    })
  }

  updatePendingMessage(clientMessageId, body) {
    this.#clientMessage.update(clientMessageId, body)
  }

  failPendingMessage(clientMessageId) {
    this.#clientMessage.failed(clientMessageId)
  }

  // Callbacks

  #allContentViewed() {
    this.latestTarget.hidden = true
  }


  // Internal

  async #ensureUpToDate() {
    if (!this.#paginator.upToDate) {
      await this.#paginator.resetToLastPage()
    }
  }

  #highlightSearchResult() {
    const highlightId = location.pathname.split("@").pop()
    const highlightMessage = this.messagesTarget.querySelector(`.message[data-message-id="${highlightId}"]`)
    if (highlightMessage) {
      highlightMessage.classList.add("search-highlight")
      highlightMessage.scrollIntoView({ behavior: "instant", block: "center" })
    }

    this.#paginator.upToDate = false
  }

  get #hasSearchResult() {
    return location.pathname.includes("@")
  }

  get #lastMessage() {
    return this.messagesTarget.children[this.messagesTarget.children.length - 1]
  }

  get #myLastMessage() {
    const myMessages = this.messagesTarget.querySelectorAll(`.${this.meClass}`)
    return myMessages[myMessages.length - 1]
  }

  #positionLastMessage() {
    const followingMessage = this.#followingMessage(this.#lastMessage)

    if (followingMessage) {
      followingMessage.before(this.#lastMessage)
    }
  }

  #playSoundForLastMessage() {
    const soundTarget = this.#lastMessage.querySelector(".sound")

    if (soundTarget) {
      this.dispatch("play", { target: soundTarget })
    }
  }

  #followingMessage(message) {
    const messageSortValue = this.#sortValue(message)
    let followingMessage = null
    let previousMessage = message.previousElementSibling

    while (messageSortValue < this.#sortValue(previousMessage)) {
      followingMessage = previousMessage
      previousMessage = previousMessage.previousElementSibling;
    }

    return followingMessage
  }

  #sortValue(node) {
    return (node && parseInt(node.dataset.sortValue)) || 0
  }

  #setupBotResponseAnimation(target) {
    // Check if this message body has bot animation enabled
    if (target.hasAttribute('data-bot-response-animation')) {
      const botResponseContent = target.querySelector('.bot-response-content')
      
      if (botResponseContent) {
        // Disable CSS animation and implement JavaScript typewriter
        botResponseContent.classList.remove('bot-response-content')
        this.#startJavaScriptTypewriter(botResponseContent)
      }
    }
  }

  #activeTypewriters = new Map()

  #measureTextHeight(element, text) {
    // Create a temporary clone to measure full height
    const clone = element.cloneNode(true)
    clone.textContent = text
    clone.style.visibility = 'hidden'
    clone.style.position = 'absolute'
    clone.style.height = 'auto'
    clone.style.minHeight = 'auto'
    
    element.parentNode.appendChild(clone)
    const height = clone.offsetHeight
    element.parentNode.removeChild(clone)
    
    return height
  }

  #startJavaScriptTypewriter(element) {
    const fullText = element.textContent.trim()
    const words = fullText.split(' ')
    
    // Measure the full height the text will occupy
    const fullHeight = this.#measureTextHeight(element, fullText)
    
    // Clear the element and reserve the space
    element.innerHTML = ''
    element.style.overflow = 'hidden'
    element.style.minHeight = `${fullHeight}px` // Reserve exact space needed
    
    let currentWordIndex = 0
    const wordDelay = 100 // 100ms between words (10 words/second)
    let timeoutId
    
    const typeNextWord = () => {
      if (currentWordIndex < words.length) {
        const word = words[currentWordIndex]
        element.textContent += (currentWordIndex > 0 ? ' ' : '') + word
        currentWordIndex++
        
        // Auto-scroll if user was near bottom and content increased height
        this.#autoScrollIfNeeded()
        
        timeoutId = setTimeout(typeNextWord, wordDelay)
      } else {
        // Animation completed, remove from active list
        this.#activeTypewriters.delete(element)
      }
    }
    
    // Store the typewriter state for potential completion
    this.#activeTypewriters.set(element, {
      fullText,
      timeoutId,
      complete: () => {
        clearTimeout(timeoutId)
        element.textContent = fullText
        this.#activeTypewriters.delete(element)
      }
    })
    
    // Start typing after a brief delay
    setTimeout(typeNextWord, 200)
  }
  
  #completeAllActiveTypewriters() {
    this.#activeTypewriters.forEach((typewriter, element) => {
      typewriter.complete()
    })
  }
  
  #autoScrollIfNeeded() {
    // Check if user is near bottom of messages container
    const threshold = 100
    const isNearBottom = (this.messagesTarget.scrollTop + this.messagesTarget.clientHeight) >= (this.messagesTarget.scrollHeight - threshold)
    
    if (isNearBottom) {
      // Scroll to bottom to keep new content visible
      this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
    }
  }

  completeOngoingBotAnimations() {
    // Complete any ongoing JavaScript typewriter effects
    this.#completeAllActiveTypewriters()
  }
}
