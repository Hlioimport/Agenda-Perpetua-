// Importa o tipo oficial do projeto se existir ou define a estrutura completa aceita pelo app
import type { Appointment as OfficialAppointment, RecurrenceType as OfficialRecurrenceType, AppointmentStatus as OfficialAppointmentStatus } from '../types';

export type RecurrenceType = OfficialRecurrenceType extends undefined ? ('none' | 'daily' | 'weekly' | 'monthly' | 'yearly') : OfficialRecurrenceType;

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
  recurrenceType?: any;
  status?: any;
  category?: string;
  [key: string]: any;
}

export interface ParseCSVResult {
  validAppointments: Omit<Appointment, 'id'>[];
  errors: string[];
}

export const parseCSVAppointments = (text: string): ParseCSVResult => {
  const lines = text.split('\n');
  const validAppointments: Omit<Appointment, 'id'>[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [title, date, time, description, color, category, status] = line.split(',');
    if (title && date) {
      validAppointments.push({
        title: title.trim(),
        date: date.trim(),
        time: time ? time.trim() : undefined,
        description: description ? description.trim() : undefined,
        color: color ? color.trim() : undefined,
        category: category ? category.trim() : undefined,
        status: status ? status.trim() : undefined,
        userId: '',
        userEmail: '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } else {
      errors.push(`Linha ${i + 1}: Dados inválidos.`);
    }
  }
  return { validAppointments, errors };
};

export const importFromCSV = (text: string): Omit<Appointment, 'id'>[] => {
  const result = parseCSVAppointments(text);
  return result.validAppointments;
};

export const ImportFromCSV = importFromCSV;

export const generateSampleCSV = (): string => {
  const header = 'titulo,data,hora,descricao,cor,categoria,status\n';
  const sampleRow = 'Reunião de Trabalho,2026-08-15,14:00,Alinhar as metas do mês,#3b82f6,Trabalho,Pendente';
  return header + sampleRow;
};

export const exportAppointmentsToCSV = (appointments: any[], _extra?: any): string => {
  const header = 'titulo,data,hora,descricao,cor,categoria,status\n';
  const rows = (appointments || []).map(app => {
    const title = (app.title || '').replace(/"/g, '""');
    const date = app.date || '';
    const time = app.time || '';
    const desc = (app.description || '').replace(/"/g, '""');
    const color = app.color || '';
    const category = app.category || '';
    const status = typeof app.status === 'string' ? app.status : '';
    return `"${title}",${date},"${time}","${desc}","${color}","${category}","${status}"`;
  });
  return header + rows.join('\n');
};

export const exportToCSV = exportAppointmentsToCSV;
