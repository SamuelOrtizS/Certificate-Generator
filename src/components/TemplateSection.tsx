import React, { useRef, useState } from 'react';
import { TemplateData } from '../types';
import { processTemplateFile } from '../services/templateService';
import { Image, FileUp, Sparkles, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface TemplateSectionProps {
  template: TemplateData | null;
  onTemplateLoaded: (template: TemplateData) => void;
  onClearTemplate: () => void;
}

export const TemplateSection: React.FC<TemplateSectionProps> = ({
  template,
  onTemplateLoaded,
  onClearTemplate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = async (file: File) => {
    setLoading(true);
    const toastId = toast.loading('Procesando plantilla...');
    try {
      const data = await processTemplateFile(file);
      onTemplateLoaded(data);
      toast.success(`Plantilla "${file.name}" cargada correctamente`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al procesar la plantilla', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const loadSampleTemplate = async (cleanNameArea = true) => {
    setLoading(true);
    const toastId = toast.loading('Cargando plantilla de muestra...');
    try {
      const response = await fetch('./sample-template.jpg');
      if (!response.ok) {
        throw new Error('Plantilla de muestra no disponible');
      }
      const blob = await response.blob();

      if (cleanNameArea) {
        // Load onto canvas to cleanly clear the placeholder name "Morgan Maxwell" on white background
        const img = new window.Image();
        const imgUrl = URL.createObjectURL(blob);
        img.src = imgUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context error');

        ctx.drawImage(img, 0, 0);

        // Clear the placeholder name area with pure white background (above the horizontal line)
        // Dimensions calculated proportionally for any resolution:
        const clearX = canvas.width * 0.18;
        const clearY = canvas.height * 0.35;
        const clearW = canvas.width * 0.64;
        const clearH = canvas.height * 0.165;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(clearX, clearY, clearW, clearH);

        const cleanBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.95)
        );

        if (!cleanBlob) throw new Error('Error al generar la plantilla limpia');

        const file = new File([cleanBlob], 'Plantilla_Certificado_Muestra.jpg', {
          type: 'image/jpeg',
        });
        const data = await processTemplateFile(file);
        onTemplateLoaded(data);
        URL.revokeObjectURL(imgUrl);
      } else {
        const file = new File([blob], 'Plantilla_Certificado_Original.jpg', {
          type: 'image/jpeg',
        });
        const data = await processTemplateFile(file);
        onTemplateLoaded(data);
      }

      toast.success('Plantilla de muestra cargada con éxito', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al cargar la plantilla', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Plantilla Base (Imagen o PDF)
          </h3>
        </div>

        {template && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {template.name} ({template.type.toUpperCase()})
            </span>
            <button
              type="button"
              onClick={onClearTemplate}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>

      {!template ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            dragOver
              ? 'border-sky-400 bg-sky-500/10'
              : 'border-slate-700/80 hover:border-sky-500/50 bg-slate-950/40 hover:bg-slate-950/70'
          }`}
        >
          <div className="p-3 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FileUp className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-200">
              Haz clic o arrastra aquí tu plantilla
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Formatos soportados: <strong>PNG, JPG, WebP, PDF</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-slate-600">— o bien —</span>
            <button
              type="button"
              disabled={loading}
              onClick={() => loadSampleTemplate(true)}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Cargar plantilla de muestra (ComSoc)
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf,application/pdf,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">{template.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              {template.width} × {template.height} px
            </span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reemplazar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.pdf,application/pdf,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
