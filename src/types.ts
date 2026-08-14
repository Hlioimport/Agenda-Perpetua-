export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type AppointmentStatus = 'Pendente' | 'Concluído' | 'Cancelado' | string;

export interface Appointment {
  id?: any;
  title: string;
  date: string;
  time?: string;
  description?: string;
  color?: string;
  userId?: string;
  userEmail?: string;
  createdAt?: any;
  updatedAt?: any;
  dateKey?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType;
  status?: AppointmentStatus;
  category?: string;
  [key: string]: any;
}
