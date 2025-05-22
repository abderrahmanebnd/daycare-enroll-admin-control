
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { childService } from '@/services/childService';
import { Child } from '@/types';
import ChildCard from './ChildCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChildListProps {
  parentId?: string;
  isParentView?: boolean;
  isEducatorView?: boolean;
  filteredChildren?: Child[];
}

const ChildList: React.FC<ChildListProps> = ({ 
  parentId, 
  isParentView = false, 
  isEducatorView = false,
  filteredChildren: initialFilteredChildren 
}) => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialFilteredChildren) {
      setChildren(initialFilteredChildren);
      setFilteredChildren(initialFilteredChildren);
      setLoading(false);
    } else {
      fetchChildren();
    }
  }, [parentId, user, initialFilteredChildren]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredChildren(children);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = children.filter(child => 
        child.name.toLowerCase().includes(lowerSearchTerm) || 
        child.allergies.toLowerCase().includes(lowerSearchTerm) ||
        child.specialNeeds.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredChildren(filtered);
    }
  }, [searchTerm, children]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      let childrenData: Child[];
      
      if (parentId) {
        childrenData = await childService.getChildrenByParentId(parentId);
      } else if (user?.role === 'parent') {
        childrenData = await childService.getChildrenByParentId(user.id);
      } else {
        childrenData = await childService.getAllChildren();
      }
      
      setChildren(childrenData);
      setFilteredChildren(childrenData);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Chargement des profils d'enfants...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
        <Input
          placeholder="Rechercher par nom, allergies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        {(user?.role === 'admin' || user?.role === 'educator') && !isParentView && (
          <Button className="bg-daycare-primary hover:bg-daycare-primary/90">
            Ajouter un enfant
          </Button>
        )}
      </div>

      {filteredChildren.length === 0 ? (
        <div className="text-center p-8 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">
            {searchTerm ? 'Aucun enfant ne correspond à votre recherche' : 'Aucun enfant inscrit'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChildren.map((child) => (
            <ChildCard 
              key={child.id} 
              child={child} 
              isParent={isParentView} 
              isEducator={isEducatorView} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildList;
