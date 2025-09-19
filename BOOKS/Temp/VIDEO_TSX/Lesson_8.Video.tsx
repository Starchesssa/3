```tsx
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import React from 'react';

// --- CONFIGURATION ---
const FPS = 30;
const DURATION_IN_SECONDS = 71;
const DURATION_IN_FRAMES = DURATION_IN_SECONDS * FPS;
const VIDEO_WIDTH = 3840;
const VIDEO_HEIGHT = 2160;

// --- ASSETS ---
const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_8.wav');
const backgroundImg = staticFile('tech_city_background.jpg');
const midgroundImg = staticFile('server-racks-midground.png');
const foregroundImg = staticFile('data_stream_foreground.png');

// --- TIMELINE ---
const PHRASES = [
  { text: 'Key lesson.', start: 0, end: 1.2 },
  { text: 'Your system is tested in a true crisis.', start: 1.38, end: 4.42 },
  { text: 'A global pandemic stopped the world.', start: 9.98, end: 13.76 },
  { text: 'Stores and offices closed.', start: 14.28, end: 16.24 },
  { text: 'The machine Amazon built for 25 years...', start: 19.62, end: 24.52 },
  { text: 'became essential infrastructure.', start: 24.98, end: 27.06 },
  { text: 'The ultimate test.', start: 34.50, end: 35.48 },
  { text: 'The system strained, but did not break.', start: 35.84, end: 39.92 },
  { text: 'Amazon hired 175,000 workers.', start: 42.48, end: 47.82 },
  { text: 'Revenue exploded by 40%.', start: 48.38, end: 53.10 },
  { text: 'For Amazon, the ultimate validation.', start: 58.88, end: 62.22 },
  { text: 'Every bet on long-term thinking paid off.', start: 62.80, end: 68.46 },
].map((p) => ({ ...p, startFrame: p.start * FPS, endFrame: p.end * FPS }));

// --- VIDEO COMPONENT ---
export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // PARALLAX: Calculate translation values based on the current frame
  const bgTranslate = interpolate(frame, [0, DURATION_IN_FRAMES], [0, -400]);
  const mgTranslate = interpolate(frame, [0, DURATION_IN_FRAMES], [0, -800]);
  const fgTranslate = interpolate(frame, [0, DURATION_IN_FRAMES], [0, -1200]);

  // PARALLAX: Define layer styles
  const baseLayerStyle: React.CSSProperties = {
    position: 'absolute', width: '115%', height: '115%',
    objectFit: 'cover', left: '-7.5%', top: '-7.5%',
  };
  const backgroundStyle = { ...baseLayerStyle, transform: `translateX(${bgTranslate}px)` };
  const midgroundStyle = { ...baseLayerStyle, transform: `translateX(${mgTranslate}px)` };
  const foregroundStyle = { ...baseLayerStyle, opacity: 0.7, transform: `translateX(${fgTranslate}px)` };

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={audioSrc} />
      <Img src={backgroundImg} style={backgroundStyle} />
      <Img src={midgroundImg} style={midgroundStyle} />
      <Img src={foregroundImg} style={foregroundStyle} />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {PHRASES.map(({ text, startFrame, endFrame }, i) => {
          // TEXT ANIMATION: Calculate scale and opacity for each phrase
          const introProgress = spring({ frame: frame - startFrame, fps: FPS, durationInFrames: 20 });
          const scale = interpolate(introProgress, [0, 1], [0.8, 1]);
          const opacity = interpolate(frame,
            [startFrame, startFrame + 15, endFrame - 15, endFrame],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // TEXT STYLE: Define style object before using it in JSX
          const textStyle: React.CSSProperties = {
            fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 160, fontWeight: 'bold',
            color: 'white', textShadow: '0 0 30px rgba(0,0,0,0.8)', textAlign: 'center',
            opacity, transform: `scale(${scale})`, padding: '0 5%',
          };
          
          return opacity > 0 && <p key={i} style={textStyle}>{text}</p>;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- COMPOSITION REGISTRATION ---
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionVideo"
    component={RemotionVideo}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={VIDEO_WIDTH}
    height={VIDEO_HEIGHT}
  />
);
```