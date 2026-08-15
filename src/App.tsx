import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Plus, Search, Clock, Trash2, Edit3, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';

type Category = 'Trabalho' | 'Pessoal' | 'Reunião' | 'Saúde' | 'Estudos' | 'Outro';
type Status = 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';

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
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CATEGORIES: Category[] = ['Trabalho', 'Pessoal', 'Reunião', 'Saúde', 'Estudos', 'Outro'];
const STATUSES: Status[] = ['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'];

export default function App() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas as Categorias');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos os Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(todayStr);
  const [formTime, setFormTime] = useState('09:00');
  const [formCategory, setFormCategory] = useState<Category>('Reunião');
  const [formStatus, setFormStatus] = useState<Status>('Pendente');
  const [formNote, setFormNote] = useState('');

  const [events, setEvents] = useState<EventItem[]>([
    { id: '1', title: 'Apresentação do Projeto', date: todayStr, time: '09:00', category: 'Trabalho', status: 'Em Andamento', note: 'Revisar slides.' },
    { id: '2', title: 'Alinhamento de Equipe', date: todayStr, time: '17:40', category: 'Reunião', status: 'Pendente', note: 'Definir metas.' }
  ]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr: dayStr });
    }
    return days;
  }, [currentYear, currentMonth]);

  const handleOpenModal = (event?: EventItem) => {
    if (event) {
      setEditingEvent(event);
      setFormTitle(event.title);
      setFormDate(event.date);
      setFormTime(event.time);
      setFormCategory(event.category);
      setFormStatus(event.status);
      setFormNote(event.note || '');
    } else {
      setEditingEvent(null);
      setFormTitle('');
      setFormDate(selectedDateStr);
      setFormTime('09:00');
      setFormCategory('Trabalho');
      setFormStatus('Pendente');
      setFormNote('');
    }
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    if (editingEvent) {
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, title: formTitle, date: formDate, time: formTime, category: formCategory, status: formStatus, note: formNote } : ev));
    } else {
      setEvents(prev => [...prev, { id: Date.now().toString(), title: formTitle, date: formDate, time: formTime, category: formCategory, status: formStatus, note: formNote }]);
    }
    setIsModalOpen(false);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Todas as Categorias' || event.category === selectedCategory;
      const matchesStat = selectedStatus === 'Todos os Status' || event.status === selectedStatus;
      return matchesSearch && matchesCat && matchesStat && event.date === selectedDateStr;
    });
  }, [events, searchQuery, selectedCategory, selectedStatus, selectedDateStr]);

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header */}
        <header className="bg-[#1c2541] p-4 rounded-xl border border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-blue-400"/>
            <h1 className="text-xl font-bold text-white">Agenda Perpétua</h1>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
            <Plus className="w-4 h-4"/> Novo Evento
          </button>
        </header>

        {/* Filtros */}
        <div className="bg-[#1c2541] p-3 rounded-xl border border-slate-700 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"/>
            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#0b132b] border border-slate-700 pl-9 pr-3 py-1.5 rounded-lg text-xs text-white" />
          </div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-[#0b132b] border border-slate-700 px-2 py-1.5 rounded-lg text-xs">
            <option value="Todas as Categorias">Todas as Categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="bg-[#0b132b] border border-slate-700 px-2 py-1.5 rounded-lg text-xs">
            <option value="Todos os Status">Todos os Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Calendário */}
          <div className="md:col-span-2 bg-[#1c2541] p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h2 className="text-base font-bold text-white">{MONTHS[currentMonth]} {currentYear}</h2>
              <div className="flex gap-1">
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1 hover:bg-slate-700 rounded"><ChevronLeft className="w-4 h-4"/></button>
                <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1 hover:bg-slate-700 rounded"><ChevronRight className="w-4 h-4"/></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 font-semibold">
              {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((item, idx) => {
                if (!item) return <div key={`e-${idx}`} className="h-12" />;

                const isToday = item.dateStr === todayStr;
                const isSelected = item.dateStr === selectedDateStr;

                let cardStyle = 'bg-[#0b132b]/50 border-slate-700 text-slate-300';
                if (isSelected) {
                  cardStyle = 'bg-blue-600/30 border-blue-500 text-white ring-2 ring-blue-500/40';
                } else if (isToday) {
                  cardStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold';
                }

                return (
                  <button
                    key={item.dateStr}
                    onClick={() => setSelectedDateStr(item.dateStr)}
                    className={`h-12 p-1 rounded-lg border text-left flex flex-col justify-between transition ${cardStyle}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs">{item.dayNumber}</span>
                      {isToday && <span className="text-[9px] bg-emerald-500/30 text-emerald-400 px-1 rounded">Hoje</span>}
                    </div>
                    {events.some(e => e.date === item.dateStr) && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Eventos */}
          <div className="bg-[#1c2541] p-4 rounded-xl border border-slate-700 space-y-3">
            <h2 className="text-sm font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400"/> Eventos ({selectedDateStr})
            </h2>

            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Nenhum evento neste dia.</p>
              ) : filteredEvents.map(ev => (
                <div key={ev.id} className="p-2.5 bg-[#0b132b] border border-slate-700 rounded-lg space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-white">{ev.title}</h3>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">{ev.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{ev.time} • {ev.category}</p>
                  {ev.note && <p className="text-[11px] text-slate-300 bg-[#1c2541] p-1 rounded border border-slate-800">{ev.note}</p>}
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => handleOpenModal(ev)} className="text-slate-400 hover:text-blue-400"><Edit3 className="w-3 h-3"/></button>
                    <button onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))} className="text-slate-400 hover:text-rose-400"><Trash2 className="w-3 h-3"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1c2541] border border-slate-700 w-full max-w-md rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h3 className="text-sm font-bold text-white">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-2 text-xs">
              <input type="text" required placeholder="Título" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full bg-[#0b132b] text-white p-2 rounded border border-slate-700" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)} className="bg-[#0b132b] text-white p-2 rounded border border-slate-700" />
                <input type="time" required value={formTime} onChange={e => setFormTime(e.target.value)} className="bg-[#0b132b] text-white p-2 rounded border border-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={formCategory} onChange={e => setFormCategory(e.target.value as Category)} className="bg-[#0b132b] text-white p-2 rounded border border-slate-700">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={formStatus} onChange={e => setFormStatus(e.target.value as Status)} className="bg-[#0b132b] text-white p-2 rounded border border-slate-700">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <textarea placeholder="Observações" value={formNote} onChange={e => setFormNote(e.target.value)} className="w-full bg-[#0b132b] text-white p-2 rounded border border-slate-700 resize-none" rows={2} />
              
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1 text-slate-400">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded font-semibold flex items-center gap-1"><Save className="w-3 h-3"/> Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
