import React from 'react';
import {
  Smartphone,
  X,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Copy,
  Check,
  Globe
} from 'lucide-react';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
  appUrl: string;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPwa,
  appUrl
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Aplicativo Android & Web App
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instale o app diretamente no seu dispositivo Android sem precisar de loja
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Card: Instalar PWA Direct Button */}
        {deferredPrompt ? (
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-700/50 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Instalação Direta Pronta</span>
            </div>
            <h3 className="text-base font-bold">
              Instalar o App da Agenda Perpétua no seu Celular
            </h3>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              Clique no botão abaixo para adicionar o ícone da Agenda na tela inicial do seu celular. O app funciona de forma autônoma, em tela cheia e offline!
            </p>
            <button
              onClick={onInstallPwa}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Aplicativo Agora</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-bold block">App Compatível com Android (PWA)</span>
              Acesse o link no navegador Chrome do seu celular Android e toque em <strong>"Adicionar à Tela Inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.
            </div>
          </div>
        )}

        {/* Link Share Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            Link de Acesso para Abrir e Baixar no Android:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions Steps */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-indigo-500" />
            <span>Passo a passo no Celular Android:</span>
          </h4>
          <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside pl-1">
            <li>Abra o link acima no navegador do celular (ex: Google Chrome).</li>
            <li>Toque nos <strong>três pontinhos (⋮)</strong> no canto superior direito do Chrome.</li>
            <li>Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
            <li>O aplicativo será instalado como um app Android nativo na sua lista de apps com ícone e acesso offline!</li>
          </ol>
        </div>

        {/* Converting to standalone APK instruction */}
        <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
          <span className="font-bold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Gerar arquivo .APK independente:
          </span>
          <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
            Você também pode colar este link em ferramentas gratuitas como <strong>PWABuilder.com</strong> ou <strong>WebIntoApp.com</strong> para baixar o arquivo .APK compilado diretamente!
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
          >
            Entendido / Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
