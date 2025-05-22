
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { admissionService } from '@/services/admissionService';
import { AdmissionRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AdmissionRequestListProps {
  parentId?: string;
  showOnlyPending?: boolean;
}

const AdmissionRequestList: React.FC<AdmissionRequestListProps> = ({ 
  parentId,
  showOnlyPending = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [parentId, user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let requestsData: AdmissionRequest[];
      
      if (parentId) {
        requestsData = await admissionService.getAdmissionRequestsByParentId(parentId);
      } else if (user?.role === 'parent') {
        requestsData = await admissionService.getAdmissionRequestsByParentId(user.id);
      } else if (showOnlyPending) {
        requestsData = await admissionService.getPendingAdmissionRequests();
      } else {
        requestsData = await admissionService.getAllAdmissionRequests();
      }
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching admission requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      if (!user) return;
      
      await admissionService.updateAdmissionStatus(id, 'approved', user.id);
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      ));
      
      toast({
        title: 'Demande approuvée',
        description: 'La demande d\'admission a été approuvée avec succès.',
      });
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'approbation de la demande.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      if (!user) return;
      
      await admissionService.updateAdmissionStatus(id, 'rejected', user.id);
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      ));
      
      toast({
        title: 'Demande refusée',
        description: 'La demande d\'admission a été refusée.',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du refus de la demande.',
        variant: 'destructive',
      });
    }
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Refusée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement des demandes d'admission...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">
          {user?.role === 'admin' 
            ? 'Aucune demande d\'admission à traiter' 
            : 'Vous n\'avez pas encore soumis de demande d\'admission'}
        </p>
        {user?.role === 'parent' && (
          <Button 
            className="mt-4 bg-daycare-primary hover:bg-daycare-primary/90"
            onClick={() => window.location.href = '/my-admissions/new'}
          >
            Soumettre une demande
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((request) => (
        <Card key={request.id} className="card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium">{request.childName}</h3>
              <Badge className={getBadgeColor(request.status)}>
                {getStatusText(request.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Date de naissance: {new Date(request.dob).toLocaleDateString('fr-FR')}
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <p className="font-medium">Allergies:</p>
                <p className="text-muted-foreground">{request.allergies || 'Aucune'}</p>
              </div>
              <div>
                <p className="font-medium">Besoins spéciaux:</p>
                <p className="text-muted-foreground">{request.specialNeeds || 'Aucun'}</p>
              </div>
              <div>
                <p className="font-medium">Consentement média:</p>
                <p className="text-muted-foreground">
                  {request.mediaConsent ? 'Accordé' : 'Non accordé'}
                </p>
              </div>
              <div>
                <p className="font-medium">Date de soumission:</p>
                <p className="text-muted-foreground">
                  {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
          {user?.role === 'admin' && request.status === 'pending' && (
            <CardFooter className="pt-2 flex gap-2">
              <Button 
                variant="default" 
                className="w-full bg-daycare-secondary hover:bg-daycare-secondary/90"
                onClick={() => handleApproveRequest(request.id)}
              >
                Approuver
              </Button>
              <Button 
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => handleRejectRequest(request.id)}
              >
                Refuser
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AdmissionRequestList;
