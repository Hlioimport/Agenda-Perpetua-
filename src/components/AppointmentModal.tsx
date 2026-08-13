import React, { useState, useEffect } from 'react';
import { Appointment } from '../lib/db';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
  selectedDateKey: string;
  userId: string;
  editingAppointment: Appointment | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDateKey,
  userId,
  editingAppointment,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('12:00');
  const [color, setColor] = useState('blue');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');

  // Monitora se estamos editando um compromisso existente para preencher os campos
  useEffect(() => {
    if (editingAppointment) {
      setTitle(editingAppointment.title);
      setDescription(editingAppointment.description);
      setTime(editingAppointment.time);
      setColor(editingAppointment.color);
      setIsRecurring(editingAppointment.isRecurring);
      setRecurrenceType(editingAppointment.recurrenceType);
    } else {
      setTitle('');
      setDescription('');
      setTime('12:00');
      setColor('blue');
      setIsRecurring(false);
      setRecurrenceType('none');
    }
  }, [editingAppointment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: editingAppointment?.id,
      userId,
      title,
      description,
      time,
      color,
      dateKey: selectedDateKey,
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : 'none',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">
          ×
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {editingAppointment ? '✏️ Editar Compromisso' : '➕ Novo Compromisso'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Título</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião de Alinhamento"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes opcionais..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Horário</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cor</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="blue">🔵 Azul</option>
                <option value="green">🟢 Verde</option>
                <option value="red">🔴 Vermelho</option>
                <option value="amber">🟡 Amarelo</option>
                <option value="purple">🟣 Roxo</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked && recurrenceType === 'none') setRecurrenceType('daily');
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Este evento se repete</span>
            </label>

            {isRecurring && (
              <div className="mt-2 animate-slideDown">
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
                >
                  <option value="daily">Todo dia</option>
                  <option value="weekly">Toda semana</option>
                  <option value="monthly">Todo mês</option>
                  <option value="yearly">Todo ano</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
            {editingAppointment && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (editingAppointment.id) onDelete(editingAppointment.id);
                  onClose();
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
              >
                Excluir
              </button>
            ) : (
              <div />
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
