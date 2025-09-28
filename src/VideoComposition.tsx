
import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';
import fs from 'fs';
import path from 'path';

const loadTimeline = (filePath: string) => {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const sentences: { start: number; end: number }[] = [];
  let start = 0;
  raw.split('\n').forEach((line) => {
    const match = line.match(/([\d.]+)\s*-->\s*([\d.]+)\s*:/);
    if (match) {
      const tEnd = parseFloat(match[2]);
      sentences.push({ start, end: tEnd });
      start = tEnd;
    }
  });
  return sentences;
};

const timelineFile = path.join(__dirname, '../BOOKS/Temp/STT/Intro_timeline.txt');
const sentenceTimes = loadTimeline(timelineFile);

// Compute total frames dynamically based on last sentence
const fps = 30;
const totalFrames = Math.ceil(sentenceTimes[sentenceTimes.length - 1]?.end * fps) || 1800;

export const RemotionVideo: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={Video}
      durationInFrames={totalFrames}
      fps={fps}
      width={1920}
      height={1080}
    />
  );
};
