import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Share2, 
  Smartphone, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle, 
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

interface EventItem {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  color: string;
  category?: string;
  status?: string;
}

export default function App() {
  const todayStr = '2026-08-15'; // Hoje: Sábado, 15 de Agosto
  const [currentDate] = useState(new Date(2026, 7, 15));
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-15');
  const [events, setEvents] = useState<EventItem[]>([]);
  
  // Filtros de Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas as Categorias');
  const [selectedStatus, setSelectedStatus] = useState('Todos os Status');
  const [onlyNotes, setOnlyNotes] = useState(false);

  // Modais e Toasts
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Formulário
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('17:40');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#eab308');

  // Formatar Date para YYYY-MM-DD
  const formatDateToKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Buscar compromissos no Firestore
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: EventItem[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as EventItem);
      });
      setEvents(fetched);
    }, (err) => console.error(err));

    return () => unsubscribe();
  }, []);

  // Salvar compromisso
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await addDoc(collection(db, 'events'), {
        title,
        description,
        date: selectedDateStr,
        time,
        color,
        createdAt: new Date()
      });

      setTitle('');
      setDescription('');
      setShowModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Filtragem de eventos
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesNotes = onlyNotes ? !!ev.description : true;
    return matchesSearch && matchesNotes;
  });

  const selectedDayEvents = filteredEvents.filter(ev => ev.date === selectedDateStr);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col">
      {/* Topbar Pro */}
      <header className="bg-[#0b0f19] border-b border-slate-800/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-wide">Agenda Perpétua</h1>
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Agenda Protegida • Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Calendário Perpétuo & Acesso Individual Protegido</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-all">
            <Share2 className="w-3.5 h-3.5" /> Compartilhar
          </button>
          <button className="bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-all">
            <Smartphone className="w-3.5 h-3.5" /> App Android
          </button>
          <button className="bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 text-indigo-400 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-all">
            <CalendarIcon className="w-3.5 h-3.5" /> Google Agenda
          </button>
          <button className="bg-slate-800/80 border border-slate-700/50 text-slate-200 text-xs px-3 py-2 rounded-lg font-medium">
            CSV
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center border border-indigo-400/30">
            H
          </div>
          <button className="text-slate-400 hover:text-slate-200 p-2">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Painel Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Bloco de Controle e Filtros */}
        <div className="bg-[#111726] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-[#182032] border border-slate-700/50 px-4 py-2 rounded-xl flex items-center space-x-3">
                <span className="text-sm font-semibold text-white">Agosto</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-indigo-400">2026</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              <button 
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30"
              >
                <Plus className="w-4 h-4" /> Novo Compromisso
              </button>
            </div>

            <div className="bg-[#182032] p-1 rounded-xl border border-slate-700/50 flex items-center text-xs">
              <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-sm">Mês</button>
              <button className="text-slate-400 px-3 py-1.5 hover:text-white">Agenda Clean</button>
            </div>
          </div>

          {/* Barra de Busca e Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
            <div className="relative md:col-span-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar compromissos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#182032] border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option>Todas as Categorias</option>
            </select>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#182032] border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              <option>Todos os Status</option>
            </select>

            <button 
              onClick={() => setOnlyNotes(!onlyNotes)}
              className={`border text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
                onlyNotes 
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                  : 'bg-[#182032] border-slate-700/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Com Anotações
            </button>
          </div>
        </div>

        {/* Grid do Calendário + Painel Lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendário */}
          <div className="lg:col-span-2 bg-[#111726] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            {/* Cabeçalho dos Dias da Semana */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-rose-500 mb-3 pb-2 border-b border-slate-800/60">
              <div>DOM</div>
              <div className="text-slate-400">SEG</div>
              <div className="text-slate-400">TER</div>
              <div className="text-slate-400">QUA</div>
              <div className="text-slate-400">QUI</div>
              <div className="text-slate-400">SEX</div>
              <div>SÁB</div>
            </div>

            {/* Grid dos Dias do Mês */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Espaços vazios até o primeiro dia do mês */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[72px] bg-transparent" />
              ))}

              {/* Dias do Mês */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const thisDate = new Date(year, month, dayNum);
                const dateKey = formatDateToKey(thisDate);
                const isSelected = selectedDateStr === dateKey;
                const isToday = todayStr === dateKey;
                const dayEvents = filteredEvents.filter(ev => ev.date === dateKey);

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDateStr(dateKey)}
                    className={`min-h-[72px] p-2 rounded-xl flex flex-col justify-between border transition-all text-left ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/50'
                        : isToday
                        ? 'bg-emerald-950/40 border-emerald-500/80'
                        : 'bg-[#182032]/50 border-slate-800/60 hover:border-slate-700 hover:bg-[#182032]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${
                        isToday 
                          ? 'text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md' 
                          : isSelected 
                          ? 'text-indigo-400' 
                          : 'text-slate-300'
                      }`}>
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                      )}
                    </div>

                    <div className="space-y-1 w-full mt-1">
                      {dayEvents.slice(0, 2).map((ev, idx) => (
                        <div 
                          key={idx} 
                          className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono truncate"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span className="truncate">{ev.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-slate-500 font-semibold pl-1">
                          +{dayEvents.length - 2}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Painel do Dia Selecionado */}
          <div className="bg-[#111726] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white">Eventos do Dia</h3>
                <span className="text-xs font-semibold text-indigo-400 font-mono">
                  {selectedDateStr.split('-').reverse().join('/')}
                </span>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <CalendarIcon className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">Nenhum compromisso para este dia.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((ev) => (
                    <div 
                      key={ev.id} 
                      className="p-3.5 rounded-xl bg-[#182032] border border-slate-700/50 flex flex-col space-y-1 relative overflow-hidden"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1" 
                        style={{ backgroundColor: ev.color || '#eab308' }} 
                      />
                      <div className="flex items-center justify-between pl-2">
                        <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{ev.time}</span>
                      </div>
                      {ev.description && (
                        <p className="text-[11px] text-slate-400 pl-2 leading-relaxed">{ev.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowModal(true)}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all border border-indigo-400/30"
            >
              <Plus className="w-4 h-4" /> Adicionar Compromisso
            </button>
          </div>

        </div>
      </main>

      {/* Modal Criar Compromisso */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111726] border border-slate-800/80 rounded-2xl shadow-2xl max-w-md w-full p-6 relative text-slate-100">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white mb-4">Novo Compromisso</h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Título</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reunião de alinhamento"
                  className="w-full bg-[#182032] border border-slate-700/50 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Data</label>
                  <input 
                    type="text" 
                    disabled 
                    value={selectedDateStr.split('-').reverse().join('/')}
                    className="w-full bg-[#182032]/50 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hora</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#182032] border border-slate-700/50 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Anotações / Descrição</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full bg-[#182032] border border-slate-700/50 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cor</label>
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-[#182032] border border-slate-700/50"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notificação */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 text-xs font-bold">
          <CheckCircle className="w-4 h-4" />
          <span>Compromisso criado com sucesso!</span>
        </div>
