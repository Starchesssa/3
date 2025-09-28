
// src/index.tsx
import {Composition} from 'remotion';
import React from 'react';
import {Video} from './Video';
import {useVideoConfig} from 'remotion';

export const RemotionVideo: React.FC = () => {
  const {width, height, fps} = useVideoConfig();

  return (
    <Composition
      id="MainVideo"
      component={Video}
      durationInFrames={fps * 60} // temporary fallback; actual video length handled by Video.tsx
      fps={fps}
      width={width}
      height={height}
    />
  );
};
