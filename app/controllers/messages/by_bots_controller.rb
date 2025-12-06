class Messages::ByBotsController < MessagesController
  allow_bot_access only: :create

  def create
    set_room
    clear_thinking_messages
    super
    head :created, location: message_url(@message)
  end

  private
    def set_room
      @room = Room.find(params[:room_id])
    end

    def clear_thinking_messages
      message_data = { action: "stop_thinking", user: Current.user.slice(:id, :name) }
      TypingNotificationsChannel.broadcast_to(@room, message_data)
    end

    def message_params
      if params[:attachment]
        params.permit(:attachment, :bot_response_animation)
      else
        reading(request.body) { |body| { body: body } }
      end
    end

    def reading(io)
      io.rewind
      yield io.read.force_encoding("UTF-8")
    ensure
      io.rewind
    end
end
