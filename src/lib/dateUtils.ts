export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const WEEKDAYS_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const WEEKDAYS_FULL_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export interface CalendarDayCell {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export const getCalendarMatrix = (year: number, month: number): CalendarDayCell[] => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysInMonth = lastDayOfMonth.getDate();

  const today = new Date();
  const todayStr = formatDateToISO(today);

  const matrix: CalendarDayCell[] = [];

  // Previous month padding days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const dateObj = new Date(year, month - 1, dayNum);
    const dateStr = formatDateToISO(dateObj);
    const dayOfWeek = dateObj.getDay();

    matrix.push({
      date: dateObj,
      dateString: dateStr,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatDateToISO(dateObj);
    const dayOfWeek = dateObj.getDay();

    matrix.push({
      date: dateObj,
      dateString: dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
  }

  // Next month padding days to complete 35 or 42 grid cells
  const remainingCells = (7 - (matrix.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const dateObj = new Date(year, month + 1, i);
    const dateStr = formatDateToISO(dateObj);
    const dayOfWeek = dateObj.getDay();

    matrix.push({
      date: dateObj,
      dateString: dateStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6
    });
  }

  return matrix;
};

export const formatDateToISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseISODate = (isoStr: string): Date => {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const formatFullDatePT = (isoStr: string): string => {
  if (!isoStr) return '';
  const dateObj = parseISODate(isoStr);
  const weekday = WEEKDAYS_FULL_PT[dateObj.getDay()];
  const day = dateObj.getDate();
  const monthName = MONTH_NAMES_PT[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${weekday}, ${day} de ${monthName} de ${year}`;
};

export const formatShortDatePT = (isoStr: string): string => {
  if (!isoStr) return '';
  const dateObj = parseISODate(isoStr);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};
