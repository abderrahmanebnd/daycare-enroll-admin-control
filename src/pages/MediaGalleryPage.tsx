import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mediaService } from "@/services/mediaService";
import { childService } from "@/services/childService";
import { Media, Child, User } from "@/types";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_USERS } from "@/services/mockData";

const MediaGalleryPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [media, setMedia] = useState<Media[]>([]);
  const [userChildren, setUserChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
      return;
    }

    fetchData();
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMedia(media);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = media.filter(
        (item) =>
          item.description?.toLowerCase().includes(lowerSearchTerm) ||
          getUserName(item.uploadedBy)
            .toLowerCase()
            .includes(lowerSearchTerm) ||
          getChildName(item.childId).toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredMedia(filtered);
    }
  }, [searchTerm, media]);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user) return;

      let mediaData: Media[] = [];

      // Different media access based on user role
      if (user.role === "parent") {
        // Get parent's children
        const children = await childService.getMyChildren(user.id);
        setUserChildren(children);

        // Get media for each child with consent
        const childrenWithConsent = children.filter(
          (child) => child.mediaConsent
        );
        const childIds = childrenWithConsent.map((child) => child.id);

        if (childIds.length > 0) {
          const allMedia = await mediaService.getAllMedia();
          mediaData = allMedia.filter((m) => childIds.includes(m.childId));
        }
      } else if (user.role === "educator") {
        // Get media uploaded by this educator
        mediaData = await mediaService.getMediaByUploaderId(user.id);

        // Also get all children to display names
        const children = await childService.getAllChildren();
        setUserChildren(children);
      } else if (user.role === "admin") {
        // Admin sees all media
        mediaData = await mediaService.getAllMedia();

        // Get all children to display names
        const children = await childService.getAllChildren();
        setUserChildren(children);
      }

      setMedia(mediaData);
      setFilteredMedia(mediaData);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string): string => {
    const foundUser = MOCK_USERS.find((u) => u.id === userId);
    return foundUser ? foundUser.name : "Éducateur inconnu";
  };

  const getChildName = (childId: string): string => {
    const child = userChildren.find((c) => c.id === childId);
    return child ? child.name : "Enfant inconnu";
  };

  const handleUploadMedia = () => {
    // For now, just log this action
    console.log("Upload media clicked");
  };

  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="text-center p-8">
          <p>Chargement de la galerie...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Galerie de médias</h1>
          {(user?.role === "admin" || user?.role === "educator") && (
            <Button
              className="bg-daycare-primary hover:bg-daycare-primary/90 mt-4 sm:mt-0"
              onClick={handleUploadMedia}
            >
              Ajouter une photo
            </Button>
          )}
        </div>

        <div className="mb-6">
          <Input
            placeholder="Rechercher par description, enfant ou éducateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredMedia.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">
              {searchTerm
                ? "Aucun média ne correspond à votre recherche"
                : user?.role === "parent"
                ? "Aucun média disponible pour vos enfants"
                : "Aucun média n'a été ajouté pour le moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg border bg-card shadow-sm"
              >
                <div className="relative aspect-video overflow-hidden">
                  {item.type === "photo" ? (
                    <img
                      src={item.fileUrl}
                      alt={item.description || "Image"}
                      className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.fileUrl}
                      controls
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">
                      {getChildName(item.childId)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Par: {getUserName(item.uploadedBy)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MediaGalleryPage;
