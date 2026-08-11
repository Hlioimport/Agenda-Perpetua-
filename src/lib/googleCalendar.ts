import { Appointment } from '../types';

/**
 * Generates a direct Google Calendar Web link to create an event with 1 click
 */
export const generateGoogleCalendarUrl = (appt: Appointment): string => {
  const title = encodeURIComponent(appt.title || 'Compromisso');
  
  // Format Date and Time
  const dateStr = appt.date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const cleanDate = dateStr.replace(/-/g, ''); // YYYYMMDD
  
  let startTime = '090000';
  let endTime = '100000';

  if (appt.time) {
    const timeParts = appt.time.split(':');
    if (timeParts.length === 2) {
      const hours = timeParts[0].padStart(2, '0');
      const mins = timeParts[1].padStart(2, '0');
      startTime = `${hours}${mins}00`;
      
      // Add 1 hour duration by default
      const endHour = String((parseInt(hours, 10) + 1) % 24).padStart(2, '0');
      endTime = `${endHour}${mins}00`;
    }
  }

  const datesParam = `${cleanDate}T${startTime}/${cleanDate}T${endTime}`;

  let detailsText = '';
  if (appt.notes && appt.notes.trim()) {
    detailsText += `Anotações: ${appt.notes}\n\n`;
  }
  detailsText += `Categoria: ${appt.category.toUpperCase()}\nStatus: ${appt.status.toUpperCase()}`;
  detailsText += `\nCadastrado via Agenda Perpétua`;

  const details = encodeURIComponent(detailsText);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}`;
};

/**
 * Generates and triggers download of an .ICS file compatible with Google Calendar, Apple Calendar, and Outlook
 */
export const exportAppointmentsToIcs = (appointments: Appointment[], filename = 'agenda_perpetua_google_calendar.ics') => {
  if (appointments.length === 0) return;

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agenda Perpetua//NONSGML v1.0//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Agenda Perpétua'
  ];

  appointments.forEach((appt) => {
    const dateStr = appt.date ? appt.date.replace(/-/g, '') : '20250101';
    let startTime = '090000';
    let endTime = '100000';

    if (appt.time) {
      const timeParts = appt.time.split(':');
      if (timeParts.length === 2) {
        const hours = timeParts[0].padStart(2, '0');
        const mins = timeParts[1].padStart(2, '0');
        startTime = `${hours}${mins}00`;
        const endHour = String((parseInt(hours, 10) + 1) % 24).padStart(2, '0');
        endTime = `${endHour}${mins}00`;
      }
    }

    const dtStart = `${dateStr}T${startTime}`;
    const dtEnd = `${dateStr}T${endTime}`;

    const summary = (appt.title || 'Compromisso').replace(/\n/g, ' ');
    const notesStr = appt.notes ? appt.notes.replace(/\n/g, '\\n') : '';
    const description = `Categoria: ${appt.category.toUpperCase()}\\nStatus: ${appt.status.toUpperCase()}${notesStr ? '\\nAnotação: ' + notesStr : ''}`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:appt-${appt.id || Date.now()}@agendaperpetua.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parses an imported .ICS calendar file from Google Calendar to extract events
 */
export const parseIcsCalendar = (icsText: string): Partial<Appointment>[] => {
  const events: Partial<Appointment>[] = [];
  const vevents = icsText.split('BEGIN:VEVENT');

  for (let i = 1; i < vevents.length; i++) {
    const chunk = vevents[i].split('END:VEVENT')[0];
    
    let title = '';
    let date = '';
    let time = '09:00';
    let notes = '';

    const lines = chunk.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith('SUMMARY:')) {
        title = line.replace('SUMMARY:', '').trim();
      } else if (line.startsWith('DTSTART')) {
        const valueMatch = line.match(/:(\d{8})(T(\d{4,6}))?/);
        if (valueMatch) {
          const rawDate = valueMatch[1]; // YYYYMMDD
          date = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
          
          if (valueMatch[3]) {
            const rawTime = valueMatch[3]; // HHMMSS or HHMM
            time = `${rawTime.substring(0, 2)}:${rawTime.substring(2, 4)}`;
          }
        }
      } else if (line.startsWith('DESCRIPTION:')) {
        notes = line.replace('DESCRIPTION:', '').replace(/\\n/g, '\n').trim();
      }
    }

    if (title && date) {
      events.push({
        title,
        date,
        time,
        notes,
        category: 'outro',
        status: 'pending'
      });
    }
  }

  return events;
};
