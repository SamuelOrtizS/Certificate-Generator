import React from 'react';
import { Award, Sparkles, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/20 text-white">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              ComSoc Certificate Generator
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                A4 Horizontal
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Generación masiva de certificados PDF con área segura y tipografía dinámica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Fuente por defecto: <strong className="text-slate-200">Allura</strong></span>
          <span className="text-slate-700">•</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Formato: <strong className="text-slate-200">A4 Landscape (842×595 pt)</strong></span>
        </div>
      </div>
    </header>
  );
};
