// Define a estrutura de um evento vindo da API do Google Calendar
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

// Função para simular ou processar a importação de eventos do Google Calendar
export const formatGoogleEvents = (events: GoogleCalendarEvent[]): any[] => {
  return events.map(event => {
    // Tenta obter a data no formato ISO e extrair apenas o padrão YYYY-MM-DD
    const fullDate = event.start.dateTime || event.start.date || '';
    const dateKey = fullDate.substring(0, 10); 

    // Tenta extrair o horário simplificado (HH:MM)
    let time = '';
    if (event.start.dateTime) {
      const match = event.start.dateTime.match(/T(\d{2}:\d{2})/);
      if (match) time = match[1];
    }

    return {
      googleId: event.id,
      title: event.summary || 'Compromisso sem título',
      description: event.description || '',
      time: time,
      dateKey: dateKey,
      color: 'indigo', // Cor padrão para identificar o que veio do Google
      isRecurring: false,
      recurrenceType: 'none'
    };
  });
};
