
// src/index.tsx
import React from 'react';
import { Composition } from 'remotion';
import fs from 'fs';
import path from 'path';
import { Video } from './Video';

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
        assets.push({ asset, layer, position, word });
      }
    });
    return { assets, effect };
  });
};

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

const getAudioPath = (timelineFile: string) => {
  const baseName = path.basename(timelineFile).replace('_timeline.txt', '');
  const audioFile = path.join(__dirname, `../BOOKS/Temp/TTS/${baseName}.wav`);
  return fs.existsSync(audioFile) ? audioFile : undefined;
};

const txtFile = path.join(__dirname, '../BOOKS/Temp/TXT/Intro_timeline.txt');
const timelineFile = path.join(__dirname, '../BOOKS/Temp/STT/Intro_timeline.txt');

const txtData = loadTXT(txtFile);
const sentenceTimes = loadTimeline(timelineFile);
const audioPath = getAudioPath(timelineFile);

// Merge TXT and timeline
const sentences = txtData.map((sentence, idx) => {
  const time = sentenceTimes[idx] || { start: idx * 2, end: (idx + 1) * 2 };
  return {
    ...sentence,
    startTime: time.start,
    endTime: time.end,
  };
});

export const RemotionVideo: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={Video}
      durationInFrames={Math.ceil(sentences[sentences.length - 1]?.end * 30) || 1800} // fps=30 fallback
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        sentences,
        audioPath,
      }}
    />
  );
};
