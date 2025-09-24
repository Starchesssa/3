
// src/Video.tsx
import React from 'react';
import fs from 'fs';
import path from 'path';

// Import all 11 templates
import {DollyZoom} from './templates/DollyZoom';
import {Basic} from './templates/Basic';
import {Vertical} from './templates/Vertical';
import {Diagonal} from './templates/Diagonal';
import {Scale} from './templates/Scale';
import {Orbit} from './templates/Orbit';
import {Blur} from './templates/Blur';
import {MaskReveal} from './templates/MaskReveal';
import {SlidingSplit} from './templates/SlidingSplit';
import {FloatingObjects} from './templates/FloatingObjects';
import {FocusPull} from './templates/FocusPull';

// Map effect names to template components
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

// Load TXT assets (sentence-wise)
const loadTXT = (filePath: string) => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const blocks = raw.split(/\n\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map(block => {
    const lines = block.split('\n');
    const assets: any[] = [];
    let effect = 'basic';
    lines.forEach(line => {
      if (line.startsWith('Overall_par_effect=')) {
        effect = line.replace('Overall_par_effect=', '').trim().toLowerCase();
      } else {
        const [word, asset, pos] = line.split('=');
        const [layer, position] = pos.split('/');
        assets.push({asset, layer: layer as 'bg' | 'md' | 'fg', position: position as 'l' | 'c' | 'r' | 'full'});
      }
    });
    return {assets, effect};
  });
};

// Load sentence timings from STT timeline
const loadTimeline = (filePath: string) => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const sentences: {start: number; end: number}[] = [];
  let start = 0;
  raw.split('\n').forEach(line => {
    const match = line.match(/([\d.]+)\s*-->\s*([\d.]+)\s*:\s*(.*)/);
    if (match) {
      const tStart = parseFloat(match[1]);
      const tEnd = parseFloat(match[2]);
      const word = match[3].trim();
      if (word.endsWith('.')) {
        sentences.push({start, end: tEnd});
        start = tEnd;
      }
    }
  });
  return sentences;
};

const Video: React.FC = () => {
  const txtData = loadTXT(path.join(__dirname, '../BOOKS/Temp/TXT/Intro_timeline.txt'));
  const sentenceTimes = loadTimeline(path.join(__dirname, '../BOOKS/Temp/STT/Intro_timeline.txt'));

  return (
    <>
      {txtData.map((sentence, idx) => {
        const TemplateComponent = templatesMap[sentence.effect] || Basic;
        const time = sentenceTimes[idx] || {start: idx * 2, end: (idx + 1) * 2}; // fallback

        return <TemplateComponent key={idx} assets={sentence.assets} startTime={time.start} endTime={time.end} />;
      })}
    </>
  );
};

export default Video;
