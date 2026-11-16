import { FontOption } from '../types';

export const AVAILABLE_FONTS: FontOption[] = [
  {
    id: 'allura',
    name: 'Allura (Cursiva elegante)',
    family: 'Allura',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/allura/Allura-Regular.ttf'
  },
  {
    id: 'great-vibes',
    name: 'Great Vibes (Caligráfica)',
    family: 'Great Vibes',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/greatvibes/GreatVibes-Regular.ttf'
  },
  {
    id: 'alex-brush',
    name: 'Alex Brush (Fluida)',
    family: 'Alex Brush',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/alexbrush/AlexBrush-Regular.ttf'
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script (Dinámica)',
    family: 'Dancing Script',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf'
  },
  {
    id: 'parisienne',
    name: 'Parisienne (Clásica)',
    family: 'Parisienne',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/parisienne/Parisienne-Regular.ttf'
  },
  {
    id: 'pinyon-script',
    name: 'Pinyon Script (Formal)',
    family: 'Pinyon Script',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/pinyonscript/PinyonScript-Regular.ttf'
  },
  {
    id: 'sacramento',
    name: 'Sacramento (Delicada)',
    family: 'Sacramento',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/sacramento/Sacramento-Regular.ttf'
  },
  {
    id: 'montserrat',
    name: 'Montserrat (Moderna Sans)',
    family: 'Montserrat',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/montserrat/Montserrat%5Bwght%5D.ttf'
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display (Serif Elegante)',
    family: 'Playfair Display',
    ttfUrl: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf'
  }
];

const fontBufferCache = new Map<string, ArrayBuffer>();

export async function fetchFontBuffer(font: FontOption, customBuffer?: ArrayBuffer): Promise<ArrayBuffer> {
  if (customBuffer) {
    return customBuffer;
  }

  if (fontBufferCache.has(font.id)) {
    return fontBufferCache.get(font.id)!;
  }

  // Attempt to fetch from CDN
  try {
    const response = await fetch(font.ttfUrl);
    if (!response.ok) {
      throw new Error(`Error al descargar la fuente ${font.name}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    fontBufferCache.set(font.id, buffer);
    return buffer;
  } catch (error) {
    console.error(`Error fetching font ${font.name}:`, error);
    // Secondary fallback for Allura
    if (font.id === 'allura') {
      const fallbackUrl = 'https://fonts.gstatic.com/s/allura/v21/9orpNY tongue...'; // or github raw
      const rawUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/allura/Allura-Regular.ttf';
      const fallbackRes = await fetch(rawUrl);
      if (fallbackRes.ok) {
        const buffer = await fallbackRes.arrayBuffer();
        fontBufferCache.set(font.id, buffer);
        return buffer;
      }
    }
    throw error;
  }
}
