import { Appointment } from './csvHelper';

// Gera a URL para adicionar o compromisso diretamente ao Google Agenda do usuário
export const generateGoogleCalendarUrl = (appointment: Appointment): string => {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(appointment.title);
  
  // Formata as datas para o padrão do Google Agenda (YYYYMMDDTHHMMSSZ)
  const dateStr = appointment.date.replace(/-/g, '');
  const timeStr = appointment.time ? appointment.time.replace(/:/g, '') + '00' : '000000';
  const dates = `${dateStr}T${timeStr}/${dateStr}T${timeStr}`;

  const details = encodeURIComponent(appointment.description || '');
  return `${base}&text=${text}&dates=${dates}&details=${details}`;
};

// Exporta múltiplos compromissos formatados para integração externa
export const exportAppointmentsToIcs = (appointments: Appointment[]): string => {
  let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Agenda Perpetua//BR\n';
  
  appointments.forEach(app => {
    const dateStr = app.date.replace(/-/g, '');
    icsContent += 'BEGIN:VEVENT\n';
    icsContent += `SUMMARY:${app.title}\n`;
    icsContent += `DTSTART:${dateStr}\n`;
    icsContent += `DESCRIPTION:${app.description || ''}\n`;
    icsContent += 'END:VEVENT\n';
  });
  
  icsContent += 'END:VCALENDAR';
  return icsContent;
};

// Faz a leitura estruturada de calendários importados
export const parseIcsCalendar = (text: string): Omit<Appointment, 'id'>[] => {
  const appointments: Omit<Appointment, 'id'>[] = [];
  const lines = text.split('\n');
  let currentApp: Partial<Appointment> = {};

  lines.forEach(line => {
    if (line.startsWith('SUMMARY:')) {
      currentApp.title = line.replace('SUMMARY:', '').trim();
    } else if (line.startsWith('DTSTART:')) {
      const rawDate = line.replace('DTSTART:', '').trim();
      // Converte YYYYMMDD para YYYY-MM-DD
      if (rawDate.length >= 8) {
        currentApp.date = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
      }
    } else if (line.startsWith('END:VEVENT')) {
      if (currentApp.title && currentApp.date) {
        appointments.push({
          title: currentApp.title,
          date: currentApp.date,
          description: currentApp.description || '',
          color: currentApp.color || '#3b82f6'
        });
      }
      currentApp = {};
    }
  });

  return appointments;
};
