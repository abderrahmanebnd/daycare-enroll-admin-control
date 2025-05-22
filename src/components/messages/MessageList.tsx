
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { messageService } from '@/services/messageService';
import { Message, User } from '@/types';
import { MOCK_USERS } from '@/services/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface MessageListProps {
  recipientId: string;
}

const MessageList: React.FC<MessageListProps> = ({ recipientId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recipient, setRecipient] = useState<User | null>(null);

  useEffect(() => {
    if (user && recipientId) {
      fetchMessages();
      const foundRecipient = MOCK_USERS.find(u => u.id === recipientId);
      if (foundRecipient) {
        setRecipient(foundRecipient);
      }
    }
  }, [user, recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const conversation = await messageService.getConversation(user!.id, recipientId);
      setMessages(conversation);
      
      // Mark messages as read
      const unreadMessages = conversation.filter(m => m.receiverId === user!.id && !m.read);
      for (const message of unreadMessages) {
        await messageService.markAsRead(message.id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !recipientId) return;
    
    try {
      setSending(true);
      const sentMessage = await messageService.createMessage({
        senderId: user.id,
        receiverId: recipientId,
        content: newMessage,
      });
      
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi du message.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

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
          Conversation avec {recipient?.name || 'Utilisateur'}
          <span className="text-sm text-muted-foreground ml-2 capitalize">({recipient?.role})</span>
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Aucun message. Commencez la conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === user!.id;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    isCurrentUser
                      ? 'bg-daycare-primary text-white rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-daycare-primary-foreground/80' : 'text-muted-foreground'}`}>
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
              if (e.key === 'Enter' && !e.shiftKey) {
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
            {sending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageList;
