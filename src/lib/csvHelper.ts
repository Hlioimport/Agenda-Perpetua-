export interface Appointment {
  id: string;
  title: string;
  date: string; // formato YYYY-MM-DD
  time?: string;
  description?: string;
  color?: string;
}

// Converte texto do arquivo CSV importado em objetos de compromisso
export const parseCSVAppointments = (text: string): Omit<Appointment, 'id'>[] => {
  const lines = text.split('\n');
  const appointments: Omit<Appointment, 'id'>[] = [];

  // Pula o cabeçalho se houver e percorre as linhas
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [title, date, time, description, color] = line.split(',');
    if (title && date) {
      appointments.push({
        title: title.trim(),
        date: date.trim(),
        time: time ? time.trim() : undefined,
        description: description ? description.trim() : undefined,
        color: color ? color.trim() : undefined
      });
    }
  }
  return appointments;
};

// Gera um arquivo CSV de exemplo para o usuário baixar de modelo
export const generateSampleCSV = (): string => {
  const header = 'titulo,data,hora,descricao,cor\n';
  const sampleRow = 'Reunião de Trabalho,2026-08-15,14:00,Alinhar as metas do mês,#3b82f6';
  return header + sampleRow;
};

// Exporta a lista atual de compromissos para o formato texto CSV
export const exportAppointmentsToCSV = (appointments: Appointment[]): string => {
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
