import { createWorker } from 'tesseract.js';

export interface ThermalData {
  point1: number;
  point2: number;
  point3: number;
}

/**
 * Advanced image pre-processing for thermal OCR.
 * Returns multiple versions of the image to handle different lighting/contrast scenarios.
 */
async function getProcessedImages(base64Image: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const versions: string[] = [];
      const scale = 4;
      const width = img.width * scale;
      const height = img.height * scale;

      const process = (mode: 'high-contrast' | 'sharpen' | 'inverted') => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return null;

        canvas.width = width;
        canvas.height = height;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

          if (mode === 'high-contrast') {
            // Aggressive binarization
            const val = gray > 150 ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = val;
          } else if (mode === 'inverted') {
            // Handle dark text on light background
            const val = gray > 150 ? 0 : 255;
            data[i] = data[i+1] = data[i+2] = val;
          } else {
            // Standard grayscale with slight contrast boost
            const val = gray < 128 ? gray * 0.8 : Math.min(255, gray * 1.2);
            data[i] = data[i+1] = data[i+2] = val;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/png');
      };

      const v1 = process('high-contrast');
      const v2 = process('sharpen');
      const v3 = process('inverted');

      if (v1) versions.push(v1);
      if (v2) versions.push(v2);
      if (v3) versions.push(v3);

      resolve(versions);
    };
    img.onerror = () => resolve([base64Image]);
    img.src = base64Image;
  });
}

/**
 * Ultra-accurate OCR for thermal images using a multi-pass approach.
 * Runs OCR on multiple pre-processed versions and merges results for maximum reliability.
 */
export async function analyzeThermalImage(base64Image: string): Promise<ThermalData | null> {
  let worker;
  try {
    const processedImages = await getProcessedImages(base64Image);
    worker = await createWorker('eng');
    
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789.SPsp°C: ,loIO',
      tessedit_pageseg_mode: '11' as any,
      preserve_interword_spaces: '1',
    });

    let combinedText = "";
    for (const img of processedImages) {
      const result = await worker.recognize(img);
      combinedText += "\n" + result.data.text;
    }
    
    console.log("Multi-Pass OCR Combined Text:", combinedText);

    const parseNumber = (str: string) => {
      let cleaned = str.toLowerCase()
        .replace(/o/g, '0').replace(/i/g, '1').replace(/l/g, '1')
        .replace(/,/g, '.').replace(/[^0-9.]/g, '');
      
      // Smart decimal fix: 325 -> 32.5
      if (!cleaned.includes('.') && cleaned.length >= 3) {
        const num = parseInt(cleaned);
        if (num > 100 && num < 1000) return num / 10;
      }

      const parts = cleaned.split('.');
      if (parts.length > 1) {
        cleaned = parts[0] + '.' + (parts[1].substring(0, 1) || '0');
      }
      
      const val = parseFloat(cleaned);
      return isNaN(val) ? null : val;
    };

    const findValue = (key: string) => {
      const variations = [
        key, key.replace('S', '5'), key.replace('P', 'B'), key.replace('P', '8'),
        key.replace('P', '0'), key.replace('P', 'o'), key.charAt(0) + key.charAt(2),
        key.charAt(0) + ' ' + key.charAt(2), '5' + key.charAt(2), 'P' + key.charAt(2)
      ];

      if (key === 'SP3') {
        ['8', 'B', 'E', 'g', 'a'].forEach(v => {
          variations.push(`SP${v}`, `S${v}`, `5P${v}`, `5${v}`);
        });
      }

      const pattern = `(?:${variations.join('|')})`;
      const regexes = [
        new RegExp(`${pattern}\\s*[:=~-]?\\s*(\\d+[.,]?\\d*)`, 'gi'),
        new RegExp(`${pattern}.{0,15}(\\d+[.,]?\\d*)`, 'gi')
      ];

      const candidates: number[] = [];
      for (const regex of regexes) {
        let match;
        while ((match = regex.exec(combinedText)) !== null) {
          const val = parseNumber(match[1]);
          if (val !== null && val > 5 && val < 400) candidates.push(val);
        }
      }

      // Return the most frequent or first valid candidate
      return candidates.length > 0 ? candidates[0] : null;
    };

    let p1 = findValue('SP1');
    let p2 = findValue('SP2');
    let p3 = findValue('SP3');

    // Final Fallback: Extract all decimal numbers and assign by order
    if (p1 === null || p2 === null || p3 === null) {
      const allNumbers = combinedText.match(/\d+[.,]\d/g);
      if (allNumbers) {
        const parsed = [...new Set(allNumbers.map(n => parseNumber(n)).filter(n => n !== null))] as number[];
        if (parsed.length >= 3) {
          if (p1 === null) p1 = parsed[0];
          if (p2 === null) p2 = parsed[1];
          if (p3 === null) p3 = parsed[2];
        } else if (parsed.length > 0) {
          if (p1 === null) p1 = parsed[0];
          if (p2 === null && parsed.length > 1) p2 = parsed[1];
          if (p3 === null && parsed.length > 2) p3 = parsed[2];
        }
      }
    }

    await worker.terminate();

    if (p1 !== null || p2 !== null || p3 !== null) {
      return { point1: p1 || 0, point2: p2 || 0, point3: p3 || 0 };
    }
    return null;
  } catch (error) {
    console.error("Multi-Pass OCR Error:", error);
    if (worker) await worker.terminate();
    return null;
  }
}
