import React, { useRef } from 'react';
import { parseCsvNames } from '../services/csvService';
import { Users, FileSpreadsheet, Trash2, PlusCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface NamesInputSectionProps {
  names: string[];
  rawText: string;
  onRawTextChange: (text: string) => void;
  onNamesChange: (names: string[]) => void;
}

const SAMPLE_NAMES = [
  'Cristhian Alejandro Moreno Delgado',
  'Samuel Ortiz Sarasti',
  'Sergio Armando Gutiérrez',
  'Román Lara-Cueva',
  'María Camila Hernández Silva',
  'Juan David Restrepo Salazar',
];

export const NamesInputSection: React.FC<NamesInputSectionProps> = ({
  names,
  rawText,
  onRawTextChange,
  onNamesChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onRawTextChange(val);
    const parsed = val
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    onNamesChange(parsed);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const csvNames = await parseCsvNames(file);
      if (csvNames.length === 0) {
        toast.error('No se encontraron nombres en la primera columna del CSV.');
        return;
      }

      // Combine existing with new or replace
      const combined = [...names, ...csvNames];
      // deduplicate while preserving order if desired, or keep as is
      const uniqueNames = Array.from(new Set(combined));
      const newText = uniqueNames.join('\n');

      onRawTextChange(newText);
      onNamesChange(uniqueNames);
      toast.success(`Se importaron ${csvNames.length} nombres desde ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar el archivo CSV.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSamples = () => {
    const newText = SAMPLE_NAMES.join('\n');
    onRawTextChange(newText);
    onNamesChange(SAMPLE_NAMES);
    toast.success('Nombres de ejemplo cargados');
  };

  const handleClear = () => {
    onRawTextChange('');
    onNamesChange([]);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Lista de Nombres de Participantes
          </h3>
          <span className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-medium">
            {names.length} {names.length === 1 ? 'nombre' : 'nombres'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSamples}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cargar ejemplos
          </button>
          {names.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Textarea for Manual / Copy-Paste input */}
        <div className="lg:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Pegar o escribir nombres (un nombre por línea con Enter):</span>
            <span className="text-[11px] text-slate-500">Un certificado por línea</span>
          </label>
          <textarea
            value={rawText}
            onChange={handleTextChange}
            placeholder={`Cristhian Alejandro Moreno Delgado\nSamuel Ortiz Sarasti\nSergio Armando Gutiérrez...`}
            rows={7}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
          />
        </div>

        {/* CSV Upload & Quick Details */}
        <div className="flex flex-col justify-between gap-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Importar desde CSV
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sube un archivo <code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">.csv</code>.
              Los nombres se extraerán automáticamente de la <strong>primera columna</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Seleccionar archivo CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvUpload}
            className="hidden"
          />

          {names.length > 0 && (
            <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                Primer nombre: <strong className="text-slate-200">{names[0]}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
