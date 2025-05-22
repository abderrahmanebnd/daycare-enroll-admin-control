
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import ChildList from '@/components/children/ChildList';

const MyChildrenPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    if (!isLoading && user?.role !== 'parent') {
      navigate('/children');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return (
    <MainLayout>
      <div className="page-container">
        <h1 className="text-3xl font-bold mb-6">Mes enfants</h1>
        <ChildList isParentView={true} />
      </div>
    </MainLayout>
  );
};

export default MyChildrenPage;
