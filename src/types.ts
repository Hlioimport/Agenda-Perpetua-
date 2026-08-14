export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type CalendarView = 'month' | 'week' | 'day' | 'agenda' | string;
export type CalendarViewType = CalendarView; // Exporta alias para resolver o erro no CalendarHeader.tsx
export type FilterOptions = any;

export interface Appointment {
  id?: any;
  title?: string;
  date?: string;
  time?: string;
  description?: string;
  color?: string;
  userId?: string;
  userEmail?: string;
  createdAt?: any;
  updatedAt?: any;
  dateKey?: string;
  isRecurring?: boolean;
  recurrenceType?: RecurrenceType | string;
  status?: string;
  category?: string;
  [key: string]: any;
}
