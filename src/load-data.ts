
// src/load-data.ts
import fs from 'fs';
import path from 'path';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface Sentence {
  assets: AssetProps[];
  effect: string;
  startTime: number;
  endTime: number;
}

export const loadTXT = (filePath: string): Omit<Sentence, 'startTime' | 'endTime'>[] => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const blocks = raw.split(/\n\n/).map(b => b.trim()).filter(Boolean);

  return blocks.map(block => {
    const lines = block.split('\n');
    const assets: AssetProps[] = [];
    let effect = 'basic';

    lines.forEach(line => {
      if (line.startsWith('Overall_par_effect=')) {
        effect = line.replace('Overall_par_effect=', '').trim().toLowerCase();
      } else {
        const [word, asset, pos] = line.split('=');
        const [layer, position] = pos.split('/');
        assets.push({ asset, layer: layer as 'bg' | 'md' | 'fg', position: position as 'l' | 'c' | 'r' | 'full', word });
      }
    });

    return { assets, effect };
  });
};

export const loadTimeline = (filePath: string) => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const sentences: { start: number; end: number }[] = [];
  let start = 0;

  raw.split('\n').forEach(line => {
    const match = line.match(/([\d.]+)\s*-->\s*([\d.]+)\s*:/);
    if (match) {
      const tEnd = parseFloat(match[2]);
      sentences.push({ start, end: tEnd });
      start = tEnd;
    }
  });

  return sentences;
};

export const getAudioPath = (timelineFile: string) => {
  const baseName = path.basename(timelineFile).replace('_timeline.txt', '');
  const audioFile = path.join(__dirname, `../BOOKS/Temp/TTS/${baseName}.wav`);
  return fs.existsSync(audioFile) ? audioFile : undefined;
};
