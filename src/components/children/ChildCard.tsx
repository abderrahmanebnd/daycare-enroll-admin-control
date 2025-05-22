
import { useNavigate } from 'react-router-dom';
import { Child } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChildCardProps {
  child: Child;
  isParent?: boolean;
  isEducator?: boolean;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, isParent = false, isEducator = false }) => {
  const navigate = useNavigate();
  
  const birthdate = new Date(child.dob);
  const now = new Date();
  let age = now.getFullYear() - birthdate.getFullYear();
  const monthDiff = now.getMonth() - birthdate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthdate.getDate())) {
    age--;
  }
  
  const ageText = age < 1 
    ? `${Math.floor((now.getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24 * 30))} mois`
    : `${age} an${age > 1 ? 's' : ''}`;

  const handleViewProfile = () => {
    if (isParent) {
      navigate(`/parent/children/${child.id}/profile`);
    } else if (isEducator) {
      navigate(`/children/${child.id}/profile`);
    } else {
      navigate(`/admin/children/${child.id}/edit`);
    }
  };

  const handleMessageParent = () => {
    navigate(`/messages?parentId=${child.parentId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-16 w-16">
          <AvatarImage src={child.profilePicture} alt={child.name} />
          <AvatarFallback className="bg-daycare-primary text-white text-lg">
            {getInitials(child.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{child.name}</h3>
          <p className="text-sm text-muted-foreground">{ageText}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium">Allergies:</p>
            <p className="text-muted-foreground">{child.allergies || 'Aucune'}</p>
          </div>
          <div>
            <p className="font-medium">Besoins spéciaux:</p>
            <p className="text-muted-foreground">{child.specialNeeds || 'Aucun'}</p>
          </div>
          <div className="col-span-2 mt-2">
            <p className="font-medium">Consentement média:</p>
            <p className="text-muted-foreground">
              {child.mediaConsent ? 'Accordé' : 'Non accordé'}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2">
        <Button 
          variant="default" 
          className="w-full bg-daycare-primary hover:bg-daycare-primary/90"
          onClick={handleViewProfile}
        >
          {isParent || isEducator ? 'Voir le profil' : 'Modifier'}
        </Button>
        {!isParent && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleMessageParent}
          >
            Contacter parent
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChildCard;
