import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Share2, 
  LogOut, 
  Upload, 
  Download,
  Calendar as CalendarIcon,
  CheckCircle,
  X
} from 'lucide-react';
import { collection, addDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';

interface EventItem {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  color: string;
  category?: string;
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 12)); // Agosto 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-12');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Campos do formulário
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('13:00');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#ef4444');

  // Formata data Date para YYYY-MM-DD
  const formatDateToKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Carregar eventos do Firestore em tempo real
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: EventItem[] = [];
      snapshot.forEach((doc) => {
        fetchedEvents.push({ id: doc.id, ...doc.data() } as EventItem);
      });
      setEvents(fetchedEvents);
    }, (error) => {
      console.error("Erro ao buscar eventos:", error);
    });

    return () => unsubscribe();
  }, []);

  // Salvar compromisso no Firestore
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

      // Limpa formulário e fecha modal
      setTitle('');
      setDescription('');
      setShowModal(false);

      // Exibe toast de sucesso
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (error) {
      console.error("Erro ao salvar compromisso:", error);
    }
  };

  // Gerador de dias do mês
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Eventos do dia selecionado
  const selectedDayEvents = events.filter(event => event.date === selectedDateStr);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Topbar / Header */}
      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold">Agenda Perpétua</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-400 text-xs px-3 py-1.5 rounded-md font-medium">
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
          <button className="bg-red-500 hover:bg-red-400 text-xs px-3 py-1.5 rounded-md font-medium">
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Calendário */}
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-lg font-bold text-slate-800">
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 text-xs bg-emerald-500 text-white px-3 py-1.5 rounded hover:bg-emerald-600">
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
              <button className="flex items-center space-x-1 text-xs bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-600">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar CSV</span>
              </button>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2">
            <div>Domingo</div>
            <div>Segunda</div>
            <div>Terça</div>
            <div>Quarta</div>
            <div>Quinta</div>
            <div>Sexta</div>
            <div>Sábado</div>
          </div>

          {/* Grid dos Dias */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const thisDate = new Date(year, month, dayNum);
              const dateKey = formatDateToKey(thisDate);
              const isSelected = selectedDateStr === dateKey;
              const hasEvents = events.some(ev => ev.date === dateKey);

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`h-12 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-bold shadow-md scale-105' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasEvents && !isSelected && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full absolute bottom-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Lado Direito: Eventos do Dia */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-bold text-slate-800">Eventos do Dia</h3>
              <span className="text-xs font-semibold text-slate-400">
                {selectedDateStr.split('-').reverse().join('/')}
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <CalendarIcon className="w-8 h-8 opacity-40" />
                <p className="text-xs">Nenhum compromisso agendado para este dia.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((ev) => (
                  <div 
                    key={ev.id} 
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-start space-x-3"
                    style={{ borderLeft: `4px solid ${ev.color}` }}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-800">{ev.title}</h4>
                      {ev.description && <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>}
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">{ev.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Compromisso</span>
          </button>
        </section>
      </main>

      {/* Modal de Criar Compromisso */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4">Novo Compromisso</h3>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reunião de alinhamento"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
                  <input 
                    type="text" 
                    disabled 
                    value={selectedDateStr.split('-').reverse().join('/')}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hora</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes opcionais..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cor do Card</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-200"
                  />
                  <span className="text-xs text-slate-500 font-mono">{color}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notificação Verde */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 text-sm font-medium">
          <CheckCircle className="w-5 h-5" />
          <span>Compromisso criado com sucesso!</span>
        </div>
      )}
    </div>
  );
}
