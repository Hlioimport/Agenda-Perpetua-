import React, { useRef } from 'react';
import { Appointment } from '../lib/db';
import { exportToCSV, importFromCSV } from '../lib/csvHelper';

interface ExportImportButtonsProps {
  appointments: Appointment[];
  userId: string;
  onImportSuccess: (imported: Appointment[]) => void;
  onNotification: (message: string, type: 'success' | 'error') => void;
}

export const ExportImportButtons: React.FC<ExportImportButtonsProps> = ({
  appointments,
  userId,
  onImportSuccess,
  onNotification,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportToCSV(appointments);
      onNotification('Compromissos exportados com sucesso!', 'success');
    } catch (error) {
      onNotification('Erro ao exportar compromissos.', 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      try {
        const importedApps = importFromCSV(csvText, userId);
        if (importedApps.length === 0) {
          onNotification('Nenhum compromisso válido encontrado no arquivo.', 'error');
          return;
        }
        onImportSuccess(importedApps);
        onNotification(`${importedApps.length} compromissos importados com sucesso!`, 'success');
      } catch (error) {
        onNotification('Erro ao ler ou processar o arquivo CSV.', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reseta o input para permitir carregar o mesmo arquivo se necessário
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex space-x-2 w-full sm:w-auto">
      <button
        onClick={handleExport}
        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        📥 Exportar CSV
      </button>
      
      <button
        onClick={handleImportClick}
        className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        📤 Importar CSV
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
    </div>
  );
};
