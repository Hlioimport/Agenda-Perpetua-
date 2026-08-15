import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  FileText,
  Clock,
  Trash2,
  Edit3,
  Filter,
  X,
  Save,
  AlertCircle
} from 'lucide-react';

// Tipos de dados
type Category = 'Trabalho' | 'Pessoal' | 'Reunião' | 'Saúde' | 'Estudos' | 'Outro';
type Status = 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
type ViewMode = 'month' | 'clean' | 'notes';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  category: Category;
  status: Status;
  note?: string;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const CATEGORIES: Category[] = ['Trabalho', 'Pessoal', 'Reunião', 'Saúde', 'Estudos', 'Outro'];
const STATUSES: Status[] = ['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'];

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 15));
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-16');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas as Categorias');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos os Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('2026-08-16');
  const [formTime, setFormTime] = useState('09:00');
  const [formCategory, setFormCategory] = useState<Category>('Reunião');
  const [formStatus, setFormStatus] = useState<Status>('Pendente');
  const [formNote, setFormNote] = useState('');
  const [events, setEvents] = useState<EventItem[]>([
    { id: '1', title: 'TESTES', date: '2026-08-16', time: '17:40', category: 'Trabalho', status: 'Pendente', note: 'Anotação teste.' },
    { id: '2', title: 'Reunião', date: '2026-08-16', time: '09:00', category: 'Reunião', status: 'Em Andamento', note: 'Revisar metas.' }
  ]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handleOpenEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDate(event.date);
    setFormTime(event.time);
    setFormCategory(event.category);
    setFormStatus(event.status);
    setFormNote(event.note || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, title: formTitle, date: formDate, time: formTime, category: formCategory, status: formStatus, note: formNote } : ev));
    } else {
      setEvents(prev => [...prev, { id: Date.now().toString(), title: formTitle, date: formDate, time: formTime, category: formCategory, status: formStatus, note: formNote }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-white font-sans p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Cabecalho */}
        <div className="bg-[#1c2541] p-4 rounded-xl border border-slate-700">
           <h1 className="text-xl font-bold">Agenda Perpétua</h1>
        </div>

        {/* Exemplo de conteudo simples para teste */}
        <div className="bg-[#1c2541] p-4 rounded-xl border border-slate-700">
          <p>Calendário e Tarefas carregados com sucesso.</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1c2541] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Editar Compromisso</h3>
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full bg-[#0b132b] text-white px-3 py-2 rounded-lg border border-slate-600" />
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300">Cancelar</button>
                <button type="submit" className="bg-blue-600 px-4 py-2 rounded-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
