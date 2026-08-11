import Papa from 'papaparse';
import { Appointment, CategoryType, AppointmentStatus } from '../types';

export interface CSVImportResult {
  validAppointments: Omit<Appointment, 'id' | 'userId' | 'userEmail' | 'createdAt' | 'updatedAt'>[];
  errors: string[];
}

export const parseCSVAppointments = (csvContent: string): CSVImportResult => {
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const validAppointments: Omit<Appointment, 'id' | 'userId' | 'userEmail' | 'createdAt' | 'updatedAt'>[] = [];
  const errors: string[] = [];

  const todayStr = new Date().toISOString().split('T')[0];

  result.data.forEach((row, idx) => {
    // Look for fields flexibility
    const dateRaw = row['Data'] || row['data'] || row['Date'] || row['date'] || todayStr;
    const timeRaw = row['Horário'] || row['Horario'] || row['horario'] || row['Time'] || row['time'] || '';
    const titleRaw = row['Compromisso'] || row['Título'] || row['Titulo'] || row['titulo'] || row['Title'] || row['title'] || row['Anotação'] || row['Anotacao'] || '';
    const notesRaw = row['Anotações'] || row['Anotacoes'] || row['Notas'] || row['notas'] || row['Notes'] || row['notes'] || '';
    const categoryRaw = (row['Categoria'] || row['categoria'] || row['Category'] || 'trabalho').toLowerCase();
    const statusRaw = (row['Status'] || row['status'] || 'pending').toLowerCase();

    if (!titleRaw && !notesRaw) {
      errors.push(`Linha ${idx + 2}: Título ou anotação do compromisso ausente.`);
      return;
    }

    // Format date YYYY-MM-DD
    let formattedDate = dateRaw.trim();
    if (formattedDate.includes('/')) {
      // Handle DD/MM/YYYY or MM/DD/YYYY
      const parts = formattedDate.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          // DD/MM/YYYY
          formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }

    // Category mapping
    let category: CategoryType = 'trabalho';
    if (['pessoal', 'reuniao', 'saude', 'estudos', 'outro'].includes(categoryRaw)) {
      category = categoryRaw as CategoryType;
    } else if (categoryRaw.includes('pessoal')) category = 'pessoal';
    else if (categoryRaw.includes('reun') || categoryRaw.includes('meet')) category = 'reuniao';
    else if (categoryRaw.includes('saud') || categoryRaw.includes('med')) category = 'saude';
    else if (categoryRaw.includes('estud') || categoryRaw.includes('aula')) category = 'estudos';

    // Status mapping
    let status: AppointmentStatus = 'pending';
    if (['in_progress', 'completed', 'cancelled'].includes(statusRaw)) {
      status = statusRaw as AppointmentStatus;
    } else if (statusRaw.includes('conclu') || statusRaw.includes('pago') || statusRaw.includes('ok')) {
      status = 'completed';
    } else if (statusRaw.includes('andamento') || statusRaw.includes('fazendo')) {
      status = 'in_progress';
    } else if (statusRaw.includes('cancel')) {
      status = 'cancelled';
    }

    validAppointments.push({
      title: titleRaw || 'Compromisso da Agenda',
      date: formattedDate,
      time: timeRaw.trim(),
      notes: notesRaw.trim(),
      category,
      status,
      sharedWithEmails: []
    });
  });

  return { validAppointments, errors };
};

export const exportAppointmentsToCSV = (appointments: Appointment[], filename = 'agenda_perpetua.csv') => {
  const exportData = appointments.map((a) => ({
    Data: a.date,
    Horario: a.time || '',
    Compromisso: a.title,
    Anotacoes: a.notes || '',
    Categoria: a.category,
    Status: a.status === 'completed' ? 'Concluído' : a.status === 'in_progress' ? 'Em Andamento' : a.status === 'cancelled' ? 'Cancelado' : 'Pendente'
  }));

  const csv = Papa.unparse(exportData, {
    delimiter: ';', // Standard Portuguese CSV delimiter
  });

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateSampleCSV = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  const d1 = `${year}-${month}-05`;
  const d2 = `${year}-${month}-12`;
  const d3 = `${year}-${month}-18`;

  const rows = [
    { Data: d1, Horario: '09:00', Compromisso: 'Reunião de Alinhamento Semanal', Anotacoes: 'Preparar apresentação e revisar metas do trimestre.', Categoria: 'reuniao', Status: 'Pendente' },
    { Data: d1, Horario: '14:30', Compromisso: 'Consulta Médica de Rotina', Anotacoes: 'Levar exames anteriores.', Categoria: 'saude', Status: 'Concluído' },
    { Data: d2, Horario: '10:00', Compromisso: 'Sessão de Foco e Planejamento', Anotacoes: 'Definir prioridades para a equipe.', Categoria: 'trabalho', Status: 'Em Andamento' },
    { Data: d3, Horario: '19:00', Compromisso: 'Jantar com Família', Anotacoes: 'Reservar mesa no restaurante.', Categoria: 'pessoal', Status: 'Pendente' }
  ];

  return Papa.unparse(rows, { delimiter: ';' });
};
