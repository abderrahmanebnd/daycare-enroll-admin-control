
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ChildList from '@/components/children/ChildList';

const ChildrenPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    if (!isLoading && user?.role === 'parent') {
      navigate('/my-children');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return (
    <MainLayout>
      <div className="page-container">
        <h1 className="text-3xl font-bold mb-6">Gestion des enfants</h1>
        <ChildList />
      </div>
    </MainLayout>
  );
};

export default ChildrenPage;
