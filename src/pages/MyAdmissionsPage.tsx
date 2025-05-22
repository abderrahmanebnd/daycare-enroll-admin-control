
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import AdmissionRequestList from '@/components/admissions/AdmissionRequestList';
import { Button } from '@/components/ui/button';

const MyAdmissionsPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    if (!isLoading && user?.role !== 'parent') {
      navigate('/admissions');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return (
    <MainLayout>
      <div className="page-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mes demandes d'admission</h1>
          <Button 
            className="bg-daycare-primary hover:bg-daycare-primary/90"
            onClick={() => navigate('/my-admissions/new')}
          >
            Nouvelle demande
          </Button>
        </div>
        <div className="mb-6">
          <p className="text-muted-foreground">
            Suivez l'état de vos demandes d'admission et soumettez-en de nouvelles.
          </p>
        </div>
        <AdmissionRequestList />
      </div>
    </MainLayout>
  );
};

export default MyAdmissionsPage;
