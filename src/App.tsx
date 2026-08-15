import React, { useState, useMemo, useEffect } from 'react';
// IMPORTAÇÕES DO FIREBASE (Adicionadas ao topo)
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider } from './firebase'; // Seu arquivo do Firebase existente

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
  // ESTADO DE AUTENTICAÇÃO
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Monitora o estado de Login do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

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

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('agenda_events');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('agenda_events', JSON.stringify(events));
  }, [events]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const yearOptions = useMemo(() => {
    const startYear = today.getFullYear() - 10;
    const years = [];
    for (let i = 0; i <= 20; i++) years.push(startYear + i);
    return years;
  }, []);

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

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Todas as Categorias' || event.category === selectedCategory;
      const matchesStat = selectedStatus === 'Todos os Status' || event.status === selectedStatus;
      return matchesSearch && matchesCat && matchesStat && event.date === selectedDateStr;
    });
  }, [events, searchQuery, selectedCategory, selectedStatus, selectedDateStr]);

  // CARREGANDO SESSÃO
  if (loadingAuth) {
    return <div className="min-h-screen bg-[#0b132b] flex items-center justify-center text-white text-sm">Carregando...</div>;
  }

  // TELA DE LOGIN (Se não estiver logado)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b132b] flex items-center justify-center p-4">
        <div className="bg-[#1c2541] border border-slate-700 p-6 rounded-xl max-w-sm w-full text-center space-y-4 shadow-xl">
          <span className="text-4xl">📅</span>
          <h2 className="text-xl font-bold text-white">Agenda Perpétua</h2>
          <p className="text-xs text-slate-400">Faça login para salvar seus compromissos na sua conta.</p>
          <button
            onClick={() => signInWithPopup(auth, googleProvider)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-xs transition flex items-center justify-center gap-2"
          >
            🔑 Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  // TELA PRINCIPAL (Sua agenda intacta)
  return (
    <div className="min-h-screen bg-[#0b132b] text-slate-100 p-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header com indicador do usuário e botão Sair */}
        <header className="bg-[#1c2541] p-4 rounded-xl border border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <h1 className="text-xl font-bold text-white">Agenda Perpétua</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 hidden sm:inline">{user.email}</span>
            <button onClick={() => signOut(auth)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600">Sair</button>
            <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">+ Novo Evento</button>
          </div>
        </header>

        {/* Filtros */}
        <div className="bg-[#1c2541] p-3 rounded-xl border border-slate-700 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#0b132b] border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white" />
          </div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-[#0b132b] border border-slate-700 px-2 py-1.5 rounded-lg text-xs text-white">
            <option value="Todas as Categorias">Todas as Categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="bg-[#0b132b] border border-slate-700 px-2 py-1.5 rounded-lg text-xs text-white">
            <option value="Todos os Status">Todos os Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Grid do Calendário + Lista */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-[#1c2541] p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-700 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">{MONTHS[currentMonth]}</span>
                <select
                  value={currentYear}
                  onChange={e => setCurrentDate(new Date(Number(e.target.value), currentMonth, 1))}
                  className="bg-[#0b132b] border border-slate-700 text-white text-sm font-bold rounded px-2 py-0.5"
                >
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex gap-1 items-center">
                <button title="Ano Anterior" onClick={() => setCurrentDate(new Date(currentYear - 1, currentMonth, 1))} className="px-2 py-1 bg-[#0b132b] border border-slate-700 hover:bg-slate-700 rounded text-xs font-bold text-slate-300">« Ano</button>
                <button title="Mês Anterior" onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="px-2 py-1 bg-[#0b132b] border border-slate-700 hover:bg-slate-700 rounded text-xs text-slate-300">◀ Mês</button>
                <button title="Mês Seguinte" onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="px-2 py-1 bg-[#0b132b] border border-slate-700 hover:bg-slate-700 rounded text-xs text-slate-300">Mês ▶</button>
                <button title="Ano Seguinte" onClick={() => setCurrentDate(new Date(currentYear + 1, currentMonth, 1))} className="px-2 py-1 bg-[#0b132b] border border-slate-700 hover:bg-slate-700 rounded text-xs font-bold text-slate-300">Ano »</button>
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
                if (isSelected) cardStyle = 'bg-blue-600/30 border-blue-500 text-white ring-2 ring-blue-500/40';
                else if (isToday) cardStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold';

                return (
                  <button key={item.dateStr} onClick={() => setSelectedDateStr(item.dateStr)} className={`h-12 p-1 rounded-lg border text-left flex flex-col justify-between transition ${cardStyle}`}>
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

          <div className="bg-[#1c2541] p-4 rounded-xl border border-slate-700 space-y-3">
            <h2 className="text-sm font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
              ⏱️ Eventos ({selectedDateStr})
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
                    <button onClick={() => handleOpenModal(ev)} className="text-xs text-slate-400 hover:text-blue-400">✏️ Editar</button>
                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-xs text-slate-400 hover:text-rose-400">🗑️ Excluir</button>
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
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
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
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded font-semibold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
