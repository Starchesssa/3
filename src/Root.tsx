
import React from 'react';
import {Composition, useCurrentFrame, interpolate, spring, Easing} from 'remotion';

const AnimatedCircle = ({delay = 0, color = 'red', xStart = 0, xEnd = 200}) => {
  const frame = useCurrentFrame() - delay;
  const progress = spring({
    frame: frame < 0 ? 0 : frame,
    fps: 30,
    config: {damping: 10},
  });

  const translateX = interpolate(progress, [0, 1], [xStart, xEnd]);
  const scale = interpolate(progress, [0, 0.5, 1], [0, 1.2, 1]);

  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: color,
        transform: `translateX(${translateX}px) scale(${scale})`,
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        position: 'absolute',
        top: 100,
        left: 100,
      }}
    />
  );
};

const AnimatedBar = ({delay = 0, heightStart = 0, heightEnd = 150, color = 'blue', left = 300}) => {
  const frame = useCurrentFrame() - delay;
  const progress = spring({
    frame: frame < 0 ? 0 : frame,
    fps: 30,
    config: {mass: 1, damping: 15},
  });

  const height = interpolate(progress, [0, 1], [heightStart, heightEnd]);

  return (
    <div
      style={{
        width: 40,
        height,
        backgroundColor: color,
        position: 'absolute',
        bottom: 100,
        left,
        borderRadius: 10,
        boxShadow: '0 0 8px rgba(0,0,0,0.2)',
      }}
    />
  );
};

const AnimatedLine = ({delay = 0}) => {
  const frame = useCurrentFrame() - delay;
  const progress = interpolate(frame, [0, 60], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <svg
      width={400}
      height={200}
      style={{
        position: 'absolute',
        top: 250,
        left: 50,
        overflow: 'visible',
      }}
    >
      <line
        x1={0}
        y1={100}
        x2={400 * progress}
        y2={100}
        stroke="green"
        strokeWidth={5}
        strokeLinecap="round"
      />
    </svg>
  );
};

const ExplainerScene = () => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#f0f0f0',
        position: 'relative',
      }}
    >
      {/* Circles animating from left to right */}
      <AnimatedCircle delay={0} color="#FF6347" xStart={0} xEnd={220} />
      <AnimatedCircle delay={15} color="#4682B4" xStart={0} xEnd={300} />
      <AnimatedCircle delay={30} color="#FFD700" xStart={0} xEnd={350} />

      {/* Bars animating height growth */}
      <AnimatedBar delay={45} color="#1E90FF" left={320} heightEnd={150} />
      <AnimatedBar delay={60} color="#32CD32" left={380} heightEnd={130} />
      <AnimatedBar delay={75} color="#FF8C00" left={440} heightEnd={170} />

      {/* Line growing left to right */}
      <AnimatedLine delay={90} />
    </div>
  );
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="MyComp"
      component={ExplainerScene}
      durationInFrames={900} // 30 seconds at 30fps
      fps={30}
      width={1280}
      height={720}
    />
  </>
);

export default RemotionRoot;
