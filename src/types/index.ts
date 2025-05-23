export type UserRole = "admin" | "educator" | "parent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Child {
  id: string | number;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  allergies: string;
  emergencyContact: string;
  specialNeeds: string;
  parentId: string | number;
  educatorId?: string | number; // New field for assigned educator
  educator: User | null; // Educator object or null if not assigned
  parent: User | null; // Parent object or null if not assigned
  mediaConsent: boolean;
  profilePicture?: string;
  createdAt: string;
}

export type AdmissionStatus = "pending" | "accepted" | "rejected";

export interface AdmissionRequest {
  id: string;
  childName: string;
  gender: string;
  dateOfBirth: string;
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
  type: "photo" | "video";
}
