// src/index.tsx
import {registerRoot} from 'remotion';
import {Composition} from 'remotion';
import React from 'react';

// Import your scene component
import {ParallaxScene} from './ParallaxScene';

const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Composition: name, id, duration, fps, width, height */}
      <Composition
        id="ParallaxScene"
        component={ParallaxScene}  // Make sure this is imported correctly
        durationInFrames={240}      // Example: 10 seconds at 24 fps
        fps={24}
        width={1920}
        height={1080}
      />
    </>
  );
};

// Register root
registerRoot(RemotionRoot);
