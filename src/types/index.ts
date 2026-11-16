export interface SafeArea {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
}

export interface TemplateData {
  file: File;
  name: string;
  type: 'image' | 'pdf';
  previewUrl: string;
  width: number;
  height: number;
  pdfBytes?: ArrayBuffer;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
  ttfUrl: string;
  isCustom?: boolean;
}

export interface FontConfig {
  fontId: string;
  family: string;
  size: number; // in pt
  color: string; // hex #FFFFFF, #000000, etc.
  autoFit: boolean;
  align: 'center' | 'left' | 'right';
  customFontFile?: File;
  customFontBuffer?: ArrayBuffer;
}

export interface GenerationProgress {
  current: number;
  total: number;
  currentName: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
  errorMessage?: string;
}

export interface CertificateConfig {
  template: TemplateData | null;
  safeArea: SafeArea;
  font: FontConfig;
  names: string[];
  certificateName: string;
  outputDirectoryName: string;
}
