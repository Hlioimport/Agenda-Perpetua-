export interface Appointment {
  id: string;
  title: string;
  date: string; // formato YYYY-MM-DD
  time?: string;
  description?: string;
  color?: string;
}

// Interface estendida para suportar o retorno com controle de erros do CSVModal
export interface ParseCSVResult {
  validAppointments: Omit<Appointment, 'id'>[];
  errors: string[];
}

// Converte texto do arquivo CSV importado em objetos de compromisso com validação
export const parseCSVAppointments = (text: string): ParseCSVResult => {
  const lines = text.split('\n');
  const validAppointments: Omit<Appointment, 'id'>[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [title, date, time, description, color] = line.split(',');
    if (title && date) {
      validAppointments.push({
        title: title.trim(),
        date: date.trim(),
        time: time ? time.trim() : undefined,
        description: description ? description.trim() : undefined,
        color: color ? color.trim() : undefined
      });
    } else {
      errors.push(`Linha ${i + 1}: Dados inválidos ou incompletos.`);
    }
  }
  return { validAppointments, errors };
};

// Abreviação direta solicitada por botões do sistema
export const ImportFromCSV = (text: string): Omit<Appointment, 'id'>[] => {
  const result = parseCSVAppointments(text);
  return result.validAppointments;
};

// Gera um arquivo CSV de exemplo para o usuário baixar de modelo
export const generateSampleCSV = (): string => {
  const header = 'titulo,data,hora,descricao,cor\n';
  const sampleRow = 'Reunião de Trabalho,2026-08-15,14:00,Alinhar as metas do mês,#3b82f6';
  return header + sampleRow;
};

// Exporta a lista atual de compromissos para o formato texto CSV (aceita argumentos adicionais opcionais)
export const exportAppointmentsToCSV = (appointments: Appointment[], _extra?: any): string => {
  const header = 'titulo,data,hora,descricao,cor\n';
  const rows = appointments.map(app => {
    const title = app.title.replace(/"/g, '""');
    const date = app.date;
    const time = app.time || '';
    const desc = (app.description || '').replace(/"/g, '""');
    const color = app.color || '';
    return `"${title}",${date},"${time}","${desc}","${color}"`;
  });
  return header + rows.join('\n');
};

// Alias para exportToCSV que os botões também chamam
export const exportToCSV = exportAppointmentsToCSV;
