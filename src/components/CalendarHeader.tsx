import React from 'react';
import { Plus, Calendar as CalendarIcon, ListFilter, Search, FileText } from 'lucide-react';
import { MONTH_NAMES_PT } from '../lib/dateUtils';
import { CalendarViewType, FilterOptions } from '../types';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  view: CalendarViewType;
  onViewChange: (v: CalendarViewType) => void;
  onOpenNewAppointment: () => void;
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  totalAppointmentsCount: number;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onYearChange,
  onMonthChange,
  view,
  onViewChange,
  onOpenNewAppointment,
  filterOptions,
  onFilterChange,
}) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate range of years starting from 2025 onwards (2025 to 2055)
  const years = Array.from({ length: 31 }, (_, i) => 2025 + i);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Primary Row: Month Navigation + Action Bar Side-by-Side */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Month & Year Selectors and Action Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <select
              value={currentMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="bg-transparent font-bold text-slate-900 dark:text-white text-base sm:text-lg focus:outline-none cursor-pointer border-b border-transparent hover:border-indigo-500 py-0.5"
            >
              {MONTH_NAMES_PT.map((m, idx) => (
                <option key={m} value={idx} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {m}
                </option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 text-base sm:text-lg focus:outline-none cursor-pointer border-b border-transparent hover:border-indigo-500 py-0.5"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* "+ Novo Compromisso" button */}
          <button
            onClick={onOpenNewAppointment}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Compromisso</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        {/* View Switches (Mês / Agenda Clean / Semana) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              view === 'month'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Mês</span>
          </button>

          <button
            onClick={() => onViewChange('agenda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              view === 'agenda'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Agenda Clean</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar compromissos ou anotações..."
            value={filterOptions.searchTerm}
            onChange={(e) => onFilterChange({ ...filterOptions, searchTerm: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Category Filter */}
          <select
            value={filterOptions.category}
            onChange={(e) => onFilterChange({ ...filterOptions, category: e.target.value })}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Todas as Categorias</option>
            <option value="trabalho">Trabalho</option>
            <option value="pessoal">Pessoal</option>
            <option value="reuniao">Reunião</option>
            <option value="saude">Saúde</option>
            <option value="estudos">Estudos</option>
            <option value="outro">Outro</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterOptions.status}
            onChange={(e) => onFilterChange({ ...filterOptions, status: e.target.value })}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>

          {/* Toggle Only with Notes */}
          <button
            type="button"
            onClick={() => onFilterChange({ ...filterOptions, onlyWithNotes: !filterOptions.onlyWithNotes })}
            className={`px-3 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 transition ${
              filterOptions.onlyWithNotes
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Com Anotações</span>
          </button>
        </div>
      </div>

    </div>
  );
};
