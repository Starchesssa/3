import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import React from 'react';

// Import your actual scene component
import { ParallaxThree } from './ParallaxThree';

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ParallaxThree"           // Use the correct ID
        component={ParallaxThree}    // Must match the imported component
        durationInFrames={240}
        fps={24}
        width={1920}
        height={1080}
      />
    </>
  );
};

// Register the root
registerRoot(RemotionRoot);
