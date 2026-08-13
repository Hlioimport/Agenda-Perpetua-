// Define a estrutura de um compromisso para exportação/importação
export interface CSVAppointment {
  title: string;
  description: string;
  time: string;
  color: string;
  dateKey: string;
  isRecurring: string;
  recurrenceType: string;
}

// Converte uma lista de compromissos para o formato de texto CSV
export const exportToCSV = (appointments: any[]): string => {
  const headers = ['title', 'description', 'time', 'color', 'dateKey', 'isRecurring', 'recurrenceType'];
  
  const csvRows = [
    headers.join(','), // Primeira linha com os cabeçalhos
    ...appointments.map(app => {
      return headers.map(header => {
        const val = app[header] !== undefined ? app[header] : '';
        // Escapa aspas e garante que textos com vírgula fiquem entre aspas
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    })
  ];

  return csvRows.join('\n');
};

// Transforma o texto de um arquivo CSV de volta em uma lista de objetos
export const parseCSV = (csvText: string): CSVAppointment[] => {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const results: CSVAppointment[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    // Expressão regular simples para separar por vírgulas respeitando as aspas
    const matches = currentLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || currentLine.split(',');
    
    const rowData: any = {};
    headers.forEach((header, index) => {
      let val = matches[index] || '';
      val = val.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
      rowData[header] = val;
    });

    if (rowData.title && rowData.dateKey) {
      results.push({
        title: rowData.title,
        description: rowData.description || '',
        time: rowData.time || '',
        color: rowData.color || 'blue',
        dateKey: rowData.dateKey,
        isRecurring: rowData.isRecurring || 'false',
        recurrenceType: rowData.recurrenceType || 'none'
      });
    }
  }

  return results;
};
