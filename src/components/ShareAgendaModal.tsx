import React, { useState } from 'react';
import { Share2, Mail, UserPlus, Trash2, CheckCircle2, AlertCircle, Users, ShieldCheck } from 'lucide-react';
import { AgendaShare, UserProfile } from '../types';
import { createShareInvitation, removeShare } from '../lib/db';

interface ShareAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  sharedAgendas: AgendaShare[];
  onSuccess: (msg: string) => void;
}

export const ShareAgendaModal: React.FC<ShareAgendaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sharedAgendas,
  onSuccess
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!inviteEmail.trim()) {
      setError('Por favor, digite o e-mail da pessoa que você deseja convidar.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createShareInvitation(currentUser.uid, currentUser.email || '', inviteEmail.trim());
      onSuccess(`Agenda compartilhada com ${inviteEmail.trim()} com sucesso!`);
      setInviteEmail('');
    } catch (err: any) {
      console.error('Error sharing agenda:', err);
      setError(err.message || 'Erro ao compartilhar agenda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string, email: string) => {
    if (window.confirm(`Deseja remover o acesso compartilhado de ${email}?`)) {
      try {
        await removeShare(shareId);
        onSuccess('Compartilhamento removido com sucesso.');
      } catch (err) {
        console.error(err);
        setError('Erro ao remover compartilhamento.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Compartilhar Agenda</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Convide outra pessoa para visualizar e gerenciar compromissos juntos
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleSendInvite} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Convidar pelo E-mail
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="emaildapessoa@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Convidar</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Shared List */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Pessoas com quem compartilho
          </h4>

          {sharedAgendas.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              Sua agenda ainda não está compartilhada com ninguém.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sharedAgendas.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded-full flex items-center justify-center">
                      {s.sharedWithEmail[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{s.sharedWithEmail}</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Acesso Ativo
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveShare(s.id, s.sharedWithEmail)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                    title="Remover acesso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informative Note */}
        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            As pessoas convidadas poderão visualizar e editar os compromissos da sua agenda. Você pode remover o acesso de qualquer pessoa a qualquer momento.
          </p>
        </div>

      </div>
    </div>
  );
};
