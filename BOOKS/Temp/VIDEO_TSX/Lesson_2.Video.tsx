```tsx
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { interpolate, Easing, spring } from 'remotion';
import React from 'react';

// --- Helper Functions and Data ---

const fps = 30;

const timeToFrames = (seconds: number) => Math.round(seconds * fps);

const transcript = [
  { text: 'Key', start: 0.0, end: 0.48 },
  { text: 'lesson.', start: 0.48, end: 0.94 },
  { text: 'The', start: 1.34, end: 1.56 },
  { text: 'market', start: 1.56, end: 1.96 },
  { text: 'is', start: 1.96, end: 2.28 },
  { text: 'a', start: 2.28, end: 2.36 },
  { text: 'mood', start: 2.36, end: 2.62 },
  { text: 'swing.', start: 2.62, end: 3.0 },
  { text: 'Your', start: 3.42, end: 3.52 },
  { text: 'strategy', start: 3.52, end: 4.12 },
  { text: 'is', start: 4.12, end: 4.5 },
  { text: 'a', start: 4.5, end: 4.56 },
  { text: 'compass.', start: 4.56, end: 4.92 },
  { text: 'The', start: 5.82, end: 5.88 },
  { text: 'bubble', start: 5.88, end: 6.2 },
  { text: 'burst.', start: 6.2, end: 6.74 },
  { text: 'From', start: 7.26, end: 7.36 },
  { text: 'late', start: 7.36, end: 7.64 },
  { text: '1999', start: 7.64, end: 8.22 },
  { text: 'through', start: 8.22, end: 8.88 },
  { text: '2001,', start: 8.88, end: 9.62 },
  { text: 'the', start: 10.06, end: 10.12 },
  { text: 'party', start: 10.12, end: 10.42 },
  { text: 'ended.', start: 10.42, end: 10.92 },
  { text: '.com', start: 11.52, end: 11.9 },
  { text: 'companies', start: 11.9, end: 12.44 },
  { text: 'vanished', start: 12.44, end: 13.02 },
  { text: 'overnight.', start: 13.02, end: 13.64 },
  { text: 'Pets', start: 14.28, end: 14.48 },
  { text: '.com.', start: 14.48, end: 14.98 },
  { text: 'Webvan.', start: 15.34, end: 15.78 },
  { text: 'Gone.', start: 16.22, end: 16.4 },
  { text: 'Wall', start: 16.92, end: 17.26 },
  { text: 'Street', start: 17.26, end: 17.56 },
  { text: 'turned', start: 17.56, end: 17.98 },
  { text: 'on', start: 17.98, end: 18.3 },
  { text: 'Amazon.', start: 18.3, end: 18.58 },
  { text: 'They', start: 19.1, end: 19.3 },
  { text: 'called', start: 19.3, end: 19.52 },
  { text: 'it', start: 19.52, end: 19.74 },
  { text: 'Amazon', start: 19.74, end: 20.24 },
  { text: 'Bomb.', start: 20.24, end: 20.64 },
  { text: 'The', start: 21.2, end: 21.46 },
  { text: 'stock', start: 21.46, end: 21.82 },
  { text: 'which', start: 21.82, end: 22.2 },
  { text: 'peaked', start: 22.2, end: 22.58 },
  { text: 'at', start: 22.58, end: 22.68 },
  { text: 'over', start: 22.68, end: 22.94 },
  { text: '$100', start: 22.94, end: 23.58 },
  { text: 'crashed.', start: 23.58, end: 24.58 },
  { text: 'It', start: 25.22, end: 25.44 },
  { text: 'fell', start: 25.44, end: 25.7 },
  { text: 'and', start: 25.7, end: 26.08 },
  { text: 'fell', start: 26.08, end: 26.38 },
  { text: 'until', start: 26.38, end: 26.92 },
  { text: 'it', start: 26.92, end: 27.1 },
  { text: 'was', start: 27.1, end: 27.2 },
  { text: 'worth', start: 27.2, end: 27.44 },
  { text: 'less', start: 27.44, end: 27.72 },
  { text: 'than', start: 27.72, end: 27.96 },
  { text: '$6', start: 27.96, end: 28.5 },
  { text: 'a', start: 28.5, end: 28.94 },
  { text: 'share.', start: 28.94, end: 29.24 },
  { text: 'A', start: 29.24, end: 29.84 },
  { text: 'drop', start: 29.84, end: 30.06 },
  { text: 'of', start: 30.06, end: 30.32 },
  { text: 'over', start: 30.32, end: 30.58 },
  { text: '90%.', start: 30.58, end: 31.8 },
  { text: 'Imagine', start: 31.8, end: 32.68 },
  { text: 'that.', start: 32.68, end: 33.02 },
  { text: 'Your', start: 33.56, end: 33.6 },
  { text: 'life\'s', start: 33.6, end: 34.14 },
  { text: 'work.', start: 34.14, end: 34.38 },
  { text: 'Your', start: 34.74, end: 34.8 },
  { text: 'entire', start: 34.8, end: 35.34 },
  { text: 'net', start: 35.34, end: 35.62 },
  { text: 'worth', start: 35.62, end: 35.96 },
  { text: 'evaporating', start: 35.96, end: 36.92 },
  { text: 'by', start: 36.92, end: 37.12 },
  { text: '90%.', start: 37.12, end: 38.3 },
  { text: 'Most', start: 38.3, end: 39.0 },
  { text: 'founders', start: 39.0, end: 39.42 },
  { text: 'would', start: 39.42, end: 39.64 },
  { text: 'panic.', start: 39.64, end: 40.02 },
  { text: 'They', start: 40.52, end: 40.64 },
  { text: 'would', start: 40.64, end: 40.76 },
  { text: 'cut', start: 40.76, end: 40.98 },
  { text: 'costs', start: 40.98, end: 41.44 },
  { text: 'to', start: 41.44, end: 41.6 },
  { text: 'the', start: 41.6, end: 41.72 },
  { text: 'bone.', start: 41.72, end: 42.06 },
  { text: 'They', start: 42.42, end: 42.5 },
  { text: 'would', start: 42.5, end: 42.6 },
  { text: 'try', start: 42.6, end: 42.86 },
  { text: 'to', start: 42.86, end: 42.98 },
  { text: 'show', start: 42.98, end: 43.16 },
  { text: 'a', start: 43.16, end: 43.3 },
  { text: 'profit.', start: 43.3, end: 43.76 },
  { text: 'Any', start: 44.1, end: 44.32 },
  { text: 'profit.', start: 44.32, end: 44.76 },
  { text: 'To', start: 45.1, end: 45.2 },
  { text: 'calm', start: 45.2, end: 45.46 },
  { text: 'the', start: 45.46, end: 45.66 },
  { text: 'investors.', start: 45.66, end: 46.2 },
  { text: 'Bezos', start: 46.84, end: 47.22 },
  { text: 'did', start: 47.22, end: 47.5 },
  { text: 'the', start: 47.5, end: 47.66 },
  { text: 'opposite.', start: 47.66, end: 48.08 },
  { text: 'He', start: 48.54, end: 48.66 },
  { text: 'kept', start: 48.66, end: 49.02 },
  { text: 'building.', start: 49.02, end: 49.44 },
  { text: 'He', start: 50.02, end: 50.26 },
  { text: 'knew', start: 50.26, end: 50.52 },
  { text: 'the', start: 50.52, end: 50.68 },
  { text: 'market', start: 50.68, end: 51.04 },
  { text: 'was', start: 51.04, end: 51.3 },
  { text: 'just', start: 51.3, end: 51.6 },
  { text: 'noise.', start: 51.6, end: 52.0 },
  { text: 'It', start: 52.52, end: 52.62 },
  { text: 'was', start: 52.62, end: 52.78 },
  { text: 'fear', start: 52.78, end: 53.08 },
  { text: 'and', start: 53.08, end: 53.42 },
  { text: 'greed.', start: 53.42, end: 53.66 },
  { text: 'His', start: 54.22, end: 54.42 },
  { text: 'strategy', start: 54.42, end: 54.96 },
  { text: 'was', start: 54.96, end: 55.32 },
  { text: 'the', start: 55.32, end: 55.5 },
  { text: 'signal.', start: 55.5, end: 55.88 },
  { text: 'He', start: 56.56, end: 56.88 },
  { text: 'needed', start: 56.88, end: 57.1 },
  { text: 'to', start: 57.1, end: 57.48 },
  { text: 'survive', start: 57.48, end: 57.8 },
  { text: 'the', start: 57.8, end: 58.22 },
  { text: 'storm.', start: 58.22, end: 58.22 },
  { text: 'Not', start: 58.6, end: 58.76 },
  { text: 'abandon', start: 58.76, end: 59.24 },
  { text: 'the', start: 59.24, end: 59.46 },
  { text: 'ship.', start: 59.46, end: 59.68 },
];

const sentenceGroups = [
	// Group words into visually coherent sentences or phrases
	{ words: [0, 1], start: 0.0, end: 1.34, line: 0 },
	{ words: [2, 3, 4, 5, 6, 7], start: 1.34, end: 3.42, line: 0 },
	{ words: [8, 9, 10, 11, 12], start: 3.42, end: 5.82, line: 0 },
	{ words: [13, 14, 15], start: 5.82, end: 7.26, line: 0 },
	{ words: [16, 17, 18, 19, 20], start: 7.26, end: 10.06, line: 1 },
	{ words: [21, 22, 23], start: 10.06, end: 11.52, line: 0 },
	{ words: [24, 25, 26, 27], start: 11.52, end: 14.28, line: 1 },
	{ words: [28, 29], start: 14.28, end: 15.34, line: 0 },
	{ words: [30], start: 15.34, end: 16.22, line: 1 },
	{ words: [31], start: 16.22, end: 16.92, line: 2 },
	{ words: [32, 33, 34, 35, 36], start: 16.92, end: 19.1, line: 0 },
	{ words: [37, 38, 39, 40, 41], start: 19.1, end: 21.2, line: 1 },
	{ words: [42, 43, 44, 45, 46, 47, 48, 49], start: 21.2, end: 25.22, line: 0 },
	{ words: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62], start: 25.22, end: 29.24, line: 1 },
	{ words: [63, 64, 65, 66, 67], start: 29.24, end: 31.8, line: 0 },
	{ words: [68, 69], start: 31.8, end: 33.56, line: 1 },
	{ words: [70, 71, 72], start: 33.56, end: 34.74, line: 0 },
	{ words: [73, 74, 75, 76, 77, 78, 79], start: 34.74, end: 38.3, line: 1 },
	{ words: [80, 81, 82, 83], start: 38.3, end: 40.52, line: 0 },
	{ words: [84, 85, 86, 87, 88, 89, 90], start: 40.52, end: 42.42, line: 1 },
	{ words: [91, 92, 93, 94, 95, 96, 97], start: 42.42, end: 44.1, line: 0 },
	{ words: [98, 99], start: 44.1, end: 45.1, line: 1 },
	{ words: [100, 101, 102, 103], start: 45.1, end: 46.84, line: 2 },
	{ words: [104, 105, 106, 107], start: 46.84, end: 48.54, line: 0 },
	{ words: [108, 109, 110], start: 48.54, end: 50.02, line: 1 },
	{ words: [111, 112, 113, 114, 115, 116, 117], start: 50.02, end: 52.52, line: 0 },
	{ words: [118, 119, 120, 121, 122], start: 52.52, end: 54.22, line: 1 },
	{ words: [123, 124, 125, 126, 127], start: 54.22, end: 56.56, line: 0 },
	{ words: [128, 129, 130, 131, 132, 133], start: 56.56, end: 58.6, line: 1 },
	{ words: [134, 135, 136, 137], start: 58.6, end: 61, line: 0 },
];

// --- Components ---

const Word: React.FC<{ text: string; start: number; end: number }> = ({
  text,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [timeToFrames(start), timeToFrames(start) + 6, timeToFrames(end), timeToFrames(end) + 6],
    [0, 1, 1, 0]
  );

  return (
    <span style={{ opacity, marginRight: '1.2rem', display: 'inline-block' }}>
      {text}
    </span>
  );
};

const TextDisplay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Georgia, serif',
        fontSize: '90px',
        color: 'rgba(255, 255, 240, 0.9)',
        textShadow: '0 0 20px rgba(0,0,0,0.7)',
        textAlign: 'center',
        padding: '0 10%',
      }}
    >
      <div>
        {sentenceGroups.map((group, i) => (
          <div key={i}>
            {group.words.map((wordIndex) => (
              <Word
                key={wordIndex}
                text={transcript[wordIndex].text}
                start={transcript[wordIndex].start}
                end={transcript[wordIndex].end}
              />
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Parallax Image Component
const ParallaxImage: React.FC<{
	src: string;
	zoomMultiplier: number; // e.g., 1.1 for subtle zoom, 1.3 for more
	panX?: number; // e.g., -100 to 100
	panY?: number; // e.g., -100 to 100
	opacity?: number;
}> = ({ src, zoomMultiplier, panX = 0, panY = 0, opacity = 1 }) => {
	const { durationInFrames } = useVideoConfig();
	const frame = useCurrentFrame();

	const scale = interpolate(frame, [0, durationInFrames], [1, zoomMultiplier]);
	const translateX = interpolate(frame, [0, durationInFrames], [0, panX]);
	const translateY = interpolate(frame, [0, durationInFrames], [0, panY]);

	return (
		<Img
			src={staticFile(src)}
			style={{
				position: 'absolute',
				width: '100%',
				height: '100%',
				objectFit: 'cover',
				opacity,
				transform: `scale(${scale}) translateX(${translateX}px) translateY(${translateY}px)`,
			}}
		/>
	);
};

// --- Main Scenes ---

const Scene: React.FC<{
  children: React.ReactNode;
  from: number;
  durationInFrames: number;
}> = ({ children, from, durationInFrames }) => {
  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <AbsoluteFill>{children}</AbsoluteFill>
    </Sequence>
  );
};

export const RemotionVideo: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_2.wav')} />

      {/* Scene 1: Key Lesson */}
      <Scene from={0} durationInFrames={timeToFrames(1.34)}>
        {/*
          Image assets required:
          - assets/images/background_abstract_light.jpg: A soft, out-of-focus light texture.
          - assets/images/key_golden.png: An ornate golden key with a transparent background.
        */}
        <ParallaxImage src="assets/images/background_abstract_light.jpg" zoomMultiplier={1.15} />
        <ParallaxImage src="assets/images/key_golden.png" zoomMultiplier={1.05} />
      </Scene>

      {/* Scene 2: Market is a Mood Swing */}
      <Scene from={timeToFrames(1.34)} durationInFrames={timeToFrames(3.42 - 1.34)}>
        {/*
          Image assets required:
          - assets/images/background_market_chart_blur.jpg: A blurry, abstract stock chart.
          - assets/images/swing_pendulum.png: A large pendulum with a transparent background.
        */}
        <ParallaxImage src="assets/images/background_market_chart_blur.jpg" zoomMultiplier={1.2} panX={50} />
        <ParallaxImage src="assets/images/swing_pendulum.png" zoomMultiplier={1.05} panX={-30} />
      </Scene>

      {/* Scene 3: Strategy is a Compass */}
      <Scene from={timeToFrames(3.42)} durationInFrames={timeToFrames(5.82 - 3.42)}>
        {/*
          Image assets required:
          - assets/images/background_old_map.jpg: A textured, vintage world map.
          - assets/images/compass_vintage.png: An antique brass compass with a transparent background.
        */}
        <ParallaxImage src="assets/images/background_old_map.jpg" zoomMultiplier={1.25} panY={-50} />
        <ParallaxImage src="assets/images/compass_vintage.png" zoomMultiplier={1.1} panY={20} />
      </Scene>
      
      {/* Scene 4 & 5: Bubble Burst / Companies Vanished */}
      <Scene from={timeToFrames(5.82)} durationInFrames={timeToFrames(13.64 - 5.82)}>
        {/*
          Image assets required:
          - assets/images/background_city_night.jpg: A vibrant city skyline at night.
          - assets/images/bubbles_soap.png: Floating soap bubbles with a transparent background.
          - assets/images/smoke_effect.png: Wisps of smoke/dust on a transparent background.
        */}
        <ParallaxImage src="assets/images/background_city_night.jpg" zoomMultiplier={1.3} panX={-60} />
        <ParallaxImage src="assets/images/bubbles_soap.png" zoomMultiplier={1.1} panY={-40} />
        <ParallaxImage src="assets/images/smoke_effect.png" zoomMultiplier={1.2} opacity={interpolate(useCurrentFrame() - timeToFrames(5.82), [timeToFrames(4), timeToFrames(7)], [0, 0.7])} />
      </Scene>

      {/* Scene 6: Failed Companies */}
      <Scene from={timeToFrames(14.28)} durationInFrames={timeToFrames(16.92 - 14.28)}>
         {/*
          Image assets required:
          - assets/images/background_digital_graveyard.jpg: Dark, glitchy digital background.
          - assets/images/logo_petscom.png: Pets.com logo, transparent background.
          - assets/images/logo_webvan.png: Webvan logo, transparent background.
        */}
        <ParallaxImage src="assets/images/background_digital_graveyard.jpg" zoomMultiplier={1.1} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: '50px'}}>
            <Img src={staticFile('assets/images/logo_petscom.png')} style={{opacity: interpolate(useCurrentFrame(), [timeToFrames(14.28), timeToFrames(15.34)], [1, 0]), height: 200}}/>
            <Img src={staticFile('assets/images/logo_webvan.png')} style={{opacity: interpolate(useCurrentFrame(), [timeToFrames(15.34), timeToFrames(16.22)], [1, 0]), height: 200}}/>
        </AbsoluteFill>
      </Scene>

      {/* Scene 7: Amazon Bomb */}
      <Scene from={timeToFrames(16.92)} durationInFrames={timeToFrames(21.20 - 16.92)}>
        {/*
          Image assets required:
          - assets/images/background_wall_street.jpg: A dark, imposing shot of a Wall Street building.
          - assets/images/amazon_logo_old.png: Old Amazon logo, transparent background.
          - assets/images/bomb_cartoon.png: A cartoon bomb, transparent background.
        */}
        <ParallaxImage src="assets/images/background_wall_street.jpg" zoomMultiplier={1.2} panY={50} />
        <ParallaxImage src="assets/images/amazon_logo_old.png" zoomMultiplier={1.05} panX={-150} />
        <ParallaxImage src="assets/images/bomb_cartoon.png" zoomMultiplier={1.05} panX={150} />
      </Scene>

      {/* Scene 8 & 9: Stock Crash / 90% Drop */}
      <Scene from={timeToFrames(21.20)} durationInFrames={timeToFrames(33.56 - 21.20)}>
        {/*
          Image assets required:
          - assets/images/background_graph_paper.jpg: A simple graph paper texture.
          - assets/images/stock_chart_down.png: A stylized red line graph showing a dramatic drop, transparent background.
          - assets/images/shattering_glass.png: Glass shard fragments, transparent background.
        */}
        <ParallaxImage src="assets/images/background_graph_paper.jpg" zoomMultiplier={1.1} />
        <ParallaxImage src="assets/images/stock_chart_down.png" zoomMultiplier={1.0} />
        <ParallaxImage src="assets/images/shattering_glass.png" zoomMultiplier={1.2} opacity={interpolate(useCurrentFrame(), [timeToFrames(29.5), timeToFrames(31)], [0, 1])}/>
      </Scene>

      {/* Scene 10: Life's Work Evaporating */}
      <Scene from={timeToFrames(33.56)} durationInFrames={timeToFrames(38.30 - 33.56)}>
        {/*
          Image assets required:
          - assets/images/background_office_desk.jpg: A founder's desk with blueprints, etc.
          - assets/images/dust_particles.png: A particle overlay, transparent background.
        */}
        <ParallaxImage src="assets/images/background_office_desk.jpg" zoomMultiplier={1.2} panY={-40} />
        <ParallaxImage src="assets/images/dust_particles.png" zoomMultiplier={1.0} panY={-100} opacity={0.7} />
      </Scene>

      {/* Scene 11 & 12: Panic and Desperation */}
      <Scene from={timeToFrames(38.30)} durationInFrames={timeToFrames(46.84 - 38.30)}>
        {/*
          Image assets required:
          - assets/images/background_boardroom_tense.jpg: A dark, tense boardroom setting.
          - assets/images/scissors_cutting_rope.png: Scissors cutting a rope, transparent background.
        */}
        <ParallaxImage src="assets/images/background_boardroom_tense.jpg" zoomMultiplier={1.3} panX={70} />
        <ParallaxImage src="assets/images/scissors_cutting_rope.png" zoomMultiplier={1.1} panX={-50} />
      </Scene>
      
      {/* Scene 13: Bezos Kept Building */}
      <Scene from={timeToFrames(46.84)} durationInFrames={timeToFrames(50.02 - 46.84)}>
        {/*
          Image assets required:
          - assets/images/background_construction_site.jpg: A construction site at dawn.
          - assets/images/blueprints_glowing.png: Glowing blue blueprint lines, transparent background.
        */}
        <ParallaxImage src="assets/images/background_construction_site.jpg" zoomMultiplier={1.25} panY={-60} />
        <ParallaxImage src="assets/images/blueprints_glowing.png" zoomMultiplier={1.05} panY={-20} opacity={0.6} />
      </Scene>

      {/* Scene 14: Market is Noise */}
      <Scene from={timeToFrames(50.02)} durationInFrames={timeToFrames(54.22 - 50.02)}>
        {/*
          Image assets required:
          - assets/images/background_static_tv.jpg: A screen with TV static.
          - assets/images/bull_bear_fighting.png: Silhouettes of a bull and bear clashing, transparent background.
        */}
        <ParallaxImage src="assets/images/background_static_tv.jpg" zoomMultiplier={1.4} />
        <ParallaxImage src="assets/images/bull_bear_fighting.png" zoomMultiplier={1.1} />
      </Scene>

      {/* Scene 15 & 16: Strategy is the Signal */}
      <Scene from={timeToFrames(54.22)} durationInFrames={durationInFrames - timeToFrames(54.22)}>
        {/*
          Image assets required:
          - assets/images/background_stormy_sea.jpg: A dark, stormy ocean.
          - assets/images/ship_sturdy.png: A sturdy ship on the water, transparent background.
          - assets/images/lighthouse_beam.png: A strong beam of light, transparent background.
        */}
        <ParallaxImage src="assets/images/background_stormy_sea.jpg" zoomMultiplier={1.3} panX={-80} />
        <ParallaxImage src="assets/images/ship_sturdy.png" zoomMultiplier={1.15} panX={-40} />
        <ParallaxImage src="assets/images/lighthouse_beam.png" zoomMultiplier={1.0} />
      </Scene>

      <TextDisplay />
    </AbsoluteFill>
  );
};

```