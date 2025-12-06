export default class ThinkingTracker {
  constructor(callback) {
    this.callback = callback
    this.store = null
  }

  set(user, message) {
    this.store = { user, message, timestamp: Date.now() }
    this.#refresh()
  }

  clear() {
    this.store = null
    this.#refresh()
  }

  #refresh() {
    if (this.store) {
      this.callback(this.store)
    } else {
      this.callback(null)
    }
  }
}