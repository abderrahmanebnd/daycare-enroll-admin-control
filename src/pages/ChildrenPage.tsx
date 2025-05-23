
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ChildList from "@/components/children/ChildList";
import AddChildForm from "@/components/children/AddChildForm";

const ChildrenPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }

    if (!isLoading && user?.role === "parent") {
      navigate("/my-children");
    }
  }, [user, isLoading, navigate]);

  const handleChildAdded = () => {
    window.location.reload(); // Simple refresh for now
  };

  if (isLoading || !user) {
    return <div>Chargement...</div>;
  }

  return (
    <MainLayout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Gestion des enfants</h1>
          {user.role === "admin" && (
            <AddChildForm onChildAdded={handleChildAdded} />
          )}
        </div>
        <ChildList
          isEducatorView={user.role === "educator"}
          isParentView={user.role === "parent"}
        />
      </div>
    </MainLayout>
  );
};

export default ChildrenPage;
