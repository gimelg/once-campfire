export function createThinkingMessageElement(thinkingMessage) {
  const { user, message: content } = thinkingMessage
  const authorName = user.name
  
  // Create the message structure with avatar
  const messageEl = document.createElement("div")
  messageEl.className = "message message--thinking"
  
  // Bot avatar with user's profile link (like real messages)  
  const avatarEl = document.createElement("figure")
  avatarEl.className = "avatar message__avatar"
  
  // Create avatar link like real messages
  const avatarLink = document.createElement("a")
  avatarLink.href = `/users/${user.id}`
  avatarLink.className = "btn avatar"
  avatarLink.setAttribute("data-turbo-frame", "_top")
  avatarLink.title = authorName
  
  // Create avatar image using the URL from backend
  const avatarImg = document.createElement("img")
  avatarImg.src = user.avatar_url
  avatarImg.alt = authorName
  avatarImg.width = 48
  avatarImg.height = 48
  avatarImg.setAttribute("aria-hidden", "true")
  
  avatarLink.appendChild(avatarImg)
  avatarEl.appendChild(avatarLink)
  
  // Message body
  const bodyEl = document.createElement("div")
  bodyEl.className = "message__body"
  
  const bodyContentEl = document.createElement("div")  
  bodyContentEl.className = "message__body-content"
  
  // Meta section with author and timestamp
  const metaEl = document.createElement("div")
  metaEl.className = "message__meta"
  
  const headingEl = document.createElement("h3")
  headingEl.className = "message__heading"
  
  const authorEl = document.createElement("span")
  authorEl.className = "message__author"
  const strongEl = document.createElement("strong")
  strongEl.textContent = authorName
  authorEl.appendChild(strongEl)
  
  const timestampEl = document.createElement("a")
  timestampEl.className = "message__permalink"
  timestampEl.href = "#"
  timestampEl.style.pointerEvents = "none" // Make it non-clickable for thinking messages
  
  const timestampSpan = document.createElement("span")
  timestampSpan.className = "message__timestamp"
  const now = new Date()
  const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  timestampSpan.textContent = timeString
  timestampEl.appendChild(timestampSpan)
  
  // Message content with wave animation to indicate processing
  const contentEl = document.createElement("div")
  contentEl.className = "thinking-content"
  contentEl.textContent = content
  contentEl.setAttribute("data-text", content)
  
  // Assemble the structure
  headingEl.appendChild(authorEl)
  headingEl.appendChild(document.createTextNode(" "))
  headingEl.appendChild(timestampEl)
  metaEl.appendChild(headingEl)
  bodyContentEl.appendChild(metaEl)
  bodyContentEl.appendChild(contentEl)
  bodyEl.appendChild(bodyContentEl)
  messageEl.appendChild(avatarEl)
  messageEl.appendChild(bodyEl)
  
  // Styling for visibility and thinking appearance
  messageEl.style.cssText = "visibility: visible !important; opacity: 0.8;"
  
  return messageEl
}

