
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import AdmissionRequestForm from '@/components/admissions/AdmissionRequestForm';

const NewAdmissionPage = () => {
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
        <h1 className="text-3xl font-bold mb-6">Nouvelle demande d'admission</h1>
        <div className="mb-6">
          <p className="text-muted-foreground">
            Remplissez ce formulaire pour demander l'admission de votre enfant à la crèche.
          </p>
        </div>
        <AdmissionRequestForm />
      </div>
    </MainLayout>
  );
};

export default NewAdmissionPage;
