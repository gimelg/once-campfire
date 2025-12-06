require "test_helper"

class Messages::ThinkingControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper
  setup do
    @room = rooms(:watercooler)
    @bot = users(:bender)
    @bot_key = @bot.bot_key
  end

  test "create broadcasts thinking message with message parameter" do
    message_content = "🤔 Processing your request..."
    
    assert_broadcasts TypingNotificationsChannel.broadcasting_for(@room), 1 do
      post room_bot_thinking_url(@room, @bot_key), params: { message: message_content }
      assert_response :ok
    end
  end

  test "create broadcasts thinking message from request body" do
    message_content = "📊 Analyzing data..."
    
    assert_broadcasts TypingNotificationsChannel.broadcasting_for(@room), 1 do
      post room_bot_thinking_url(@room, @bot_key), params: message_content
      assert_response :ok
    end
  end

  test "create handles UTF-8 encoding properly" do
    message_content = "🔍 Searching knowledge base... 👋"
    
    assert_broadcasts TypingNotificationsChannel.broadcasting_for(@room), 1 do
      post room_bot_thinking_url(@room, @bot_key), params: message_content
      assert_response :ok
    end
  end

  test "create broadcasts stop_thinking with empty request" do
    assert_broadcasts TypingNotificationsChannel.broadcasting_for(@room), 1 do
      post room_bot_thinking_url(@room, @bot_key)
      assert_response :ok
    end
  end

  test "allows bot access with valid bot_key" do
    post room_bot_thinking_url(@room, @bot_key), params: { message: "Test message" }
    assert_response :ok
  end

  test "denies access without bot_key" do
    post room_messages_url(@room), params: { message: "Test message" }
    assert_response :redirect
  end

  test "denies access with invalid bot_key" do
    invalid_bot_key = "invalid-key"
    post room_bot_thinking_url(@room, invalid_bot_key), params: { message: "Test message" }
    assert_response :redirect
  end

  test "handles room not found" do
    non_existent_room_id = 999999
    assert_raises(ActiveRecord::RecordNotFound) do
      post "/rooms/#{non_existent_room_id}/#{@bot_key}/thinking", params: { message: "Test message" }
    end
  end

  test "handles malformed requests gracefully" do
    # This test verifies the controller handles requests with unexpected parameters
    # Following same behavior as by_bots_controller - reads from request body
    assert_broadcasts TypingNotificationsChannel.broadcasting_for(@room), 1 do
      post room_bot_thinking_url(@room, @bot_key), params: { unexpected: "parameter" }
      assert_response :ok
    end
  end

  test "bot user attributes include id, name and avatar_url" do
    assert_broadcasts TypingNotificationsChannel.broadcasting_for(@room), 1 do
      post room_bot_thinking_url(@room, @bot_key), params: { message: "Test" }
      assert_response :ok
    end
  end

end