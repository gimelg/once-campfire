class Messages::AnimatedByBotsController < ApplicationController
  allow_bot_access only: :create
  before_action :set_room

  def create
    clear_thinking_messages
    bot_animation = true  # Always animate for this endpoint
    message_params = reading(request.body) { |body| { body: body } }
    @message = @room.messages.create_with_attachment!(message_params)

    # Store bot response animation flag as a temporary attribute
    @message.define_singleton_method(:bot_response_animation) { bot_animation }
    
    @message.broadcast_create
    deliver_webhooks_to_bots
    head :created, location: message_url(@message)
  rescue ActiveRecord::RecordNotFound
    render action: :room_not_found
  end

  private
    def set_room
      @room = Room.find(params[:room_id])
    end

    def clear_thinking_messages
      message_data = { action: "stop_thinking", user: Current.user.slice(:id, :name) }
      TypingNotificationsChannel.broadcast_to(@room, message_data)
    end

    def reading(io)
      io.rewind
      yield io.read.force_encoding("UTF-8")
    ensure
      io.rewind
    end

    def deliver_webhooks_to_bots
      bots_eligible_for_webhook.excluding(@message.creator).each { |bot| bot.deliver_webhook_later(@message) }
    end

    def bots_eligible_for_webhook
      @room.direct? ? @room.users.active_bots : @message.mentionees.active_bots
    end
end