
// src/VideoComposition.tsx
import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';
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

// Load TXT instructions
const loadTXT = (filePath: string): Omit<Sentence, 'startTime' | 'endTime'>[] => {
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

// Load timeline
const loadTimeline = (filePath: string) => {
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

// Get audio path
const getAudioPath = (timelineFile: string) => {
  const baseName = path.basename(timelineFile).replace('_timeline.txt', '');
  const audioFile = path.join(__dirname, `../BOOKS/Temp/TTS/${baseName}.wav`);
  return fs.existsSync(audioFile) ? audioFile : undefined;
};

// File paths
const txtFile = path.join(__dirname, '../BOOKS/Temp/TXT/Intro_timeline.txt');
const timelineFile = path.join(__dirname, '../BOOKS/Temp/STT/Intro_timeline.txt');

const txtData = loadTXT(txtFile);
const timeline = loadTimeline(timelineFile);
const audioPath = getAudioPath(timelineFile);

// Merge TXT and timeline
const sentences: Sentence[] = txtData.map((s, idx) => {
  const time = timeline[idx] || { start: idx * 2, end: (idx + 1) * 2 };
  return { ...s, startTime: time.start, endTime: time.end };
});

// Compute duration
const fps = 30;
const totalFrames = Math.ceil(sentences[sentences.length - 1]?.end * fps) || 1800;

export const RemotionVideo: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={Video}
      durationInFrames={totalFrames}
      fps={fps}
      width={1920}
      height={1080}
      defaultProps={{ sentences, audioPath }}
    />
  );
};
