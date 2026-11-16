import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CertificateConfig } from '../types';

// Standard A4 in landscape at 72 DPI
export const A4_LANDSCAPE_WIDTH = 841.89;
export const A4_LANDSCAPE_HEIGHT = 595.28;

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return { r, g, b };
}

export function sanitizeFileName(name: string): string {
  // Replace invalid filesystem characters and clean whitespace
  return name.replace(/[/\\?%*:|"<>]/g, '').trim();
}

/**
 * Converts any image source to PNG bytes for guaranteed embedding in pdf-lib
 */
async function getImageBytesAsPng(previewUrl: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas context error'));
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Failed to create blob'));
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Failed to load image for PDF embedding'));
    img.src = previewUrl;
  });
}

export interface GeneratedCertificateResult {
  name: string;
  fileName: string;
  bytes: Uint8Array;
}

export async function generateSingleCertificate(
  name: string,
  config: CertificateConfig,
  fontBuffer: ArrayBuffer
): Promise<GeneratedCertificateResult> {
  const { template, safeArea, font, certificateName } = config;

  if (!template) {
    throw new Error('No se ha proporcionado una plantilla');
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const customFont = await pdfDoc.embedFont(fontBuffer);
  const page = pdfDoc.addPage([A4_LANDSCAPE_WIDTH, A4_LANDSCAPE_HEIGHT]);

  // 1. Draw Template background
  if (template.type === 'pdf' && template.pdfBytes) {
    const srcDoc = await PDFDocument.load(template.pdfBytes);
    const [embeddedTemplatePage] = await pdfDoc.embedPdf(srcDoc, [0]);
    page.drawPage(embeddedTemplatePage, {
      x: 0,
      y: 0,
      width: A4_LANDSCAPE_WIDTH,
      height: A4_LANDSCAPE_HEIGHT,
    });
  } else {
    // Image template
    const pngBytes = await getImageBytesAsPng(template.previewUrl);
    const embeddedImage = await pdfDoc.embedPng(pngBytes);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: A4_LANDSCAPE_WIDTH,
      height: A4_LANDSCAPE_HEIGHT,
    });
  }

  // 2. Calculate Safe Area bounding box on A4 landscape
  const boxX = (safeArea.x / 100) * A4_LANDSCAPE_WIDTH;
  const boxWidth = (safeArea.width / 100) * A4_LANDSCAPE_WIDTH;
  const boxHeight = (safeArea.height / 100) * A4_LANDSCAPE_HEIGHT;
  
  // In PDF, Y=0 is bottom
  const boxTop = A4_LANDSCAPE_HEIGHT - (safeArea.y / 100) * A4_LANDSCAPE_HEIGHT;
  const boxBottom = boxTop - boxHeight;
  const boxCenterY = boxBottom + boxHeight / 2;

  // 3. Auto-fit Font Size
  let fontSize = font.size;
  let textWidth = customFont.widthOfTextAtSize(name, fontSize);
  let textHeight = customFont.heightAtSize(fontSize);

  if (font.autoFit) {
    const maxWidth = boxWidth * 0.95;
    const maxHeight = boxHeight * 0.85;

    if (textWidth > maxWidth || textHeight > maxHeight) {
      const scaleX = maxWidth / textWidth;
      const scaleY = maxHeight / textHeight;
      const scale = Math.min(scaleX, scaleY);
      fontSize = Math.max(12, Math.floor(fontSize * scale));
      textWidth = customFont.widthOfTextAtSize(name, fontSize);
      textHeight = customFont.heightAtSize(fontSize);
    }
  }

  // 4. Horizontal alignment
  let textX = boxX;
  if (font.align === 'center') {
    textX = boxX + (boxWidth - textWidth) / 2;
  } else if (font.align === 'right') {
    textX = boxX + boxWidth - textWidth;
  }

  // 5. Vertical baseline positioning
  // Text baseline in script fonts sits roughly around baseline offset
  const textY = boxCenterY - (textHeight * 0.28);

  const { r, g, b } = hexToRgb(font.color);

  page.drawText(name, {
    x: textX,
    y: textY,
    size: fontSize,
    font: customFont,
    color: rgb(r, g, b),
  });

  const pdfBytes = await pdfDoc.save();
  const cleanCertName = sanitizeFileName(certificateName || 'Certificado');
  const cleanName = sanitizeFileName(name);
  const fileName = `${cleanCertName}${cleanName}.pdf`;

  return {
    name,
    fileName,
    bytes: pdfBytes,
  };
}
