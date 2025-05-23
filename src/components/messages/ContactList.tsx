import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { messageService } from "@/services/messageService";
import { childService } from "@/services/childService";
import { Message, User, Child } from "@/types";
import { MOCK_USERS } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [myChildren, setMyChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    // Get selected contact from URL params
    const params = new URLSearchParams(location.search);
    const contactId = params.get("contactId");
    const parentId = params.get("parentId");
    if (contactId) {
      setSelectedContactId(contactId);
    } else if (parentId) {
      setSelectedContactId(parentId);
    }
  }, [location.search]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(lowerSearchTerm) ||
          (contact.children &&
            contact.children.some((child) =>
              child.name.toLowerCase().includes(lowerSearchTerm)
            ))
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  const fetchContacts = async () => {
    try {
      setLoading(true);

      let userContacts: Contact[] = [];

      if (user?.role === "admin") {
        // Admin can message all users
        userContacts = MOCK_USERS.filter((u) => u.id !== user.id).map((u) => ({
          ...u,
          unreadCount: 0,
        }));
      } else if (user?.role === "educator") {
        // Educators can message parents
        userContacts = MOCK_USERS.filter((u) => u.role === "parent").map(
          (u) => ({
            ...u,
            unreadCount: 0,
          })
        );
      } else if (user?.role === "parent") {
        // First, get children to identify assigned educators
        const children = await childService.getMyChildren(user.id);
        setMyChildren(children);

        // Create a set of educator IDs assigned to my children
        const assignedEducatorIds = new Set(
          children
            .filter((child) => child.educatorId)
            .map((child) => child.educatorId)
        );

        // Parents can message admins and educators
        userContacts = MOCK_USERS.filter(
          (u) => u.role === "admin" || u.role === "educator"
        ).map((u) => ({
          ...u,
          unreadCount: 0,
          isAssignedEducator:
            u.role === "educator" && assignedEducatorIds.has(u.id),
        }));
      }

      // Get last messages and unread counts
      for (let contact of userContacts) {
        const conversation = await messageService.getConversation(
          user.id,
          contact.id
        );

        if (conversation.length > 0) {
          // Sort by date (newest first) and get the first one
          conversation.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          contact.lastMessage = conversation[0];

          // Count unread messages
          contact.unreadCount = conversation.filter(
            (m) => m.receiverId === user.id && !m.read
          ).length;
        }

        // For educators, get children of each parent
        if (user.role === "educator" && contact.role === "parent") {
          contact.children = await childService.getMyChildren(contact.id);
        }
      }

      // Sort contacts: first assigned educators, then by unread messages, then by most recent message
      userContacts.sort((a, b) => {
        // First, prioritize assigned educators
        if (a.isAssignedEducator !== b.isAssignedEducator) {
          return a.isAssignedEducator ? -1 : 1;
        }

        // Then sort by unread messages
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }

        // Finally sort by most recent message
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;

        return (
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
        );
      });

      setContacts(userContacts);
      setFilteredContacts(userContacts);

      // If there's no selected contact, select the first one
      if (!selectedContactId && userContacts.length > 0) {
        setSelectedContactId(userContacts[0].id);
        navigate(`/messages?contactId=${userContacts[0].id}`);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    navigate(`/messages?contactId=${contactId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-4">
        <p>Chargement des contacts...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-4 border-b">
        <Input
          placeholder="Rechercher un contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm
              ? "Aucun contact ne correspond à votre recherche"
              : "Aucun contact disponible"}
          </div>
        ) : (
          filteredContacts.map((contact) => (
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
                  {contact.children && contact.children.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Enfant(s):{" "}
                      {contact.children.map((c) => c.name).join(", ")}
                    </p>
                  )}
                  {contact.lastMessage && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {contact.lastMessage.senderId === user!.id
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
