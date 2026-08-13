import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { PerpetualCalendar } from './components/PerpetualCalendar';
import { AppointmentList } from './components/AppointmentList';
import { AppointmentModal } from './components/AppointmentModal';
import { ShareAgendaModal } from './components/ShareAgendaModal';
import { ExportImportButtons } from './components/ExportImportButtons';
import { Toast, ToastProps } from './components/Toast';
import { subscribeToAuthChanges, loginWithGoogle, logoutUser } from './lib/auth';
import { getUserAppointments, saveAppointment, deleteAppointment, Appointment } from './lib/db';
import { getTodayDateKey } from './lib/dateUtils';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Controle de datas e navegação do calendário (Inicia em Agosto de 2026)
  const [currentMonth, setCurrentMonth] = useState(7); // 0 = Janeiro, 7 = Agosto
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(12); // Dia 12 inicializado
  const [selectedDateKey, setSelectedDateKey] = useState('2026-08-12');

  // Modais e Alertas
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Visão de Convidado
  const [isGuestView, setIsGuestView] = useState(false);
  const [guestUserId, setGuestUserId] = useState<string | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, onClose: () => setToast(null) });
  };

  // 1. Gerencia Estado de Autenticação e Modo Convidado
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get('view');

    if (viewId) {
      setIsGuestView(true);
      setGuestUserId(viewId);
      fetchAppointments(viewId);
      setLoading(false);
    } else {
      const unsubscribe = subscribeToAuthChanges((currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          fetchAppointments(currentUser.uid);
        } else {
          setAppointments([]);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  // 2. Busca compromissos do Firestore
  const fetchAppointments = async (uid: string) => {
    try {
      const data = await getUserAppointments(uid);
      setAppointments(data);
    } catch (error) {
      showNotification('Erro ao carregar seus compromissos.', 'error');
    }
  };

  // 3. Atualiza a string YYYY-MM-DD quando o dia muda
  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setSelectedDateKey(`${currentYear}-${monthStr}-${dayStr}`);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  // 4. Ações de Salvar e Excluir Eventos
  const handleSaveAppointment = async (appData: Appointment) => {
    const activeUserId = user?.uid || guestUserId;
    if (!activeUserId) return;

    try {
      const savedId = await saveAppointment(appData);
      const updatedApp = { ...appData, id: savedId };

      if (appData.id) {
        setAppointments(prev => prev.map(a => a.id === appData.id ? updatedApp : a));
        showNotification('Compromisso atualizado!', 'success');
      } else {
        setAppointments(prev => [...prev, updatedApp]);
        showNotification('Compromisso criado com sucesso!', 'success');
      }
    } catch (error) {
      showNotification('Não foi possível salvar o compromisso.', 'error');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      showNotification('Compromisso removido.', 'success');
    } catch (error) {
      showNotification('Erro ao excluir o compromisso.', 'error');
    }
  };

  const handleImportSuccess = (importedApps: Appointment[]) => {
    setAppointments(prev => [...prev, ...importedApps]);
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      showNotification('Falha na autenticação com o Google.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showNotification('Sessão encerrada.', 'info');
    } catch (error) {
      showNotification('Erro ao deslogar.', 'error');
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Carregando Agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar 
        user={user} 
        isGuestView={isGuestView} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        {!user && !isGuestView ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto border border-gray-100 mt-12 animate-fadeIn">
            <span className="text-5xl block mb-4">🗓️</span>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Sua Agenda Perpétua</h2>
            <p className="text-gray-500 text-sm mb-6">
              Organize seus compromissos diários e recorrentes na nuvem de maneira simples e eficiente.
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Começar com o Google
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Controles de Navegação Superior do Calendário */}
            <div className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-100">
              <div className="flex items-center space-x-4">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors">◀</button>
                <h2 className="text-lg font-black text-gray-800 min-w-[150px] text-center">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg font-bold text-gray-600 transition-colors">▶</button>
              </div>

              {!isGuestView && user && (
                <ExportImportButtons
                  appointments={appointments}
                  userId={user.uid}
                  onImportSuccess={handleImportSuccess}
                  onNotification={showNotification}
                />
              )}
            </div>

            {/* Layout em Duas Colunas: Calendário + Listagem Lateral */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PerpetualCalendar
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  appointments={appointments}
                  selectedDay={selectedDay}
                  onSelectDay={handleSelectDay}
                />
              </div>
              
              <div className="flex flex-col space-y-4">
                <AppointmentList
                  appointments={appointments}
                  selectedDateKey={selectedDateKey}
                  isGuestView={isGuestView}
                  onEditAppointment={(app) => {
                    setEditingAppointment(app);
                    setIsAppModalOpen(true);
                  }}
                />

                {!isGuestView && selectedDay && (
                  <button
                    onClick={() => {
                      setEditingAppointment(null);
                      setIsAppModalOpen(true);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm"
                  >
                    ➕ Adicionar Compromisso
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modais de Controle */}
      <AppointmentModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setEditingAppointment(null);
        }}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
        selectedDateKey={selectedDateKey}
        userId={user?.uid || guestUserId || ''}
        editingAppointment={editingAppointment}
      />

      {user && (
        <ShareAgendaModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          userId={user.uid}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={toast.onClose} />
      )}
    </div>
  );
}

export default App;
