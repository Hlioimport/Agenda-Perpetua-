import { Appointment, RecurrenceType } from '../types';

export { Appointment, RecurrenceType };

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
    if (title || date) {
      validAppointments.push({
        title: title ? title.trim() : 'Sem título',
        date: date ? date.trim() : '',
        time: time ? time.trim() : '',
        description: description ? description.trim() : '',
        color: color ? color.trim() : '',
        category: category ? category.trim() : '',
        status: status ? status.trim() : 'Pendente',
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

export const exportAppointmentsToCSV = (appointments?: any, _extra?: any): string => {
  const list = Array.isArray(appointments) ? appointments : [];
  const header = 'titulo,data,hora,descricao,cor,categoria,status\n';
  const rows = list.map(app => {
    const title = (app?.title || '').replace(/"/g, '""');
    const date = app?.date || '';
    const time = app?.time || '';
    const desc = (app?.description || '').replace(/"/g, '""');
    const color = app?.color || '';
    const category = app?.category || '';
    const status = typeof app?.status === 'string' ? app.status : '';
    return `"${title}",${date},"${time}","${desc}","${color}","${category}","${status}"`;
  });
  return header + rows.join('\n');
};

export const exportToCSV = exportAppointmentsToCSV;
