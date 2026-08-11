import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { CalendarHeader } from './components/CalendarHeader';
import { PerpetualCalendar } from './components/PerpetualCalendar';
import { AgendaList } from './components/AgendaList';
import { AuthModal } from './components/AuthModal';
import { AppointmentModal } from './components/AppointmentModal';
import { ShareAgendaModal } from './components/ShareAgendaModal';
import { CSVModal } from './components/CSVModal';
import { GoogleCalendarModal } from './components/GoogleCalendarModal';
import { AndroidAppModal } from './components/AndroidAppModal';
import { Toast } from './components/Toast';

import { UserProfile, Appointment, AgendaShare, CalendarViewType, FilterOptions, AppointmentStatus } from './types';
import { subscribeToAuthChanges, logoutUser } from './lib/auth';
import {
  subscribeToAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  subscribeToSharedAgendas,
  getLocalAppointments,
  saveLocalAppointments,
  syncLocalToCloud
} from './lib/db';
import { formatDateToISO } from './lib/dateUtils';
import { Cloud, Lock, Calendar as CalendarIcon, Sparkles, WifiOff, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatDateToISO(new Date()));
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sharedAgendas, setSharedAgendas] = useState<AgendaShare[]>([]);
  const [activeAgendaUid, setActiveAgendaUid] = useState<string | null>(null);

  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    category: 'all',
    status: 'all',
    onlyWithNotes: false
  });

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isGoogleCalendarModalOpen, setIsGoogleCalendarModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Toast State
  const [toast, setToast] = useState<{ message: string | null; type?: 'success' | 'error' | 'info' }>({ message: null });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Seed sample local data if empty in guest mode
  useEffect(() => {
    const localData = getLocalAppointments();
    if (localData.length === 0 && !currentUser) {
      const today = new Date();
      const todayIso = formatDateToISO(today);
      
      const seed: Appointment[] = [
        {
          id: 'local_sample_1',
          userId: '',
          userEmail: '',
          title: 'Reunião de Alinhamento Semanal',
          date: todayIso,
          time: '09:00',
          durationMinutes: 60,
          category: 'reuniao',
          status: 'pending',
          notes: 'Apresentar metas do mês e revisar compromissos agendados.',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: 'local_sample_2',
          userId: '',
          userEmail: '',
          title: 'Acompanhamento do Projeto Principal',
          date: todayIso,
          time: '14:30',
          category: 'trabalho',
          status: 'in_progress',
          notes: 'Sincronização da agenda individual segura na nuvem.',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
      saveLocalAppointments(seed);
    }
  }, [currentUser]);

  // Online/Offline status listeners & auto-sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      showToast('Conexão reestabelecida! Sincronizando dados com a nuvem...', 'info');
      if (currentUser) {
        const synced = await syncLocalToCloud(currentUser.uid, currentUser.email);
        if (synced > 0) {
          showToast(`Sincronizados ${synced} compromisso(s) criados offline!`, 'success');
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Você está offline. Compromissos serão salvos localmente e sincronizados depois.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Auto-sync local items when user logs in or page loads while online
  useEffect(() => {
    if (currentUser && isOnline) {
      syncLocalToCloud(currentUser.uid, currentUser.email).then((synced) => {
        if (synced > 0) {
          showToast(`Sincronizados ${synced} compromisso(s) criados offline com sua conta!`, 'success');
        }
      });
    }
  }, [currentUser, isOnline]);

  // Auth Subscription
  useEffect(() => {
    const unsubAuth = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      if (!user) {
        setActiveAgendaUid(null);
      }
    });
    return () => unsubAuth();
  }, []);

  // Shared Agendas Listener
  useEffect(() => {
    if (currentUser) {
      const unsubShares = subscribeToSharedAgendas(currentUser.email, currentUser.uid, (shares) => {
        setSharedAgendas(shares);
      });
      return () => unsubShares();
    } else {
      setSharedAgendas([]);
    }
  }, [currentUser]);

  // Appointments Listener
  useEffect(() => {
    const unsubAppts = subscribeToAppointments(
      currentUser?.uid || '',
      currentUser?.email || null,
      activeAgendaUid,
      (data) => {
        setAppointments(data);
      },
      (err) => {
        showToast('Erro ao carregar dados da nuvem. Exibindo dados locais.', 'error');
      }
    );
    return () => unsubAppts();
  }, [currentUser, activeAgendaUid]);

  // Navigation handlers for perpetual calendar
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatDateToISO(today));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate((prev) => new Date(year, prev.getMonth(), 1));
  };

  const handleMonthChange = (month: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), month, 1));
  };

  // Appointment Actions
  const handleOpenNewAppointment = (dateStr?: string) => {
    if (dateStr) setSelectedDateStr(dateStr);
    setEditingAppt(null);
    setIsApptModalOpen(true);
  };

  const handleEditAppointment = (appt: Appointment) => {
    setEditingAppt(appt);
    setIsApptModalOpen(true);
  };

  const handleSaveAppointment = async (
    apptData: Omit<Appointment, 'id' | 'userId' | 'userEmail' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (editingAppt) {
        await updateAppointment(editingAppt.id, currentUser?.uid || '', apptData);
        showToast('Compromisso atualizado na nuvem com sucesso!');
      } else {
        await addAppointment(
          currentUser?.uid || '',
          currentUser?.email || 'convidado@local',
          apptData
        );
        showToast('Novo compromisso salvo com sucesso!');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao salvar compromisso.', 'error');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment(id, currentUser?.uid || '');
      showToast('Compromisso excluído.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir compromisso.', 'error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: AppointmentStatus) => {
    const nextStatus: AppointmentStatus =
      currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await updateAppointment(id, currentUser?.uid || '', { status: nextStatus });
      showToast(nextStatus === 'completed' ? 'Compromisso marcado como concluído!' : 'Compromisso marcado como pendente.');
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const handleImportCSVAppointments = async (
    newAppts: Omit<Appointment, 'id' | 'userId' | 'userEmail' | 'createdAt' | 'updatedAt'>[]
  ) => {
    for (const appt of newAppts) {
      await addAppointment(currentUser?.uid || '', currentUser?.email || 'convidado@local', appt);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    showToast('Você saiu da sua conta.');
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // In month view, filter for selected date OR if searching show all matching month
      const matchesSearch =
        filterOptions.searchTerm === '' ||
        appt.title.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()) ||
        (appt.notes && appt.notes.toLowerCase().includes(filterOptions.searchTerm.toLowerCase()));

      const matchesCategory =
        filterOptions.category === 'all' || appt.category === filterOptions.category;

      const matchesStatus =
        filterOptions.status === 'all' || appt.status === filterOptions.status;

      const matchesNotes =
        !filterOptions.onlyWithNotes || Boolean(appt.notes && appt.notes.trim().length > 0);

      // If in Agenda view or searching, we show all search matches, else strictly selected date
      if (calendarView === 'agenda' || filterOptions.searchTerm.trim() !== '') {
        return matchesSearch && matchesCategory && matchesStatus && matchesNotes;
      }

      return appt.date === selectedDateStr && matchesSearch && matchesCategory && matchesStatus && matchesNotes;
    });
  }, [appointments, selectedDateStr, calendarView, filterOptions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        isOnline={isOnline}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenCSVModal={() => setIsCSVModalOpen(true)}
        onOpenGoogleCalendarModal={() => setIsGoogleCalendarModalOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onLogout={handleLogout}
        sharedAgendas={sharedAgendas}
        activeAgendaUid={activeAgendaUid}
        onSelectAgenda={setActiveAgendaUid}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner if Offline */}
        {!isOnline && (
          <div className="p-4 bg-amber-500/10 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800/60 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="font-bold block">Modo Offline Ativo</span>
                <span className="text-amber-700 dark:text-amber-300">
                  Sua agenda funciona perfeitamente sem internet. Qualquer anotação ou compromisso alterado será salvo e sincronizado automaticamente com a nuvem assim que reconectar.
                </span>
              </div>
            </div>
            {currentUser && (
              <button
                onClick={async () => {
                  const synced = await syncLocalToCloud(currentUser.uid, currentUser.email);
                  showToast(synced > 0 ? `${synced} compromisso(s) sincronizados!` : 'Todos os compromissos estão em dia.', 'info');
                }}
                className="px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 rounded-xl font-semibold shrink-0 transition flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sincronizar</span>
              </button>
            )}
          </div>
        )}

        {/* Banner if Guest Mode */}
        {!currentUser && (
          <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-md border border-indigo-800/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600/50 rounded-xl flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Acesse sua Agenda Protegida Individual</h2>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Entre com E-mail/Senha ou Conta Google para proteger e sincronizar seus compromissos na nuvem, ou continue no modo sem identificação.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition shadow-sm"
              >
                Entrar / Conta Google
              </button>
            </div>
          </div>
        )}

        {/* Calendar Header Control Bar with Button side-by-side with arrows */}
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
          view={calendarView}
          onViewChange={setCalendarView}
          onOpenNewAppointment={() => handleOpenNewAppointment(selectedDateStr)}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          totalAppointmentsCount={appointments.length}
        />

        {/* Main Grid: Perpetual Calendar + Clean Agenda View */}
        {calendarView === 'month' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Perpetual Calendar Grid */}
            <div className="lg:col-span-7 xl:col-span-8">
              <PerpetualCalendar
                currentDate={currentDate}
                selectedDateStr={selectedDateStr}
                onSelectDate={setSelectedDateStr}
                appointments={appointments}
                onOpenNewForDate={handleOpenNewAppointment}
              />
            </div>

            {/* Right 5 Columns: Clean Agenda List for Selected Date */}
            <div className="lg:col-span-5 xl:col-span-4">
              <AgendaList
                selectedDateStr={selectedDateStr}
                appointments={filteredAppointments}
                allAppointmentsCount={appointments.length}
                onEditAppointment={handleEditAppointment}
                onDeleteAppointment={handleDeleteAppointment}
                onToggleStatus={handleToggleStatus}
                onOpenNewAppointment={handleOpenNewAppointment}
              />
            </div>

          </div>
        ) : (
          /* Full Agenda View */
          <div className="max-w-4xl mx-auto">
            <AgendaList
              selectedDateStr={selectedDateStr}
              appointments={filteredAppointments}
              allAppointmentsCount={appointments.length}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onToggleStatus={handleToggleStatus}
              onOpenNewAppointment={handleOpenNewAppointment}
              filterTitle="Todas as Anotações e Compromissos da Agenda"
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Agenda Perpétua — Agenda Protegida e Sincronizada na Nuvem</p>
          <p className="text-[11px] text-slate-400">Acesso Individual Protegido por E-mail/Senha ou Google</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
        initialDateStr={selectedDateStr}
        editingAppointment={editingAppt}
      />

      <ShareAgendaModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentUser={currentUser}
        sharedAgendas={sharedAgendas}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <CSVModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onImportAppointments={handleImportCSVAppointments}
        currentAppointments={appointments}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <GoogleCalendarModal
        isOpen={isGoogleCalendarModalOpen}
        onClose={() => setIsGoogleCalendarModalOpen(false)}
        appointments={appointments}
        onImportAppointments={async (importedAppts) => {
          for (const appt of importedAppts) {
            await addAppointment(
              currentUser?.uid || '',
              currentUser?.email || 'convidado@local',
              {
                title: appt.title || 'Compromisso',
                date: appt.date || formatDateToISO(new Date()),
                time: appt.time || '09:00',
                category: appt.category || 'outro',
                status: appt.status || 'pending',
                notes: appt.notes || ''
              }
            );
          }
          showToast(`${importedAppts.length} evento(s) importados do Google Agenda!`, 'success');
        }}
      />

      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        deferredPrompt={deferredPrompt}
        appUrl={typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-2h6loavgap6d7zhxvavqre-706032402143.us-east1.run.app'}
        onInstallPwa={() => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                showToast('Instalação do app iniciada!', 'success');
              }
              setDeferredPrompt(null);
            });
          }
        }}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null })}
      />

    </div>
  );
}
