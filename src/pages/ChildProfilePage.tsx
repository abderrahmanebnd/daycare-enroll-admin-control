
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { childService } from '@/services/childService';
import { mediaService } from '@/services/mediaService';
import { Child, Media } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import ChildEducator from '@/components/children/ChildEducator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon } from 'lucide-react';

const ChildProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [childMedia, setChildMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (id) {
      fetchChildData(id);
    }
  }, [id, user, isLoading, navigate]);

  const fetchChildData = async (childId: string) => {
    try {
      setLoading(true);
      const childData = await childService.getChildById(childId);
      
      if (!childData) {
        navigate('/my-children');
        return;
      }
      
      // Verify if current user is the parent of this child
      if (user?.role === 'parent' && childData.parentId !== user.id) {
        navigate('/my-children');
        return;
      }
      
      setChild(childData);
      
      // Fetch media for this child if media consent is given
      if (childData.mediaConsent) {
        const mediaData = await mediaService.getMediaByChildId(childId);
        setChildMedia(mediaData);
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const calculateAge = (dob: string) => {
    const birthdate = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birthdate.getFullYear();
    const monthDiff = now.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age < 1 
      ? `${Math.floor((now.getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24 * 30))} mois`
      : `${age} an${age > 1 ? 's' : ''}`;
  };

  const handleContactEducator = () => {
    if (child?.educatorId) {
      navigate(`/messages?contactId=${child.educatorId}`);
    }
  };

  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <p>Chargement du profil...</p>
        </div>
      </MainLayout>
    );
  }

  if (!child) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Profil de {child.name}</h1>
          <Button 
            variant="outline"
            onClick={() => navigate(user?.role === 'parent' ? '/my-children' : '/children')}
          >
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Child info */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={child.profilePicture} alt={child.name} />
                  <AvatarFallback className="bg-daycare-primary text-white text-2xl">
                    {getInitials(child.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-2xl font-bold mb-1">{child.name}</h2>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                      {format(new Date(child.dob), 'dd MMMM yyyy')} ({calculateAge(child.dob)})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <div className={`w-3 h-3 rounded-full ${child.mediaConsent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">
                      {child.mediaConsent ? 'Consentement média accordé' : 'Pas de consentement média'}
                    </span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Informations</TabsTrigger>
                  <TabsTrigger value="media" disabled={!child.mediaConsent}>
                    Médias ({childMedia.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Allergies</h3>
                      <p className="text-muted-foreground mt-1">
                        {child.allergies || 'Aucune allergie signalée'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Besoins spéciaux</h3>
                      <p className="text-muted-foreground mt-1">
                        {child.specialNeeds || 'Aucun besoin spécial signalé'}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Date d'inscription</h3>
                      <p className="text-muted-foreground mt-1">
                        {format(new Date(child.createdAt), 'dd MMMM yyyy')}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="media">
                  {childMedia.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Aucun média disponible pour cet enfant
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {childMedia.map(media => (
                        <div key={media.id} className="relative aspect-square overflow-hidden rounded-md border">
                          {media.type === 'photo' ? (
                            <img 
                              src={media.fileUrl} 
                              alt={media.description || 'Photo'} 
                              className="h-full w-full object-cover transition-all hover:scale-105"
                            />
                          ) : (
                            <video 
                              src={media.fileUrl} 
                              controls 
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right column - Educator info */}
          <div>
            <ChildEducator educatorId={child.educatorId} />
            
            {user?.role === 'parent' && child.educatorId && (
              <Button 
                className="w-full mt-4"
                onClick={handleContactEducator}
              >
                Contacter l'éducateur
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChildProfilePage;
