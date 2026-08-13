import { Appointment } from './db';

// Função para exportar os compromissos para o formato CSV
export const exportToCSV = (appointments: Appointment[]): string => {
  const headers = ['id', 'title', 'description', 'time', 'color', 'dateKey', 'isRecurring', 'recurrenceType'];
  
  const rows = appointments.map(app => [
    app.id || '',
    `"${(app.title || '').replace(/"/g, '""')}"`,
    `"${(app.description || '').replace(/"/g, '""')}"`,
    app.time || '',
    app.color || 'blue',
    app.dateKey || '',
    app.isRecurring ? 'true' : 'false',
    app.recurrenceType || 'none'
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

// Função para ler o arquivo CSV importado e converter de volta para objetos do app
export const importFromCSV = (csvText: string, userId: string): Appointment[] => {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length <= 1) return [];

  const appointments: Appointment[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Regex simples para separar por vírgulas ignorando as que estão dentro de aspas
    const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    
    if (matches.length >= 6) {
      const clean = (val: string) => val ? val.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';

      appointments.push({
        userId,
        title: clean(matches[1]) || 'Compromisso Importado',
        description: clean(matches[2]),
        time: clean(matches[3]) || '12:00',
        color: clean(matches[4]) || 'blue',
        dateKey: clean(matches[5]),
        isRecurring: matches[6] === 'true',
        recurrenceType: (matches[7] as any) || 'none'
      });
    }
  }

  return appointments;
};
