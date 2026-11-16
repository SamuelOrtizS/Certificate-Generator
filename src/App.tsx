import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TemplateSection } from './components/TemplateSection';
import { SafeAreaCanvas } from './components/SafeAreaCanvas';
import { FontSettingsSection } from './components/FontSettingsSection';
import { NamesInputSection } from './components/NamesInputSection';
import { ConfigSection } from './components/ConfigSection';
import { GenerationModal } from './components/GenerationModal';
import { TemplateData, SafeArea, FontConfig, FontOption, CertificateConfig } from './types';
import { AVAILABLE_FONTS } from './services/fontService';
import { processTemplateFile } from './services/templateService';
import { Toaster } from 'react-hot-toast';

export const App: React.FC = () => {
  // 1. Template State
  const [template, setTemplate] = useState<TemplateData | null>(null);

  // 2. Safe Area State (tuned for certificate name area above the line)
  const [safeArea, setSafeArea] = useState<SafeArea>({
    x: 18,
    y: 36,
    width: 64,
    height: 14,
  });

  // 3. Font Config State (default: Allura, dark color #111827 for clear contrast, size 52pt)
  const [fontConfig, setFontConfig] = useState<FontConfig>({
    fontId: 'allura',
    family: 'Allura',
    size: 52,
    color: '#111827',
    autoFit: true,
    align: 'center',
  });

  // Available fonts list
  const [fonts, setFonts] = useState<FontOption[]>(AVAILABLE_FONTS);

  // 4. Names State
  const [rawText, setRawText] = useState<string>(
    'Cristhian Alejandro Moreno Delgado\nSamuel Ortiz Sarasti\nSergio Armando Gutiérrez'
  );
  const [names, setNames] = useState<string[]>([
    'Cristhian Alejandro Moreno Delgado',
    'Samuel Ortiz Sarasti',
    'Sergio Armando Gutiérrez',
  ]);

  // 5. Config State
  const [certificateName, setCertificateName] = useState<string>('CertificadoOrganizador');
  const [outputDirectoryHandle, setOutputDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // 6. Generation Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Auto-load sample template on mount
  useEffect(() => {
    let isMounted = true;
    async function initSample() {
      try {
        const res = await fetch('./sample-template.jpg');
        if (!res.ok) return;
        const blob = await res.blob();

        const img = new Image();
        const imgUrl = URL.createObjectURL(blob);
        img.src = imgUrl;

        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        // Clear the placeholder name area with pure white background (above the horizontal line)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(
          canvas.width * 0.18,
          canvas.height * 0.35,
          canvas.width * 0.64,
          canvas.height * 0.165
        );

        const cleanBlob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.95)
        );

        if (!cleanBlob || !isMounted) return;

        const file = new File([cleanBlob], 'Plantilla_Certificado_Muestra.jpg', {
          type: 'image/jpeg',
        });
        const data = await processTemplateFile(file);
        if (isMounted) {
          setTemplate(data);
        }
        URL.revokeObjectURL(imgUrl);
      } catch (err) {
        console.error('Error al precargar plantilla de muestra:', err);
      }
    }

    initSample();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add custom font handler
  const handleAddCustomFont = (newFont: FontOption) => {
    setFonts((prev) => [newFont, ...prev]);
  };

  const previewSampleName = names.length > 0 ? names[0] : 'Cristhian Alejandro Moreno Delgado';

  const isReadyToGenerate =
    Boolean(template) &&
    names.length > 0 &&
    certificateName.trim().length > 0 &&
    safeArea.width > 0 &&
    safeArea.height > 0;

  const currentConfig: CertificateConfig = {
    template,
    safeArea,
    font: fontConfig,
    names,
    certificateName: certificateName.trim(),
    outputDirectoryName: certificateName.trim(),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F172A',
            color: '#F8FAFC',
            border: '1px solid #1E293B',
            fontSize: '13px',
          },
        }}
      />

      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Canvas Preview & Visual Configuration (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Template Upload */}
            <TemplateSection
              template={template}
              onTemplateLoaded={setTemplate}
              onClearTemplate={() => setTemplate(null)}
            />

            {/* 2. Interactive Safe Area Canvas */}
            <SafeAreaCanvas
              template={template}
              safeArea={safeArea}
              onSafeAreaChange={setSafeArea}
              font={fontConfig}
              previewName={previewSampleName}
            />

            {/* 3. Typography & Styling */}
            <FontSettingsSection
              fontConfig={fontConfig}
              onFontConfigChange={setFontConfig}
              fonts={fonts}
              onAddCustomFont={handleAddCustomFont}
            />
          </div>

          {/* Right Column: Names & Output Settings (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 4. Names Input & CSV */}
            <NamesInputSection
              names={names}
              rawText={rawText}
              onRawTextChange={setRawText}
              onNamesChange={setNames}
            />

            {/* 5. Output Configuration & Action */}
            <ConfigSection
              certificateName={certificateName}
              onCertificateNameChange={setCertificateName}
              outputDirectoryHandle={outputDirectoryHandle}
              onDirectoryHandleChange={setOutputDirectoryHandle}
              sampleName={previewSampleName}
              isReady={isReadyToGenerate}
              onStartGeneration={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Generation Progress and Export Modal */}
      <GenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={currentConfig}
        fonts={fonts}
        outputDirectoryHandle={outputDirectoryHandle}
      />
    </div>
  );
};

export default App;
