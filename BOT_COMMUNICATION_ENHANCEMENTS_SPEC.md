# Bot Communication Enhancements Specification

## Overview

This feature implements two complementary bot communication enhancements:

1. **Ephemeral Thinking Messages** - Real-time status updates that appear temporarily while bots process requests
2. **Typewriter Animation for Bot Messages** - Word-by-word reveal animation for bot responses to enhance user experience

Both leverage existing infrastructure to provide seamless bot-to-human communication improvements.

## Problem Solved

Bots previously had no way to indicate processing status and their responses appeared instantly without natural conversation flow. This created two UX gaps:

1. **Processing Feedback Gap**: Users see nothing during bot processing time
2. **Response Animation Gap**: Bot messages appear instantly without natural typing simulation

## Two-Part Solution

### Part 1: Ephemeral Thinking Messages
Temporary status messages that display real-time bot processing updates via ActionCable:
- Appears instantly via ActionCable broadcast
- Shows actual message content (not just "typing...")
- Remains visible until explicitly cleared or replaced
- Disappears on page refresh (ephemeral - not stored in database)
- No database changes required

### Part 2: Typewriter Animation for Bot Messages  
Enhanced bot message display with word-by-word reveal animation:
- Natural reading flow at 10 words/second
- Space pre-allocation prevents layout shifts
- Interrupt handling maintains chronological order
- Integrates with thinking messages for smooth transitions

## API Endpoints

### 1. Thinking Messages Endpoint

**Send Thinking Message**
```http
POST /rooms/:room_id/:bot_key/thinking
Content-Type: text/plain

🤔 Analyzing your request...
```

**Clear Thinking Message**
```http
POST /rooms/:room_id/:bot_key/thinking
(empty body)
```

**Purpose**: Display ephemeral status messages while bot processes requests.

### 2. Animated Messages Endpoint

**Send Animated Bot Message**
```http
POST /rooms/:room_id/:bot_key/animated_messages
Content-Type: text/plain

Hello with typewriter animation! This is a long message, therefore it makes sense
to display in in stream-like fation, simulating how LLM chatbots communicate large
chunks of text.
```

**Purpose**: Match user expectaions of LLMs streaming long responses.

## Implementation Architecture

### Backend Components

**ThinkingController** (`app/controllers/messages/thinking_controller.rb`)
- Route: `POST /rooms/:room_id/:bot_key/thinking`
- Supports form parameters and request body with UTF-8 encoding
- Empty request triggers stop_thinking broadcast
- Bot authentication reuses regular messages logic via `allow_bot_access`
- Broadcasts via `TypingNotificationsChannel.broadcast_to`

**AnimatedByBotsController** (`app/controllers/messages/animated_by_bots_controller.rb`)
- Route: `POST /rooms/:room_id/:bot_key/animated_messages` 
- Same request format as regular messages
- All messages sent to this endpoint get animation applied
- Integrates with thinking message cleanup

**ByBotsController Integration** (`app/controllers/messages/by_bots_controller.rb`)
- Auto-cleanup of thinking messages before real message creation
- Broadcasts stop_thinking when real messages are sent
- Ensures thinking messages don't persist after responses

### Frontend Components

**ThinkingMessageRenderer** (`app/javascript/lib/thinking_message_renderer.js`)
- Creates complete message DOM structure matching real messages
- Bot avatars with profile links using `user.avatar_url`
- Timestamps, author information, and wave animation CSS classes
- XSS prevention via `textContent`

**ThinkingTracker** (`app/javascript/models/thinking_tracker.js`)
- Callback-based state management independent from TypingTracker
- Simple API: `set(user, message)` and `clear()`
- No automatic timeout (bot-controlled lifecycle)

**MessagesController** (`app/javascript/controllers/messages_controller.js`)
- Enhanced with JavaScript typewriter animation
- Word-by-word reveal at 10 words/second
- Space pre-allocation to prevent layout shifts during animation
- Interrupt handling for chronological message order

**TypingNotificationsController** (`app/javascript/controllers/typing_notifications_controller.js`)
- Handles ActionCable messages for "thinking" and "stop_thinking" actions
- Messages display in main message stream
- Auto-scroll functionality when thinking messages appear
- **Cross-controller integration**: Automatically completes ongoing typewriter animations when thinking messages appear

### Visual Design & Animations

**Thinking Message Animations** (`app/assets/stylesheets/composer.css`)

Two coordinated animations for thinking messages:

1. **Avatar Animation**: Sequential blinking dots replace bot avatar
   - Duration: 1.2 seconds per cycle
   - Pattern: Center → Left → Right → Center
   - Size: 4px dots with 8px spacing
   - Theme-aware colors with dark mode support

2. **Text Wave Animation**: Horizontal gradient wave sweeps across content
   - Duration: 2.2 seconds total cycle  
   - Width: 30% of message content width
   - Speed variation: Slow start → acceleration → deceleration → pause
   - Dark/light wave based on theme

**Typewriter Animation**
- Pure frontend visual effect applied during message display
- Natural reading pace with word-by-word reveal
- Maintains identical message content and functionality to regular messages
- Automatic completion when interrupted by new messages or thinking updates

## Message Lifecycle & Integration

### Thinking Messages
- **Creation**: Instant via ActionCable broadcast
- **Duration**: No timeout - bot-controlled lifecycle  
- **Cleanup**: Automatic when real message sent, manual via empty POST
- **Page refresh**: Disappears (ephemeral state)
- **Independence**: Operates separately from typing indicators

### Animated Messages  
- **Creation**: Stored in database like regular messages
- **Animation**: Frontend-only effect during display
- **Integration**: Automatically completes any active thinking messages
- **Interruption**: Can be interrupted by newer messages for chronological order

### Cross-Feature Integration
- Thinking messages automatically complete ongoing typewriter animations
- Animated messages automatically clear thinking messages when sent
- Both features work independently but enhance each other when used together

## Workflow Examples

### Combined Usage Pattern
```bash
# 1. Show processing status (raw body)
curl -X POST "/rooms/123/bot-key/thinking" -d "🤔 Processing request..."

# 2. Update progress (form parameter)
curl -X POST "/rooms/123/bot-key/thinking" -d "message=📊 Analyzing data..."

# 3. Send animated response (clears thinking, shows typewriter)
curl -X POST "/rooms/123/bot-key/animated_messages" -d "Here's your analysis results..."
```

### Thinking-Only Usage
```bash
# Raw request body
curl -X POST "/rooms/123/bot-key/thinking" -d "🔍 Searching..."

# Form parameter alternative
curl -X POST "/rooms/123/bot-key/thinking" -d "message=🔍 Searching..."

curl -X POST "/rooms/123/bot-key/messages" -d "Found 5 results"
```

### Animation-Only Usage  
```bash
curl -X POST "/rooms/123/bot-key/animated_messages" -d "Welcome to the chat!"
```

## Security & Best Practices

- **XSS Prevention**: All content HTML-escaped before display
- **Authentication**: Uses existing bot authentication system
- **Permissions**: Respects existing room access controls

### Usage Guidelines

**Thinking Messages:**
- Use for operations >2 seconds
- Provide specific status updates vs generic "Processing..."
- Clear error states after 3-5 seconds
- Bot manages own lifecycle

**Animated Messages:**
- Use for enhanced UX on important responses
- Natural conversation flow simulation
- Automatic integration with thinking message cleanup

## Testing

**Thinking Messages** (`test/controllers/messages/thinking_controller_test.rb`):
- Form parameter and request body handling
- UTF-8 encoding, authentication, error handling  
- ActionCable broadcast verification

**Animated Messages** (`test/controllers/messages/animated_by_bots_controller_test.rb`):
- Message creation with UTF-8 support
- Automatic thinking message cleanup
- Authentication/security validation
- Webhook behavior in direct rooms
- Broadcast verification

## Architecture Notes

- **Dual functionality**: Separate endpoints for different use cases (ephemeral status vs persisted, animated responses)
- **Reuses existing infrastructure**: ActionCable, authentication, styling patterns
- **No database changes**: Thinking messages fully ephemeral, animated messages are identical to normal messages in temrs of backend storage
- **Bot-controlled lifecycle**: No automatic timeouts for thinking messages
- **Backward compatible**: No changes to existing message or typing functionality
- **Cross-feature integration**: Features enhance each other when used together
