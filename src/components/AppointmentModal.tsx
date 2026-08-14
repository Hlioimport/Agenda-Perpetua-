import React, { useState, useEffect } from 'react';
import { Appointment, RecurrenceType } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  initialData?: Appointment | null;
  editingAppointment?: Appointment | null;
  selectedDateKey?: string;
  userId?: string;
  [key: string]: any;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  editingAppointment,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType | string>('none');

  const currentAppointment = initialData || editingAppointment;

  useEffect(() => {
    if (currentAppointment) {
      setTitle(currentAppointment.title || '');
      setDate(currentAppointment.date || '');
      setTime(currentAppointment.time || '');
      setDescription(currentAppointment.description || '');
      setColor(currentAppointment.color || '#3b82f6');
      setCategory(currentAppointment.category || '');
      setIsRecurring(!!currentAppointment.isRecurring);
      setRecurrenceType(currentAppointment.recurrenceType || 'none');
    } else {
      setTitle('');
      setDate('');
      setTime('');
      setDescription('');
      setColor('#3b82f6');
      setCategory('');
      setIsRecurring(false);
      setRecurrenceType('none');
    }
  }, [currentAppointment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(currentAppointment?.id ? { id: currentAppointment.id } : {}),
      title,
      date,
      time,
      description,
      color,
      category,
      isRecurring,
      recurrenceType: recurrenceType as RecurrenceType,
      status: currentAppointment?.status || 'Pendente',
    });
    onClose();
  };

  const handleDelete = () => {
    if (currentAppointment?.id && onDelete) {
      onDelete(currentAppointment.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {currentAppointment ? 'Editar Compromisso' : 'Novo Compromisso'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Cor</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border rounded p-1 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <span className="text-sm font-medium">Repetir compromisso</span>
            </label>

            {isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-1">Frequência</label>
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-between space-x-2 pt-4 border-t">
            {currentAppointment && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Excluir
              </button>
            ) : <div />}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

export default AppointmentModal;
