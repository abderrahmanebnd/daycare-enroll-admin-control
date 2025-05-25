import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { messageService } from "@/services/messageService";
import { childService } from "@/services/childService";
import { Message, User, Child } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axiosPrivate from "@/axios/axios";

interface Contact extends User {
  lastMessage?: Message;
  unreadCount: number;
  children?: Child[];
  isAssignedEducator?: boolean;
}

const ContactList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contactId = params.get("contactId");
    if (contactId) setSelectedContactId(contactId);
  }, [location.search]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data } = await axiosPrivate.get("/users/contacts");
      let userContacts: Contact[] = data.contacts.map((u: User) => ({
        ...u,
        unreadCount: 0,
      }));

      if (user?.role === "parent") {
        const myChildren = await childService.getMyChildren();
        const educatorIds = new Set(
          myChildren.map((c) => c.educatorId).filter(Boolean)
        );
        userContacts = userContacts.map((u) => ({
          ...u,
          isAssignedEducator: u.role === "educator" && educatorIds.has(u.id),
        }));
      }

      if (user?.role === "educator") {
        for (const contact of userContacts) {
          if (contact.role === "parent") {
            contact.children = await childService.getMyChildren(contact.id);
          }
        }
      }

      for (const contact of userContacts) {
        const convo = await messageService.getConversation(contact.id);
        if (convo.length > 0) {
          convo.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          contact.lastMessage = convo[0];
          contact.unreadCount = convo.filter(
            (m) => m.receiverId === user?.id && !m.read
          ).length;
        }
      }

      setContacts(userContacts);

      if (!selectedContactId && userContacts.length > 0) {
        setSelectedContactId(userContacts[0].id);
        navigate(`/messages?contactId=${userContacts[0].id}`);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    navigate(`/messages?contactId=${id}`);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (loading) {
    return (
      <div className="p-4">
        <p>Chargement des contacts...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-r">
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Aucun contact disponible
          </div>
        ) : (
          contacts.map((contact) => (
            <Button
              key={contact.id}
              variant="ghost"
              className={`w-full justify-start p-3 h-auto ${
                selectedContactId === contact.id ? "bg-muted" : ""
              }`}
              onClick={() => handleSelectContact(contact.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <Avatar>
                  <AvatarFallback
                    className={`text-white ${
                      contact.isAssignedEducator
                        ? "bg-daycare-secondary"
                        : "bg-daycare-primary"
                    }`}
                  >
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {contact.name}
                      {contact.isAssignedEducator && (
                        <span className="ml-2 text-xs bg-daycare-secondary/20 text-daycare-secondary px-2 py-0.5 rounded-full">
                          Éducateur assigné
                        </span>
                      )}
                    </span>
                    {contact.unreadCount > 0 && (
                      <span className="bg-daycare-primary text-white text-xs rounded-full px-2 py-1 ml-2">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {contact.role}
                  </p>
                  {contact.children?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Enfant(s):{" "}
                      {contact.children.map((c) => c.fullName).join(", ")}
                    </p>
                  )}
                  {contact.lastMessage && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {contact.lastMessage.senderId === user?.id
                        ? "Vous: "
                        : ""}
                      {contact.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactList;
