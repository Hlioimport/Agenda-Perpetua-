import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download, FileText, CheckCircle2, AlertCircle, FileUp } from 'lucide-react';
import { parseCSVAppointments, generateSampleCSV, exportAppointmentsToCSV } from '../lib/csvHelper';
import { Appointment } from '../types';

interface CSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAppointments: (newAppts: Omit<Appointment, 'id' | 'userId' | 'userEmail' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
  currentAppointments: Appointment[];
  onSuccess: (msg: string) => void;
}

export const CSVModal: React.FC<CSVModalProps> = ({
  isOpen,
  onClose,
  onImportAppointments,
  currentAppointments,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [importSummary, setImportSummary] = useState<{ count: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setCsvText(content);
        processCSVContent(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const processCSVContent = (content: string) => {
    setError(null);
    const { validAppointments, errors } = parseCSVAppointments(content);
    setImportSummary({ count: validAppointments.length, errors });
  };

  const handleExecuteImport = async () => {
    if (!csvText.trim()) {
      setError('Por favor, selecione um arquivo CSV ou cole o conteúdo CSV.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { validAppointments } = parseCSVAppointments(csvText);
      if (validAppointments.length === 0) {
        throw new Error('Nenhum compromisso válido foi encontrado no CSV.');
      }

      await onImportAppointments(validAppointments);
      onSuccess(`${validAppointments.length} compromissos importados com sucesso!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao importar arquivo CSV.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const sample = generateSampleCSV();
    const blob = new Blob(['\ufeff' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_agenda_perpetua.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportCSV = () => {
    exportAppointmentsToCSV(currentAppointments, 'minha_agenda_perpetua.csv');
    onSuccess('Agenda exportada com sucesso em CSV!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Importar / Exportar CSV</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gerencie sua agenda perpétua a partir do seu arquivo CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Importar CSV
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Exportar CSV ({currentAppointments.length})
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'import' ? (
          <div className="space-y-4">
            
            {/* File drop zone */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-5 text-center bg-slate-50/50 dark:bg-slate-800/40 transition cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-upload"
              />
              <label htmlFor="csv-file-upload" className="cursor-pointer space-y-2 block">
                <FileUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Clique aqui para selecionar seu arquivo .CSV
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Colunas aceitas: Data, Horário, Compromisso, Anotações, Categoria, Status
                  </p>
                </div>
              </label>
            </div>

            {/* Download sample */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400">Não tem um modelo pronto?</span>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Modelo CSV Exemplo</span>
              </button>
            </div>

            {/* CSV Raw Text Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ou cole o conteúdo do seu CSV aqui:
              </label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  processCSVContent(e.target.value);
                }}
                placeholder="Data;Horario;Compromisso;Anotacoes;Categoria;Status&#10;2026-10-15;09:00;Reunião de Equipe;Revisar apresentação;reuniao;Pendente"
                className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Import Summary */}
            {importSummary && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>{importSummary.count} compromissos prontos para serem importados.</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            <button
              onClick={handleExecuteImport}
              disabled={loading || !csvText.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Importar Compromissos para a Agenda</span>
                </>
              )}
            </button>

          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Export e guarde seus {currentAppointments.length} compromissos em formato .CSV compatível com Excel, Google Sheets ou backup pessoal.
            </p>

            <button
              onClick={handleExportCSV}
              disabled={currentAppointments.length === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo CSV ({currentAppointments.length} itens)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
