
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { MOCK_USERS } from '@/services/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ChildEducatorProps {
  educatorId?: string;
}

const ChildEducator: React.FC<ChildEducatorProps> = ({ educatorId }) => {
  const [educator, setEducator] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (educatorId) {
      // Find educator from mock data
      const foundEducator = MOCK_USERS.find(user => user.id === educatorId);
      if (foundEducator) {
        setEducator(foundEducator);
      }
    }
  }, [educatorId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleContactEducator = () => {
    if (educator) {
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
          <p className="text-sm text-muted-foreground">
            {educator.email}
          </p>
        </div>
      </div>
      <Button 
        className="w-full mt-4 bg-daycare-primary hover:bg-daycare-primary/90"
        onClick={handleContactEducator}
      >
        Contacter l'éducateur
      </Button>
    </div>
  );
};

export default ChildEducator;
