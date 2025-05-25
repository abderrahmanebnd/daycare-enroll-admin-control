import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { messageService } from "@/services/messageService";
import { Message, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import socket from "@/services/socket";
import axiosPrivate from "@/axios/axios";

interface MessageListProps {
  recipientId: string;
}

const MessageList: React.FC<MessageListProps> = ({ recipientId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && recipientId) {
      fetchRecipient();
      fetchMessages();
      socket.emit("joinRoom", { userId: user.id });

      socket.on("newMessage", (message: Message) => {
        if (
          (message.senderId === recipientId &&
            message.receiverId === user.id) ||
          (message.senderId === user.id && message.receiverId === recipientId)
        ) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });

      return () => {
        socket.off("newMessage");
      };
    }
  }, [user, recipientId]);

  const fetchRecipient = async () => {
    try {
      const { data } = await axiosPrivate.get(`/users/${recipientId}`);
      setRecipient(data.user);
    } catch (err) {
      console.error("Failed to load recipient user:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const conversation = await messageService.getConversation(recipientId);
      setMessages(conversation);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !recipientId) return;

    try {
      setSending(true);
      const messagePayload = {
        senderId: user.id,
        receiverId: Number(recipientId),
        content: newMessage.trim(),
      };
      socket.emit("sendMessage", messagePayload);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  useEffect(() => {
    if (user?.id) {
      socket.emit("register", user.id);
    }
  }, [user]);

  useEffect(() => {
    socket.on("newMessage", (message: Message) => {
      console.log("📨 New message received via socket:", message);
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.off("newMessage");
    };
  }, [user, recipientId]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="p-4 border-b bg-muted/10">
        <h3 className="font-medium">
          Conversation avec {recipient?.name || "Utilisateur"}
          <span className="text-sm text-muted-foreground ml-2 capitalize">
            ({recipient?.role})
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              Aucun message. Commencez la conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === user!.id;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    isCurrentUser
                      ? "bg-daycare-primary text-white rounded-tr-none"
                      : "bg-muted rounded-tl-none"
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser
                        ? "text-daycare-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatMessageDate(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Textarea
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            className="bg-daycare-primary hover:bg-daycare-primary/90 self-end"
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? "Envoi..." : "Envoyer"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageList;
