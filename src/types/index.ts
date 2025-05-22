
export type UserRole = 'admin' | 'educator' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Child {
  id: string;
  name: string;
  dob: string;
  allergies: string;
  specialNeeds: string;
  parentId: string;
  educatorId?: string;  // New field for assigned educator
  mediaConsent: boolean;
  profilePicture?: string;
  createdAt: string;
}

export type AdmissionStatus = 'pending' | 'approved' | 'rejected';

export interface AdmissionRequest {
  id: string;
  childName: string;
  dob: string;
  allergies: string;
  specialNeeds: string;
  parentId: string;
  mediaConsent: boolean;
  status: AdmissionStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  targetRole?: UserRole;
  targetUserId?: string;
  read: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Media {
  id: string;
  fileUrl: string;
  childId: string;
  description?: string;
  uploadedBy: string;
  createdAt: string;
}
