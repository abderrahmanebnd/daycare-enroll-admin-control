
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import NotificationBell from '@/components/notifications/NotificationBell';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b h-16 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-daycare-dark">
            <span className="text-daycare-primary">Little</span>Dreams
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
          © 2025 Little Dreams Daycare. Tous droits réservés.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
