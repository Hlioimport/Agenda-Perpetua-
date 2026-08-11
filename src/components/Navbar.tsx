import React from 'react';
import { UserProfile, AgendaShare } from '../types';
import {
  Calendar,
  Cloud,
  CloudOff,
  User as UserIcon,
  LogOut,
  Share2,
  FileSpreadsheet,
  LogIn,
  ChevronDown,
  Sparkles,
  Users,
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  isOnline?: boolean;
  onOpenAuthModal: () => void;
  onOpenShareModal: () => void;
  onOpenCSVModal: () => void;
  onOpenGoogleCalendarModal: () => void;
  onOpenAndroidModal: () => void;
  onLogout: () => void;
  sharedAgendas: AgendaShare[];
  activeAgendaUid: string | null;
  onSelectAgenda: (uid: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isOnline = true,
  onOpenAuthModal,
  onOpenShareModal,
  onOpenCSVModal,
  onOpenGoogleCalendarModal,
  onOpenAndroidModal,
  onLogout,
  sharedAgendas,
  activeAgendaUid,
  onSelectAgenda
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Cloud Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Calendar className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Agenda <span className="text-indigo-600 dark:text-indigo-400">Perpétua</span>
              </h1>
              
              {/* Cloud Badge */}
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                currentUser
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}>
                {currentUser ? (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Agenda Protegida</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3 text-slate-500" />
                    <span>Sem Identificação</span>
                  </>
                )}
              </span>

              {/* Offline / Online Badge */}
              {!isOnline ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700 animate-pulse">
                  <CloudOff className="w-3 h-3" />
                  <span>Modo Offline</span>
                </span>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Calendário Perpétuo & Acesso Individual Protegido
            </p>
          </div>
        </div>

        {/* Agenda Switcher & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Shared Agendas Dropdown Selector */}
          {currentUser && sharedAgendas.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700"
              >
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">
                  {activeAgendaUid ? 'Agenda Compartilhada' : 'Minha Agenda'}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <button
                    onClick={() => { onSelectAgenda(null); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between ${
                      !activeAgendaUid ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Minha Agenda Privada</span>
                    {!activeAgendaUid && <span>✓</span>}
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <div className="px-4 py-1 text-[10px] uppercase font-bold text-slate-400">
                    Compartilhadas com você:
                  </div>

                  {sharedAgendas.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { onSelectAgenda(s.ownerUid); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between truncate ${
                        activeAgendaUid === s.ownerUid ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{s.ownerEmail}</span>
                      {activeAgendaUid === s.ownerUid && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Share Agenda Button */}
          {currentUser && (
            <button
              onClick={onOpenShareModal}
              title="Compartilhar agenda com outra pessoa"
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200/80 dark:border-slate-700"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden md:inline">Compartilhar</span>
            </button>
          )}

          {/* Android App Button */}
          <button
            onClick={onOpenAndroidModal}
            title="Instalar App Android ou copiar link"
            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-200/80 dark:border-emerald-800 shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">App Android</span>
          </button>

          {/* Google Calendar Sync */}
          <button
            onClick={onOpenGoogleCalendarModal}
            title="Sincronizar e exportar para Google Agenda"
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-200/80 dark:border-indigo-800 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Google Agenda</span>
          </button>

          {/* CSV Import/Export */}
          <button
            onClick={onOpenCSVModal}
            title="Importar ou Exportar CSV"
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200/80 dark:border-slate-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline">CSV</span>
          </button>

          {/* User Profile / Auth Action */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div
                title={currentUser.email || ''}
                className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800"
              >
                {currentUser.displayName ? currentUser.displayName[0]?.toUpperCase() : 'U'}
              </div>

              <button
                onClick={onLogout}
                title="Sair da conta"
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
