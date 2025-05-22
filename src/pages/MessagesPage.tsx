
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ContactList from '@/components/messages/ContactList';
import MessageList from '@/components/messages/MessageList';

const MessagesPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    // Get selected contact from URL params
    const params = new URLSearchParams(location.search);
    const contactId = params.get('contactId');
    const parentId = params.get('parentId');
    
    if (contactId) {
      setSelectedContactId(contactId);
    } else if (parentId) {
      setSelectedContactId(parentId);
    }
  }, [user, isLoading, navigate, location.search]);

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return (
    <MainLayout>
      <div className="page-container h-[80vh]">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <div className="h-full border rounded-lg overflow-hidden">
            <ContactList />
          </div>
          <div className="md:col-span-2 border rounded-lg overflow-hidden">
            {selectedContactId ? (
              <MessageList recipientId={selectedContactId} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Sélectionnez un contact pour commencer à discuter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
