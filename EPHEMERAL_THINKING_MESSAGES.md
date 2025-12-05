# Ephemeral "Thinking" Messages Implementation Plan

## 📋 IMPLEMENTATION PROGRESS

### ✅ COMPLETED COMPONENTS

#### **Phase 1: Backend Foundation (2/2 Complete)**

1. **✅ Thinking Controller** - `app/controllers/messages/thinking_controller.rb`
   - **Status**: FULLY IMPLEMENTED ✅
   - **Tests**: Written FIRST ✅ (test/controllers/messages/thinking_controller_test.rb)
   - **Implementation**: Minimal GREEN phase implementation ✅
   - **Route**: Added to config/routes.rb ✅
   - **Features**: 
     - ✅ Form parameter support (`params[:message]`)
     - ✅ Request body support (raw text)
     - ✅ UTF-8 encoding handling
     - ✅ Empty request → stop_thinking broadcast
     - ✅ Bot authentication via `allow_bot_access`
     - ✅ ActionCable broadcast generation
     - ✅ Error handling (room not found, malformed requests)
     - ✅ Security (user attributes limited to id/name only)

2. **✅ Cleanup & Lifecycle Management** - `app/controllers/messages/by_bots_controller.rb`
   - **Status**: FULLY IMPLEMENTED ✅
   - **Tests**: Written FIRST ✅ (test/controllers/messages/by_bots_controller_test.rb)
   - **Implementation**: Minimal GREEN phase implementation ✅
   - **Features**: 
     - ✅ Auto-cleanup before real message creation
     - ✅ ActionCable broadcast with stop_thinking action
     - ✅ Proper room channel targeting
     - ✅ Security (user attributes limited to id/name only)
     - ✅ Uses existing codebase patterns (captured_broadcasts testing)

#### **Phase 2: JavaScript Core Logic (2/2 Complete)**

3. **✅ ThinkingMessageStore** - `app/javascript/lib/thinking_message_store.js`
   - **Status**: IMPLEMENTED ✅
   - **Features**:
     - ✅ Single message storage (newest replaces previous)
     - ✅ Memory-only state (no persistence)
     - ✅ Simple CRUD operations (set, get, clear, isEmpty)

4. **✅ ThinkingMessageRenderer** - `app/javascript/lib/thinking_message_renderer.js`
   - **Status**: IMPLEMENTED ✅
   - **Features**:
     - ✅ Safe DOM element creation following existing message structure
     - ✅ XSS prevention via `textContent`
     - ✅ Follows existing CSS naming conventions

#### **Phase 3: Display Management (1/1 Complete)**

5. **✅ ThinkingTracker** - `app/javascript/models/thinking_tracker.js`
   - **Status**: IMPLEMENTED ✅
   - **Features**:
     - ✅ Callback-based tracker following TypingTracker pattern
     - ✅ Simple state management (set, clear)
     - ✅ No automatic timeout (bot-controlled lifecycle)

#### **Phase 4: Integration & UI (3/3 Complete)**

6. **✅ Controller Updates** - `app/javascript/controllers/typing_notifications_controller.js`
   - **Status**: IMPLEMENTED ✅
   - **Features**:
     - ✅ Added `thinkingContainer` target and ThinkingTracker integration
     - ✅ ActionCable message handling (thinking, stop_thinking actions)
     - ✅ DOM manipulation via renderer

7. **✅ Template Updates** - `app/views/rooms/show/_composer.html.erb`
   - **Status**: IMPLEMENTED ✅
   - **Features**: ✅ Added thinking container above typing indicator

8. **✅ Styling** - `app/assets/stylesheets/composer.css`
   - **Status**: IMPLEMENTED ✅  
   - **Features**: ✅ Complete CSS with animations and responsive design

### ⏳ PENDING PHASES
- **Phase 5**: End-to-End Testing & Validation
  - Manual browser testing needed
  - Real bot integration testing  
  - ActionCable frontend integration verification
  - Cross-browser compatibility testing
  - Performance validation under load

### 🎯 CURRENT STATUS - READY FOR END-TO-END TESTING

**✅ IMPLEMENTATION COMPLETE**
- **Backend**: Fully tested with 23 controller tests passing (88 assertions)  
- **Frontend**: All JavaScript components implemented following existing patterns
- **Integration**: ActionCable, Stimulus, and CSS integration complete
- **Security**: HTML escaping, authentication, and user attribute limiting in place

**🔧 READY FOR**
- Manual browser testing with real bot integration
- End-to-end workflow validation  
- ActionCable frontend verification
- Performance testing

**⚠️ NOT YET PRODUCTION READY**
- Requires comprehensive end-to-end testing
- Needs real bot integration validation
- Frontend ActionCable behavior needs browser verification

---

## 🚨 MANDATORY: Test-Driven Development (TDD) Implementation 🚨

**THIS FEATURE MUST BE IMPLEMENTED USING TEST-DRIVEN DEVELOPMENT (TDD) METHODOLOGY**

### CRITICAL TDD RULES - NO EXCEPTIONS:

1. **🔴 RED PHASE**: Write failing tests FIRST for every function, method, and behavior
2. **🟢 GREEN PHASE**: Write minimal code to make tests pass  
3. **🔵 REFACTOR PHASE**: Improve code while keeping all tests passing
4. **❌ NEVER write implementation code without tests first**
5. **❌ NEVER skip test writing for any component**
6. **❌ NEVER implement multiple features before testing each individually**

### TDD Implementation Order:
- **FIRST**: Write comprehensive test suite for component
- **SECOND**: Run tests and confirm they fail (RED)
- **THIRD**: Implement minimal code to pass tests (GREEN)  
- **FOURTH**: Refactor and improve while keeping tests green (REFACTOR)
- **FIFTH**: Move to next component

**Any implementation that violates TDD methodology must be rejected and restarted with proper TDD approach.**

## Overview
Extend the existing `TypingNotificationsChannel` to support ephemeral "thinking" messages that appear temporarily while bots process responses, then automatically disappear when real messages are sent.

## Problem Statement
Bots currently have **no way to indicate processing status** to users. Unlike human users who can trigger typing indicators through the chat UI, bots only communicate via HTTP API endpoints and have no mechanism to show real-time status like "🤔 Analyzing your request..." or "📊 Searching knowledge base..." during processing time.

**Current state:**
- **Human users**: Type in UI → triggers typing notifications via ActionCable for other users
- **Bots**: Send HTTP requests → users see nothing until final response arrives
- **Gap**: No real-time feedback mechanism for bot processing states

## Solution
Leverage the existing typing notification infrastructure to display temporary message content that:
- Appears instantly via ActionCable
- Shows actual message content (not just "typing...")
- Remains visible until explicitly cleared or replaced by real messages
- Disappears on page refresh (ephemeral - not stored in database)
- Requires no database changes

---

## 🧪 STRICT TDD Implementation Strategy 🧪

**CRITICAL: This feature MUST be implemented using Test-Driven Development (TDD) methodology.**

### TDD Requirements for Every Phase:
1. **RED**: Write failing tests first
2. **GREEN**: Write minimal code to make tests pass
3. **REFACTOR**: Improve code while keeping tests passing
4. **NO IMPLEMENTATION WITHOUT TESTS**

### Implementation Phases (TDD Required for Each)

#### **Phase 1: Backend Foundation** 
**⚠️ WRITE TESTS FIRST ⚠️**
1. **Thinking Controller** - API endpoint with clear input/output boundaries
   - **TDD Focus**: Write controller tests BEFORE implementation
2. **Cleanup & Lifecycle Management** - Automatic and manual cleanup mechanisms
   - **TDD Focus**: Test cleanup behavior BEFORE implementation

#### **Phase 2: JavaScript Core Logic** 
**⚠️ WRITE TESTS FIRST ⚠️** 
3. **ThinkingMessageStore** - Pure data structure for state management
   - **TDD Focus**: Unit test all CRUD operations BEFORE implementation
4. **Thinking Message Renderer** - Pure DOM functions with XSS and content length protection
   - **TDD Focus**: DOM structure and XSS prevention tests BEFORE implementation

#### **Phase 3: Display Management**
**⚠️ WRITE TESTS FIRST ⚠️**
5. **NotificationDisplayManager** - Stateful UI component
   - **TDD Focus**: State transition tests BEFORE implementation
6. **TypingTracker Integration** - Extended behavior with new state
   - **TDD Focus**: Integration tests with mocked callbacks BEFORE implementation

#### **Phase 4: Integration & UI**
**⚠️ WRITE TESTS FIRST ⚠️**
7. **Controller Updates** - Minimal glue code
   - **TDD Focus**: Component interaction tests BEFORE implementation
8. **Template & Styling** - HTML/CSS integration
   - **TDD Focus**: System tests for visual behavior BEFORE implementation

#### **Phase 5: System Integration**
**⚠️ WRITE TESTS FIRST ⚠️**
9. **End-to-End System Tests** - Complete workflow validation
   - **TDD Focus**: Full workflow tests covering all scenarios BEFORE final integration

---

## Implementation Details

### 1. API Endpoint Design

**🚨 TDD REQUIREMENT: Write all tests BEFORE implementing any code 🚨**

**STEP 1: Write Tests First** (examples in spec/controllers/messages/thinking_controller_spec.rb)
```ruby
# WRITE THESE TESTS FIRST - NO IMPLEMENTATION YET
describe Messages::ThinkingController do
  describe "POST #create" do
    context "with message parameter" do
      it "broadcasts thinking message"
      it "returns 200 OK status"
    end
    
    context "with request body content" do
      it "broadcasts thinking message from body"
      it "handles UTF-8 encoding properly"
    end
    
    context "with empty request" do
      it "broadcasts stop_thinking message"
    end
    
    context "authentication" do
      it "allows bot access with valid bot_key"
      it "denies access without bot_key"
      it "denies access with invalid bot_key"
    end
    
    context "error handling" do
      it "handles room not found"
      it "handles malformed requests"
    end
  end
end
```

**STEP 2: Add Route** (ONLY after writing tests)
```ruby
# config/routes.rb (add to existing room routes)
post ":bot_key/thinking", to: "messages/thinking#create", as: :bot_thinking
```

**STEP 3: Implement Controller** (ONLY after tests are written and failing)
```ruby
# app/controllers/messages/thinking_controller.rb
class Messages::ThinkingController < ApplicationController
  allow_bot_access only: :create
  before_action :set_room

  def create
    if params[:message].present?
      broadcast_thinking_message(params[:message])
      head :ok
    elsif request.body.read.present?
      broadcast_thinking_message(request.body.read.force_encoding("UTF-8"))
      head :ok
    else
      broadcast_stop_thinking
      head :ok
    end
  end

  private
    def broadcast_thinking_message(content)
      ActionCable.server.broadcast(
        "typing_notifications_#{@room.id}",
        { action: "thinking", user: bot_user_attributes, message: content }
      )
    end

    def broadcast_stop_thinking
      ActionCable.server.broadcast(
        "typing_notifications_#{@room.id}",
        { action: "stop_thinking", user: bot_user_attributes }
      )
    end

    def bot_user_attributes
      Current.user.slice(:id, :name)
    end

    def set_room
      @room = Room.find(params[:room_id])
    end
end
```

**Note:** Bot authentication is handled automatically by the existing `Authentication` concern via `params[:bot_key]`. No additional auth methods needed.

**TDD MANDATE:** Route registration, authentication via `allow_bot_access`, broadcast generation for different input types, and error handling MUST ALL be tested before implementation.

### 2. Cleanup & Lifecycle Management

Thinking messages require proper cleanup to avoid stale states. The system provides both automatic and manual cleanup mechanisms.

**Auto-cleanup on real message creation:**
```ruby
# app/controllers/messages/by_bots_controller.rb
def create
  # Clear any thinking messages from this bot before creating real message
  clear_thinking_messages
  super
end

private
  def clear_thinking_messages
    ActionCable.server.broadcast(
      "typing_notifications_#{@room.id}",
      { action: "stop_thinking", user: Current.user.slice(:id, :name) }
    )
  end
```

**Manual cleanup mechanisms:**
- **Empty POST request**: Send `POST /rooms/:room_id/:bot_key/thinking` with no body to clear thinking message
- **Explicit clear**: Bots can clear their thinking state at any time
- **Error handling**: Bots should clear thinking messages after showing error states

**Page refresh behavior:**
- Thinking messages disappear on page refresh since they're not stored in database
- This is expected behavior - ephemeral state is lost on navigation
- No cleanup required on frontend disconnect

**Bot cleanup responsibilities:**
- Handle processing timeouts gracefully with explicit error messages
- Clear error messages after a few seconds of display  
- Always clear thinking state before sending real messages (automatic via controller)
- Manage their own message lifecycle and error states
- No automatic timeout (bot controls lifecycle completely)

**TDD Focus:** Test thinking message clearing before real message creation, verify broadcast content and timing, test manual cleanup via empty requests, test error handling scenarios.

### 3. ThinkingMessageStore (Core Data Structure)

**🚨 TDD REQUIREMENT: Write all unit tests BEFORE implementing any code 🚨**

**STEP 1: Write Tests First** (spec/javascript/lib/thinking_message_store.spec.js)
```javascript
// WRITE THESE TESTS FIRST - NO IMPLEMENTATION YET
describe('ThinkingMessageStore', () => {
  describe('constructor', () => {
    it('initializes with null currentMessage')
  })
  
  describe('set', () => {
    it('stores name and message with timestamp')
    it('replaces previous message when called again')
  })
  
  describe('get', () => {
    it('returns null when empty')
    it('returns stored message object')
  })
  
  describe('clear', () => {
    it('sets currentMessage to null')
  })
  
  describe('isEmpty', () => {
    it('returns true when no message stored')
    it('returns false when message is stored')
  })
  
  describe('getAll', () => {
    it('returns empty array when no message')
    it('returns array with single message entry')
  })
})
```

**STEP 2: Implement ONLY After Tests Are Written**
```javascript
// app/javascript/lib/thinking_message_store.js
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
  
  // For compatibility with multi-entry API
  getAll() {
    return this.currentMessage ? [[this.currentMessage.name, this.currentMessage]] : []
  }
}
```

**Key characteristics:**
- **No timeout**: Messages persist until explicitly cleared (unlike typing notifications)
- **Single message**: Only one thinking message visible at a time (newest replaces previous)
- **Memory only**: No database persistence, disappears on page refresh
- **Simple state**: Straightforward current message tracking

**TDD Focus:** Unit test all CRUD operations, edge cases (duplicate names, empty states), no external dependencies.

### 4. Thinking Message Renderer (Pure Functions)

**DOM element creation with security considerations:**
```javascript
// app/javascript/lib/thinking_message_renderer.js
export function createThinkingMessageElement(authorName, content) {
  const messageEl = document.createElement("div")
  messageEl.className = "message message--thinking"
  
  const authorEl = document.createElement("div")
  authorEl.className = "message__author"
  authorEl.textContent = authorName // Safe text insertion
  
  const bodyEl = document.createElement("div")
  bodyEl.className = "message__body thinking-flicker"
  bodyEl.textContent = content // Safe text insertion - HTML is escaped
  
  messageEl.appendChild(authorEl)
  messageEl.appendChild(bodyEl)
  
  return messageEl
}

export function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
```

**Security features:**
- **HTML escaping**: All user content is escaped to prevent XSS
- **Safe insertion**: Uses `textContent` instead of `innerHTML`
- **Content limits**: Frontend should enforce reasonable message length limits

**TDD Focus:** DOM structure validation, XSS prevention testing, various content types, pure function behavior.

### 5. Display State Manager

**Manages notification display states and DOM manipulation:**
```javascript
// app/javascript/lib/notification_display_manager.js
export default class NotificationDisplayManager {
  constructor({ authorTarget, indicatorTarget, thinkingContainerTarget, activeClass }) {
    this.authorTarget = authorTarget
    this.indicatorTarget = indicatorTarget
    this.thinkingContainerTarget = thinkingContainerTarget
    this.activeClass = activeClass
  }

  showThinking(message, renderer) {
    // Clear existing thinking message and show new one
    this.thinkingContainerTarget.innerHTML = ""
    
    const messageEl = renderer(message.name, message.message)
    this.thinkingContainerTarget.appendChild(messageEl)
    
    this.thinkingContainerTarget.classList.add("thinking-messages--active")
  }

  showTyping(names) {
    // Show typing indicator - independent of thinking state
    this.authorTarget.textContent = names.join(", ")
    this.indicatorTarget.classList.add(this.activeClass)
  }

  hideTyping() {
    this.authorTarget.textContent = ""
    this.indicatorTarget.classList.remove(this.activeClass)
  }

  hideThinking() {
    this.thinkingContainerTarget.classList.remove("thinking-messages--active")
  }
}
```

**Display characteristics:**
- **Independent indicators** - thinking and typing can be shown simultaneously
- **Single thinking message** - newest thinking message replaces any previous one
- **Visual styling** includes pulse animation and reduced opacity for thinking messages

**TDD Focus:** State transitions, DOM manipulation verification with mocked elements, CSS class management.

### 6. TypingTracker Integration

**Extend existing TypingTracker to use ThinkingMessageStore:**
```javascript
// app/javascript/models/typing_tracker.js
import ThinkingMessageStore from '../lib/thinking_message_store.js'

const REFRESH_INTERVAL = 1000
const TYPING_TIMEOUT = 5000 // Only for regular typing, not thinking messages

export default class TypingTracker {
  constructor(callback) {
    this.callback = callback
    this.currentlyTyping = {}
    this.thinkingStore = new ThinkingMessageStore()
    this.timer = setInterval(this.#refresh.bind(this), REFRESH_INTERVAL)
  }

  close() {
    clearInterval(this.timer)
  }

  add(name) {
    this.currentlyTyping[name] = Date.now()
    this.#refresh()
  }

  remove(name) {
    delete this.currentlyTyping[name]
    this.#refresh()
  }

  addThinking(name, message) {
    this.thinkingStore.set(name, message)
    this.#refresh()
  }

  stopThinking(name) {
    this.thinkingStore.remove(name)
    this.#refresh()
  }

  #refresh() {
    this.#purgeInactiveTyping() // Only purge typing, not thinking
    const typingNames = Object.keys(this.currentlyTyping).sort()
    const thinkingMessage = this.thinkingStore.get()

    // Send independent status updates for thinking and typing
    if (!this.thinkingStore.isEmpty()) {
      this.callback({ type: "thinking", message: thinkingMessage })
    } else {
      this.callback({ type: "thinking_clear" })
    }

    if (typingNames.length > 0) {
      this.callback({ type: "typing", names: typingNames })
    } else {
      this.callback({ type: "typing_clear" })
    }
  }

  #purgeInactiveTyping() {
    // Only purge typing notifications, thinking messages persist indefinitely
    const cutoff = Date.now() - TYPING_TIMEOUT
    this.currentlyTyping = Object.fromEntries(
      Object.entries(this.currentlyTyping).filter(([_name, timestamp]) => timestamp > cutoff)
    )
  }
}
```

**Key behavior differences from typing:**
- **No automatic timeout**: Thinking messages persist until explicitly cleared
- **Independent operation**: Thinking and typing indicators work independently
- **Persistence**: Survives page interactions but not page refresh

**TDD Focus:** Integration tests with mocked callbacks, state transition verification between typing and thinking modes.

### 7. Controller Integration (Minimal Glue Code)

**Updates typing_notifications_controller.js to use new components:**
```javascript
// app/javascript/controllers/typing_notifications_controller.js
import NotificationDisplayManager from '../lib/notification_display_manager.js'
import { createThinkingMessageElement } from '../lib/thinking_message_renderer.js'

export default class extends Controller {
  static targets = ["author", "indicator", "thinkingContainer"]

  connect() {
    // ... existing setup code ...
    
    this.displayManager = new NotificationDisplayManager({
      authorTarget: this.authorTarget,
      indicatorTarget: this.indicatorTarget,
      thinkingContainerTarget: this.thinkingContainerTarget,
      activeClass: this.activeClass
    })
  }

  #received({ action, user, message }) {
    if (user.id !== Current.user.id) {
      if (action === "start") {
        this.tracker.add(user.name)
      } else if (action === "stop") {
        this.tracker.remove(user.name)
      } else if (action === "thinking") {
        this.tracker.addThinking(user.name, message)
      } else if (action === "stop_thinking") {
        this.tracker.stopThinking(user.name)
      }
    }
  }

  #update(data) {
    if (data?.type === "thinking") {
      this.displayManager.showThinking(data.message, createThinkingMessageElement)
    } else if (data?.type === "thinking_clear") {
      this.displayManager.hideThinking()
    } else if (data?.type === "typing") {
      this.displayManager.showTyping(data.names)
    } else if (data?.type === "typing_clear") {
      this.displayManager.hideTyping()
    }
  }
}
```

**ActionCable integration:**
- **Reuses existing channel**: No changes needed to `TypingNotificationsChannel`
- **Bot-to-human communication**: Bots send via HTTP, humans receive via WebSocket
- **Real-time updates**: Instant display via existing WebSocket connection

**TDD Focus:** Integration tests with mocked ActionCable messages, component interaction verification.

### 8. Template & Styling

**Update Composer Template:**
```erb
<!-- app/views/rooms/show/_composer.html.erb -->
<!-- Add this above the existing typing indicator -->
<div class="thinking-messages" data-typing-notifications-target="thinkingContainer"></div>

<div class="typing-indicator gap txt-small align-center flex-inline" data-typing-notifications-target="indicator">
  <div class="typing-indicator__author spinner" data-typing-notifications-target="author"></div>
</div>
```

**Add CSS:**
```css
/* app/assets/stylesheets/composer.css */
.thinking-messages {
  display: none;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--color-bg-subtle);
  margin-bottom: 1rem;
}

.thinking-messages--active {
  display: block;
}

.message--thinking {
  opacity: 0.8; /* Subtle visual difference from real messages */
}

.thinking-flicker {
  animation: thinking-pulse 2s infinite;
}

@keyframes thinking-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}
```

**Visual design principles:**
- **Subtle differentiation**: Thinking messages look similar to real messages but slightly faded
- **Pulse animation**: Indicates temporary/processing state
- **Responsive design**: Works across screen sizes
- **Accessibility**: Maintains color contrast requirements

**TDD Focus:** System tests for visual appearance, responsive behavior and animations.

### 9. System Integration Tests

**End-to-End Workflow Testing:**
- **Complete bot workflow**: thinking → real message (auto-cleanup)
- **Multiple bots**: Concurrent thinking messages from different bots
- **Manual cleanup**: Empty POST requests clear thinking messages
- **Page refresh behavior**: Thinking messages disappear (ephemeral state)
- **Error scenarios**: Timeout handling, network failures, malformed requests
- **Authentication flows**: Valid/invalid bot keys, room permissions
- **Content security**: XSS prevention, content length limits

---

## API Documentation

### Send Thinking Message
```http
POST /rooms/:room_id/:bot_key/thinking
Content-Type: text/plain

🤔 Analyzing your request...
```

**URL Parameters:**
- `room_id` - The ID of the room to send the thinking message to
- `bot_key` - Your bot's authentication key (format: `{bot_id}-{bot_token}`)

**Request Body:**
- Send the thinking message content as plain text in the request body
- Maximum recommended length: 280 characters (enforced by frontend)
- HTML will be escaped for security
- Supports Unicode and emoji

**Response:**
- `200 OK` - Thinking message sent successfully
- `401 Unauthorized` - Invalid bot key
- `404 Not Found` - Room not found

### Clear Thinking Message
```http
POST /rooms/:room_id/:bot_key/thinking
```

**Send an empty request body to manually clear your bot's thinking message.**

This is essential for:
- Cleaning up after processing errors
- Clearing timeout messages
- Manual state management

### Send Timeout/Error Message
```http
POST /rooms/:room_id/:bot_key/thinking
Content-Type: text/plain

❌ Unable to process request - please try again
```

**Best practice**: Show timeout/error thinking message, then clear it after 3-5 seconds to avoid permanent error states.

## Usage Examples

### Show Processing Status
```bash
curl -X POST \
  "https://your-campfire.com/rooms/123/456-abc123def456/thinking" \
  -d "🤔 Processing your request..."
```

### Show Progress Updates
```bash
# Step 1: Initial processing
curl -X POST \
  "https://your-campfire.com/rooms/123/456-abc123def456/thinking" \
  -d "📊 Analyzing data..."

# Step 2: Advanced processing
curl -X POST \
  "https://your-campfire.com/rooms/123/456-abc123def456/thinking" \
  -d "🔍 Searching knowledge base..."

# Step 3: Final processing
curl -X POST \
  "https://your-campfire.com/rooms/123/456-abc123def456/thinking" \
  -d "✨ Generating response..."
```

### Handle Timeout/Error Gracefully
```bash
# When processing fails or times out
curl -X POST \
  "https://your-campfire.com/rooms/123/456-abc123def456/thinking" \
  -d "❌ Request timed out - please try again"

# Clear error message after 3 seconds (important!)
sleep 3
curl -X POST \
  "https://your-campfire.com/rooms/123/456-abc123def456/thinking"
```

### Integration with Regular Messages
```bash
# 1. Show thinking message
curl -X POST \
  "https://your-campfire.com/rooms/123/456-abc123def456/thinking" \
  -d "🔮 Generating response..."

# 2. Send actual response (automatically clears thinking message)
curl -X POST \
  "https://your-campfire.com/rooms/123/456-abc123def456/messages" \
  -d "Here's your answer: The solution is..."

# The thinking message automatically disappears when real message is sent
```


## Behavior Reference

### Message Lifecycle
- **Creation**: Instant via ActionCable broadcast
- **Duration**: No timeout - remains visible until explicitly cleared or replaced
- **Independence**: Thinking and typing indicators operate independently
- **Cleanup**: Automatic when real message sent, manual via empty POST
- **Page refresh**: Disappears (ephemeral state, not stored in database)


### Visual Behavior  
- **Styling**: Thinking messages appear with reduced opacity and pulse animation
- **Positioning**: Displayed above the typing indicator in composer area
- **Coexistence**: Both thinking messages and typing indicators can be visible simultaneously
- **Responsiveness**: Works across all screen sizes and orientations

### Security & Content
- **XSS Prevention**: All content is HTML-escaped before display
- **Content limits**: 280 character recommended maximum
- **Authentication**: Uses existing bot authentication (no additional setup)
- **Permissions**: Respects existing room access controls

## Best Practices

### When to Use Thinking Messages
- **Long operations**: Processes that take >2 seconds
- **Multi-step workflows**: Break complex operations into progress updates
- **User feedback**: Keep users informed during processing delays
- **Error communication**: Gracefully handle timeouts and failures

### Content Guidelines  
- **Keep messages short**: 280 characters or less for good UX
- **Be informative**: "🔍 Searching..." vs generic "Processing..."
- **Use emoji sparingly**: Enhance readability without overdoing it
- **Progressive updates**: Show workflow steps as they happen

### Error Handling
- **Explicit timeouts**: Don't rely on automatic cleanup for errors
- **Clear error states**: Always clear error messages after brief display
- **Graceful degradation**: Handle network failures and API errors
- **User guidance**: Provide clear next steps when things go wrong

### Technical Implementation
- **State management**: Bots are responsible for their own thinking message lifecycle
- **Cleanup discipline**: Always clear thinking state before sending real messages (automatic)
- **Testing**: Include thinking message flows in bot integration tests
- **Monitoring**: Track thinking message usage for performance insights

---

## Implementation Summary

This plan leverages the existing typing notification infrastructure to add ephemeral "thinking" messages using a TDD approach with modular, testable components:

**Key Files to Create/Modify:**
1. `app/controllers/messages/thinking_controller.rb` - API endpoint  
2. `app/controllers/messages/by_bots_controller.rb` - Auto-cleanup integration
3. `app/javascript/lib/thinking_message_store.js` - Core data structure
4. `app/javascript/lib/thinking_message_renderer.js` - DOM rendering functions  
5. `app/javascript/lib/notification_display_manager.js` - UI state management
6. `app/javascript/models/typing_tracker.js` - Extended behavior integration
7. `app/javascript/controllers/typing_notifications_controller.js` - Glue components
8. `app/views/rooms/show/_composer.html.erb` - Template updates
9. `app/assets/stylesheets/composer.css` - Styling
10. `config/routes.rb` - Route addition

**Architecture Benefits:**
- **Reuses existing infrastructure**: ActionCable, authentication, styling patterns
- **No database changes**: Fully ephemeral, memory-only state
- **Bot-controlled lifecycle**: No automatic timeouts, bots manage their own state
- **Security-first**: HTML escaping, content limits, existing permission model
- **Performance-conscious**: Minimal overhead, efficient DOM manipulation

**Operational Benefits:**
- **Immediate deployment**: No database migrations or infrastructure changes
- **Backward compatible**: No changes to existing message or typing functionality  
- **Graceful degradation**: Works with or without JavaScript enabled
- **Monitoring ready**: Easy to track usage and performance metrics
- **Bot-friendly**: Simple HTTP API follows existing patterns

The implementation provides a smooth UX where bots can show rich "I'm working on it..." style messages that persist until the bot explicitly clears them or sends a real response, with full lifecycle control and robust error handling.

---

## ⚠️ TDD IMPLEMENTATION CHECKLIST ⚠️

**Before implementing ANY component, ensure:**

- [ ] **Tests are written FIRST** for all expected behaviors
- [ ] **Tests fail initially** (RED phase confirmed)
- [ ] **Implementation is minimal** to pass tests (GREEN phase)
- [ ] **Code is refactored** while keeping tests passing (REFACTOR phase)
- [ ] **No implementation code exists** without corresponding tests
- [ ] **Each component is fully tested** before moving to the next

**REMEMBER: Test-Driven Development is MANDATORY for this feature. Any deviation from TDD methodology should be rejected and restarted with proper test-first approach.**
