import React, { useState, useEffect, useRef } from 'react';
import { CertificateConfig, FontOption } from '../types';
import { fetchFontBuffer } from '../services/fontService';
import { generateSingleCertificate, GeneratedCertificateResult } from '../services/pdfGenerator';
import { saveCertificatesToDirectory, downloadCertificatesAsZip } from '../services/exportService';
import { CheckCircle2, AlertTriangle, Download, FolderCheck, X, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CertificateConfig;
  fonts: FontOption[];
  outputDirectoryHandle: FileSystemDirectoryHandle | null;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  onClose,
  config,
  fonts,
  outputDirectoryHandle,
}) => {
  const [current, setCurrent] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedToDisk, setSavedToDisk] = useState(false);
  const [results, setResults] = useState<GeneratedCertificateResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasStartedRef.current) {
      hasStartedRef.current = true;
      runGeneration();
    }
    if (!isOpen) {
      hasStartedRef.current = false;
      setCurrent(0);
      setCurrentName('');
      setIsGenerating(false);
      setIsCompleted(false);
      setSavedToDisk(false);
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  const runGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    const total = config.names.length;
    const generated: GeneratedCertificateResult[] = [];

    try {
      // 1. Resolve Font buffer
      const selectedFont = fonts.find((f) => f.id === config.font.fontId) || fonts[0];
      const fontBuffer = await fetchFontBuffer(selectedFont, config.font.customFontBuffer);

      // 2. Generate each certificate
      for (let i = 0; i < total; i++) {
        const name = config.names[i];
        setCurrent(i + 1);
        setCurrentName(name);

        const result = await generateSingleCertificate(name, config, fontBuffer);
        generated.push(result);

        // Small yield to allow UI repaint
        await new Promise((r) => setTimeout(r, 10));
      }

      setResults(generated);
      setIsCompleted(true);
      setIsGenerating(false);

      // 3. Save directly to local directory if handle exists
      if (outputDirectoryHandle) {
        try {
          await saveCertificatesToDirectory(
            generated,
            config.certificateName,
            outputDirectoryHandle
          );
          setSavedToDisk(true);
          toast.success(
            `¡${generated.length} certificados guardados en la carpeta "${config.certificateName}"!`
          );
        } catch (dirErr) {
          console.error('Error guardando en directorio:', dirErr);
          toast.error('No se pudo escribir en el directorio seleccionado.');
        }
      } else {
        toast.success(`¡${generated.length} certificados generados con éxito!`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error durante la generación de certificados');
      setIsGenerating(false);
    }
  };

  const handleDownloadZip = async () => {
    if (results.length === 0) return;
    setIsZipping(true);
    const toastId = toast.loading('Preparando archivo ZIP...');
    try {
      await downloadCertificatesAsZip(results, config.certificateName);
      toast.success('Descarga iniciada correctamente', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Error al empaquetar el ZIP', { id: toastId });
    } finally {
      setIsZipping(false);
    }
  };

  if (!isOpen) return null;

  const total = config.names.length;
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-100 text-base">
              {isCompleted ? 'Certificados Generados' : 'Generando Certificados PDF'}
            </h3>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5">
          {error ? (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Ocurrió un error</p>
                <p className="text-xs text-rose-400 mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Progress details */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Progreso general</span>
                  <span className="text-sky-400 font-mono font-bold">
                    {current} / {total} ({percent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-150"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Current name */}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800/80">
                    <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                    <span className="truncate">
                      Procesando: <strong className="text-slate-200">{currentName}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Completed Status */}
              {isCompleted && (
                <div className="flex flex-col gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-200">
                        ¡Proceso completado exitosamente!
                      </p>
                      <p className="text-xs text-emerald-400/80 mt-0.5">
                        Se generaron {results.length} certificados en tamaño A4 Horizontal.
                      </p>
                    </div>
                  </div>

                  {savedToDisk && outputDirectoryHandle && (
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300">
                      <FolderCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Guardados en:{' '}
                        <strong className="text-white">
                          {outputDirectoryHandle.name}/{config.certificateName}/
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="max-h-40 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 flex flex-col gap-1">
                    {results.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-slate-300">{r.fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>

          {isCompleted && (
            <button
              type="button"
              disabled={isZipping}
              onClick={handleDownloadZip}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Empaquetando...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Descargar todo en ZIP (.zip)
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
