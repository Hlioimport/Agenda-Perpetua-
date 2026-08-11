import React, { useState, useEffect } from 'react';
import { Appointment, CategoryType, AppointmentStatus } from '../types';
import { Calendar, Clock, Tag, FileText, Check, AlertCircle, Trash2, ExternalLink } from 'lucide-react';
import { generateGoogleCalendarUrl } from '../lib/googleCalendar';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apptData: Omit<Appointment, 'id' | 'userId' | 'userEmail' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialDateStr?: string;
  editingAppointment?: Appointment | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDateStr,
  editingAppointment
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDateStr || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [category, setCategory] = useState<CategoryType>('trabalho');
  const [status, setStatus] = useState<AppointmentStatus>('pending');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAppointment) {
      setTitle(editingAppointment.title || '');
      setDate(editingAppointment.date || initialDateStr || new Date().toISOString().split('T')[0]);
      setTime(editingAppointment.time || '09:00');
      setCategory(editingAppointment.category || 'trabalho');
      setStatus(editingAppointment.status || 'pending');
      setNotes(editingAppointment.notes || '');
    } else {
      setTitle('');
      setDate(initialDateStr || new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setCategory('trabalho');
      setStatus('pending');
      setNotes('');
    }
    setError(null);
  }, [editingAppointment, initialDateStr, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe um título para o compromisso.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        date,
        time,
        category,
        status,
        notes: notes.trim(),
        sharedWithEmails: editingAppointment?.sharedWithEmails || []
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving appointment:', err);
      setError('Erro ao salvar compromisso. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingAppointment || !onDelete) return;
    if (window.confirm('Tem certeza que deseja excluir este compromisso?')) {
      setSaving(true);
      try {
        await onDelete(editingAppointment.id);
        onClose();
      } catch (err) {
        console.error(err);
        setError('Erro ao excluir compromisso.');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {editingAppointment ? 'Editar Compromisso' : 'Novo Compromisso'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adicione detalhes ou anotações para mudar a cor da linha na agenda
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título do Compromisso *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Reunião com cliente, Consulta médica, Estudo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data
              </label>
              <input
                type="date"
                required
                min="2025-01-01"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="trabalho">Trabalho</option>
                <option value="pessoal">Pessoal</option>
                <option value="reuniao">Reunião</option>
                <option value="saude">Saúde</option>
                <option value="estudos">Estudos</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Notes (Anotações) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span>Anotações / Observações</span>
              </label>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Muda a cor da linha automaticamente!
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Escreva anotações importantes sobre o compromisso..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-amber-50/40 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {editingAppointment ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>

                <a
                  href={generateGoogleCalendarUrl(editingAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-200 dark:border-indigo-800"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Enviar p/ Google Agenda</span>
                  <ExternalLink className="w-3 h-3 text-indigo-400" />
                </a>
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Compromisso</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
