
// src/VideoComposition.tsx
import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';

export const RemotionVideo: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={Video}
      durationInFrames={1800} // fallback; actual timing handled inside Video.tsx
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
