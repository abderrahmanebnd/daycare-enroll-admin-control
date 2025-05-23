import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ChildrenPage from "./pages/ChildrenPage";
import MyChildrenPage from "./pages/MyChildrenPage";
import MyAssignedChildrenPage from "./pages/MyAssignedChildrenPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import MyAdmissionsPage from "./pages/MyAdmissionsPage";
import NewAdmissionPage from "./pages/NewAdmissionPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";
import EditChildPage from "./pages/EditChildPage";
import ChildProfilePage from "./pages/ChildProfilePage";
import MediaGalleryPage from "./pages/MediaGalleryPage";
import UserManagement from "./pages/UserManagment";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/children" element={<ChildrenPage />} />
            <Route path="/my-children" element={<MyChildrenPage />} />
            <Route
              path="/my-assigned-children"
              element={<MyAssignedChildrenPage />}
            />
            <Route
              path="/admin/children/:id/edit"
              element={<EditChildPage />}
            />
            <Route path="/users" element={<UserManagement />} />
            <Route
              path="/parent/children/:id/profile"
              element={<ChildProfilePage />}
            />
            <Route
              path="/children/:id/profile"
              element={<ChildProfilePage />}
            />
            <Route path="/media" element={<MediaGalleryPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/my-admissions" element={<MyAdmissionsPage />} />
            <Route path="/my-admissions/new" element={<NewAdmissionPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
