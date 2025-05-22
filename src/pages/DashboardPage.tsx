
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { childService } from '@/services/childService';
import { admissionService } from '@/services/admissionService';
import { messageService } from '@/services/messageService';
import { notificationService } from '@/services/notificationService';
import { Child, AdmissionRequest, Message, Notification } from '@/types';

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [admissionRequests, setAdmissionRequests] = useState<AdmissionRequest[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    if (user) {
      fetchDashboardData();
    }
  }, [user, isLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsDataLoading(true);
      
      // Fetch children data
      let childrenData: Child[] = [];
      if (user?.role === 'parent') {
        childrenData = await childService.getChildrenByParentId(user.id);
      } else {
        childrenData = await childService.getAllChildren();
      }
      setChildren(childrenData);
      
      // Fetch admission requests
      let requestsData: AdmissionRequest[] = [];
      if (user?.role === 'admin') {
        requestsData = await admissionService.getPendingAdmissionRequests();
      } else if (user?.role === 'parent') {
        requestsData = await admissionService.getAdmissionRequestsByParentId(user.id);
      }
      setAdmissionRequests(requestsData);
      
      // Fetch unread messages
      const messages = await messageService.getMessagesByReceiverId(user!.id);
      const unreadCount = messages.filter(m => !m.read).length;
      setUnreadMessages(unreadCount);
      
      // Fetch notifications
      const userNotifications = await notificationService.getNotificationsByUserId(user!.id);
      setNotifications(userNotifications.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return (
    <MainLayout>
      <div className="fade-in">
        <h1 className="text-3xl font-bold mb-6">
          Bienvenue, {user.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover bg-gradient-to-br from-daycare-primary to-daycare-primary/80 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Enfants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-2">{children.length}</p>
              <p className="text-sm opacity-80">
                {user.role === 'parent' 
                  ? 'Enfants inscrits'
                  : 'Enfants dans la crèche'}
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4 bg-white text-daycare-primary hover:bg-white/90"
                onClick={() => navigate(user.role === 'parent' ? '/my-children' : '/children')}
              >
                {user.role === 'parent' ? 'Voir mes enfants' : 'Gérer les enfants'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-daycare-secondary to-daycare-secondary/80 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Demandes d'admission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-2">{admissionRequests.length}</p>
              <p className="text-sm opacity-80">
                {user.role === 'admin' 
                  ? 'En attente de validation'
                  : 'Demandes soumises'}
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4 bg-white text-daycare-secondary hover:bg-white/90"
                onClick={() => navigate(user.role === 'parent' ? '/my-admissions' : '/admissions')}
              >
                {user.role === 'parent' ? 'Voir mes demandes' : 'Traiter les demandes'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-daycare-accent to-daycare-accent/80 text-daycare-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-2">{unreadMessages}</p>
              <p className="text-sm opacity-80">
                Messages non lus
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4 bg-white text-daycare-accent hover:bg-white/90"
                onClick={() => navigate('/messages')}
              >
                Voir les messages
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-daycare-dark to-daycare-dark/80 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-2">
                {notifications.filter(n => !n.read).length}
              </p>
              <p className="text-sm opacity-80">
                Notifications non lues
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4 bg-white text-daycare-dark hover:bg-white/90"
                onClick={() => navigate('/notifications')}
              >
                Voir les notifications
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <p>Chargement...</p>
              ) : notifications.length === 0 ? (
                <p className="text-muted-foreground">Aucune notification récente</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border-b pb-3">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{notification.title}</h3>
                        {!notification.read && (
                          <span className="bg-daycare-primary w-2 h-2 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/notifications')}
                  >
                    Voir toutes les notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {user.role === 'parent' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-daycare-primary hover:bg-daycare-primary/90"
                    onClick={() => navigate('/my-admissions/new')}
                  >
                    Nouvelle demande d'admission
                  </Button>
                  <Button 
                    className="w-full bg-daycare-secondary hover:bg-daycare-secondary/90"
                    onClick={() => navigate('/messages')}
                  >
                    Contacter un éducateur
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/media')}
                  >
                    Voir les photos de mes enfants
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {user.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Demandes d'admission en attente</CardTitle>
              </CardHeader>
              <CardContent>
                {isDataLoading ? (
                  <p>Chargement...</p>
                ) : admissionRequests.length === 0 ? (
                  <p className="text-muted-foreground">Aucune demande en attente</p>
                ) : (
                  <div className="space-y-4">
                    {admissionRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="border-b pb-3">
                        <h3 className="font-medium">{request.childName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Date de naissance: {new Date(request.dob).toLocaleDateString('fr-FR')}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            className="bg-daycare-secondary hover:bg-daycare-secondary/90"
                            onClick={() => navigate(`/admissions/${request.id}`)}
                          >
                            Voir détails
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/admissions')}
                    >
                      Voir toutes les demandes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {user.role === 'educator' && (
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-daycare-primary hover:bg-daycare-primary/90"
                    onClick={() => navigate('/children')}
                  >
                    Gérer les enfants
                  </Button>
                  <Button 
                    className="w-full bg-daycare-secondary hover:bg-daycare-secondary/90"
                    onClick={() => navigate('/messages')}
                  >
                    Contacter les parents
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/media')}
                  >
                    Gérer les photos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
