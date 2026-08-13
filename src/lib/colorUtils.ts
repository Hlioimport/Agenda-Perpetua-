// Define as opções de cores que o usuário pode escolher para seus compromissos
export interface ColorOption {
  id: string;
  name: string;
  bg: string;
  text: string;
  border: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'blue', name: 'Azul', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { id: 'green', name: 'Verde', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { id: 'red', name: 'Vermelho', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  { id: 'purple', name: 'Roxo', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { id: 'yellow', name: 'Amarelo', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { id: 'indigo', name: 'Anil', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { id: 'gray', name: 'Cinza', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
];

// Função auxiliar para buscar rapidamente as classes CSS de uma cor pelo ID
export const getColorClasses = (colorId: string) => {
  const option = COLOR_OPTIONS.find(c => c.id === colorId);
  if (!option) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300'
    };
  }
  return {
    bg: option.bg,
    text: option.text,
    border: option.border
  };
};
