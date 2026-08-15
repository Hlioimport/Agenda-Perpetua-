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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Tipos de dados
type Category = 'Trabalho' | 'Pessoal' | 'Reunião' | 'Saúde' | 'Estudos' | 'Outro';
type Status = 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
type ViewMode = 'month' | 'clean' | 'notes';

interface EventItem {
  id: string;
  title: string;
  date: string; // Formato YYYY-MM-DD
  time: string; // Formato HH:MM
  category: Category;
  status: Status;
  note?: string;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const CATEGORIES: Category[] = ['Trabalho', 'Pessoal', 'Reunião', 'Saúde', 'Estudos', 'Outro'];
const STATUSES: Status[] = ['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'];

export default function App() {
  // Estado inicial
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 15));
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-16');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas as Categorias');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos os Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Estados do Formulário
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('2026-08-16');
  const [formTime, setFormTime] = useState('09:00');
  const [formCategory, setFormCategory] = useState<Category>('Reunião');
  const [formStatus, setFormStatus] = useState<Status>('Pendente');
  const [formNote, setFormNote] = useState('');

  // Eventos Cadastrados
  const [events, setEvents] = useState<EventItem[]>([
    { id: '1', title: 'Apresentação do Projeto', date: '2026-08-16', time: '09:00', category: 'Trabalho', status: 'Em Andamento', note: 'Revisar slides antes de apresentar.' },
    { id: '2', title: 'Alinhamento de Equipe', date: '2026-08-16', time: '17:40', category: 'Reunião', status: 'Pendente', note: 'Definir prioridades para a próxima semana.' },
    { id: '3', title: 'Consulta Médica', date: '2026-08-20', time: '14:30', category: 'Saúde', status: 'Pendente', note: 'Levar os exames anteriores.' }
  ]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navegação de Mês
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Gerador de Dias do Calendário
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dayNumber: d, dateStr: dayStr });
    }
    return days;
  }, [currentYear, currentMonth]);

  // Ações do Modal
  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormDate(selectedDateStr);
    setFormTime('09:00');
    setFormCategory('Trabalho');
    setFormStatus('Pendente');
    setFormNote('');
    setIsModalOpen(true);
  };

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

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingEvent) {
      setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? {
        ...ev,
        title: formTitle,
        date: formDate,
        time: formTime,
        category: formCategory,
        status: formStatus,
        note: formNote
      } : ev));
    } else {
      const newEv: EventItem = {
        id: Date.now().toString(),
        title: formTitle,
        date: formDate,
        time: formTime,
        category: formCategory,
        status: formStatus,
        note: formNote
      };
      setEvents(prev => [...prev, newEv]);
    }
    setIsModalOpen(false);
  };

  // Filtros de Eventos
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (event.note && event.note.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'Todas as Categorias' || event.category === selectedCategory;
      const matchesStatus = selectedStatus === 'Todos os Status' || event.status === selectedStatus;
      
      if (viewMode === 'month') {
        return matchesSearch && matchesCategory && matchesStatus && event.date === selectedDateStr;
      }
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchQuery, selectedCategory, selectedStatus, viewMode, selectedDateStr]);

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'Concluído': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Em Andamento': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Cancelado': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 font-sans p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Topo / Barra de Ferramentas */}
        <header className="bg-[#1c2541] p-4 md:p-6 rounded-2xl border border-slate-700/60 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
              <CalendarIcon className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Agenda Perpétua</h1>
              <p className="text-xs text-slate-400">Gerenciador de tarefas e compromissos</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex bg-[#0b132b] p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Calendário
              </button>
              <button
                onClick={() => setViewMode('clean')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'clean' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Lista Geral
              </button>
              <button
                onClick={() => setViewMode('notes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'notes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Anotações
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-600/20 w-full md:w-auto"
            >
              <Plus className="w-4 h-4" />
              Novo Evento
            </button>
          </div>
        </header>

        {/* Filtros e Busca */}
        <div className="bg-[#1c2541] p-4 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar compromisso ou anotação..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b132b] border border-slate-700 pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#0b132b] border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="Todas as Categorias">Todas as Categorias</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-[#0b132b] border border-slate-700 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="Todos os Status">Todos os Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Grade do Calendário e Lista de Compromissos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Seção do Calendário (Exibido no modo 'month') */}
          {viewMode === 'month' && (
            <div className="lg:col-span-2 bg-[#1c2541] p-5 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{MONTHS[currentMonth]}</span>
                  <span className="text-blue-400">{currentYear}</span>
                </h2>
                <div className="flex items-center gap-1">
                  <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Dias da Semana */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-xs font-semibold text-slate-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do Mês */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarGrid.map((item, idx) => {
                  if (!item) {
                    return <div key={`empty-${idx}`} className="h-14 rounded-xl bg-slate-800/20" />;
                  }

                  const isSelected = item.dateStr === selectedDateStr;
                  const dayEvents = events.filter(e => e.date === item.dateStr);

                  return (
                    <button
                      key={item.dateStr}
                      onClick={() => setSelectedDateStr(item.dateStr)}
                      className={`h-14 p-1.5 rounded-xl border flex flex-col justify-between transition text-left relative ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/30'
                          : 'bg-[#0b132b]/60 border-slate-700/50 hover:border-slate-500 text-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold">{item.dayNumber}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-[10px] text-slate-400 font-medium truncate">
                            {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Painel de Eventos / Lista */}
          <div className={`${viewMode === 'month' ? 'lg:col-span-1' : 'lg:col-span-3'} bg-[#1c2541] p-5 rounded-2xl border border-slate-700/60 shadow-xl space-y-4`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                {viewMode === 'month' ? `Compromissos (${selectedDateStr})` : 'Lista de Compromissos'}
              </h2>
              <span className="text-xs text-slate-400 font-medium">{filteredEvents.length} item(ns)</span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Nenhum compromisso encontrado para este filtro.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3.5 bg-[#0b132b]/70 border border-slate-700/60 rounded-xl flex flex-col gap-2 hover:border-slate-600 transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{event.date}</span>
                          <span>•</span>
                          <span>{event.time}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">{event.category}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(event.status)}`}>
                        {event.status}
                      </span>
                    </div>

                    {event.note && (
                      <p className="text-xs text-slate-300 bg-[#1c2541]/80 p-2 rounded-lg border border-slate-700/40 mt-1">
                        {event.note}
                      </p>
                    )}

                    <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => handleOpenEditModal(event)}
                        className="p-1 text-slate-400 hover:text-blue-400 transition"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c2541] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                {editingEvent ? 'Editar Compromisso' : 'Novo Compromisso'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reunião de Planejamento"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-[#0b132b] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-[#0b132b] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full bg-[#0b132b] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as Category)}
                    className="w-full bg-[#0b132b] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-s
