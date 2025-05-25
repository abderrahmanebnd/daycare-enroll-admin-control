import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mediaService } from "@/services/mediaService";
import { childService } from "@/services/childService";
import { Media, Child } from "@/types";
import MainLayout from "@/components/layout/MainLayout";
import AddMediaForm from "@/components/media/AddMediaForm";

const MediaGalleryPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [media, setMedia] = useState<Media[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    } else if (user) {
      fetchData();
    }
  }, [user, isLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);

      let mediaData: Media[] = [];
      let childrenData: Child[] = [];

      if (user?.role === "parent") {
        childrenData = await childService.getMyChildren();
        const consented = childrenData.filter((c) => c.mediaConsent);
        const allMedia = await mediaService.getAllMedia();
        mediaData = allMedia.filter((m) =>
          consented.some((c) => c.id === m.childId)
        );
      } else if (user?.role === "educator") {
        mediaData = await mediaService.getMediaByUploaderId(user.id);
        childrenData = await childService.getAllChildren();
      } else if (user?.role === "admin") {
        mediaData = await mediaService.getAllMedia();
        childrenData = await childService.getAllChildren();
      }

      setMedia(mediaData);
      setChildren(childrenData);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChildName = (childId: number): string => {
    const child = children.find((c) => c.id === childId);
    return child ? child.fullName : "Enfant inconnu";
  };

  const handleMediaAdded = () => {
    fetchData();
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
            <AddMediaForm onMediaAdded={handleMediaAdded} />
          )}
        </div>

        {media.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">
              {user?.role === "parent"
                ? "Aucun média disponible pour vos enfants"
                : "Aucun média n'a été ajouté pour le moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg border bg-card shadow-sm"
              >
                <div className="relative aspect-video overflow-hidden">
                  {item.type === "photo" ? (
                    <img
                      src={`http://localhost:3000${item.fileUrl}`}
                      alt={item.title || "Image"}
                      className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                  ) : (
                    <video
                      src={`http://localhost:3000${item.fileUrl}`}
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
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <b className="text-black">Uploaded by: </b>
                    {item.uploader.name}
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
