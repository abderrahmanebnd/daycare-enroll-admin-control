import axiosPrivate from "@/axios/axios";
import { Media } from "@/types";

// Mock data for media
const MOCK_MEDIA: Media[] = [
  {
    id: "1",
    fileUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843",
    childId: "1",
    description: "Jeu en extérieur",
    uploadedBy: "3", // educator
    createdAt: "2025-04-15T10:30:00Z",
    type: "photo",
  },
  {
    id: "2",
    fileUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    childId: "2",
    description: "Activité artistique",
    uploadedBy: "3", // educator
    createdAt: "2025-04-16T14:20:00Z",
    type: "photo",
  },
  {
    id: "3",
    fileUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86",
    childId: "1",
    description: "Sortie nature",
    uploadedBy: "3", // educator
    createdAt: "2025-04-17T11:15:00Z",
    type: "photo",
  },
  {
    id: "4",
    fileUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    childId: "3",
    description: "Activité sensorielle",
    uploadedBy: "4", // another educator
    createdAt: "2025-04-18T09:45:00Z",
    type: "photo",
  },
];

class MediaService {
  private media: Media[] = [...MOCK_MEDIA];

  async getAllMedia(): Promise<Media[]> {
    const { data } = await axiosPrivate.get("/media");
    console.log("Fetched media data:", data.data);
    return data.data;
  }

  async getMediaByChildId(childId: string): Promise<Media[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.media.filter((media) => media.childId === childId);
  }

  async getMediaByUploaderId(uploaderId: string): Promise<Media[]> {
    const { data } = await axiosPrivate.get(`/media/${uploaderId}`);
    console.log("Fetched media by uploader:", data.data);
    return data.data;
  }

  async addMedia(formData: FormData) {
    return axiosPrivate.post("/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async deleteMedia(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const initialLength = this.media.length;
    this.media = this.media.filter((media) => media.id !== id);

    return this.media.length < initialLength;
  }
}

export const mediaService = new MediaService();
