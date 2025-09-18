```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from 'remotion';
import React from 'react';
import { z } from 'zod';

// Helper to convert seconds to frames
const sec = (seconds: number) => Math.round(seconds * 30);

// Define schema for props if needed (optional for this specific case)
export const remotionSchema = z.object({});

// --- Word Highlighting Component ---
// This component displays a word and highlights it based on the timeline.
const Word: React.FC<{ text: string; start: number; end: number }> = ({
  text,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const opacity =
    frame >= start && frame < end
      ? 1
      : 0.5;

  return (
    <span style={{ opacity, transition: 'opacity 0.2s linear', marginRight: '10px' }}>
      {text}
    </span>
  );
};

// --- Text Sequence Component ---
// Manages the display of a full sentence, word by word.
const TextSequence: React.FC<{
  words: { text: string; start: number; end: number }[];
  from: number;
  durationInFrames: number;
  top?: number;
  left?: number;
}> = ({ words, from, durationInFrames, top = 10, left = 10 }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [from, from + 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [from + durationInFrames - 15, from + durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  const containerOpacity = Math.min(fadeIn, fadeOut);

  return (
    <div
      style={{
        position: 'absolute',
        top: `${top}%`,
        left: `${left}%`,
        width: `${100 - left * 2}%`,
        fontSize: '90px',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'left',
        textShadow: '0 0 15px rgba(0,0,0,0.8)',
        opacity: containerOpacity,
      }}
    >
      {words.map((word, i) => (
        <Word
          key={i}
          text={word.text}
          start={sec(word.start)}
          end={sec(word.end)}
        />
      ))}
    </div>
  );
};

// --- Animated Image Layer Component ---
// Handles parallax, zoom, and fade for image layers.
const AnimatedLayer: React.FC<{
  src: string;
  from?: number;
  durationInFrames: number;
  zoomStart?: number;
  zoomEnd?: number;
  panXStart?: number;
  panXEnd?: number;
  panYStart?: number;
  panYEnd?: number;
  opacityStart?: number;
  opacityEnd?: number;
  initialScale?: number;
}> = ({
  src,
  from = 0,
  durationInFrames,
  zoomStart = 1,
  zoomEnd = 1,
  panXStart = 0,
  panXEnd = 0,
  panYStart = 0,
  panYEnd = 0,
  opacityStart = 1,
  opacityEnd = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const sequenceStart = from;
  const sequenceEnd = from + durationInFrames;

  // Calculate animation values
  const scale = interpolate(
    frame,
    [sequenceStart, sequenceEnd],
    [zoomStart, zoomEnd]
  );
  const translateX = interpolate(
    frame,
    [sequenceStart, sequenceEnd],
    [panXStart, panXEnd]
  );
  const translateY = interpolate(
    frame,
    [sequenceStart, sequenceEnd],
    [panYStart, panYEnd]
  );
  const opacity = interpolate(
    frame,
    [sequenceStart, sequenceStart + 30, sequenceEnd - 30, sequenceEnd],
    [0, opacityStart, opacityEnd, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const style: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity,
    transform: `scale(${scale}) translateX(${translateX}px) translateY(${translateY}px)`,
  };

  return <Img src={staticFile(src)} style={style} />;
};


export const RemotionVideo: React.FC<z.infer<typeof remotionSchema>> = () => {
  const { durationInFrames, fps } = useVideoConfig();
	const frame = useCurrentFrame();

  const transcript = [
		{ text: 'Key', start: 0.0, end: 0.42 },
		{ text: 'lesson.', start: 0.42, end: 0.86 },
		{ text: 'Your', start: 1.38, end: 1.56 },
		{ text: 'system', start: 1.56, end: 2.06 },
		{ text: 'is', start: 2.06, end: 2.32 },
		{ text: 'only', start: 2.32, end: 2.76 },
		{ text: 'tested', start: 2.76, end: 3.26 },
		{ text: 'in', start: 3.26, end: 3.52 },
		{ text: 'a', start: 3.52, end: 3.62 },
		{ text: 'true', start: 3.62, end: 3.9 },
		{ text: 'crisis.', start: 3.9, end: 4.42 },
		{ text: 'Late', start: 5.26, end: 5.52 },
		{ text: '2019', start: 5.52, end: 6.26 },
		{ text: 'rolled', start: 6.26, end: 6.78 },
		{ text: 'into', start: 6.78, end: 7.12 },
		{ text: '2020,', start: 7.12, end: 7.72 },
		{ text: 'and', start: 7.92, end: 8.4 },
		{ text: 'the', start: 8.4, end: 8.66 },
		{ text: 'world', start: 8.66, end: 8.92 },
		{ text: 'stopped.', start: 8.92, end: 9.52 },
		{ text: 'A', start: 9.98, end: 10.14 },
		{ text: 'global', start: 10.14, end: 10.52 },
		{ text: 'pandemic', start: 10.52, end: 11.12 },
		{ text: 'called', start: 11.12, end: 11.46 },
		{ text: 'COVID-19', start: 11.46, end: 12.36 },
		{ text: 'shut', start: 12.36, end: 12.78 },
		{ text: 'down', start: 12.78, end: 13.04 },
		{ text: 'everything.', start: 13.04, end: 13.76 },
		{ text: 'Stores', start: 14.28, end: 14.68 },
		{ text: 'closed,', start: 14.68, end: 15.02 },
		{ text: 'offices', start: 15.44, end: 15.82 },
		{ text: 'closed,', start: 15.82, end: 16.24 },
		{ text: 'people', start: 16.58, end: 16.9 },
		{ text: 'were', start: 16.9, end: 17.1 },
		{ text: 'locked', start: 17.1, end: 17.42 },
		{ text: 'in', start: 17.42, end: 17.66 },
		{ text: 'their', start: 17.66, end: 17.82 },
		{ text: 'homes.', start: 17.82, end: 18.16 },
		{ text: 'And', start: 18.68, end: 18.8 },
		{ text: 'suddenly,', start: 18.8, end: 19.28 },
		{ text: 'the', start: 19.62, end: 19.7 },
		{ text: 'machine', start: 19.7, end: 20.1 },
		{ text: 'that', start: 20.1, end: 20.4 },
		{ text: 'Amazon', start: 20.4, end: 20.7 },
		{ text: 'had', start: 20.7, end: 21.04 },
		{ text: 'been', start: 21.04, end: 21.2 },
		{ text: 'building', start: 21.2, end: 21.54 },
		{ text: 'for', start: 21.54, end: 21.78 },
		{ text: '25', start: 21.78, end: 22.38 },
		{ text: 'years', start: 22.38, end: 22.88 },
		{ text: 'was', start: 22.88, end: 23.26 },
		{ text: 'not', start: 23.26, end: 23.54 },
		{ text: 'just', start: 23.54, end: 23.86 },
		{ text: 'a', start: 23.86, end: 24.02 },
		{ text: 'convenience.', start: 24.02, end: 24.52 },
		{ text: 'It', start: 24.98, end: 25.12 },
		{ text: 'became', start: 25.12, end: 25.48 },
		{ text: 'essential', start: 25.48, end: 26.26 },
		{ text: 'infrastructure.', start: 26.26, end: 27.06 },
		{ text: 'The', start: 27.06, end: 27.7 },
		{ text: 'warehouses,', start: 27.7, end: 28.28 },
		{ text: 'the', start: 28.6, end: 28.64 },
		{ text: 'delivery', start: 28.64, end: 28.94 },
		{ text: 'trucks,', start: 28.94, end: 29.38 },
		{ text: 'the', start: 29.7, end: 29.78 },
		{ text: 'website,', start: 29.78, end: 30.24 },
		{ text: 'the', start: 30.52, end: 30.6 },
		{ text: 'cloud', start: 30.6, end: 30.9 },
		{ text: 'servers,', start: 30.9, end: 31.34 },
		{ text: 'powering', start: 31.58, end: 31.92 },
		{ text: 'Netflix', start: 31.92, end: 32.14 },
		{ text: 'and', start: 32.14, end: 32.58 },
		{ text: 'Zoom,', start: 32.58, end: 32.82 },
		{ text: 'it', start: 33.16, end: 33.36 },
		{ text: 'was', start: 33.36, end: 33.48 },
		{ text: 'all', start: 33.48, end: 33.84 },
		{ text: 'put', start: 33.84, end: 34.12 },
		{ text: 'to', start: 34.12, end: 34.38 },
		{ text: 'the', start: 34.38, end: 34.5 },
		{ text: 'ultimate', start: 34.5, end: 34.94 },
		{ text: 'test.', start: 34.94, end: 35.48 },
		{ text: 'The', start: 35.84, end: 36.08 },
		{ text: 'system', start: 36.08, end: 36.5 },
		{ text: 'strained,', start: 36.5, end: 37.14 },
		{ text: 'delivery', start: 37.44, end: 37.74 },
		{ text: 'time', start: 37.74, end: 38.04 },
		{ text: 'slipped,', start: 38.04, end: 38.44 },
		{ text: 'but', start: 38.8, end: 38.94 },
		{ text: 'it', start: 38.94, end: 39.08 },
		{ text: 'did', start: 39.08, end: 39.24 },
		{ text: 'not', start: 39.24, end: 39.56 },
		{ text: 'break.', start: 39.56, end: 39.92 },
		{ text: 'While', start: 40.48, end: 40.7 },
		{ text: 'other', start: 40.7, end: 41.0 },
		{ text: 'businesses', start: 41.0, end: 41.5 },
		{ text: 'collapsed,', start: 41.5, end: 42.02 },
		{ text: 'Amazon', start: 42.48, end: 42.72 },
		{ text: 'hired.', start: 42.72, end: 43.24 },
		{ text: 'They', start: 43.62, end: 43.86 },
		{ text: 'hired', start: 43.86, end: 44.14 },
		{ text: '175,000', start: 44.14, end: 46.02 },
		{ text: 'new', start: 46.02, end: 46.26 },
		{ text: 'workers', start: 46.26, end: 46.58 },
		{ text: 'in', start: 46.58, end: 46.84 },
		{ text: 'just', start: 46.84, end: 47.12 },
		{ text: 'a', start: 47.12, end: 47.36 },
		{ text: 'few', start: 47.36, end: 47.48 },
		{ text: 'months.', start: 47.48, end: 47.82 },
		{ text: 'Their', start: 48.38, end: 48.56 },
		{ text: 'revenue', start: 48.56, end: 48.98 },
		{ text: 'for', start: 48.98, end: 49.22 },
		{ text: 'the', start: 49.22, end: 49.32 },
		{ text: 'second', start: 49.32, end: 49.64 },
		{ text: 'quarter', start: 49.64, end: 50.02 },
		{ text: 'of', start: 50.02, end: 50.18 },
		{ text: '2020', start: 50.18, end: 50.7 },
		{ text: 'exploded,', start: 50.7, end: 51.78 },
		{ text: 'up', start: 52.08, end: 52.28 },
		{ text: '40%', start: 52.28, end: 53.1 },
		{ text: 'to', start: 53.1, end: 53.44 },
		{ text: '$88.9', start: 53.44, end: 54.6 },
		{ text: 'billion.', start: 54.6, end: 55.08 },
		{ text: 'The', start: 55.84, end: 56.36 },
		{ text: 'pandemic', start: 56.36, end: 56.88 },
		{ text: 'was', start: 56.88, end: 57.18 },
		{ text: 'a', start: 57.18, end: 57.3 },
		{ text: 'tragedy', start: 57.3, end: 57.74 },
		{ text: 'for', start: 57.74, end: 58.0 },
		{ text: 'the', start: 58.0, end: 58.12 },
		{ text: 'world,', start: 58.12, end: 58.42 },
		{ text: 'but', start: 58.66, end: 58.88 },
		{ text: 'for', start: 58.88, end: 59.06 },
		{ text: "Amazon's", start: 59.06, end: 59.68 },
		{ text: 'business', start: 59.68, end: 59.94 },
		{ text: 'model,', start: 59.94, end: 60.32 },
		{ text: 'it', start: 60.52, end: 60.7 },
		{ text: 'was', start: 60.7, end: 60.84 },
		{ text: 'the', start: 60.84, end: 61.02 },
		{ text: 'ultimate', start: 61.02, end: 61.52 },
		{ text: 'validation.', start: 61.52, end: 62.22 },
		{ text: 'Every', start: 62.8, end: 63.2 },
		{ text: 'bet', start: 63.2, end: 63.46 },
		{ text: 'they', start: 63.46, end: 63.66 },
		{ text: 'had', start: 63.66, end: 63.82 },
		{ text: 'ever', start: 63.82, end: 64.18 },
		{ text: 'made', start: 64.18, end: 64.44 },
		{ text: 'on', start: 64.44, end: 64.6 },
		{ text: 'logistics,', start: 64.6, end: 65.1 },
		{ text: 'on', start: 65.42, end: 65.52 },
		{ text: 'infrastructure,', start: 65.52, end: 66.08 },
		{ text: 'on', start: 66.5, end: 66.62 },
		{ text: 'long-term', start: 66.62, end: 67.12 },
		{ text: 'thinking,', start: 67.12, end: 67.58 },
		{ text: 'paid', start: 67.98, end: 68.12 },
		{ text: 'off', start: 68.12, end: 68.46 },
		{ text: 'in', start: 68.46, end: 68.68 },
		{ text: 'the', start: 68.68, end: 68.78 },
		{ text: 'moment', start: 68.78, end: 69.1 },
		{ text: 'the', start: 69.1, end: 69.32 },
		{ text: 'world', start: 69.32, end: 69.6 },
		{ text: 'needed', start: 69.6, end: 69.96 },
		{ text: 'it', start: 69.96, end: 70.14 },
		{ text: 'most.', start: 70.14, end: 70.4 },
	];

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_8.wav')} />

      {/* --- SCENE 1: The System in a Crisis --- */}
      <Sequence from={sec(0)} durationInFrames={sec(5)}>
        {/* assets/images/abstract-background.jpg: Dark, textured background for a serious tone. */}
        <AnimatedLayer src="assets/images/abstract-background.jpg" durationInFrames={sec(5)} zoomStart={1.1} zoomEnd={1.2} />
        {/* assets/images/gears-system.png: Detailed mechanical gears with transparent background, representing a complex system. */}
        <AnimatedLayer src="assets/images/gears-system.png" durationInFrames={sec(5)} zoomStart={1.0} zoomEnd={1.1} panXStart={-20} panXEnd={20} />
        <TextSequence words={transcript.slice(0, 11)} from={sec(0)} durationInFrames={sec(5)} />
      </Sequence>

      {/* --- SCENE 2: The World Stopped --- */}
      <Sequence from={sec(5)} durationInFrames={sec(5)}>
        {/* assets/images/city-night-2019.jpg: Busy city street with light trails, representing a normal, pre-pandemic world. */}
        <AnimatedLayer src="assets/images/city-night-2019.jpg" durationInFrames={sec(5)} zoomStart={1.2} zoomEnd={1} />
        {/* assets/images/empty-city.jpg: The same city street but deserted, symbolizing the global shutdown. */}
        <AnimatedLayer src="assets/images/empty-city.jpg" from={sec(5)+sec(3.5)} durationInFrames={sec(1.5)} zoomStart={1} zoomEnd={1.1} opacityStart={1} opacityEnd={1}/>
        <TextSequence words={transcript.slice(11, 21)} from={sec(5)} durationInFrames={sec(5)} />
      </Sequence>

      {/* --- SCENE 3: The Pandemic --- */}
      <Sequence from={sec(9.5)} durationInFrames={sec(4.5)}>
        <AnimatedLayer src="assets/images/empty-city.jpg" durationInFrames={sec(4.5)} zoomStart={1.1} zoomEnd={1.3} panYStart={0} panYEnd={-30} />
        {/* assets/images/virus-particle.png: A stylized 3D model of a virus, on a transparent background, to visualize the cause. */}
        <AnimatedLayer src="assets/images/virus-particle.png" durationInFrames={sec(4.5)} zoomStart={0.5} zoomEnd={0.7} panXStart={-100} panXEnd={100} panYStart={50} panYEnd={-50} />
        {/* assets/images/closed-sign.png: A glowing neon 'CLOSED' sign with transparent background for emphasis. */}
        <AnimatedLayer src="assets/images/closed-sign.png" from={sec(9.5) + sec(2)} durationInFrames={sec(2.5)} zoomStart={0.4} zoomEnd={0.5} />
        <TextSequence words={transcript.slice(21, 29)} from={sec(9.5)} durationInFrames={sec(4.5)} top={80} left={10} />
      </Sequence>

      {/* --- SCENE 4: Lockdown --- */}
      <Sequence from={sec(14)} durationInFrames={sec(4.5)}>
        {/* assets/images/empty-office.jpg: A deserted modern office space, a full-screen background image. */}
        <AnimatedLayer src="assets/images/empty-office.jpg" durationInFrames={sec(4.5)} zoomStart={1} zoomEnd={1.1} panXStart={-20} panXEnd={20} />
        {/* assets/images/window-silhouette.png: A person in silhouette looking out a window, transparent, conveying isolation. */}
        <AnimatedLayer src="assets/images/window-silhouette.png" durationInFrames={sec(4.5)} zoomStart={1.2} zoomEnd={1.1} panXStart={50} panXEnd={-50} />
        <TextSequence words={transcript.slice(29, 39)} from={sec(14)} durationInFrames={sec(4.5)} />
      </Sequence>

      {/* --- SCENE 5: Amazon's Machine --- */}
      <Sequence from={sec(18.5)} durationInFrames={sec(6.5)}>
        {/* assets/images/blueprint-grid.jpg: A technical blueprint background, symbolizing design and strategy. */}
        <AnimatedLayer src="assets/images/blueprint-grid.jpg" durationInFrames={sec(6.5)} zoomStart={1.5} zoomEnd={1} />
        {/* assets/images/logistics-network.png: Glowing lines over a map, transparent, representing Amazon's vast network. */}
        <AnimatedLayer src="assets/images/logistics-network.png" durationInFrames={sec(6.5)} zoomStart={1} zoomEnd={1.2} panYStart={30} panYEnd={-30}/>
        {/* assets/images/amazon-box.png: The iconic cardboard box, transparent, as the tangible result of the system. */}
        <AnimatedLayer src="assets/images/amazon-box.png" durationInFrames={sec(6.5)} zoomStart={0.3} zoomEnd={0.4} panXStart={-50} panXEnd={50} />
        <TextSequence words={transcript.slice(39, 53)} from={sec(18.5)} durationInFrames={sec(6.5)} top={75} />
      </Sequence>

      {/* --- SCENE 6: Essential Infrastructure --- */}
      <Sequence from={sec(25)} durationInFrames={sec(11)}>
        {/* assets/images/modern-bridge.jpg: A massive bridge at dusk, a metaphor for essential infrastructure. */}
        <AnimatedLayer src="assets/images/modern-bridge.jpg" durationInFrames={sec(11)} zoomStart={1} zoomEnd={1.2} />
        {/* assets/images/server-room.jpg: A data center, representing AWS, a core part of the infrastructure. */}
        <AnimatedLayer src="assets/images/server-room.jpg" from={sec(25)+sec(4)} durationInFrames={sec(7)} zoomStart={1.2} zoomEnd={1} panXStart={-40} panXEnd={40} />
        <TextSequence words={transcript.slice(53, 76)} from={sec(25)} durationInFrames={sec(11)} />
      </Sequence>

      {/* --- SCENE 7: The Ultimate Test --- */}
      <Sequence from={sec(35.5)} durationInFrames={sec(5)}>
        {/* assets/images/strained-chain.png: A glowing, taut metal chain on a transparent background, visualizing strain. */}
        <AnimatedLayer src="assets/images/strained-chain.png" durationInFrames={sec(5)} zoomStart={1} zoomEnd={1.2} />
        <TextSequence words={transcript.slice(76, 86)} from={sec(35.5)} durationInFrames={sec(5)} top={80}/>
      </Sequence>

      {/* --- SCENE 8: Amazon Hired --- */}
      <Sequence from={sec(40)} durationInFrames={sec(8)}>
        {/* assets/images/for-lease-sign.jpg: A 'For Lease' sign on a closed business, showing economic decline. */}
        <AnimatedLayer src="assets/images/for-lease-sign.jpg" durationInFrames={sec(4)} zoomStart={1} zoomEnd={1.1} />
        {/* assets/images/active-warehouse.jpg: A busy Amazon warehouse, contrasting with the previous image to show growth. */}
        <AnimatedLayer src="assets/images/active-warehouse.jpg" from={sec(40) + sec(2.5)} durationInFrames={sec(5.5)} zoomStart={1.2} zoomEnd={1} />
        <TextSequence words={transcript.slice(86, 100)} from={sec(40)} durationInFrames={sec(8)} />
      </Sequence>

      {/* --- SCENE 9: Revenue Explodes --- */}
      <Sequence from={sec(48)} durationInFrames={sec(7.5)}>
        {/* assets/images/stock-market-up.jpg: Abstract background of rising green stock charts. */}
        <AnimatedLayer src="assets/images/stock-market-up.jpg" durationInFrames={sec(7.5)} zoomStart={1} zoomEnd={1.2} panXStart={0} panXEnd={-50} />
        <TextSequence words={transcript.slice(100, 112)} from={sec(48)} durationInFrames={sec(7.5)} />
      </Sequence>
      
      {/* --- SCENE 10: Ultimate Validation --- */}
      <Sequence from={sec(55.5)} durationInFrames={sec(7)}>
        {/* assets/images/earth-glow.jpg: A beautiful view of Earth from space, providing a global context. */}
        <AnimatedLayer src="assets/images/earth-glow.jpg" durationInFrames={sec(7)} zoomStart={1} zoomEnd={1.1} />
        {/* assets/images/validated-stamp.png: A bold 'VALIDATED' stamp graphic on a transparent background. */}
        <AnimatedLayer src="assets/images/validated-stamp.png" from={sec(55.5)+sec(5.5)} durationInFrames={sec(1.5)} zoomStart={0.1} zoomEnd={0.5} opacityStart={1} opacityEnd={1}/>
        <TextSequence words={transcript.slice(112, 125)} from={sec(55.5)} durationInFrames={sec(7)} />
      </Sequence>

      {/* --- SCENE 11: The Long-Term Bets --- */}
      <Sequence from={sec(62.5)} durationInFrames={sec(8.5)}>
        <AnimatedLayer src="assets/images/earth-glow.jpg" durationInFrames={sec(8.5)} zoomStart={1.1} zoomEnd={1.3} />
        {/* assets/images/logistics-icon.png: Simple, clean icon for logistics, transparent background. */}
        <AnimatedLayer src="assets/images/logistics-icon.png" from={sec(62.5) + sec(1.5)} durationInFrames={sec(7)} zoomStart={0.3} zoomEnd={0.3} panXStart={-300} panXEnd={-300} />
        {/* assets/images/infrastructure-icon.png: Simple, clean icon for infrastructure, transparent background. */}
        <AnimatedLayer src="assets/images/infrastructure-icon.png" from={sec(62.5) + sec(2.5)} durationInFrames={sec(6)} zoomStart={0.3} zoomEnd={0.3} />
        {/* assets/images/thinking-icon.png: Simple, clean icon for long-term thinking, transparent background. */}
        <AnimatedLayer src="assets/images/thinking-icon.png" from={sec(62.5) + sec(3.5)} durationInFrames={sec(5)} zoomStart={0.3} zoomEnd={0.3} panXStart={300} panXEnd={300} />
        {/* assets/images/amazon-logo-glow.png: The Amazon smile logo with a soft glow, transparent background. */}
        <AnimatedLayer src="assets/images/amazon-logo-glow.png" from={sec(62.5) + sec(5.5)} durationInFrames={sec(3)} zoomStart={0.5} zoomEnd={0.6} />
        <TextSequence words={transcript.slice(125)} from={sec(62.5)} durationInFrames={sec(8.5)} top={80}/>
      </Sequence>
    </AbsoluteFill>
  );
};
```