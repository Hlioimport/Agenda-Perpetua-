import React from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { getRowColorClasses, getCategoryBadgeStyle, getCategoryLabel } from '../lib/colorUtils';
import { formatFullDatePT } from '../lib/dateUtils';
import { generateGoogleCalendarUrl } from '../lib/googleCalendar';
import {
  Clock,
  FileText,
  CheckCircle2,
  Circle,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Plus,
  AlertCircle,
  Share2,
  Check,
  ExternalLink
} from 'lucide-react';

interface AgendaListProps {
  selectedDateStr: string;
  appointments: Appointment[];
  allAppointmentsCount: number;
  onEditAppointment: (appt: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: AppointmentStatus) => void;
  onOpenNewAppointment: (dateStr?: string) => void;
  filterTitle?: string;
}

export const AgendaList: React.FC<AgendaListProps> = ({
  selectedDateStr,
  appointments,
  allAppointmentsCount,
  onEditAppointment,
  onDeleteAppointment,
  onToggleStatus,
  onOpenNewAppointment,
  filterTitle
}) => {
  const [expandedNotesId, setExpandedNotesId] = React.useState<string | null>(null);

  // Filter appointments for selected date or show filtered view
  const formattedDateHeader = formatFullDatePT(selectedDateStr);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
      
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{filterTitle || `Agenda para ${formattedDateHeader}`}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {appointments.length} {appointments.length === 1 ? 'compromisso encontrado' : 'compromissos encontrados'}
          </p>
        </div>

        <button
          onClick={() => onOpenNewAppointment(selectedDateStr)}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-200/80 dark:border-indigo-800"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar no dia</span>
        </button>
      </div>

      {/* Agenda Items List */}
      {appointments.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Nenhum compromisso marcado para este dia
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Sua agenda está limpa! Clique no botão abaixo para adicionar um compromisso ou anotações importantes.
            </p>
          </div>
          <button
            onClick={() => onOpenNewAppointment(selectedDateStr)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Compromisso</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const hasNotes = Boolean(appt.notes && appt.notes.trim().length > 0);
            const rowStyle = getRowColorClasses(appt.status, hasNotes);
            const isNotesExpanded = expandedNotesId === appt.id;

            return (
              <div
                key={appt.id}
                className={`group relative rounded-xl p-4 border transition-all shadow-2xs ${rowStyle.bg} ${rowStyle.border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Checkbox / Status toggle + Time & Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Status Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(appt.id, appt.status)}
                      title={appt.status === 'completed' ? 'Marcar como pendente' : 'Marcar como concluído'}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition"
                    >
                      {appt.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5 hover:scale-110 transition" />
                      )}
                    </button>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      
                      {/* Top Badges: Category, Status, Notes Alert */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Time */}
                        {appt.time && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            {appt.time}
                          </span>
                        )}

                        {/* Category */}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryBadgeStyle(appt.category)}`}>
                          {getCategoryLabel(appt.category)}
                        </span>

                        {/* Automatic Color Change Status Badge */}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${rowStyle.badge}`}>
                          {rowStyle.label}
                        </span>

                        {/* Note Badge Indicator */}
                        {hasNotes && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300/80 dark:border-amber-800">
                            <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Anotação Adicionada
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className={`text-sm font-semibold leading-snug break-words ${rowStyle.text}`}>
                        {appt.title}
                      </h4>

                      {/* Inline Notes Preview */}
                      {hasNotes && (
                        <div className="mt-2 text-xs text-slate-700 dark:text-slate-300 bg-amber-50/60 dark:bg-slate-800/80 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wide">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Anotação:</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {appt.notes}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right Actions: Google Calendar Export, Edit, Delete */}
                  <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100">
                    <a
                      href={generateGoogleCalendarUrl(appt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Exportar este compromisso para Google Agenda"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1 text-xs font-medium"
                    >
                      <CalendarIcon className="w-4 h-4 text-indigo-500" />
                      <span className="hidden xl:inline text-[11px]">Google Agenda</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    <button
                      onClick={() => onEditAppointment(appt)}
                      title="Editar compromisso / corrigir horário e dados"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px] font-medium">Editar</span>
                    </button>

                    <button
                      onClick={() => onDeleteAppointment(appt.id)}
                      title="Excluir compromisso"
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px] font-medium text-rose-600">Excluir</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
