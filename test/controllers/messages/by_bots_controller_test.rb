require "test_helper"

class Messages::ByBotsControlleTest < ActionDispatch::IntegrationTest
  setup do
    @room = rooms(:watercooler)
  end

  test "create" do
    assert_difference -> { Message.count }, +1 do
      post room_bot_messages_url(@room, users(:bender).bot_key), params: +"Hello Bot World!"
      assert_equal "Hello Bot World!", Message.last.plain_text_body
    end
  end

  test "create with UTF-8 content" do
    assert_difference -> { Message.count }, +1 do
      post room_bot_messages_url(@room, users(:bender).bot_key), params: +"Hello 👋!"
      assert_equal "Hello 👋!", Message.last.plain_text_body
    end
  end

  test "create file" do
    assert_difference -> { Message.count }, +1 do
      post room_bot_messages_url(@room, users(:bender).bot_key), params: { attachment: fixture_file_upload("moon.jpg", "image/jpeg") }
      assert Message.last.attachment.present?
    end
  end

  test "create does not trigger a webhook to the sending bot if it mentions itself" do
    body = "<div>Hey #{mention_attachment_for(:bender)}</div>"

    assert_no_enqueued_jobs only: Bot::WebhookJob do
      post room_bot_messages_url(@room, users(:bender).bot_key), params: body
    end
  end

  test "create does not trigger a webhook to the sending bot in a direct room" do
    assert_no_enqueued_jobs only: Bot::WebhookJob do
      post room_bot_messages_url(rooms(:bender_and_kevin), users(:bender).bot_key), params: +"Talking to myself again!"
    end
  end

  test "create can't be abused to post messages as any user" do
    user = users(:kevin)
    bot_key = "#{user.id}-"

    assert_no_difference -> { Message.count } do
      post room_bot_messages_url(rooms(:bender_and_kevin), bot_key), params: "Hello 👋!"
    end

    assert_response :redirect
  end

  test "denied index" do
    get room_messages_url(@room, bot_key: users(:bender).bot_key, format: :json)
    assert_response :forbidden
  end

  # Thinking message cleanup tests
  test "create automatically clears thinking messages from the same bot" do
    post room_bot_messages_url(@room, users(:bender).bot_key), params: +"Hello World!"
    assert_response :created

    # Should broadcast stop_thinking before creating the message
    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    stop_thinking_broadcast = broadcasts.find { |b| b[:action] == "stop_thinking" }
    assert_not_nil stop_thinking_broadcast, "Should broadcast stop_thinking when creating real message"
    assert_equal users(:bender).id, stop_thinking_broadcast[:user][:id]
    assert_equal users(:bender).name, stop_thinking_broadcast[:user][:name]
  end

  test "clear_thinking_messages broadcasts correct data format" do
    post room_bot_messages_url(@room, users(:bender).bot_key), params: +"Test message"
    assert_response :created

    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    stop_thinking_broadcast = broadcasts.find { |b| b[:action] == "stop_thinking" }
    assert_not_nil stop_thinking_broadcast

    # Verify broadcast data structure
    assert_equal "stop_thinking", stop_thinking_broadcast[:action]
    assert_equal users(:bender).id, stop_thinking_broadcast[:user][:id] 
    assert_equal users(:bender).name, stop_thinking_broadcast[:user][:name]
    assert_nil stop_thinking_broadcast[:message], "stop_thinking should not include message content"
  end

  test "clear_thinking_messages uses correct channel for room" do
    different_room = rooms(:hq) 
    
    post room_bot_messages_url(different_room, users(:bender).bot_key), params: +"Test message"
    assert_response :created

    broadcasts = captured_broadcasts("typing_notifications_#{different_room.id}")
    stop_thinking_broadcast = broadcasts.find { |b| b[:action] == "stop_thinking" }
    assert_not_nil stop_thinking_broadcast
  end

  test "clear_thinking_messages only sends user id and name attributes" do
    post room_bot_messages_url(@room, users(:bender).bot_key), params: +"Test message"
    assert_response :created

    broadcasts = captured_broadcasts("typing_notifications_#{@room.id}")
    stop_thinking_broadcast = broadcasts.find { |b| b[:action] == "stop_thinking" }
    user_data = stop_thinking_broadcast[:user]
    
    # Should only include id and name, no other user attributes
    assert_equal 2, user_data.keys.length
    assert_includes user_data.keys, "id"
    assert_includes user_data.keys, "name"
    refute_includes user_data.keys, "email"
    refute_includes user_data.keys, "bot_key"
    refute_includes user_data.keys, "created_at"
  end

  private
    def captured_broadcasts(channel)
      ActionCable.server.pubsub.broadcasts(channel).map { |broadcast| JSON.parse(broadcast).with_indifferent_access }
    end
end
