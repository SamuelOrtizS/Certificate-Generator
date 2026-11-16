import * as pdfjsLib from 'pdfjs-dist';
import { TemplateData } from '../types';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function processTemplateFile(file: File): Promise<TemplateData> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);

    const viewport = page.getViewport({ scale: 2.0 }); // High quality render
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No se pudo inicializar el contexto de canvas para renderizar el PDF.');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const previewUrl = canvas.toDataURL('image/png');

    return {
      file,
      name: file.name,
      type: 'pdf',
      previewUrl,
      width: viewport.width,
      height: viewport.height,
      pdfBytes: arrayBuffer,
    };
  } else {
    // Image file
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          resolve({
            file,
            name: file.name,
            type: 'image',
            previewUrl,
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height,
          });
        };
        img.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada.'));
        img.src = previewUrl;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
      reader.readAsDataURL(file);
    });
  }
}
