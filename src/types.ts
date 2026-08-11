export type AppointmentStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type CategoryType = 'trabalho' | 'pessoal' | 'reuniao' | 'saude' | 'estudos' | 'outro';

export interface Appointment {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  durationMinutes?: number;
  notes?: string;
  status: AppointmentStatus;
  category: CategoryType;
  color?: string; // Optional custom hex/tailwind color
  sharedWithEmails?: string[]; // Array of emails that have access to this item
  agendaId?: string; // If part of a specific shared agenda ID
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AgendaShare {
  id: string;
  ownerUid: string;
  ownerEmail: string;
  sharedWithEmail: string;
  sharedWithUid?: string;
  status: 'pending' | 'accepted';
  createdAt: number;
}

export interface CSVRowAppointment {
  date: string;
  time?: string;
  title: string;
  notes?: string;
  category?: string;
  status?: string;
}

export type CalendarViewType = 'month' | 'agenda' | 'week';

export interface FilterOptions {
  searchTerm: string;
  category: string;
  status: string;
  onlyWithNotes: boolean;
}
