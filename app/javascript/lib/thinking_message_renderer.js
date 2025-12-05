// TDD GREEN PHASE: DOM rendering functions for thinking messages
// Following the implementation plan from EPHEMERAL_THINKING_MESSAGES.md
// Using existing CSS conventions from the codebase

export function createThinkingMessageElement(authorName, content) {
  const messageEl = document.createElement("div")
  messageEl.className = "message message--thinking"
  
  const authorEl = document.createElement("div")
  authorEl.className = "message__author"
  authorEl.textContent = authorName // Safe text insertion
  
  const bodyEl = document.createElement("div")
  bodyEl.className = "message__body"
  
  const bodyContentEl = document.createElement("div")
  bodyContentEl.className = "message__body-content message__body-content--thinking"
  bodyContentEl.textContent = content // Safe text insertion - HTML is escaped
  
  bodyEl.appendChild(bodyContentEl)
  messageEl.appendChild(authorEl)
  messageEl.appendChild(bodyEl)
  
  return messageEl
}

export function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}