import { useState, useEffect } from "react";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ChildEducatorParentProps {
  educator?: User | null;
  parent?: User | null;
}

const ChildEducatorParent: React.FC<ChildEducatorParentProps> = ({
  educator,
  parent,
}) => {
  const { user } = useAuth();
  const isParentView = user?.role === "parent";
  const isEducatorView = user?.role === "educator";

  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleContact = () => {
    if (isParentView && parent) {
      navigate(`/messages?contactId=${parent.id}`);
    } else if (isEducatorView && educator) {
      navigate(`/messages?contactId=${educator.id}`);
    }
  };

  if (!educator) {
    return (
      <div className="p-4 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">Aucun éducateur assigné</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-medium mb-3">Éducateur assigné</h3>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-daycare-primary text-white">
            {getInitials(educator.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{educator.name}</p>
          <p className="text-sm text-muted-foreground">{educator.email}</p>
        </div>
      </div>
      {!isEducatorView && (
        <Button
          className="w-full mt-4 bg-daycare-primary hover:bg-daycare-primary/90"
          onClick={handleContact}
        >
          Contacter l'éducateur
        </Button>
      )}
    </div>
  );
};

export default ChildEducatorParent;
