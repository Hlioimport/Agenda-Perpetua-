import React, { useState } from 'react';

interface ShareAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const ShareAgendaModal: React.FC<ShareAgendaModalProps> = ({ isOpen, onClose, userId }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Gera o link público baseado na URL atual do app
  const shareUrl = `${window.location.origin}${window.location.pathname}?view=${userId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar o link: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
        >
          ×
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          📢 Compartilhar Agenda
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          Copie o link abaixo para permitir que outras pessoas visualizem os seus compromissos no modo convidado:
        </p>

        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-xs text-gray-600 flex-1 outline-none overflow-x-auto"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-1.5 rounded-md text-sm font-medium text-white transition-colors duration-200 ${
              copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
