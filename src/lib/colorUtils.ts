import { AppointmentStatus, CategoryType } from '../types';

export const getRowColorClasses = (status: AppointmentStatus, hasNotes: boolean) => {
  // Automatic color change based on notes and status
  if (status === 'completed') {
    return {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40',
      border: 'border-l-4 border-l-emerald-500 border-emerald-200 dark:border-emerald-800/60',
      text: 'text-slate-800 dark:text-slate-200',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      label: 'Concluído'
    };
  }

  if (status === 'in_progress') {
    return {
      bg: 'bg-sky-50/80 dark:bg-sky-950/30 hover:bg-sky-100/80 dark:hover:bg-sky-900/40',
      border: 'border-l-4 border-l-sky-500 border-sky-200 dark:border-sky-800/60',
      text: 'text-slate-800 dark:text-slate-200',
      badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
      label: 'Em Andamento'
    };
  }

  if (status === 'cancelled') {
    return {
      bg: 'bg-slate-100/60 dark:bg-slate-800/40 opacity-70 hover:opacity-100',
      border: 'border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-700',
      text: 'text-slate-500 line-through dark:text-slate-400',
      badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      label: 'Cancelado'
    };
  }

  // Pending status
  if (hasNotes) {
    // Note added automatically turns row into an enriched warm amber/violet highlighted card
    return {
      bg: 'bg-amber-50/90 dark:bg-amber-950/30 hover:bg-amber-100/90 dark:hover:bg-amber-900/40',
      border: 'border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-800/60',
      text: 'text-slate-900 dark:text-slate-100 font-medium',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      label: 'Com Anotação'
    };
  }

  // Default clean pending row
  return {
    bg: 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60',
    border: 'border-l-4 border-l-indigo-500 border-slate-200 dark:border-slate-800',
    text: 'text-slate-800 dark:text-slate-200',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    label: 'Pendente'
  };
};

export const getCategoryBadgeStyle = (category: CategoryType) => {
  switch (category) {
    case 'trabalho':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200/60';
    case 'pessoal':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200/60';
    case 'reuniao':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200/60';
    case 'saude':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200/60';
    case 'estudos':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200/60';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60';
  }
};

export const getCategoryLabel = (category: CategoryType) => {
  switch (category) {
    case 'trabalho': return 'Trabalho';
    case 'pessoal': return 'Pessoal';
    case 'reuniao': return 'Reunião';
    case 'saude': return 'Saúde';
    case 'estudos': return 'Estudos';
    default: return 'Outro';
  }
};
