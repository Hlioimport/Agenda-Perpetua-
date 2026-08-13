export interface DateInfo {
  day: number;
  month: number;
  year: number;
}

// Retorna o nome do mês em português
export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
};

// Retorna os dias da semana resumidos
export const getWeekDays = (): string[] => {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
};

// Verifica se um ano é bissexto
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Retorna a quantidade de dias que um mês específico tem
export const getDaysInMonth = (month: number, year: number): number => {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 1 && isLeapYear(year)) {
    return 29; // Fevereiro em ano bissexto
  }
  return daysPerMonth[month];
};

// Formata a data para exibição amigável (Ex: 12 de Agosto de 2026)
export const formatDateLong = (day: number, month: number, year: number): string => {
  return `${day} de ${getMonthName(month)} de ${year}`;
};

// Converte os dados do dia para uma string usada como chave no banco (Ex: "2026-08-12")
export const dateToKey = (day: number, month: number, year: number): string => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};
