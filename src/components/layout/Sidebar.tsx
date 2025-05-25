import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    setActiveItem(pathSegments[1] || "dashboard");
  }, [location]);

  const adminLinks = [
    { name: "Tableau de bord", path: "/dashboard", icon: "📊" },
    { name: "Demandes d'admission", path: "/admissions", icon: "📝" },
    { name: "Enfants", path: "/children", icon: "👶" },
    { name: "Utilisateurs", path: "/users", icon: "👥" },
    { name: "Messages", path: "/messages", icon: "💬" },
    { name: "Média", path: "/media", icon: "📸" },

    // { name: 'Notifications', path: '/notifications', icon: '🔔' },
  ];

  const educatorLinks = [
    { name: "Tableau de bord", path: "/dashboard", icon: "📊" },
    { name: "Enfants", path: "/children", icon: "👶" },
    { name: "Messages", path: "/messages", icon: "💬" },
    { name: "Média", path: "/media", icon: "📸" },
  ];

  const parentLinks = [
    { name: "Tableau de bord", path: "/dashboard", icon: "📊" },
    { name: "Mes enfants", path: "/my-children", icon: "👶" },
    { name: "Demandes d'admission", path: "/my-admissions", icon: "📝" },
    { name: "Messages", path: "/messages", icon: "💬" },
    { name: "Média", path: "/media", icon: "📸" },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case "admin":
        return adminLinks;
      case "educator":
        return educatorLinks;
      case "parent":
        return parentLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="w-64 min-h-screen bg-sidebar border-r shadow-sm hidden md:block">
      <div className="py-6 px-4">
        <h1 className="text-2xl font-bold mb-8 text-center text-daycare-dark">
          <span className="text-daycare-primary">Little</span>Dreams
        </h1>
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                activeItem === link.path.substring(1)
                  ? "bg-daycare-primary text-white"
                  : "hover:bg-daycare-light hover:text-daycare-primary"
              )}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
