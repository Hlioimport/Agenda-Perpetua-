import React from 'react';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  isGuestView: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenShare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isGuestView,
  onLogin,
  onLogout,
  onOpenShare,
}) => {
  return (
    <nav className="bg-blue-600 text-white shadow-md px-6 py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 z-40 relative">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">📅</span>
        <h1 className="text-xl font-black tracking-tight">Agenda Perpétua</h1>
        {isGuestView && (
          <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold ml-2">
            Modo Convidado
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Só permite compartilhar se NÃO estiver no modo convidado e estiver logado */}
        {user && !isGuestView && (
          <button
            onClick={onOpenShare}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1"
          >
            <span>📢 Compartilhar</span>
          </button>
        )}

        {user ? (
          <div className="flex items-center space-x-3">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuário'}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            )}
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Sair
            </button>
          </div>
        ) : (
          !isGuestView && (
            <button
              onClick={onLogin}
              className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              Entrar com Google
            </button>
          )
        )}
      </div>
    </nav>
  );
};
