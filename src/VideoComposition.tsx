
// src/VideoComposition.tsx
import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';
import { loadTXT, loadTimeline, getAudioPath } from './load-data';
import path from 'path';

const txtFile = path.join(__dirname, '../BOOKS/Temp/TXT/Intro_timeline.txt');
const timelineFile = path.join(__dirname, '../BOOKS/Temp/STT/Intro_timeline.txt');

const txtData = loadTXT(txtFile);
const timeline = loadTimeline(timelineFile);
const audioPath = getAudioPath(timelineFile);

// Merge TXT + timeline
const sentences = txtData.map((s, idx) => {
  const time = timeline[idx] || { start: idx * 2, end: (idx + 1) * 2 };
  return { ...s, startTime: time.start, endTime: time.end };
});

// Duration
const fps = 30;
const totalFrames = Math.ceil(sentences[sentences.length - 1]?.end * fps) || 1800;

export const RemotionVideo: React.FC = () => (
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
