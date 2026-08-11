import React from 'react';
import { WEEKDAYS_SHORT_PT, getCalendarMatrix, CalendarDayCell } from '../lib/dateUtils';
import { Appointment } from '../types';
import { FileText, Plus, CheckCircle2, Clock } from 'lucide-react';

interface PerpetualCalendarProps {
  currentDate: Date;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  appointments: Appointment[];
  onOpenNewForDate: (dateStr: string) => void;
}

export const PerpetualCalendar: React.FC<PerpetualCalendarProps> = ({
  currentDate,
  selectedDateStr,
  onSelectDate,
  appointments,
  onOpenNewForDate
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysMatrix: CalendarDayCell[] = getCalendarMatrix(year, month);

  // Group appointments by date
  const appointmentsByDate = React.useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach((appt) => {
      if (!map[appt.date]) {
        map[appt.date] = [];
      }
      map[appt.date].push(appt);
    });
    return map;
  }, [appointments]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-center py-2.5">
        {WEEKDAYS_SHORT_PT.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-bold uppercase tracking-wider ${
              idx === 0 || idx === 6
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Perpetual Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-100/40 dark:bg-slate-900/40">
        {daysMatrix.map((cell) => {
          const isSelected = cell.dateString === selectedDateStr;
          const dayAppts = appointmentsByDate[cell.dateString] || [];
          const hasNotesOnDay = dayAppts.some((a) => a.notes && a.notes.trim().length > 0);

          return (
            <div
              key={cell.dateString}
              onClick={() => onSelectDate(cell.dateString)}
              className={`group relative min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 transition cursor-pointer flex flex-col justify-between ${
                !cell.isCurrentMonth
                  ? 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                  : isSelected
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500 ring-inset z-10'
                  : cell.isToday
                  ? 'bg-amber-50/60 dark:bg-amber-950/20'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              {/* Day Cell Header: Number + Badges + Quick Add */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    cell.isToday
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isSelected
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : cell.isWeekend
                      ? 'text-rose-600 dark:text-rose-400'
                      : cell.isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <div className="flex items-center gap-1">
                  {/* Note badge indicator on cell */}
                  {hasNotesOnDay && (
                    <span
                      title="Contém anotações neste dia"
                      className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                    />
                  )}

                  {/* Hover Quick Add Plus button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewForDate(cell.dateString);
                    }}
                    title="Adicionar compromisso neste dia"
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950 rounded transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Appointments List Preview */}
              <div className="mt-1 space-y-1 overflow-hidden flex-1">
                {dayAppts.slice(0, 3).map((appt) => {
                  const isDone = appt.status === 'completed';
                  const hasNote = appt.notes && appt.notes.trim().length > 0;

                  return (
                    <div
                      key={appt.id}
                      className={`text-[11px] leading-tight px-1.5 py-0.5 rounded border truncate flex items-center justify-between gap-1 transition ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 line-through opacity-75'
                          : hasNote
                          ? 'bg-amber-100/80 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 font-medium'
                          : 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      <span className="truncate">
                        {appt.time ? `${appt.time} ` : ''}{appt.title}
                      </span>
                      {hasNote && <FileText className="w-2.5 h-2.5 shrink-0 text-amber-600 dark:text-amber-400" />}
                    </div>
                  );
                })}

                {dayAppts.length > 3 && (
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 pl-1">
                    +{dayAppts.length - 3} mais...
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
