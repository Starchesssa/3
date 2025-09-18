```tsx
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import React from 'react';

// Import the audio file
import audioSource from './BOOKS/Temp/TTS/Lesson_7.wav';

const VIDEO_WIDTH = 3840;
const VIDEO_HEIGHT = 2160;
const VIDEO_FPS = 30;

// --- Helper Functions and Types ---

const fps = VIDEO_FPS;
const toFrames = (seconds: number) => Math.round(seconds * fps);

type Word = {
  start: number;
  end: number;
  text: string;
};

// Data from transcript converted to frames
const words: Word[] = [
  { text: 'Key', start: toFrames(0.0), end: toFrames(0.44) },
  { text: 'lesson,', start: toFrames(0.44), end: toFrames(0.84) },
  { text: 'the', start: toFrames(1.28), end: toFrames(1.42) },
  { text: 'price', start: toFrames(1.42), end: toFrames(1.8) },
  { text: 'of', start: toFrames(1.8), end: toFrames(2.04) },
  { text: 'innovation', start: toFrames(2.04), end: toFrames(2.58) },
  { text: 'is', start: toFrames(2.58), end: toFrames(3.04) },
  { text: 'expensive', start: toFrames(3.04), end: toFrames(3.68) },
  { text: 'public', start: toFrames(3.68), end: toFrames(4.36) },
  { text: 'failure.', start: toFrames(4.36), end: toFrames(4.84) },
  { text: 'We', start: toFrames(5.53), end: toFrames(5.88) },
  { text: 'need', start: toFrames(5.88), end: toFrames(6.24) },
  { text: 'to', start: toFrames(6.24), end: toFrames(6.42) },
  { text: 'talk', start: toFrames(6.42), end: toFrames(6.62) },
  { text: 'about', start: toFrames(6.62), end: toFrames(6.84) },
  { text: '2019,', start: toFrames(6.84), end: toFrames(7.46) },
  { text: 'but', start: toFrames(8.0), end: toFrames(8.26) },
  { text: 'to', start: toFrames(8.26), end: toFrames(8.48) },
  { text: 'understand', start: toFrames(8.48), end: toFrames(9.02) },
  { text: '2019,', start: toFrames(9.02), end: toFrames(9.74) },
  { text: 'you', start: toFrames(10.12), end: toFrames(10.3) },
  { text: 'have', start: toFrames(10.3), end: toFrames(10.52) },
  { text: 'to', start: toFrames(10.52), end: toFrames(10.68) },
  { text: 'understand', start: toFrames(10.68), end: toFrames(11.12) },
  { text: 'the', start: toFrames(11.12), end: toFrames(11.3) },
  { text: 'ghosts', start: toFrames(11.3), end: toFrames(11.62) },
  { text: 'of', start: toFrames(11.62), end: toFrames(11.96) },
  { text: 'failures', start: toFrames(11.96), end: toFrames(12.28) },
  { text: 'passed.', start: toFrames(12.28), end: toFrames(12.68) },
  { text: 'The', start: toFrames(13.34), end: toFrames(13.54) },
  { text: 'biggest', start: toFrames(13.54), end: toFrames(13.88) },
  { text: 'one', start: toFrames(13.88), end: toFrames(14.12) },
  { text: 'was', start: toFrames(14.12), end: toFrames(14.34) },
  { text: 'the', start: toFrames(14.34), end: toFrames(14.46) },
  { text: 'fire', start: toFrames(14.46), end: toFrames(14.82) },
  { text: 'phone', start: toFrames(14.82), end: toFrames(15.12) },
  { text: 'from', start: toFrames(15.12), end: toFrames(15.3) },
  { text: '2014.', start: toFrames(15.3), end: toFrames(15.98) },
  { text: 'It', start: toFrames(16.64), end: toFrames(16.76) },
  { text: 'was', start: toFrames(16.76), end: toFrames(16.9) },
  { text: 'a', start: toFrames(16.9), end: toFrames(17.02) },
  { text: 'complete', start: toFrames(17.02), end: toFrames(17.5) },
  { text: 'disaster,', start: toFrames(17.5), end: toFrames(17.94) },
  { text: 'a', start: toFrames(18.4), end: toFrames(18.5) },
  { text: 'total', start: toFrames(18.5), end: toFrames(18.9) },
  { text: 'flop.', start: toFrames(18.9), end: toFrames(19.26) },
  { text: 'The', start: toFrames(19.76), end: toFrames(19.92) },
  { text: 'company', start: toFrames(19.92), end: toFrames(20.24) },
  { text: 'took', start: toFrames(20.24), end: toFrames(20.5) },
  { text: 'a', start: toFrames(20.5), end: toFrames(20.72) },
  { text: '$170', start: toFrames(20.72), end: toFrames(21.78) },
  { text: 'million', start: toFrames(21.78), end: toFrames(22.38) },
  { text: 'write', start: toFrames(22.38), end: toFrames(22.92) },
  { text: 'down', start: toFrames(22.92), end: toFrames(23.2) },
  { text: 'on', start: toFrames(23.2), end: toFrames(23.42) },
  { text: 'Unsold', start: toFrames(23.42), end: toFrames(23.84) },
  { text: 'Inventory.', start: toFrames(23.84), end: toFrames(24.44) },
  { text: 'It', start: toFrames(24.68), end: toFrames(24.98) },
  { text: 'was', start: toFrames(24.98), end: toFrames(25.1) },
  { text: 'a', start: toFrames(25.1), end: toFrames(25.24) },
  { text: 'public', start: toFrames(25.24), end: toFrames(25.66) },
  { text: 'humiliation.', start: toFrames(25.66), end: toFrames(26.32) },
  { text: 'They', start: toFrames(26.32), end: toFrames(27.18) },
  { text: 'tried', start: toFrames(27.18), end: toFrames(27.42) },
  { text: 'to', start: toFrames(27.42), end: toFrames(27.58) },
  { text: 'compete', start: toFrames(27.58), end: toFrames(27.86) },
  { text: 'with', start: toFrames(27.86), end: toFrames(28.14) },
  { text: 'Apple', start: toFrames(28.14), end: toFrames(28.42) },
  { text: 'and', start: toFrames(28.42), end: toFrames(28.62) },
  { text: 'Google', start: toFrames(28.62), end: toFrames(28.9) },
  { text: 'and', start: toFrames(28.9), end: toFrames(29.2) },
  { text: 'they', start: toFrames(29.2), end: toFrames(29.32) },
  { text: 'failed', start: toFrames(29.32), end: toFrames(29.7) },
  { text: 'spectacularly.', start: toFrames(29.7), end: toFrames(30.78) },
  { text: 'A', start: toFrames(31.14), end: toFrames(31.44) },
  { text: 'normal', start: toFrames(31.44), end: toFrames(31.74) },
  { text: 'company', start: toFrames(31.74), end: toFrames(32.18) },
  { text: 'would', start: toFrames(32.18), end: toFrames(32.38) },
  { text: 'fire', start: toFrames(32.38), end: toFrames(32.7) },
  { text: 'the', start: toFrames(32.7), end: toFrames(32.92) },
  { text: 'entire', start: toFrames(32.92), end: toFrames(33.26) },
  { text: 'team.', start: toFrames(33.26), end: toFrames(33.76) },
  { text: 'They', start: toFrames(34.12), end: toFrames(34.22) },
  { text: 'would', start: toFrames(34.22), end: toFrames(34.34) },
  { text: 'never', start: toFrames(34.34), end: toFrames(34.64) },
  { text: 'mention', start: toFrames(34.64), end: toFrames(35.0) },
  { text: 'the', start: toFrames(35.0), end: toFrames(35.12) },
  { text: 'project', start: toFrames(35.12), end: toFrames(35.46) },
  { text: 'again.', start: toFrames(35.46), end: toFrames(35.82) },
  { text: 'They', start: toFrames(36.3), end: toFrames(36.4) },
  { text: 'would', start: toFrames(36.4), end: toFrames(36.56) },
  { text: 'conclude,', start: toFrames(36.56), end: toFrames(36.98) },
  { text: 'we', start: toFrames(37.3), end: toFrames(37.42) },
  { text: 'are', start: toFrames(37.42), end: toFrames(37.66) },
  { text: 'not', start: toFrames(37.66), end: toFrames(37.94) },
  { text: 'a', start: toFrames(37.94), end: toFrames(38.14) },
  { text: 'hardware', start: toFrames(38.14), end: toFrames(38.38) },
  { text: 'company.', start: toFrames(38.38), end: toFrames(38.86) },
  { text: 'Amazon', start: toFrames(39.54), end: toFrames(39.84) },
  { text: 'did', start: toFrames(39.84), end: toFrames(40.24) },
  { text: 'not', start: toFrames(40.24), end: toFrames(40.52) },
  { text: 'do', start: toFrames(40.52), end: toFrames(40.76) },
  { text: 'that.', start: toFrames(40.76), end: toFrames(41.02) },
  { text: 'Bezos', start: toFrames(41.58), end: toFrames(41.82) },
  { text: 'said,', start: toFrames(41.82), end: toFrames(42.24) },
  { text: 'if', start: toFrames(42.42), end: toFrames(42.5) },
  { text: 'you', start: toFrames(42.5), end: toFrames(42.62) },
  { text: 'are', start: toFrames(42.62), end: toFrames(42.72) },
  { text: 'not', start: toFrames(42.72), end: toFrames(42.98) },
  { text: 'failing,', start: toFrames(42.98), end: toFrames(43.38) },
  { text: 'you', start: toFrames(43.7), end: toFrames(43.8) },
  { text: 'are', start: toFrames(43.8), end: toFrames(43.9) },
  { text: 'not', start: toFrames(43.9), end: toFrames(44.18) },
  { text: 'innovating.', start: toFrames(44.18), end: toFrames(44.76) },
  { text: 'The', start: toFrames(45.28), end: toFrames(45.46) },
  { text: '$170', start: toFrames(45.46), end: toFrames(46.38) },
  { text: 'million', start: toFrames(46.38), end: toFrames(46.92) },
  { text: 'was', start: toFrames(46.92), end: toFrames(47.54) },
  { text: 'the', start: toFrames(47.54), end: toFrames(47.72) },
  { text: 'tuition', start: toFrames(47.72), end: toFrames(48.1) },
  { text: 'fee.', start: toFrames(48.1), end: toFrames(48.46) },
  { text: 'The', start: toFrames(49.08), end: toFrames(49.28) },
  { text: 'lessons', start: toFrames(49.28), end: toFrames(49.58) },
  { text: 'they', start: toFrames(49.58), end: toFrames(49.86) },
  { text: 'learned', start: toFrames(49.86), end: toFrames(50.12) },
  { text: 'from', start: toFrames(50.12), end: toFrames(50.32) },
  { text: 'the', start: toFrames(50.32), end: toFrames(50.46) },
  { text: 'fire', start: toFrames(50.46), end: toFrames(50.7) },
  { text: "phone's", start: toFrames(50.7), end: toFrames(51.12) },
  { text: 'failure,', start: toFrames(51.12), end: toFrames(51.4) },
  { text: 'the', start: toFrames(51.7), end: toFrames(51.78) },
  { text: 'engineers', start: toFrames(51.78), end: toFrames(52.1) },
  { text: 'they', start: toFrames(52.1), end: toFrames(52.6) },
  { text: 'trained,', start: toFrames(52.6), end: toFrames(52.98) },
  { text: 'the', start: toFrames(53.14), end: toFrames(53.2) },
  { text: 'supply', start: toFrames(53.2), end: toFrames(53.6) },
  { text: 'chains', start: toFrames(53.6), end: toFrames(53.92) },
  { text: 'they', start: toFrames(53.92), end: toFrames(54.14) },
  { text: 'built', start: toFrames(54.14), end: toFrames(54.36) },
  { text: 'were', start: toFrames(54.36), end: toFrames(54.64) },
  { text: 'not', start: toFrames(54.64), end: toFrames(54.9) },
  { text: 'thrown', start: toFrames(54.9), end: toFrames(55.16) },
  { text: 'away.', start: toFrames(55.16), end: toFrames(55.46) },
  { text: 'They', start: toFrames(55.46), end: toFrames(56.26) },
  { text: 'were', start: toFrames(56.26), end: toFrames(56.42) },
  { text: 'repurposed.', start: toFrames(56.42), end: toFrames(57.28) },
  { text: 'That', start: toFrames(57.82), end: toFrames(57.96) },
  { text: 'same', start: toFrames(57.96), end: toFrames(58.3) },
  { text: 'team,', start: toFrames(58.3), end: toFrames(58.68) },
  { text: 'that', start: toFrames(58.9), end: toFrames(59.04) },
  { text: 'same', start: toFrames(59.04), end: toFrames(59.38) },
  { text: 'knowledge', start: toFrames(59.38), end: toFrames(59.8) },
  { text: 'went', start: toFrames(59.8), end: toFrames(60.22) },
  { text: 'on', start: toFrames(60.22), end: toFrames(60.38) },
  { text: 'to', start: toFrames(60.38), end: toFrames(60.52) },
  { text: 'create', start: toFrames(60.52), end: toFrames(60.82) },
  { text: 'the', start: toFrames(60.82), end: toFrames(61.02) },
  { text: 'Amazon', start: toFrames(61.02), end: toFrames(61.34) },
  { text: 'Echo', start: toFrames(61.34), end: toFrames(61.82) },
  { text: 'and', start: toFrames(61.82), end: toFrames(62.08) },
  { text: 'Alexa,', start: toFrames(62.08), end: toFrames(62.46) },
  { text: 'a', start: toFrames(63.0), end: toFrames(63.18) },
  { text: 'product', start: toFrames(63.18), end: toFrames(63.52) },
  { text: 'that', start: toFrames(63.52), end: toFrames(63.76) },
  { text: 'created', start: toFrames(63.76), end: toFrames(64.1) },
  { text: 'an', start: toFrames(64.1), end: toFrames(64.34) },
  { text: 'entirely', start: toFrames(64.34), end: toFrames(64.86) },
  { text: 'new', start: toFrames(64.86), end: toFrames(65.32) },
  { text: 'category', start: toFrames(65.32), end: toFrames(5.8) },
  { text: 'of', start: toFrames(65.8), end: toFrames(66.04) },
  { text: 'technology.', start: toFrames(66.04), end: toFrames(66.6) },
  { text: 'By', start: toFrames(67.12), end: toFrames(67.36) },
  { text: '2019,', start: toFrames(67.36), end: toFrames(68.04) },
  { text: 'tens', start: toFrames(68.5), end: toFrames(68.8) },
  { text: 'of', start: toFrames(68.8), end: toFrames(69.06) },
  { text: 'millions', start: toFrames(69.06), end: toFrames(69.32) },
  { text: 'of', start: toFrames(69.32), end: toFrames(69.58) },
  { text: 'homes', start: toFrames(69.58), end: toFrames(69.86) },
  { text: 'had', start: toFrames(69.86), end: toFrames(70.08) },
  { text: 'an', start: toFrames(70.08), end: toFrames(70.26) },
  { text: 'Echo', start: toFrames(70.26), end: toFrames(70.48) },
  { text: 'device.', start: toFrames(70.48), end: toFrames(70.8) },
  { text: 'The', start: toFrames(71.48), end: toFrames(71.62) },
  { text: 'ashes', start: toFrames(71.62), end: toFrames(71.96) },
  { text: 'of', start: toFrames(71.96), end: toFrames(72.18) },
  { text: 'their', start: toFrames(72.18), end: toFrames(72.32) },
  { text: 'biggest', start: toFrames(72.32), end: toFrames(72.66) },
  { text: 'failure', start: toFrames(72.66), end: toFrames(73.08) },
  { text: 'became', start: toFrames(73.08), end: toFrames(73.52) },
  { text: 'the', start: toFrames(73.52), end: toFrames(73.72) },
  { text: 'soil', start: toFrames(73.72), end: toFrames(74.1) },
  { text: 'for', start: toFrames(74.1), end: toFrames(74.36) },
  { text: 'one', start: toFrames(74.36), end: toFrames(74.52) },
  { text: 'of', start: toFrames(74.52), end: toFrames(74.6) },
  { text: 'their', start: toFrames(74.6), end: toFrames(74.74) },
  { text: 'biggest', start: toFrames(74.74), end: toFrames(75.08) },
  { text: 'successes.', start: toFrames(75.08), end: toFrames(75.68) },
  { text: 'Failure', start: toFrames(76.54), end: toFrames(76.96) },
  { text: 'is', start: toFrames(76.96), end: toFrames(77.16) },
  { text: 'only', start: toFrames(77.16), end: toFrames(77.6) },
  { text: 'failure', start: toFrames(77.6), end: toFrames(78.04) },
  { text: 'if', start: toFrames(78.04), end: toFrames(78.32) },
  { text: 'you', start: toFrames(78.32), end: toFrames(78.44) },
  { text: 'learn', start: toFrames(78.44), end: toFrames(78.66) },
  { text: 'nothing', start: toFrames(78.66), end: toFrames(79.1) },
  { text: 'from', start: toFrames(79.1), end: toFrames(79.4) },
  { text: 'it.', start: toFrames(79.4), end: toFrames(79.6) },
];

// --- Animated Components ---

const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [word.start, word.start + 5, word.end - 5, word.end],
    [0, 1, 1, 0]
  );

  const translateY = interpolate(
    frame,
    [word.start, word.start + 5],
    [10, 0],
    {
      extrapolateRight: 'clamp',
    }
  );

  const wordStyle: React.CSSProperties = {
    display: 'inline-block',
    opacity,
    transform: `translateY(${translateY}px)`,
  };

  return <span style={wordStyle}>{word.text}&nbsp;</span>;
};

const Subtitles: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '15%',
    width: '100%',
    textAlign: 'center',
    padding: '0 10%',
    fontSize: '80px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 0 15px rgba(0,0,0,0.8)',
    fontFamily: 'Helvetica, Arial, sans-serif',
    lineHeight: 1.3
  };

  return (
    <div style={containerStyle}>
      {words.map((word, i) => (
        <WordComponent key={i} word={word} />
      ))}
    </div>
  );
};


// --- Scene Components ---

// This component will handle the parallax and camera movement for each scene
const SceneContainer: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
}> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  
  // Cinematic slow zoom
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.1], {
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });

  // Slow pan
  const panX = interpolate(frame, [0, durationInFrames], [0, -50], {
     easing: Easing.linear,
  });

  const cameraStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `scale(${scale}) translateX(${panX}px)`,
  };

  return <div style={cameraStyle}>{children}</div>;
};

// Parallax Image Layer
const ParallaxLayer: React.FC<{
  src: string;
  speed: number;
  durationInFrames: number;
  opacity?: number;
  scale?: number;
  style?: React.CSSProperties;
}> = ({ src, speed, durationInFrames, opacity = 1, scale = 1.15, style }) => {
  const frame = useCurrentFrame();
  const xOffset = interpolate(frame, [0, durationInFrames], [0, -VIDEO_WIDTH * 0.1 * speed]);

  const layerStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    transform: `translateX(${xOffset}px) scale(${scale})`,
    opacity,
    ...style,
  };

  return (
    <AbsoluteFill>
      <Img src={src} style={layerStyle} />
    </AbsoluteFill>
  );
};


// --- Video Component ---

export const RemotionVideo: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={audioSource} />

      {/* SCENE 1: The Price of Innovation (0.00 - 4.84s) */}
      <Sequence from={0} durationInFrames={toFrames(5.5)}>
        <SceneContainer durationInFrames={toFrames(5.5)}>
          {/* stage_background.jpg: Dark stage with a spotlight. Full bleed background. */}
          <ParallaxLayer src="assets/images/stage_background.jpg" speed={1} durationInFrames={toFrames(5.5)} scale={1.2}/>
          {/* key.png: Ornate, antique key. Transparent background to float on stage. */}
          <ParallaxLayer src="assets/images/key.png" speed={2} durationInFrames={toFrames(5.5)} scale={0.5} style={{objectFit: 'contain'}}/>
           {/* price_tag.png: A large price tag. Transparent background. */}
          <ParallaxLayer src="assets/images/price_tag.png" speed={3} durationInFrames={toFrames(5.5)} scale={0.6} style={{objectFit: 'contain', left: '10%'}}/>
        </SceneContainer>
      </Sequence>

      {/* SCENE 2: Ghosts of Failures Past (5.53 - 12.68s) */}
      <Sequence from={toFrames(5.5)} durationInFrames={toFrames(8)}>
         <SceneContainer durationInFrames={toFrames(8)}>
          {/* ghostly_failures_bg.jpg: Dark, abstract background for a mysterious feel. */}
          <ParallaxLayer src="assets/images/ghostly_failures_bg.jpg" speed={1} durationInFrames={toFrames(8)} scale={1.2}/>
          {/* failed_invention_1.png: Semi-transparent image of a failed product. */}
          <ParallaxLayer src="assets/images/failed_invention_1.png" speed={3} durationInFrames={toFrames(8)} scale={0.8} style={{objectFit: 'contain', opacity: 0.5}}/>
          {/* calendar_2019.png: Stylish calendar for 2019. Transparent background. */}
          <ParallaxLayer src="assets/images/calendar_2019.png" speed={2} durationInFrames={toFrames(8)} scale={0.7} style={{objectFit: 'contain'}}/>
        </SceneContainer>
      </Sequence>

      {/* SCENE 3 & 4: Fire Phone Disaster (13.34 - 19.26s) */}
      <Sequence from={toFrames(13)} durationInFrames={toFrames(7)}>
         <SceneContainer durationInFrames={toFrames(7)}>
          {/* dark_tech_bg.jpg: Modern background with circuit patterns. */}
          <ParallaxLayer src="assets/images/dark_tech_bg.jpg" speed={1} durationInFrames={toFrames(7)} scale={1.2}/>
          {/* fire_phone.png: Stylized image of a cracked/burning smartphone. Transparent background. */}
          <ParallaxLayer src="assets/images/fire_phone.png" speed={2.5} durationInFrames={toFrames(7)} scale={0.6} style={{objectFit: 'contain'}}/>
          {/* shattered_screen.png: Transparent overlay of shattered glass. Appears later in scene. */}
          <Sequence from={toFrames(3.5)}>
            <ParallaxLayer src="assets/images/shattered_screen.png" speed={0} durationInFrames={toFrames(3.5)} scale={1.1} style={{objectFit: 'cover'}}/>
          </Sequence>
        </SceneContainer>
      </Sequence>

      {/* SCENE 5 & 6: Humiliation and Write Down (19.76 - 30.78s) */}
      <Sequence from={toFrames(19.5)} durationInFrames={toFrames(12)}>
        <SceneContainer durationInFrames={toFrames(12)}>
          {/* warehouse_boxes.jpg: Dimly lit warehouse full of unsold product. */}
          <ParallaxLayer src="assets/images/warehouse_boxes.jpg" speed={1} durationInFrames={toFrames(12)} scale={1.2}/>
           {/* money_graphic.png: A bold "$170 Million" graphic. Transparent background. */}
          <ParallaxLayer src="assets/images/money_graphic.png" speed={2} durationInFrames={toFrames(12)} scale={0.7} style={{objectFit: 'contain'}}/>
          {/* humiliation_silhouette.png: Silhouette of person in despair. Transparent background. */}
          <ParallaxLayer src="assets/images/humiliation_silhouette.png" speed={3} durationInFrames={toFrames(12)} scale={0.9} style={{objectFit: 'contain', top: '20%'}}/>
        </SceneContainer>
      </Sequence>

      {/* SCENE 7 & 8: A Normal Company's Reaction (31.14 - 38.86s) */}
      <Sequence from={toFrames(31)} durationInFrames={toFrames(8.5)}>
        <SceneContainer durationInFrames={toFrames(8.5)}>
          {/* closed_factory.jpg: Desolate, closed factory exterior. */}
          <ParallaxLayer src="assets/images/closed_factory.jpg" speed={1} durationInFrames={toFrames(8.5)} scale={1.2}/>
          {/* broken_robot.png: A broken, sparking robotic arm. Transparent background. */}
          <ParallaxLayer src="assets/images/broken_robot.png" speed={2} durationInFrames={toFrames(8.5)} scale={0.8} style={{objectFit: 'contain'}}/>
          {/* pink_slips.png: Fired notices flying across the screen. Transparent background. */}
          <ParallaxLayer src="assets/images/pink_slips.png" speed={4} durationInFrames={toFrames(8.5)} scale={0.9} style={{objectFit: 'contain'}}/>
        </SceneContainer>
      </Sequence>
      
      {/* SCENE 9, 10, 11: Amazon's Different Path (39.54 - 48.46s) */}
      <Sequence from={toFrames(39)} durationInFrames={toFrames(10)}>
        <SceneContainer durationInFrames={toFrames(10)}>
          {/* brain_gears.jpg: Abstract background of a brain with mechanical gears. */}
          <ParallaxLayer src="assets/images/brain_gears.jpg" speed={1} durationInFrames={toFrames(10)} scale={1.2}/>
          {/* lightbulb.png: A classic "idea" lightbulb. Transparent background. */}
          <ParallaxLayer src="assets/images/lightbulb.png" speed={2} durationInFrames={toFrames(10)} scale={0.5} style={{objectFit: 'contain', filter: `brightness(2) drop-shadow(0 0 20px #ffeeaa)`}}/>
          {/* graduation_cap.png: Graduation cap representing "tuition". Transparent background. */}
          <ParallaxLayer src="assets/images/graduation_cap.png" speed={3} durationInFrames={toFrames(10)} scale={0.4} style={{objectFit: 'contain', left: '20%'}}/>
        </SceneContainer>
      </Sequence>

      {/* SCENE 12 & 13: Repurposed into Echo & Alexa (49.08 - 66.60s) */}
      <Sequence from={toFrames(49)} durationInFrames={toFrames(18)}>
        <SceneContainer durationInFrames={toFrames(18)}>
          {/* blueprints_bg.jpg: Background of technical schematics. */}
          <ParallaxLayer src="assets/images/blueprints_bg.jpg" speed={1} durationInFrames={toFrames(18)} scale={1.2}/>
          {/* phoenix.png: A majestic phoenix rising from embers. Transparent background. */}
          <ParallaxLayer src="assets/images/phoenix.png" speed={2} durationInFrames={toFrames(18)} scale={0.8} style={{objectFit: 'contain', opacity: 0.7}}/>
          {/* amazon_echo.png: Clean product shot of the Amazon Echo. Transparent background. */}
          <ParallaxLayer src="assets/images/amazon_echo.png" speed={3} durationInFrames={toFrames(18)} scale={0.6} style={{objectFit: 'contain'}}/>
        </SceneContainer>
      </Sequence>

      {/* SCENE 14 & 15: Ashes to Soil, Failure to Success (67.12 - 75.68s) */}
      <Sequence from={toFrames(67)} durationInFrames={toFrames(9)}>
        <SceneContainer durationInFrames={toFrames(9)}>
          {/* ash_to_soil_bg.jpg: A background transitioning from ash to rich soil. */}
          <ParallaxLayer src="assets/images/ash_to_soil_bg.jpg" speed={1} durationInFrames={toFrames(9)} scale={1.2}/>
          {/* living_room.jpg: Cozy living room setting where an Echo might be. */}
          <ParallaxLayer src="assets/images/living_room.jpg" speed={2} durationInFrames={toFrames(9)} scale={1.1} style={{opacity: 0.4, mixBlendMode: 'screen'}}/>
          {/* sprout.png: A small green plant growing. Transparent background. */}
          <ParallaxLayer src="assets/images/sprout.png" speed={3} durationInFrames={toFrames(9)} scale={0.7} style={{objectFit: 'contain', top: '-10%'}}/>
        </SceneContainer>
      </Sequence>
      
      {/* SCENE 16: The Final Lesson (76.54 - 79.60s) */}
      <Sequence from={toFrames(76)} durationInFrames={toFrames(4)}>
        <SceneContainer durationInFrames={toFrames(4)}>
          {/* success_tree.jpg: A large, thriving tree symbolizing success. */}
          <ParallaxLayer src="assets/images/success_tree.jpg" speed={1} durationInFrames={toFrames(4)} scale={1.2}/>
        </SceneContainer>
      </Sequence>

      {/* Subtitles rendered on top of all scenes */}
      <AbsoluteFill>
        <Subtitles />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- Remotion Composition ---

export const MyComposition = () => {
  const videoDuration = 79.6 * VIDEO_FPS; // Total duration in frames

  return (
    <Composition
      id="RemotionVideo"
      component={RemotionVideo}
      durationInFrames={Math.ceil(videoDuration) + 30} // Add a small buffer
      fps={VIDEO_FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
};
```