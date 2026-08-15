import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Share2, Smartphone, Search, Plus, FileText, CheckCircle, X, LogOut, ChevronDown } from 'lucide-react';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

interface EventItem { id?: string; title: string; description?: string; date: string; time: string; color: string; }

export default function App() {
  const todayStr = '2026-08-15';
  const [currentDate] = useState(new Date(2026, 7, 15));
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-15');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('17:40');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#eab308');

  useEffect(() => {
    const q = query(collection(db, 'events'));
    return onSnapshot(q, (snapshot) => {
      const fetched: EventItem[] = [];
      snapshot.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() } as EventItem));
      setEvents(fetched);
    });
  }, []);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addDoc(collection(db, 'events'), { title, description, date: selectedDateStr, time, color, createdAt: new Date() });
    setTitle(''); setDescription(''); setShowModal(false);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const filteredEvents = events.filter(ev => ev.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedDayEvents = filteredEvents.filter(ev => ev.date === selectedDateStr);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col">
      <header className="bg-[#0b0f19] border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Agenda Perpétua</h1>
            <p className="text-[11px] text-slate-400">Calendário Perpétuo Protegido</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="bg-[#111726] border border-slate-800 rounded-2xl p-5 flex justify-between items-center">
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Novo Compromisso
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#111726] border border-slate-800 rounded-2xl p-5">
            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-3">
              <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SÁB</div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[60px]" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateKey = `2026-08-${String(dayNum).padStart(2, '0')}`;
                return (
                  <button key={dayNum} onClick={() => setSelectedDateStr(dateKey)} className={`min-h-[60px] p-2 rounded-xl border text-left ${selectedDateStr === dateKey ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-xs font-bold">{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Eventos ({selectedDateStr})</h3>
            {selectedDayEvents.map(ev => (
              <div key={ev.id} className="p-3 bg-slate-900 rounded-xl mb-2">
                <p className="text-xs font-bold text-white">{ev.title}</p>
                <p className="text-[10px] text-slate-400">{ev.time}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-sm font-bold text-white mb-4">Novo Compromisso</h3>
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <input type="text" placeholder="Título" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white" />
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="text-xs text-slate-400 px-3 py-2">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-xs px-4 py-2 rounded-xl text-white">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
