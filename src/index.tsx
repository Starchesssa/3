
// src/index.tsx
import {registerRoot, Composition} from 'remotion';
import React from 'react';
import {Video} from './Video';
import {useVideoConfig} from 'remotion';

const RemotionVideo: React.FC = () => {
  const {width, height, fps} = useVideoConfig();

  return (
    <Composition
      id="MainVideo"
      component={Video}
      durationInFrames={fps * 600} // 10 minutes max fallback
      fps={fps}
      width={width}
      height={height}
    />
  );
};

// Register the root for Remotion
registerRoot(RemotionVideo);
