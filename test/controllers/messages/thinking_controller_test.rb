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
    
    post room_bot_thinking_url(@room, @bot_key), params: { message: message_content }
    assert_response :ok
    
    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    assert_equal 1, broadcasts.size
    
    broadcast = broadcasts.first
    assert_equal "thinking", broadcast[:action]
    assert_equal message_content, broadcast[:message]
    assert_equal @bot.id, broadcast[:user][:id]
    assert_equal @bot.name, broadcast[:user][:name]
  end

  test "create broadcasts thinking message from request body" do
    message_content = "📊 Analyzing data..."
    
    post room_bot_thinking_url(@room, @bot_key), params: message_content
    assert_response :ok
    
    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    assert_equal 1, broadcasts.size
    
    broadcast = broadcasts.first
    assert_equal "thinking", broadcast[:action]
    assert_equal message_content, broadcast[:message]
    assert_equal @bot.id, broadcast[:user][:id]
    assert_equal @bot.name, broadcast[:user][:name]
  end

  test "create handles UTF-8 encoding properly" do
    message_content = "🔍 Searching knowledge base... 👋"
    
    post room_bot_thinking_url(@room, @bot_key), params: message_content
    assert_response :ok
    
    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    assert_equal 1, broadcasts.size
    
    broadcast = broadcasts.first
    assert_equal "thinking", broadcast[:action]
    assert_equal message_content, broadcast[:message]
  end

  test "create broadcasts stop_thinking with empty request" do
    post room_bot_thinking_url(@room, @bot_key)
    assert_response :ok
    
    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    assert_equal 1, broadcasts.size
    
    broadcast = broadcasts.first
    assert_equal "stop_thinking", broadcast[:action]
    assert_equal @bot.id, broadcast[:user][:id]
    assert_equal @bot.name, broadcast[:user][:name]
    assert_nil broadcast[:message] # stop_thinking should not have message content
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
    post room_bot_thinking_url(@room, @bot_key), params: { unexpected: "parameter" }
    assert_response :ok
    
    # Should broadcast thinking with the form data as message content
    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    assert_equal 1, broadcasts.size
    
    broadcast = broadcasts.first
    assert_equal "thinking", broadcast[:action]
    assert broadcast[:message].present? # Form data gets serialized as content
  end

  test "bot user attributes include only id and name" do
    post room_bot_thinking_url(@room, @bot_key), params: { message: "Test" }
    assert_response :ok
    
    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    assert_equal 1, broadcasts.size
    
    broadcast = broadcasts.first
    user_attrs = broadcast[:user]
    
    assert_equal 2, user_attrs.keys.size
    assert user_attrs.key?(:id)
    assert user_attrs.key?(:name)
    assert_equal @bot.id, user_attrs[:id]
    assert_equal @bot.name, user_attrs[:name]
  end

  private
    def captured_broadcasts(channel)
      ActionCable.server.pubsub.broadcasts(channel).map { |broadcast| JSON.parse(broadcast).with_indifferent_access }
    end
end