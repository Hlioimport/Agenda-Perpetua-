import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, LogIn, ArrowRight, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { loginWithEmail, registerWithEmail, sendPasswordReset, loginWithGoogle } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onSuccess('Login realizado com sucesso! Sua agenda está sincronizada na nuvem.');
        onClose();
      } else if (mode === 'register') {
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }
        await registerWithEmail(email, password, name);
        onSuccess('Conta criada com sucesso! Sua agenda privada está pronta.');
        onClose();
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Por favor, informe seu e-mail para recuperar a senha.');
        }
        await sendPasswordReset(email);
        setResetSent(true);
        onSuccess(`E-mail de recuperação enviado para ${email}. Verifique sua caixa de entrada.`);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Ocorreu um erro ao processar a solicitação.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está cadastrado. Tente fazer login.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'A senha deve conter no mínimo 6 caracteres.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'O login por E-mail/Senha precisa ser ativado no Firebase Console (Authentication > Sign-in method). Você também pode usar a Conta Google ou o Modo Convidado.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Endereço de e-mail inválido.';
      } else {
        msg = `${err.message || 'Erro ao realizar autenticação.'} (${err.code || 'erro'})`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess('Autenticado via Google com sucesso!');
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      let googleErrorMsg = 'Erro ao entrar com a conta Google.';
      if (err.code === 'auth/popup-blocked') {
        googleErrorMsg = 'O navegador bloqueou a janela pop-up do Google. Permita pop-ups ou clique em "Abrir em Nova Aba" abaixo.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        googleErrorMsg = 'A janela do Google foi fechada antes da conclusão do login.';
      } else if (err.code === 'auth/unauthorized-domain') {
        googleErrorMsg = 'Este domínio precisa ser adicionado na lista de Domínios Autorizados no Firebase Console (Authentication > Settings > Authorized domains).';
      } else if (err.code === 'auth/operation-not-allowed') {
        googleErrorMsg = 'O provedor Google precisa estar ativado no Firebase Console (Authentication > Sign-in method).';
      } else if (err.message) {
        googleErrorMsg = `${err.message} (${err.code || 'erro'})`;
      }
      setError(googleErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              {mode === 'login' && 'Acessar Agenda Protegida'}
              {mode === 'register' && 'Criar Conta Individual'}
              {mode === 'forgot' && 'Recuperar Senha'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sua agenda individual protegida por E-mail/Senha ou Conta Google
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && mode === 'forgot' ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">E-mail de redefinição enviado!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enviamos um link para <strong className="text-slate-900 dark:text-slate-200">{email}</strong> para que você possa redefinir sua senha com segurança.
            </p>
            <button
              onClick={() => { setMode('login'); setResetSent(false); }}
              className="mt-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Voltar para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seu Nome
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Hélio Pedro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(null); }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Esqueci minha senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {/* Eye Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' && (
                    <>
                      <span>Entrar na Agenda</span>
                      <LogIn className="w-4 h-4" />
                    </>
                  )}
                  {mode === 'register' && (
                    <>
                      <span>Criar Conta Segura</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                  {mode === 'forgot' && (
                    <>
                      <span>Enviar Link de Recuperação</span>
                      <KeyRound className="w-4 h-4" />
                    </>
                  )}
                </>
              )}
            </button>
          </form>
        )}

        {/* Google Auth & Switch Mode */}
        {mode !== 'forgot' && (
          <div className="mt-6 space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 uppercase font-medium absolute">
                ou acesse com
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            <a
              href={typeof window !== 'undefined' ? window.location.href : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl font-medium flex items-center justify-center gap-1.5 transition text-center"
            >
              <span>Abrir App em Nova Aba (Evita Bloqueador de Pop-ups)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Footer switch */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
          {mode === 'login' ? (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ainda não tem uma conta?{' '}
              <button
                onClick={() => { setMode('register'); setError(null); }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Cadastre-se grátis
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Já tem uma conta cadastrada?{' '}
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Faça login
              </button>
            </p>
          )}

          <div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline font-medium"
            >
              Permanecer sem identificação (Modo Convidado)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
