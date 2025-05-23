import { AdmissionRequest, AdmissionStatus } from "@/types";
import axiosPrivate from "@/axios/axios";
import { notificationService } from "./notificationService";

class AdmissionService {
  async getAllAdmissionRequests(): Promise<AdmissionRequest[]> {
    const { data } = await axiosPrivate.get("/admissions");
    return data.data;
  }

  async getPendingAdmissionRequests(): Promise<AdmissionRequest[]> {
    const { data } = await axiosPrivate.get("/admissions?status=pending");
    return data.data;
  }

  async getAdmissionRequestById(id: string): Promise<AdmissionRequest> {
    const { data } = await axiosPrivate.get(`/admissions/${id}`);
    return data.data;
  }

  async getAdmissionRequestsByParentId(): Promise<AdmissionRequest[]> {
    // Assuming backend uses req.user from JWT to determine parent
    const { data } = await axiosPrivate.get("/admissions/me");
    console.log("Admission requests for parent:", data);
    return data.data;
  }

  async createAdmissionRequest(
    request: Omit<AdmissionRequest, "id" | "status" | "createdAt">
  ): Promise<AdmissionRequest> {
    const { data } = await axiosPrivate.post("/admissions", request);

    // Optionally trigger notification on backend instead of frontend
    await notificationService.createNotification({
      title: "Nouvelle demande d'admission",
      content: `Une nouvelle demande d'admission a été soumise pour ${request.childName}.`,
      targetRole: "admin",
      read: false,
      createdBy: request.parentId,
    });

    return data;
  }

  async updateAdmissionStatus(
    id: string,
    status: AdmissionStatus,
    adminId: string,
    educatorId?: string
  ): Promise<AdmissionRequest> {
    const payload: any = { decision: status };

    if (status === "approved" && educatorId) {
      payload.educatorId = educatorId;
    }

    const { data } = await axiosPrivate.patch(
      `/admissions/${id}/decision`,
      payload
    );

    // Notifications can still be sent from frontend if needed
    return data;
  }
}

export const admissionService = new AdmissionService();
