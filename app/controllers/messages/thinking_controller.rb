class Messages::ThinkingController < ApplicationController
  allow_bot_access only: :create
  before_action :set_room

  def create
    if params[:message].present?
      broadcast_thinking_message(params[:message])
      head :ok
    elsif (body_content = read_request_body).present?
      broadcast_thinking_message(body_content)
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

    def read_request_body
      request.body.rewind
      content = request.body.read.force_encoding("UTF-8")
      request.body.rewind
      content
    end

    def set_room
      @room = Room.find(params[:room_id])
    end
end