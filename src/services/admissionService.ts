
import { AdmissionRequest, AdmissionStatus } from '@/types';
import { MOCK_ADMISSION_REQUESTS } from './mockData';
import { childService } from './childService';
import { notificationService } from './notificationService';

// Mock service for admission requests
class AdmissionService {
  private admissionRequests: AdmissionRequest[] = [...MOCK_ADMISSION_REQUESTS];

  async getAllAdmissionRequests(): Promise<AdmissionRequest[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.admissionRequests];
  }

  async getPendingAdmissionRequests(): Promise<AdmissionRequest[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.admissionRequests.filter(request => request.status === 'pending');
  }

  async getAdmissionRequestById(id: string): Promise<AdmissionRequest | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.admissionRequests.find(request => request.id === id);
  }

  async getAdmissionRequestsByParentId(parentId: string): Promise<AdmissionRequest[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.admissionRequests.filter(request => request.parentId === parentId);
  }

  async createAdmissionRequest(request: Omit<AdmissionRequest, 'id' | 'status' | 'createdAt'>): Promise<AdmissionRequest> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newRequest: AdmissionRequest = {
      ...request,
      id: (this.admissionRequests.length + 1).toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    this.admissionRequests.push(newRequest);
    
    // Notify admin about new request (in a real app, this would be done on the server)
    await notificationService.createNotification({
      title: 'Nouvelle demande d\'admission',
      content: `Une nouvelle demande d'admission a été soumise pour ${newRequest.childName}.`,
      targetRole: 'admin',
      read: false,
      createdBy: request.parentId,
    });
    
    return newRequest;
  }

  async updateAdmissionStatus(id: string, status: AdmissionStatus, adminId: string): Promise<AdmissionRequest | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = this.admissionRequests.findIndex(request => request.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    const updatedRequest: AdmissionRequest = {
      ...this.admissionRequests[index],
      status,
    };
    
    this.admissionRequests[index] = updatedRequest;
    
    // If approved, create a child record
    if (status === 'approved') {
      await childService.createChild({
        name: updatedRequest.childName,
        dob: updatedRequest.dob,
        allergies: updatedRequest.allergies,
        specialNeeds: updatedRequest.specialNeeds,
        parentId: updatedRequest.parentId,
        mediaConsent: updatedRequest.mediaConsent,
      });
      
      // Notify parent about approval
      await notificationService.createNotification({
        title: 'Demande d\'admission approuvée',
        content: `Votre demande d'admission pour ${updatedRequest.childName} a été approuvée.`,
        targetUserId: updatedRequest.parentId,
        read: false,
        createdBy: adminId,
      });
    } else if (status === 'rejected') {
      // Notify parent about rejection
      await notificationService.createNotification({
        title: 'Demande d\'admission refusée',
        content: `Votre demande d'admission pour ${updatedRequest.childName} a été refusée. Veuillez nous contacter pour plus d'informations.`,
        targetUserId: updatedRequest.parentId,
        read: false,
        createdBy: adminId,
      });
    }
    
    return updatedRequest;
  }
}

export const admissionService = new AdmissionService();
