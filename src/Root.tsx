
import React from 'react';
import {Composition, useCurrentFrame, interpolate} from 'remotion';

/**
 * The actual visual content.
 * A simple fade + slide animation so you can confirm rendering works.
 */
const HelloComp = () => {
  const frame = useCurrentFrame(); // current frame number
  const opacity = interpolate(frame, [0, 30], [0, 1]); // fade in over 1s @30fps
  const y = interpolate(frame, [0, 60], [100, 0]);     // slide up first 2s

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: 100,
        fontFamily: 'sans-serif',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      Hello Remotion!
    </div>
  );
};

/**
 * Register compositions here.
 * The ID **must match** what you pass to the CLI ("MyComp").
 */
export const RemotionRoot = () => (
  <>
    <Composition
      id="MyComp"
      component={HelloComp}
      durationInFrames={150}  // 5 seconds @ 30 fps
      fps={30}
      width={1280}
      height={720}
    />
  </>
);

export default RemotionRoot;
