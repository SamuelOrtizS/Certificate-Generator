import React, { useRef } from 'react';
import { FontConfig, FontOption } from '../types';
import { AVAILABLE_FONTS } from '../services/fontService';
import { Type, Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface FontSettingsSectionProps {
  fontConfig: FontConfig;
  onFontConfigChange: (config: FontConfig) => void;
  fonts: FontOption[];
  onAddCustomFont: (font: FontOption, buffer: ArrayBuffer) => void;
}

const COLOR_SWATCHES = [
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Negro', value: '#111827' },
  { name: 'Dorado', value: '#F59E0B' },
  { name: 'Azul IEEE', value: '#00629B' },
  { name: 'Azul Marino', value: '#0F172A' },
  { name: 'Rojo Carmesí', value: '#991B1B' },
];

export const FontSettingsSection: React.FC<FontSettingsSectionProps> = ({
  fontConfig,
  onFontConfigChange,
  fonts,
  onAddCustomFont,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFontChange = (fontId: string) => {
    const selected = fonts.find((f) => f.id === fontId);
    if (selected) {
      onFontConfigChange({
        ...fontConfig,
        fontId: selected.id,
        family: selected.family,
        customFontFile: undefined,
        customFontBuffer: undefined,
      });
    }
  };

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const customFontName = file.name.replace(/\.[^/.]+$/, '');
      const customId = `custom-${Date.now()}`;

      // Register font face in document so browser preview renders it immediately
      const fontFace = new FontFace(customFontName, buffer);
      await fontFace.load();
      document.fonts.add(fontFace);

      const newOption: FontOption = {
        id: customId,
        name: `${customFontName} (Personalizada)`,
        family: customFontName,
        ttfUrl: '',
        isCustom: true,
      };

      onAddCustomFont(newOption, buffer);
      onFontConfigChange({
        ...fontConfig,
        fontId: customId,
        family: customFontName,
        customFontFile: file,
        customFontBuffer: buffer,
      });

      toast.success(`Fuente "${customFontName}" cargada exitosamente`);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar la fuente personalizada.');
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Type className="w-4 h-4 text-sky-400" />
          Tipografía y Estilo
        </h3>
        <span className="text-xs text-sky-400 font-medium">
          Fuente activa: {fontConfig.family}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector de Fuente */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">
            Fuente Tipográfica
          </label>
          <div className="flex gap-2">
            <select
              value={fontConfig.fontId}
              onChange={(e) => handleFontChange(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
            >
              {fonts.map((f) => (
                <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>
                  {f.name} {f.id === 'allura' ? '⭐ (Por Defecto)' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
              title="Subir archivo de fuente propio (.ttf o .otf)"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf"
              onChange={handleCustomFontUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Tamaño de Fuente */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-400">
              Tamaño Base: {fontConfig.size} pt
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={fontConfig.autoFit}
                onChange={(e) =>
                  onFontConfigChange({ ...fontConfig, autoFit: e.target.checked })
                }
                className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-0"
              />
              Auto-ajustar a caja
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="18"
              max="90"
              value={fontConfig.size}
              onChange={(e) =>
                onFontConfigChange({ ...fontConfig, size: parseInt(e.target.value) || 48 })
              }
              className="flex-1 accent-sky-500 cursor-pointer"
            />
            <input
              type="number"
              min="12"
              max="120"
              value={fontConfig.size}
              onChange={(e) =>
                onFontConfigChange({ ...fontConfig, size: parseInt(e.target.value) || 48 })
              }
              className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-center text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Color y Alineación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
        {/* Color del Texto */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400">
            Color del Nombre
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fontConfig.color}
              onChange={(e) =>
                onFontConfigChange({ ...fontConfig, color: e.target.value })
              }
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() =>
                    onFontConfigChange({ ...fontConfig, color: swatch.value })
                  }
                  className="w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: swatch.value }}
                  title={swatch.name}
                >
                  {fontConfig.color.toUpperCase() === swatch.value.toUpperCase() && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        swatch.value === '#FFFFFF' ? 'text-black' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-slate-400 ml-1">
              {fontConfig.color}
            </span>
          </div>
        </div>

        {/* Alineación */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400">
            Alineación Horizontal
          </label>
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => onFontConfigChange({ ...fontConfig, align })}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  fontConfig.align === align
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {align === 'left' ? 'Izquierda' : align === 'center' ? 'Centro' : 'Derecha'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
