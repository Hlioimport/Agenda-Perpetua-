import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Save,
  Tag,
  AlertCircle
} from 'lucide-react';

// Tipos de dados
type Category = 'Trabalho' | 'Pessoal' | 'Reunião' | 'Saúde' | 'Estudos' | 'Outro';
type Status = 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
type ViewMode = 'month' | 'clean' | 'notes';

interface EventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: Category;
  status: Status;
  note?: string;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CATEGORIES: Category[] = ['Trabalho', 'Pessoal', 'Reunião', 'Saúde', 'Estudos', 'Outro'];
const STATUSES: Status[] = ['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'];

export default function App() {
  // Datas e Visualização
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 15)); // Agosto 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-16');
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas as Categorias');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos os Status');

  // Modal / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('2026-08-16');
  const [formTime, setFormTime] = useState('09:00');
  const [formCategory, setFormCategory] = useState<Category>('Reunião');
  const [formStatus, setFormStatus] = useState<Status>('Pendente');
  const [formNote, setFormNote] = useState('');

  // Banco de Dados Inicial de Teste
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: '1',
      title: 'TESTES',
      date: '2026-08-16',
      time: '17:40',
      category: 'Trabalho',
      status: 'Pendente',
      note: 'Anotação adicionada para testes do sistema.'
    },
    {
      id: '2',
      title: 'Reunião de Alinhamento Semanal',
      date: '2026-08-16',
      time: '09:00',
      category: 'Reunião',
      status: 'Em Andamento',
      note: 'Revisar metas do projeto e prazos das entregas.'
    }
  ]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Troca de Mês / Ano via Selects
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentYear, newMonth, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentDate(new Date(newYear, currentMonth, 1));
  };

  // Abrir modal para Criar
  const handleOpenCreateModal = (dateStr?: string) => {
    setEditingEvent(null);
    setFormTitle('');
    setFormDate(dateStr || selectedDateStr);
    setFormTime('09:00');
    setFormCategory('Reunião');
    setFormStatus('Pendente');
    setFormNote('');
    setIsModalOpen(true);
  };

  // Abrir modal para Editar
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

  // Salvar (Novo ou Edição)
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

  // Excluir compromisso
  const handleDeleteEvent = (id: string) => {
    if (confirm('Deseja realmente excluir este compromisso?')) {
      setEvents(prev => prev.filter(ev => ev.id !== id));
    }
  };

  // Eventos Filtrados
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // Busca texto
      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.note && ev.note.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filtro de Categoria
      const matchesCategory = selectedCategory === 'Todas as Categorias' || ev.category === selectedCategory;

      // Filtro de Status
      const matchesStatus = selectedStatus === 'Todos os Status' || ev.status === selectedStatus;

      // Se for modo 'notes', só mostra quem tem anotação
      const matchesNotesMode = viewMode === 'notes' ? Boolean(ev.note && ev.note.trim().length > 0) : true;

      return matchesSearch && matchesCategory && matchesStatus && matchesNotesMode;
    });
  }, [events, searchQuery, selectedCategory, selectedStatus, viewMode]);

  // Dias do mês para a grade
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({
        dayNumber: d,
        dateStr: fullDateStr,
        hasEvents: events.some(e => e.date === fullDateStr)
      });
    }
    return days;
  }, [currentYear, currentMonth, events]);

  const selectedDayEvents = filteredEvents.filter(e => e.date === selectedDateStr);

  return (
    <div className="min-h-screen bg-[#0b132b] text-white font-sans p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* CABEÇALHO / NAVBAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1c2541] p-4 rounded-xl border border-slate-700/50 shadow-lg">
          
          {/* Mês e Ano Selects */}
          <div className="flex items-center gap-2">
            <select
              value={currentMonth}
              onChange={handleMonthChange}
              className="bg-[#0b132b] text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={handleYearChange}
              className="bg-[#0b132b] text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 font-semibold"
            >
              {Array.from({ length: 15 }, (_, i) => 2024 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={() => handleOpenCreateModal()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-md ml-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Compromisso</span>
            </button>
          </div>

          {/* BOTÕES DE MODO DE VISUALIZAÇÃO */}
          <div className="flex items-center bg-[#0b132b] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Mês</span>
            </button>

            <button
              onClick={() => setViewMode('clean')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'clean'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Agenda Clean</span>
            </button>

            <button
              onClick={() => setViewMode('notes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'notes'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Com Anotações</span>
            </button>
          </div>
        </div>

        {/* BARRA DE PESQUISA E FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#1c2541] p-3 rounded-xl border border-slate-700/50">
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar compromissos ou anotações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b132b] text-white pl-9 pr-3 py-2 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0b132b] text-white px-3 py-2 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="Todas as Categorias">Todas as Categorias</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0b132b] text-white px-3 py-2 rounded-lg border border-slate-600 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="Todos os Status">Todos os Status</option>
            {STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* CORPO PRINCIPAL - CONTEÚDO DINÂMICO */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRADE DO CALENDÁRIO */}
            <div className="lg:col-span-2 bg-[#1c2541] p-5 rounded-2xl border border-slate-700/50 shadow-xl">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-3">
                <div className="text-red-400">DOM</div>
                <div>SEG</div>
                <div>TER</div>
                <div>QUA</div>
                <div>QUI</div>
                <div>SEX</div>
                <div className="text-red-400">SÁB</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="h-16 rounded-xl bg-[#0b132b]/30"></div>;
                  }

                  const isSelected = day.dateStr === selectedDateStr;
                  const dayEvents = filteredEvents.filter(e => e.date === day.dateStr);

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => setSelectedDateStr(day.dateStr)}
                      className={`h-16 p-2 rounded-xl border transition-all flex flex-col justify-between items-start text-left relative overflow-hidden ${
                        isSelected
                          ? 'border-blue-500 bg-blue-600/20 ring-2 ring-blue-500/50'
                          : 'border-slate-700/60 bg-[#0b132b]/80 hover:border-slate-500'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                        {day.dayNumber}
                      </span>

                      {dayEvents.length > 0 && (
                        <div className="w-full space-y-1 mt-1">
                          {dayEvents.slice(0, 2).map(e => (
                            <div
                              key={e.id}
                              className="text-[10px] truncate px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30 font-medium"
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-slate-400">+{dayEvents.length - 2} mais</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PAINEL LATERAL: EVENTOS DO DIA */}
            <div className="bg-[#1c2541] p-5 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col h-full">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <h3 className="font-bold text-lg text-white">Eventos do Dia</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {selectedDateStr.split('-').reverse().join('/')}
                </span>
              </div>

              <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[450px]">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum compromisso para este dia.</p>
                  </div>
                ) : (
                  selectedDayEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3.5 rounded-xl bg-[#0b132b] border border-slate-700/80 hover:border-slate-600 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {event.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs">{event.time}</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-white text-base">{event.title}</h4>

                      {event.note && (
                        <p className="text-xs text-slate-300 bg-[#1c2541] p-2 rounded-lg border border-slate-700/50">
                          💬 {event.note}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-[11px] text-slate-400">Status: <strong className="text-blue-400">{event.status}</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(event)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* MODO: AGENDA CLEAN OU COM ANOTAÇÕES */}
        {(viewMode === 'clean' || viewMode === 'notes') && (
          <div className="bg-[#1c2541] p-6 rounded-2xl border border-slate-700/50 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {viewMode === 'notes' ? 'Todas as Anotações da Agenda' : 'Visão Simplificada da Agenda'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {filteredEvents.length} compromisso(s) encontrado(s)
                </p>
              </div>
              <button
                onClick={() => handleOpenCreateModal()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Compromisso</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-16 text-slate-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-base">Nenhum compromisso encontrado com os filtros selecionados.</p>
                </div>
              ) : (
                filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className="bg-[#0b132b] p-4 rounded-xl border border-slate-700/80 hover:border-blue-500/50 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          📅 {event.date.split('-').reverse().join('/')} às {event.time}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {event.category}
                        </span>
                      </div>
