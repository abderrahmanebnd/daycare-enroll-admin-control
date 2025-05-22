
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { childService } from '@/services/childService';
import { Child } from '@/types';
import ChildList from '@/components/children/ChildList';

const MyAssignedChildrenPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [assignedChildren, setAssignedChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    if (!isLoading && user?.role !== 'educator') {
      navigate('/dashboard');
    }
    
    if (user?.role === 'educator') {
      fetchAssignedChildren();
    }
  }, [user, isLoading, navigate]);

  const fetchAssignedChildren = async () => {
    try {
      setLoading(true);
      const allChildren = await childService.getAllChildren();
      const myChildren = allChildren.filter(child => child.educatorId === user?.id);
      setAssignedChildren(myChildren);
    } catch (error) {
      console.error('Error fetching assigned children:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return (
    <MainLayout>
      <div className="page-container">
        <h1 className="text-3xl font-bold mb-6">Mes enfants assignés</h1>
        <div className="mb-6">
          <p className="text-muted-foreground">
            Voici la liste des enfants qui vous sont assignés en tant qu'éducateur.
          </p>
        </div>
        {loading ? (
          <div className="text-center p-8">
            <p>Chargement des enfants...</p>
          </div>
        ) : assignedChildren.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">
              Aucun enfant ne vous a été assigné pour le moment.
            </p>
          </div>
        ) : (
          <ChildList filteredChildren={assignedChildren} isEducatorView={true} />
        )}
      </div>
    </MainLayout>
  );
};

export default MyAssignedChildrenPage;
