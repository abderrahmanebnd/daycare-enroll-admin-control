
import { User, Child, AdmissionRequest, Message, Notification, Media } from '@/types';

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Sophie Martin',
    email: 'educator@example.com',
    role: 'educator',
    createdAt: '2023-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Pierre Dupont',
    email: 'parent@example.com',
    role: 'parent',
    createdAt: '2023-01-03T00:00:00Z',
  },
  {
    id: '4',
    name: 'Marie Laurent',
    email: 'parent2@example.com',
    role: 'parent',
    createdAt: '2023-01-04T00:00:00Z',
  },
];

// Mock Children
export const MOCK_CHILDREN: Child[] = [
  {
    id: '1',
    fullName: 'Emma Dupont',
    dateOfBirth: '2019-05-12T00:00:00Z',
    allergies: 'Nuts, Eggs',
    specialNeeds: 'None',
    parentId: '3',
    mediaConsent: true,
    profilePicture: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=300&h=300',
    createdAt: '2023-02-01T00:00:00Z',
  },
  {
    id: '2',
    fullName: 'Lucas Laurent',
    dateOfBirth: '2020-03-22T00:00:00Z',
    allergies: 'None',
    specialNeeds: 'Mild sensory sensitivity',
    parentId: '4',
    mediaConsent: false,
    profilePicture: 'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?auto=format&fit=crop&w=300&h=300',
    createdAt: '2023-02-02T00:00:00Z',
  },
  {
    id: '3',
    fullName: 'Léa Dupont',
    dateOfBirth: '2021-01-08T00:00:00Z',
    allergies: 'Dairy',
    specialNeeds: 'None',
    parentId: '3',
    mediaConsent: true,
    profilePicture: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=300&h=300',
    createdAt: '2023-02-03T00:00:00Z',
  },
];

// Mock Admission Requests
export const MOCK_ADMISSION_REQUESTS: AdmissionRequest[] = [
  {
    id: '1',
    childName: 'Noah Bernard',
    dateOfBirth: '2021-07-15T00:00:00Z',
    allergies: 'Peanuts',
    specialNeeds: 'None',
    parentId: '4',
    mediaConsent: true,
    status: 'pending',
    createdAt: '2023-04-01T00:00:00Z',
  },
  {
    id: '2',
    childName: 'Chloé Moreau',
    dateOfBirth: '2020-11-30T00:00:00Z',
    allergies: 'None',
    specialNeeds: 'Speech delay',
    parentId: '3',
    mediaConsent: false,
    status: 'pending',
    createdAt: '2023-04-02T00:00:00Z',
  },
  {
    id: '3',
    childName: 'Ethan Petit',
    dateOfBirth: '2022-02-18T00:00:00Z',
    allergies: 'Gluten',
    specialNeeds: 'None',
    parentId: '4',
    mediaConsent: true,
    status: 'approved',
    createdAt: '2023-03-15T00:00:00Z',
  },
  {
    id: '4',
    childName: 'Jade Roux',
    dateOfBirth: '2021-12-05T00:00:00Z',
    allergies: 'None',
    specialNeeds: 'None',
    parentId: '3',
    mediaConsent: true,
    status: 'rejected',
    createdAt: '2023-03-10T00:00:00Z',
  },
];

// Mock Messages
export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: '3', // Parent
    receiverId: '2', // Educator
    content: "Bonjour, est-ce qu'Emma a bien mangé aujourd'hui?",
    read: true,
    createdAt: '2023-05-01T10:30:00Z',
  },
  {
    id: '2',
    senderId: '2', // Educator
    receiverId: '3', // Parent
    content: "Bonjour! Oui, Emma a très bien mangé aujourd'hui. Elle a particulièrement apprécié les légumes!",
    read: true,
    createdAt: '2023-05-01T11:15:00Z',
  },
  {
    id: '3',
    senderId: '4', // Parent 2
    receiverId: '2', // Educator
    content: "Bonjour, Lucas a-t-il bien dormi pendant la sieste?",
    read: false,
    createdAt: '2023-05-01T14:22:00Z',
  },
  {
    id: '4',
    senderId: '3', // Parent
    receiverId: '2', // Educator
    content: "Merci pour l'information. Je voulais aussi vous dire que nous serons en retard demain matin pour déposer Emma.",
    read: false,
    createdAt: '2023-05-01T15:45:00Z',
  },
];

// Mock Notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Journée portes ouvertes',
    content: 'Nous organisons une journée portes ouvertes le samedi 20 mai de 10h à 16h. Venez nombreux!',
    targetRole: 'parent',
    read: false,
    createdAt: '2023-05-02T09:00:00Z',
    createdBy: '1', // Admin
  },
  {
    id: '2',
    title: 'Rappel: Formulaires médicaux',
    content: 'Merci de mettre à jour les formulaires médicaux de vos enfants avant la fin du mois.',
    targetRole: 'parent',
    read: true,
    createdAt: '2023-05-01T08:30:00Z',
    createdBy: '1', // Admin
  },
  {
    id: '3',
    title: 'Nouvelle admission approuvée',
    content: "L'admission d'Ethan Petit a été approuvée. Il rejoindra notre crèche le 1er juin.",
    targetUserId: '4', // Parent 2
    read: false,
    createdAt: '2023-04-20T14:15:00Z',
    createdBy: '1', // Admin
  },
  {
    id: '4',
    title: 'Réunion du personnel',
    content: 'Rappel: Réunion du personnel ce vendredi à 17h dans la salle principale.',
    targetRole: 'educator',
    read: false,
    createdAt: '2023-05-03T11:00:00Z',
    createdBy: '1', // Admin
  },
];

// Mock Media
export const MOCK_MEDIA: Media[] = [
  {
    id: '1',
    fileUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&h=400',
    childId: '1', // Emma
    description: 'Emma pendant l\'activité peinture',
    uploadedBy: '2', // Educator
    createdAt: '2023-05-02T14:30:00Z',
    type: 'photo'
  },
  {
    id: '2',
    fileUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&h=400',
    childId: '1', // Emma
    description: 'Heure du goûter',
    uploadedBy: '2', // Educator
    createdAt: '2023-05-01T15:45:00Z',
    type: 'photo'
  },
  {
    id: '3',
    fileUrl: 'https://images.unsplash.com/photo-1503428401430-b5e3b9f5b6f7?auto=format&fit=crop&w=600&h=400',
    childId: '2', // Lucas
    description: 'Lucas joue dans le jardin',
    uploadedBy: '2', // Educator
    createdAt: '2023-05-02T10:15:00Z',
    type: 'photo'
  },
  {
    id: '4',
    fileUrl: 'https://images.unsplash.com/photo-1557555187-23d685287bc3?auto=format&fit=crop&w=600&h=400',
    childId: '3', // Léa
    description: 'Léa apprend à compter',
    uploadedBy: '2', // Educator
    createdAt: '2023-05-03T11:30:00Z',
    type: 'photo'
  },
];
