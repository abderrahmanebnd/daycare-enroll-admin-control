
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { childService } from '@/services/childService';
import { Child } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import ChildList from '@/components/children/ChildList';

const MyAssignedChildrenPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [assignedChildren, setAssignedChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (!isLoading && user?.role !== 'educator') {
      navigate('/dashboard');
      return;
    }

    fetchAssignedChildren();
  }, [user, isLoading, navigate]);

  const fetchAssignedChildren = async () => {
    try {
      setLoading(true);
      if (user) {
        // Get all children
        const allChildren = await childService.getAllChildren();
        // Filter to only those assigned to this educator
        const children = allChildren.filter(child => child.educatorId === user.id);
        setAssignedChildren(children);
      }
    } catch (error) {
      console.error('Error fetching assigned children:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="page-container">
        <h1 className="text-3xl font-bold mb-6">Mes enfants assignés</h1>
        <ChildList 
          isEducatorView={true} 
          filteredChildren={assignedChildren}
        />
      </div>
    </MainLayout>
  );
};

export default MyAssignedChildrenPage;
