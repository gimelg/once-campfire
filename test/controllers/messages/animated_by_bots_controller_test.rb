require "test_helper"

class Messages::AnimatedByBotsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @room = rooms(:watercooler)
  end

  test "create" do
    assert_difference -> { Message.count }, +1 do
      post room_bot_animated_messages_url(@room, users(:bender).bot_key), params: +"Hello Animated World!"
      assert_response :created
      assert_equal "Hello Animated World!", Message.last.plain_text_body
    end
  end

  test "create with UTF-8 content" do
    assert_difference -> { Message.count }, +1 do
      post room_bot_animated_messages_url(@room, users(:bender).bot_key), params: +"Hello 👋 Animated!"
      assert_equal "Hello 👋 Animated!", Message.last.plain_text_body
    end
  end

  test "automatically clears thinking messages from the same bot" do
    assert_broadcasts TypingNotificationsChannel.broadcasting_for(@room), 1 do
      post room_bot_animated_messages_url(@room, users(:bender).bot_key), params: +"Animated Hello World!"
      assert_response :created
    end
  end

  test "create can't be abused to post messages as any user" do
    user = users(:kevin)
    invalid_bot_key = "#{user.id}-"

    assert_no_difference -> { Message.count } do
      post room_bot_animated_messages_url(@room, invalid_bot_key), params: +"Unauthorized animated message"
    end

    assert_response :redirect
  end

  test "create does not trigger a webhook to the sending bot in a direct room" do
    assert_no_enqueued_jobs only: Bot::WebhookJob do
      post room_bot_animated_messages_url(rooms(:bender_and_kevin), users(:bender).bot_key), params: +"Talking to myself again!"
    end
  end

  # Thinking message cleanup tests
  test "clear_thinking_messages broadcasts correct data format" do
    assert_broadcasts TypingNotificationsChannel.broadcasting_for(@room), 1 do
      post room_bot_animated_messages_url(@room, users(:bender).bot_key), params: +"Test animated message"
      assert_response :created
    end
  end
end