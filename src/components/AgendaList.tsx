import React from 'react';
import { Appointment } from '../lib/db';
import { getColorClasses } from '../lib/colorUtils';

interface AppointmentListProps {
  appointments: Appointment[];
  selectedDateKey: string;
  isGuestView: boolean;
  onEditAppointment: (appointment: Appointment) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  selectedDateKey,
  isGuestView,
  onEditAppointment,
}) => {
  // Filtra os compromissos que pertencem à data selecionada
  const dayAppointments = appointments
    .filter(app => app.dateKey === selectedDateKey)
    .sort((a, b) => a.time.localeCompare(b.time)); // Ordena por horário (mais cedo primeiro)

  // Converte a chave da data (YYYY-MM-DD) para um formato mais amigável (DD/MM/YYYY)
  const formatDisplayDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 h-full flex flex-col">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center justify-between">
        <span>📋 Eventos do Dia</span>
        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {formatDisplayDate(selectedDateKey)}
        </span>
      </h3>

      {dayAppointments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
          <span className="text-2xl mb-1">🍃</span>
          <p className="text-sm text-gray-400 font-medium">Nenhum compromisso agendado para hoje.</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 generic-scrollbar">
          {dayAppointments.map((app) => {
            const colors = getColorClasses(app.color);

            return (
              <div
                key={app.id}
                className={`p-3 rounded-xl border ${colors.bg} ${colors.border} ${colors.text} transition-all duration-200 flex justify-between items-start group`}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <span className="text-xs font-bold bg-white/70 px-1.5 py-0.5 rounded-md shadow-sm border border-black/5">
                      ⏰ {app.time}
                    </span>
                    {app.isRecurring && (
                      <span className="text-[10px] font-bold bg-black/5 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        🔄 Repete
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 truncate">{app.title}</h4>
                  {app.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 bg-white/30 p-1.5 rounded-md border border-white/40">
                      {app.description}
                    </p>
                  )}
                </div>

                {/* Só exibe o botão de editar se NÃO for o modo convidado */}
                {!isGuestView && (
                  <button
                    onClick={() => onEditAppointment(app)}
                    className="opacity-80 hover:opacity-100 bg-white/80 hover:bg-white p-1.5 rounded-lg shadow-sm border border-black/5 text-gray-700 transition-all text-xs font-bold"
                  >
                    Editar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
