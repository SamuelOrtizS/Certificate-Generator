import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SafeArea, FontConfig, TemplateData } from '../types';
import { Move, Maximize2, RotateCcw, AlignCenter } from 'lucide-react';

interface SafeAreaCanvasProps {
  template: TemplateData | null;
  safeArea: SafeArea;
  onSafeAreaChange: (newArea: SafeArea) => void;
  font: FontConfig;
  previewName: string;
}

type HandleType = 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | 'drag' | null;

export const SafeAreaCanvas: React.FC<SafeAreaCanvasProps> = ({
  template,
  safeArea,
  onSafeAreaChange,
  font,
  previewName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<HandleType>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; initialArea: SafeArea } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, handle: HandleType) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialArea: { ...safeArea }
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeHandle || !dragStart || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    let { x, y, width, height } = dragStart.initialArea;

    if (activeHandle === 'drag') {
      x = Math.max(0, Math.min(100 - width, x + deltaXPercent));
      y = Math.max(0, Math.min(100 - height, y + deltaYPercent));
    } else {
      if (activeHandle.includes('r')) {
        width = Math.max(5, Math.min(100 - x, width + deltaXPercent));
      }
      if (activeHandle.includes('l')) {
        const newWidth = Math.max(5, width - deltaXPercent);
        const newX = x + (width - newWidth);
        if (newX >= 0) {
          x = newX;
          width = newWidth;
        }
      }
      if (activeHandle.includes('b')) {
        height = Math.max(3, Math.min(100 - y, height + deltaYPercent));
      }
      if (activeHandle.includes('t')) {
        const newHeight = Math.max(3, height - deltaYPercent);
        const newY = y + (height - newHeight);
        if (newY >= 0) {
          y = newY;
          height = newHeight;
        }
      }
    }

    onSafeAreaChange({
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
    });
  }, [activeHandle, dragStart, onSafeAreaChange]);

  const handleMouseUp = useCallback(() => {
    setActiveHandle(null);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeHandle, handleMouseMove, handleMouseUp]);

  // Center horizontally helper
  const centerHorizontal = () => {
    const newX = Math.round(((100 - safeArea.width) / 2) * 10) / 10;
    onSafeAreaChange({ ...safeArea, x: newX });
  };

  // Reset to default safe area placement
  const resetDefault = () => {
    onSafeAreaChange({
      x: 15,
      y: 40,
      width: 70,
      height: 9,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Área Segura para el Nombre</span>
          <span className="text-xs text-slate-400">
            (Arrastra o redimensiona sobre la plantilla)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={centerHorizontal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="Centrar horizontalmente"
          >
            <AlignCenter className="w-3.5 h-3.5 text-sky-400" />
            Centrar
          </button>
          <button
            onClick={resetDefault}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="Restablecer posición sugerida"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Restablecer
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[842/595] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl select-none"
      >
        {template ? (
          <img
            src={template.previewUrl}
            alt="Plantilla"
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <Maximize2 className="w-10 h-10 stroke-1" />
            <p className="text-sm">Sube una plantilla en imagen o PDF para comenzar</p>
          </div>
        )}

        {/* Draggable & Resizable Safe Area Box */}
        {template && (
          <div
            style={{
              left: `${safeArea.x}%`,
              top: `${safeArea.y}%`,
              width: `${safeArea.width}%`,
              height: `${safeArea.height}%`,
            }}
            className={`absolute border-2 border-dashed border-sky-400 bg-sky-500/15 cursor-move transition-shadow ${
              activeHandle ? 'shadow-2xl shadow-sky-500/30' : 'hover:border-sky-300'
            }`}
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            {/* Label Badge */}
            <div className="absolute -top-6 left-0 flex items-center gap-1 bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none">
              <Move className="w-3 h-3" /> Área Segura ({safeArea.width}% × {safeArea.height}%)
            </div>

            {/* Preview of Name with Selected Font */}
            <div
              className="w-full h-full flex items-center justify-center overflow-hidden px-2 pointer-events-none"
              style={{
                fontFamily: font.family,
                color: font.color,
                fontSize: `clamp(14px, ${font.size * 0.42}px, 6vw)`,
                lineHeight: 1.1,
                textAlign: font.align,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              <span className="truncate w-full text-center">
                {previewName || 'Nombre del Participante'}
              </span>
            </div>

            {/* Resize Handles */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'tl')}
              className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-sky-600 rounded-sm cursor-nwse-resize z-10"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'tr')}
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-sky-600 rounded-sm cursor-nesw-resize z-10"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'bl')}
              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-sky-600 rounded-sm cursor-nesw-resize z-10"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'br')}
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-sky-600 rounded-sm cursor-nwse-resize z-10"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 't')}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-white border-2 border-sky-600 rounded-sm cursor-ns-resize z-10"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'b')}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-white border-2 border-sky-600 rounded-sm cursor-ns-resize z-10"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'l')}
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-4 bg-white border-2 border-sky-600 rounded-sm cursor-ew-resize z-10"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'r')}
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-4 bg-white border-2 border-sky-600 rounded-sm cursor-ew-resize z-10"
            />
          </div>
        )}
      </div>

      {/* Numeric coordinates fine-tuning */}
      <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs">
        <div>
          <label className="text-slate-400 block mb-0.5">X (%):</label>
          <input
            type="number"
            min="0"
            max="95"
            step="0.5"
            value={safeArea.x}
            onChange={(e) => onSafeAreaChange({ ...safeArea, x: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
          />
        </div>
        <div>
          <label className="text-slate-400 block mb-0.5">Y (%):</label>
          <input
            type="number"
            min="0"
            max="95"
            step="0.5"
            value={safeArea.y}
            onChange={(e) => onSafeAreaChange({ ...safeArea, y: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
          />
        </div>
        <div>
          <label className="text-slate-400 block mb-0.5">Ancho (%):</label>
          <input
            type="number"
            min="5"
            max="100"
            step="0.5"
            value={safeArea.width}
            onChange={(e) => onSafeAreaChange({ ...safeArea, width: parseFloat(e.target.value) || 5 })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
          />
        </div>
        <div>
          <label className="text-slate-400 block mb-0.5">Alto (%):</label>
          <input
            type="number"
            min="2"
            max="100"
            step="0.5"
            value={safeArea.height}
            onChange={(e) => onSafeAreaChange({ ...safeArea, height: parseFloat(e.target.value) || 2 })}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
