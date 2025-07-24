
import React from 'react';
import { Composition, useCurrentFrame, interpolate, spring, Easing } from 'remotion';

const easeInOutCubic = (t: number) => 
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const StunningAnimation = () => {
  const frame = useCurrentFrame();
  const duration = 900; // 30 seconds at 30fps

  // Animate opacity from 0 to 1 over first 2 seconds
  const opacity = interpolate(frame, [0, 60], [0, 1], { easing: Easing.ease });

  // Slide in from bottom over first 3 seconds
  const translateY = interpolate(frame, [0, 90], [100, 0], { easing: Easing.out(Easing.cubic) });

  // Scale bounce between 1 and 1.15 between 3s and 10s, repeated pulse effect
  const scale = 1 + 0.15 * Math.sin((frame - 90) / 10);

  // Rotate slowly full 360 degrees over 30 seconds
  const rotate = interpolate(frame, [0, duration], [0, 360]);

  // Color shift from blue to purple over 30 seconds
  const colorInterpolation = interpolate(frame, [0, duration], [0, 1]);
  const backgroundColor = `rgb(
    ${Math.floor(70 + 80 * colorInterpolation)}, 
    ${Math.floor(130 + 30 * (1 - colorInterpolation))}, 
    ${Math.floor(180 + 75 * colorInterpolation)})`;

  // Text shadow pulse (glow effect)
  const shadowBlur = interpolate(frame % 60, [0, 30, 60], [5, 20, 5]);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
        transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
        willChange: 'transform, opacity',
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: 120,
          fontWeight: '900',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          textShadow: `0 0 ${shadowBlur}px rgba(255,255,255,0.8)`,
          userSelect: 'none',
          margin: 0,
        }}
      >
        Stunning Remotion!
      </h1>
    </div>
  );
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="MyComp"
      component={StunningAnimation}
      durationInFrames={900} // 30 seconds @ 30 fps
      fps={30}
      width={1280}
      height={720}
    />
  </>
);

export default RemotionRoot;
