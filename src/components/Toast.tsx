import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  // Faz o alerta sumir automaticamente após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Define a cor de fundo baseada no tipo do alerta
  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 flex items-center space-x-2`}>
      <span>{message}</span>
      <button 
        onClick={onClose} 
        className="font-bold hover:text-gray-200 focus:outline-none"
      >
        ×
      </button>
    </div>
  );
};
