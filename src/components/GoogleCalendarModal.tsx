import React, { useState } from 'react';
import { Appointment } from '../types';
import { generateGoogleCalendarUrl, exportAppointmentsToIcs, parseIcsCalendar } from '../lib/googleCalendar';
import {
  Calendar as CalendarIcon,
  X,
  ExternalLink,
  Download,
  Upload,
  Check,
  Sparkles,
  Clock,
  FileText,
  HelpCircle,
  Share2
} from 'lucide-react';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  onImportAppointments: (newAppts: Partial<Appointment>[]) => void;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  isOpen,
  onClose,
  appointments,
  onImportAppointments
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importedEvents, setImportedEvents] = useState<Partial<Appointment>[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.ics') && !file.name.endsWith('.ical')) {
      setImportStatus('Por favor, selecione um arquivo válido do Google Agenda (.ics)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsed = parseIcsCalendar(text);
        if (parsed.length > 0) {
          setImportedEvents(parsed);
          setImportStatus(`Encontrados ${parsed.length} evento(s) no arquivo do Google Agenda!`);
        } else {
          setImportStatus('Nenhum evento válido encontrado no arquivo do Google Agenda.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importedEvents.length > 0) {
      onImportAppointments(importedEvents);
      setImportStatus(`${importedEvents.length} compromisso(s) importado(s) com sucesso!`);
      setImportedEvents([]);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Sincronizar com Google Agenda
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exporte seus compromissos para a Google Agenda ou importe eventos externos (.ics)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Export vs Import */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Exportar para Google Agenda
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2.5 text-xs font-bold transition border-b-2 ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Importar do Google Agenda (.ics)
          </button>
        </div>

        {/* Export View */}
        {activeTab === 'export' && (
          <div className="space-y-5">
            {/* Download Full .ICS File for Google Calendar Import */}
            <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Baixar Arquivo para Google Agenda (.ics)</span>
                </h3>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1 max-w-md">
                  Gere um arquivo com todos os seus {appointments.length} compromissos cadastrados e importe diretamente em <strong>Configurações &gt; Importar e Exportar</strong> no Google Agenda.
                </p>
              </div>

              <button
                onClick={() => exportAppointmentsToIcs(appointments)}
                disabled={appointments.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition disabled:opacity-50 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Baixar todos (.ics)</span>
              </button>
            </div>

            {/* List of Appointments with Direct 1-Click Export Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Exportar Compromisso Individual (Links Diretos de 1 Clique):
              </h4>

              {appointments.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  Nenhum compromisso para exportar no momento.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {appt.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Data: {appt.date}</span>
                          {appt.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-indigo-500" />
                              {appt.time}
                            </span>
                          )}
                        </p>
                      </div>

                      <a
                        href={generateGoogleCalendarUrl(appt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition shrink-0 shadow-2xs"
                      >
                        <span>Abrir na Google Agenda</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import View */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-6 border-2 border-dashed rounded-2xl text-center space-y-3 transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Arraste seu arquivo .ics do Google Agenda
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  no formato iCalendar (.ics) exportado do Google Agenda
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition">
                <Upload className="w-4 h-4" />
                <span>Selecionar Arquivo .ics</span>
                <input
                  type="file"
                  accept=".ics,.ical"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {importStatus && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 rounded-xl text-xs font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {importedEvents.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Eventos a importar ({importedEvents.length}):
                  </h4>
                  <button
                    onClick={handleConfirmImport}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar Importação</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {importedEvents.map((evt, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {evt.title}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {evt.date} às {evt.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            Suporta exportação e importação direta sem perder dados.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 transition"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
