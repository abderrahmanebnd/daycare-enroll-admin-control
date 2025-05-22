
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import AdmissionRequestList from '@/components/admissions/AdmissionRequestList';

const AdmissionsPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    if (!isLoading && user?.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return (
    <MainLayout>
      <div className="page-container">
        <h1 className="text-3xl font-bold mb-6">Demandes d'admission</h1>
        <div className="mb-6">
          <p className="text-muted-foreground">
            Vous pouvez approuver ou refuser les demandes d'admission des parents.
          </p>
        </div>
        <AdmissionRequestList showOnlyPending={true} />
      </div>
    </MainLayout>
  );
};

export default AdmissionsPage;
