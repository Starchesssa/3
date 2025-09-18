```tsx
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

const textStyle: React.CSSProperties = {
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: 80,
  fontWeight: 'bold',
  textAlign: 'center',
  color: 'white',
  textShadow: '0 0 20px rgba(0,0,0,0.7)',
};

const AnimatedKeyword: React.FC<{
  children: React.ReactNode;
  startFrame: number;
}> = ({ children, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - startFrame, fps, from: 0.8, to: 1, durationInFrames: 20 });
  const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], { extrapolateRight: 'clamp' });
  const animStyle = { display: 'inline-block', transform: `scale(${scale})`, opacity };
  return <span style={animStyle}>{children}</span>;
};

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  const parallaxPan = interpolate(progress, [0, 1], [0, -300]);
  const parallaxZoom = interpolate(progress, [0, 1], [1, 1.25]);

  const bgStyle = { transform: `scale(${parallaxZoom}) translateX(${parallaxPan * 0.2}px)` };
  const midStyle = { transform: `scale(${parallaxZoom}) translateX(${parallaxPan * 0.5}px)` };
  const fgStyle = { transform: `scale(${parallaxZoom}) translateX(${parallaxPan * 1}px)`, opacity: 0.6 };
  const textContainerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center' };

  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_2.wav')} />

      <AbsoluteFill style={bgStyle}>
        <img src={staticFile('images/city-background.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={midStyle}>
        <img src={staticFile('images/stock-chart-midground.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill style={fgStyle}>
        <img src={staticFile('images/tech-overlay-foreground.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>

      <AbsoluteFill style={textContainerStyle}>
        <Sequence from={40} durationInFrames={240} style={textStyle}>
          The market is a <AnimatedKeyword startFrame={47}>mood swing.</AnimatedKeyword>
        </Sequence>
        <Sequence from={280} durationInFrames={240} style={textStyle}>
          Your <AnimatedKeyword startFrame={286}>strategy</AnimatedKeyword> is a <AnimatedKeyword startFrame={317}>compass.</AnimatedKeyword>
        </Sequence>
        <Sequence from={350} durationInFrames={300} style={textStyle}>
          .com companies <AnimatedKeyword startFrame={388}>vanished overnight.</AnimatedKeyword>
        </Sequence>
        <Sequence from={620} durationInFrames={270} style={textStyle}>
          Amazon stock <AnimatedKeyword startFrame={655}>crashed,</AnimatedKeyword><br />a drop of over <AnimatedKeyword startFrame={895}>90%.</AnimatedKeyword>
        </Sequence>
        <Sequence from={1080} durationInFrames={240} style={textStyle}>
          Your net worth <AnimatedKeyword startFrame={1100}>evaporating.</AnimatedKeyword>
        </Sequence>
        <Sequence from={1450} durationInFrames={300} style={textStyle}>
          Bezos did the <AnimatedKeyword startFrame={1457}>opposite.</AnimatedKeyword><br />He kept <AnimatedKeyword startFrame={1483}>building.</AnimatedKeyword>
        </Sequence>
        <Sequence from={1600} durationInFrames={220} style={textStyle}>
          His <AnimatedKeyword startFrame={1633}>strategy</AnimatedKeyword> was the signal.
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```