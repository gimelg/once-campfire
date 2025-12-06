module Message::Broadcasts
  def broadcast_create
    broadcast_append_to room, :messages, target: [ room, :messages ], locals: { bot_response_animation: respond_to?(:bot_response_animation) ? bot_response_animation : nil }
    ActionCable.server.broadcast("unread_rooms", { roomId: room.id })
  end

  def broadcast_remove
    broadcast_remove_to room, :messages
  end
end
