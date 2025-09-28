
// src/Video.tsx
import React from 'react';
import fs from 'fs';
import path from 'path';
import { Audio } from '@remotion/media-utils';
import { DollyZoom } from './templates/DollyZoom';
import { Basic } from './templates/Basic';
import { Vertical } from './templates/Vertical';
import { Diagonal } from './templates/Diagonal';
import { Scale } from './templates/Scale';
import { Orbit } from './templates/Orbit';
import { Blur } from './templates/Blur';
import { MaskReveal } from './templates/MaskReveal';
import { SlidingSplit } from './templates/SlidingSplit';
import { FloatingObjects } from './templates/FloatingObjects';
import { FocusPull } from './templates/FocusPull';

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

interface VideoProps {}

const templatesMap: Record<string, React.FC<any>> = {
  dolly_zoom: DollyZoom,
  basic: Basic,
  vertical: Vertical,
  diagonal: Diagonal,
  scale: Scale,
  orbit: Orbit,
  blur: Blur,
  mask_reveal: MaskReveal,
  sliding_split: SlidingSplit,
  floating_objects: FloatingObjects,
  focus_pull: FocusPull,
};

// Load TXT instructions
const loadTXT = (filePath: string): Sentence[] => {
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
    return { assets, effect, startTime: 0, endTime: 0 };
  });
};

// Load timeline
const loadTimeline = (filePath: string) => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const sentences: { start: number; end: number }[] = [];
  let start = 0;
  raw.split('\n').forEach(line => {
    const match = line.match(/([\d.]+)\s*-->\s*([\d.]+)\s*:\s*(.*)/);
    if (match) {
      const tEnd = parseFloat(match[2]);
      const word = match[3].trim();
      if (word.endsWith('.')) {
        sentences.push({ start, end: tEnd });
        start = tEnd;
      }
    }
  });
  return sentences;
};

// Get audio path
const getAudioPath = (timelineFile: string) => {
  const baseName = path.basename(timelineFile).replace('_timeline.txt', '');
  const audioFile = path.join(__dirname, `../BOOKS/Temp/TTS/${baseName}.wav`);
  return fs.existsSync(audioFile) ? audioFile : undefined;
};

export const Video: React.FC<VideoProps> = () => {
  const txtFile = path.join(__dirname, '../BOOKS/Temp/TXT/Intro_timeline.txt');
  const timelineFile = path.join(__dirname, '../BOOKS/Temp/STT/Intro_timeline.txt');

  const txtData = loadTXT(txtFile);
  const timeline = loadTimeline(timelineFile);
  const audioPath = getAudioPath(timelineFile);

  // Merge timings
  const sentences = txtData.map((s, idx) => {
    const time = timeline[idx] || { start: idx * 2, end: (idx + 1) * 2 };
    return { ...s, startTime: time.start, endTime: time.end };
  });

  return (
    <>
      {audioPath && (
        <Audio src={audioPath} startFrom={0} endAt={sentences[sentences.length - 1]?.end || 10} />
      )}

      {sentences.map((s, idx) => {
        const TemplateComponent = templatesMap[s.effect] || Basic;
        return <TemplateComponent key={idx} assets={s.assets} startTime={s.startTime} endTime={s.endTime} />;
      })}
    </>
  );
};
