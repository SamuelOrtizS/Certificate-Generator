import React from 'react';
import { Folder, FolderCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { sanitizeFileName } from '../services/pdfGenerator';

interface ConfigSectionProps {
  certificateName: string;
  onCertificateNameChange: (val: string) => void;
  outputDirectoryHandle: FileSystemDirectoryHandle | null;
  onDirectoryHandleChange: (handle: FileSystemDirectoryHandle | null) => void;
  sampleName: string;
  isReady: boolean;
  onStartGeneration: () => void;
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
  certificateName,
  onCertificateNameChange,
  outputDirectoryHandle,
  onDirectoryHandleChange,
  sampleName,
  isReady,
  onStartGeneration,
}) => {
  const supportsFileSystem = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handlePickDirectory = async () => {
    if (!supportsFileSystem) {
      toast('Tu navegador no soporta selección directa de carpetas. Los certificados se descargarán automáticamente en un archivo ZIP con la carpeta correspondiente.', {
        icon: 'ℹ️',
      });
      return;
    }

    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });
      onDirectoryHandleChange(handle);
      toast.success(`Directorio de salida: ${handle.name}`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err);
        toast.error('Error al seleccionar el directorio.');
      }
    }
  };

  const previewCleanCertName = sanitizeFileName(certificateName || 'Certificado');
  const previewCleanName = sanitizeFileName(sampleName || 'Cristhian Alejandro Moreno Delgado');
  const previewFileName = `${previewCleanCertName}${previewCleanName}.pdf`;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Folder className="w-4 h-4 text-sky-400" />
          Configuración de Salida y Nombres de Archivo
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre del Certificado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">
            Nombre del Certificado (prefijo de carpeta y archivo):
          </label>
          <div className="relative">
            <input
              type="text"
              value={certificateName}
              onChange={(e) => onCertificateNameChange(e.target.value)}
              placeholder="Ej: CertificadoOrganizador"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
          <span className="text-[11px] text-slate-500">
            Se creará una subcarpeta con este nombre.
          </span>
        </div>

        {/* Directorio de Salida */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Directorio de Salida:</span>
            {supportsFileSystem ? (
              <span className="text-[10px] text-emerald-400 font-medium">Directorio local soportado</span>
            ) : (
              <span className="text-[10px] text-amber-400 font-medium">Modo descarga ZIP</span>
            )}
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePickDirectory}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                outputDirectoryHandle
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {outputDirectoryHandle ? (
                <>
                  <FolderCheck className="w-4 h-4 text-emerald-400" />
                  <span className="truncate">Carpeta: {outputDirectoryHandle.name}</span>
                </>
              ) : (
                <>
                  <Folder className="w-4 h-4 text-sky-400" />
                  <span>Elegir Directorio de Salida</span>
                </>
              )}
            </button>

            {outputDirectoryHandle && (
              <button
                type="button"
                onClick={() => onDirectoryHandleChange(null)}
                className="px-2.5 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700"
                title="Quitar directorio seleccionado (usar ZIP)"
              >
                Cambiar
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-500">
            {outputDirectoryHandle
              ? `Los archivos se guardarán directamente en: ${outputDirectoryHandle.name}/${previewCleanCertName}/`
              : 'Si no seleccionas directorio o tu navegador no lo permite, se descargará un ZIP organizado.'}
          </span>
        </div>
      </div>

      {/* Vista previa de nomenclatura */}
      <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-lg flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          Ejemplo del formato de salida:
        </span>
        <div className="font-mono text-xs text-sky-300 bg-slate-900 px-3 py-2 rounded border border-slate-800/80 break-all">
          📁 {previewCleanCertName}/<br />
          &nbsp;&nbsp;&nbsp;&nbsp;📄 <strong className="text-white">{previewFileName}</strong>
        </div>
      </div>

      {/* Botón Principal de Generación */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          disabled={!isReady}
          onClick={onStartGeneration}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all ${
            isReady
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/25 cursor-pointer transform hover:-translate-y-0.5'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          {isReady ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-sky-200" />
              Generar Todos los Certificados PDF
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5" />
              Completa los requisitos para generar
            </>
          )}
        </button>
      </div>
    </div>
  );
};
