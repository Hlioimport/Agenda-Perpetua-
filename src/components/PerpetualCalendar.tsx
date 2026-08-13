import React from 'react';
import { getDaysInMonth, getWeekDays } from '../lib/dateUtils';
import { Appointment } from '../lib/db';
import { getColorClasses } from '../lib/colorUtils';

interface PerpetualCalendarProps {
  currentMonth: number;
  currentYear: number;
  appointments: Appointment[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

export const PerpetualCalendar: React.FC<PerpetualCalendarProps> = ({
  currentMonth,
  currentYear,
  appointments,
  selectedDay,
  onSelectDay,
}) => {
  const weekDays = getWeekDays();
  const totalDays = getDaysInMonth(currentMonth, currentYear);

  // Descobre em qual dia da semana o mês começa (0 = Domingo, 1 = Segunda, etc.)
  const firstDayOfMonthInstance = new Date(currentYear, currentMonth, 1);
  const startWeekDay = firstDayOfMonthInstance.getDay();

  // Cria um array com os dias do mês
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  // Cria os espaços em branco para alinhar o primeiro dia no dia da semana correto
  const blanksArray = Array.from({ length: startWeekDay }, (_, i) => i);

  // Verifica se um dia específico tem compromissos
  const getDayAppointments = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
    return appointments.filter(app => app.dateKey === dateKey);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-xs font-bold text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grade de Dias do Calendário */}
      <div className="grid grid-cols-7 gap-1">
        {/* Espaços vazios do início do mês */}
        {blanksArray.map(blank => (
          <div key={`blank-${blank}`} className="p-2"></div>
        ))}

        {/* Dias reais */}
        {daysArray.map(day => {
          const isSelected = selectedDay === day;
          const dayApps = getDayAppointments(day);
          const hasApps = dayApps.length > 0;

          return (
            <button
              key={`day-${day}`}
              onClick={() => onSelectDay(day)}
              className={`p-2 min-h-[50px] flex flex-col justify-between items-center rounded-lg border transition-all relative ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              <span className="text-sm font-semibold">{day}</span>
              
              {/* Indicadores de compromisso simplificados */}
              {hasApps && (
                <div className="flex space-x-0.5 mt-1 overflow-hidden max-w-full justify-center">
                  {dayApps.slice(0, 3).map((app, idx) => {
                    const colors = getColorClasses(app.color);
                    return (
                      <span
                        key={app.id || idx}
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : colors.bg.replace('bg-', 'bg-')}`}
                        style={{ backgroundColor: isSelected ? '#ffffff' : undefined }}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
