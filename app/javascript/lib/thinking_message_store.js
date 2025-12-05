// TDD GREEN PHASE: Minimal implementation to make tests pass
// ThinkingMessageStore for ephemeral thinking messages
// Following the implementation plan from EPHEMERAL_THINKING_MESSAGES.md

export default class ThinkingMessageStore {
  constructor() {
    this.currentMessage = null
  }
  
  set(name, message) {
    this.currentMessage = { name, message, timestamp: Date.now() }
  }
  
  get() {
    return this.currentMessage
  }
  
  clear() {
    this.currentMessage = null
  }
  
  isEmpty() {
    return this.currentMessage === null
  }
}