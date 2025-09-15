```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from 'remotion';
import React from 'react';

// --- Helper Components ---

// Component for word-by-word synchronized text
const Word = ({
  text,
  start,
  duration,
}: {
  text: string;
  start: number;
  duration: number;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 5], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const blur = interpolate(frame, [start, start + 5], [10, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <span
      style={{
        display: 'inline-block',
        margin: '0 0.25em',
        opacity,
        filter: `blur(${blur}px)`,
        transform: `translateY(${interpolate(
          frame,
          [start, start + 5],
          [10, 0],
          {
            extrapolateRight: 'clamp',
          }
        )}px)`,
      }}
    >
      {text}
    </span>
  );
};

// Component to handle a sentence with multiple words
const Subtitle = ({
  words,
  style,
}: {
  words: { text: string; start: number; end: number }[];
  style?: React.CSSProperties;
}) => {
  return (
    <div
      style={{
        width: '100%',
        textAlign: 'center',
        position: 'absolute',
        bottom: '15%',
        fontSize: '72px',
        fontWeight: 'bold',
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: 'white',
        textShadow: '0 0 15px rgba(0,0,0,0.8)',
        ...style,
      }}
    >
      {words.map((word) => (
        <Word
          key={word.text + word.start}
          text={word.text}
          start={word.start * 30}
          duration={(word.end - word.start) * 30}
        />
      ))}
    </div>
  );
};

// Component for a scene with parallax effect
const ParallaxScene = ({
  children,
  durationInFrames,
  from,
  zoom = 1.1,
  panX = 0,
  panY = 0,
  rotate = 0,
}: {
  children: React.ReactNode;
  durationInFrames: number;
  from: number;
  zoom?: number;
  panX?: number;
  panY?: number;
  rotate?: number;
}) => {
  const frame = useCurrentFrame();
  const sequenceFrame = frame - from;

  const sceneProgress = interpolate(sequenceFrame, [0, durationInFrames], [0, 1]);

  const scale = interpolate(sceneProgress, [0, 1], [1, zoom]);
  const translateX = interpolate(sceneProgress, [0, 1], [0, panX]);
  const translateY = interpolate(sceneProgress, [0, 1], [0, panY]);
  const rotation = interpolate(sceneProgress, [0, 1], [0, rotate]);

  const opacity = interpolate(
    sequenceFrame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0]
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale}) translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const ImageLayer = ({
  src,
  parallax = 1,
  scale = 1,
  opacity = 1,
  style,
}: {
  src: string;
  parallax?: number;
  scale?: number;
  opacity?: number;
  style?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const move = interpolate(frame, [0, 1575], [0, -width * 0.1 * parallax]);

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: `url(${staticFile(src)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `translateX(${move}px) scale(${scale})`,
        opacity,
        ...style,
      }}
    />
  );
};

// --- Transcript Data ---

const transcript = [
  { text: 'Key', start: 0.0, end: 0.44 },
  { text: 'lesson.', start: 0.44, end: 0.8 },
  { text: 'Profitability', start: 1.66, end: 2.28 },
  { text: 'is', start: 2.28, end: 2.58 },
  { text: 'a', start: 2.58, end: 2.68 },
  { text: 'weapon,', start: 2.68, end: 3.02 },
  { text: 'not', start: 3.4, end: 3.64 },
  { text: 'just', start: 3.64, end: 3.92 },
  { text: 'a', start: 3.92, end: 4.08 },
  { text: 'goal.', start: 4.08, end: 4.3 },
  { text: 'Now', start: 5.38, end: 5.64 },
  { text: 'is', start: 5.64, end: 5.9 },
  { text: '2003.', start: 5.9, end: 6.76 },
  { text: 'The', start: 7.38, end: 7.46 },
  { text: '.com', start: 7.46, end: 8.04 },
  { text: 'graveyard', start: 8.04, end: 8.5 },
  { text: 'is', start: 8.5, end: 8.9 },
  { text: 'full.', start: 8.9, end: 9.24 },
  { text: 'Amazon', start: 9.9, end: 10.24 },
  { text: 'is', start: 10.24, end: 10.56 },
  { text: 'still', start: 10.56, end: 10.82 },
  { text: 'standing,', start: 10.82, end: 11.28 },
  { text: 'but', start: 11.66, end: 11.78 },
  { text: 'it', start: 11.78, end: 11.88 },
  { text: 'is', start: 11.88, end: 12.06 },
  { text: 'wounded.', start: 12.06, end: 12.44 },
  { text: 'The', start: 12.92, end: 13.08 },
  { text: 'pressure', start: 13.08, end: 13.5 },
  { text: 'is', start: 13.5, end: 13.8 },
  { text: 'immense.', start: 13.8, end: 14.18 },
  { text: 'They', start: 14.96, end: 15.16 },
  { text: 'had', start: 15.16, end: 15.46 },
  { text: 'to', start: 15.46, end: 15.66 },
  { text: 'prove', start: 15.66, end: 15.96 },
  { text: 'the', start: 15.96, end: 16.2 },
  { text: 'model', start: 16.2, end: 16.4 },
  { text: 'worked.', start: 16.4, end: 16.82 },
  { text: 'They', start: 17.28, end: 17.46 },
  { text: 'had', start: 17.46, end: 17.7 },
  { text: 'to', start: 17.7, end: 17.9 },
  { text: 'show', start: 17.9, end: 18.16 },
  { text: 'they', start: 18.16, end: 18.34 },
  { text: 'could', start: 18.34, end: 18.5 },
  { text: 'actually', start: 18.5, end: 19.0 },
  { text: 'make', start: 19.0, end: 19.28 },
  { text: 'money.', start: 19.28, end: 19.66 },
  { text: 'And', start: 19.66, end: 20.48 },
  { text: 'the', start: 20.48, end: 20.6 },
  { text: 'fourth', start: 20.6, end: 20.92 },
  { text: 'quarter', start: 20.92, end: 21.2 },
  { text: 'of', start: 21.2, end: 21.4 },
  { text: '2001,', start: 21.4, end: 22.06 },
  { text: 'they', start: 22.46, end: 22.54 },
  { text: 'posted', start: 22.54, end: 22.98 },
  { text: 'their', start: 22.98, end: 23.2 },
  { text: 'first', start: 23.2, end: 23.68 },
  { text: 'ever', start: 23.68, end: 24.0 },
  { text: 'profit.', start: 24.0, end: 24.4 },
  { text: 'It', start: 24.92, end: 25.16 },
  { text: 'was', start: 25.16, end: 25.32 },
  { text: 'tiny,', start: 25.32, end: 25.74 },
  { text: 'just', start: 26.14, end: 26.44 },
  { text: '$5', start: 26.44, end: 26.94 },
  { text: 'million', start: 26.94, end: 27.2 },
  { text: 'on', start: 27.2, end: 27.84 },
  { text: 'over', start: 27.84, end: 28.14 },
  { text: '$1', start: 28.14, end: 28.6 },
  { text: 'billion', start: 28.6, end: 28.9 },
  { text: 'in', start: 28.9, end: 29.4 },
  { text: 'sales.', start: 29.4, end: 29.78 },
  { text: 'By', start: 30.48, end: 30.58 },
  { text: '2003,', start: 30.58, end: 31.4 },
  { text: 'they', start: 31.82, end: 31.92 },
  { text: 'were', start: 31.92, end: 32.04 },
  { text: 'consistently', start: 32.04, end: 32.7 },
  { text: 'profitable.', start: 32.7, end: 33.38 },
  { text: 'This', start: 33.82, end: 34.22 },
  { text: "wasn't", start: 34.22, end: 34.58 },
  { text: 'about', start: 34.58, end: 34.76 },
  { text: 'pleasing', start: 34.76, end: 35.14 },
  { text: 'Wall', start: 35.14, end: 35.42 },
  { text: 'Street', start: 35.42, end: 35.64 },
  { text: 'anymore.', start: 35.64, end: 36.02 },
  { text: 'It', start: 36.56, end: 36.68 },
  { text: 'was', start: 36.68, end: 36.8 },
  { text: 'about', start: 36.8, end: 37.06 },
  { text: 'generating', start: 37.06, end: 37.58 },
  { text: 'their', start: 37.58, end: 37.88 },
  { text: 'own', start: 37.88, end: 38.22 },
  { text: 'fuel.', start: 38.22, end: 38.62 },
  { text: 'Profit', start: 39.22, end: 39.7 },
  { text: "wasn't", start: 39.7, end: 40.16 },
  { text: 'the', start: 40.16, end: 40.3 },
  { text: 'end', start: 40.3, end: 40.46 },
  { text: 'goal.', start: 40.46, end: 40.68 },
  { text: 'Profit', start: 41.16, end: 41.54 },
  { text: 'was', start: 41.54, end: 41.66 },
  { text: 'the', start: 41.66, end: 41.86 },
  { text: 'cash', start: 41.86, end: 42.16 },
  { text: 'that', start: 42.16, end: 42.46 },
  { text: 'allowed', start: 42.46, end: 42.72 },
  { text: 'them', start: 42.72, end: 43.02 },
  { text: 'to', start: 43.02, end: 43.2 },
  { text: 'build', start: 43.2, end: 43.5 },
  { text: 'more,', start: 43.5, end: 43.84 },
  { text: 'to', start: 44.2, end: 44.38 },
  { text: 'experiment', start: 44.38, end: 44.88 },
  { text: 'more,', start: 44.88, end: 45.22 },
  { text: 'to', start: 45.54, end: 45.7 },
  { text: 'take', start: 45.7, end: 45.96 },
  { text: 'bigger', start: 45.96, end: 46.38 },
  { text: 'risks', start: 46.38, end: 46.78 },
  { text: 'without', start: 46.78, end: 47.18 },
  { text: 'asking', start: 47.18, end: 47.68 },
  { text: 'for', start: 47.68, end: 47.86 },
  { text: 'permission.', start: 47.86, end: 48.24 },
  { text: 'It', start: 48.24, end: 49.08 },
  { text: 'was', start: 49.08, end: 49.24 },
  { text: 'the', start: 49.24, end: 49.4 },
  { text: 'foundation', start: 49.4, end: 49.98 },
  { text: 'for', start: 49.98, end: 50.26 },
  { text: 'the', start: 50.26, end: 50.42 },
  { text: 'next', start: 50.42, end: 50.82 },
  { text: 'decade', start: 50.82, end: 51.32 },
  { text: 'of', start: 51.32, end: 51.52 },
  { text: 'war.', start: 51.52, end: 51.78 },
];

const getWordsForTime = (start: number, end: number) => {
	return transcript.filter(w => w.start >= start && w.end <= end);
}


// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
  const fps = 30;
  const videoDuration = 52.5 * fps; // Duration in frames

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_3.wav')} />

      {/* Scene 1: Key lesson */}
      <Sequence from={0} durationInFrames={1.66 * fps}>
        <ParallaxScene from={0} durationInFrames={1.66 * fps} zoom={1.2}>
          {/* dark_library.jpg: A moody, dimly lit library or study, with bookshelves out of focus in the background. */}
          <ImageLayer src="assets/images/dark_library.jpg" parallax={0.5} />
          {/* ornate_key.png: A single, old, detailed key with a slight glow. Transparent background. */}
          <ImageLayer src="assets/images/ornate_key.png" parallax={1.5} scale={1.2} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(0.00, 1.66)} />
      </Sequence>

      {/* Scene 2: Profitability is a weapon */}
      <Sequence from={1.66 * fps} durationInFrames={(4.3 - 1.66) * fps}>
        <ParallaxScene from={1.66 * fps} durationInFrames={(4.3 - 1.66) * fps} zoom={1.15} panX={-100}>
          {/* forge_background.jpg: A dark, fiery industrial forge environment with sparks and heat haze. */}
          <ImageLayer src="assets/images/forge_background.jpg" parallax={0.5} />
          {/* glowing_sword.png: A powerful sword, glowing with an inner light, presented vertically. Transparent background. */}
          <ImageLayer src="assets/images/glowing_sword.png" parallax={1.2} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(1.66, 4.3)} />
      </Sequence>
      
      {/* Scene 3: Now is 2003 */}
      <Sequence from={5.38 * fps} durationInFrames={(6.76 - 5.38) * fps}>
        <ParallaxScene from={5.38 * fps} durationInFrames={(6.76 - 5.38) * fps} zoom={1.3}>
            {/* digital_background.jpg: A dark background with cascading green digital numbers, like in The Matrix. */}
            <ImageLayer src="assets/images/digital_background.jpg" parallax={0.2} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(5.38, 6.76)} style={{fontSize: '150px', top: '40%'}}/>
      </Sequence>

      {/* Scene 4: The .com graveyard */}
      <Sequence from={7.38 * fps} durationInFrames={(9.24 - 7.38) * fps}>
        <ParallaxScene from={7.38 * fps} durationInFrames={(9.24 - 7.38) * fps} zoom={1.1} panX={150}>
            {/* dotcom_graveyard.jpg: A misty, desolate landscape at dusk with tombstones. */}
            <ImageLayer src="assets/images/dotcom_graveyard.jpg" parallax={0.5} />
            {/* fog_overlay.png: A semi-transparent layer of fog to add depth. Transparent background. */}
            <ImageLayer src="assets/images/fog_overlay.png" parallax={1.5} opacity={0.7}/>
        </ParallaxScene>
        <Subtitle words={getWordsForTime(7.38, 9.24)} />
      </Sequence>

      {/* Scene 5: Amazon is wounded */}
      <Sequence from={9.90 * fps} durationInFrames={(12.44 - 9.90) * fps}>
        <ParallaxScene from={9.90 * fps} durationInFrames={(12.44 - 9.90) * fps} zoom={1.2} rotate={-2}>
            {/* stormy_sky.jpg: A dark, dramatic sky with storm clouds and a hint of lightning. */}
            <ImageLayer src="assets/images/stormy_sky.jpg" parallax={0.4} />
            {/* damaged_tower.png: A tall, stone tower with visible cracks and damage but still standing strong. Transparent background. */}
            <ImageLayer src="assets/images/damaged_tower.png" parallax={1.1} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(9.90, 12.44)} />
      </Sequence>
      
      {/* Scene 6: Pressure is immense */}
      <Sequence from={12.92 * fps} durationInFrames={(14.18 - 12.92) * fps}>
        <ParallaxScene from={12.92 * fps} durationInFrames={(14.18 - 12.92) * fps} zoom={1.5}>
            {/* cracking_ground.jpg: A close-up shot of dry, cracked earth or concrete spreading. */}
            <ImageLayer src="assets/images/cracking_ground.jpg" parallax={1} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(12.92, 14.18)} />
      </Sequence>

      {/* Scene 7: Prove the model worked */}
      <Sequence from={14.96 * fps} durationInFrames={(16.82 - 14.96) * fps}>
        <ParallaxScene from={14.96 * fps} durationInFrames={(16.82 - 14.96) * fps} zoom={1.25} panY={50}>
            {/* blueprint.jpg: A detailed, complex technical blueprint with a dark blue background. */}
            <ImageLayer src="assets/images/blueprint.jpg" parallax={0.6} />
            {/* glowing_lines.png: A transparent overlay of glowing lines that match some of the blueprint's paths. */}
            <ImageLayer src="assets/images/glowing_lines.png" parallax={1.3} opacity={0.8}/>
        </ParallaxScene>
        <Subtitle words={getWordsForTime(14.96, 16.82)} />
      </Sequence>
      
      {/* Scene 8: Make money */}
      <Sequence from={17.28 * fps} durationInFrames={(19.66 - 17.28) * fps}>
        <ParallaxScene from={17.28 * fps} durationInFrames={(19.66 - 17.28) * fps} zoom={1.3}>
            {/* dark_machinery.jpg: A background of complex, dark metallic gears and cogs. */}
            <ImageLayer src="assets/images/dark_machinery.jpg" parallax={0.7} />
            {/* golden_coin.png: A single, shiny golden coin, rendered realistically. Transparent background. */}
            <ImageLayer src="assets/images/golden_coin.png" parallax={1.4} scale={0.8}/>
        </ParallaxScene>
        <Subtitle words={getWordsForTime(17.28, 19.66)} />
      </Sequence>

      {/* Scene 9: First ever profit */}
      <Sequence from={19.66 * fps} durationInFrames={(24.40 - 19.66) * fps}>
        <ParallaxScene from={19.66 * fps} durationInFrames={(24.40 - 19.66) * fps} zoom={1.1} panX={-80}>
            {/* stock_chart.jpg: A digital display of a stock market chart, mostly showing a red downward trend. */}
            <ImageLayer src="assets/images/stock_chart.jpg" parallax={0.5} />
            {/* green_uptick.png: A transparent overlay of a single, sharp, glowing green line moving upwards. */}
            <ImageLayer src="assets/images/green_uptick.png" parallax={1.2} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(19.66, 24.40)} />
      </Sequence>

      {/* Scene 10: It was tiny */}
      <Sequence from={24.92 * fps} durationInFrames={(29.78 - 24.92) * fps}>
        {/* Using a custom animation here for the dolly zoom effect */}
        <AbsoluteFill>
          <div style={{
            width: '100%',
            height: '100%',
            transform: `scale(${interpolate(useCurrentFrame(), [24.92 * fps, 29.78 * fps], [40, 1], {easing: Easing.bezier(0.5, 0, 0.5, 1)})})`,
            opacity: interpolate(useCurrentFrame(), [24.92 * fps, 24.92 * fps + 15, 29.78 * fps - 15, 29.78 * fps], [0, 1, 1, 0])
          }}>
            {/* package_mountain.jpg: An immense, overwhelming pile of cardboard packages stretching into the distance. */}
            <ImageLayer src="assets/images/package_mountain.jpg" parallax={0} />
            {/* glowing_speck.png: A tiny, bright pinpoint of light. Transparent background. */}
            <ImageLayer src="assets/images/glowing_speck.png" parallax={0} style={{backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}} />
          </div>
        </AbsoluteFill>
        <Subtitle words={getWordsForTime(24.92, 29.78)} />
      </Sequence>

      {/* Scene 11: Consistently profitable */}
      <Sequence from={30.48 * fps} durationInFrames={(33.38 - 30.48) * fps}>
        <ParallaxScene from={30.48 * fps} durationInFrames={(33.38 - 30.48) * fps} zoom={1.2}>
            {/* upward_graph.jpg: A clean, modern digital graph with a steady, strong upward trend line in green. */}
            <ImageLayer src="assets/images/upward_graph.jpg" parallax={0.8} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(30.48, 33.38)} />
      </Sequence>
      
      {/* Scene 12: Not about Wall Street */}
      <Sequence from={33.82 * fps} durationInFrames={(36.02 - 33.82) * fps}>
        <ParallaxScene from={33.82 * fps} durationInFrames={(36.02 - 33.82) * fps} zoom={1.15} panX={100}>
            {/* factory_floor.jpg: A bustling, bright, and productive modern factory or warehouse interior. */}
            <ImageLayer src="assets/images/factory_floor.jpg" parallax={0.5} />
            {/* wall_street_building.png: An iconic Wall Street building, made semi-transparent and faded. Transparent background. */}
            <ImageLayer src="assets/images/wall_street_building.png" parallax={1.5} opacity={0.3} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(33.82, 36.02)} />
      </Sequence>

      {/* Scene 13: Generating their own fuel */}
      <Sequence from={36.56 * fps} durationInFrames={(38.62 - 36.56) * fps}>
        <ParallaxScene from={36.56 * fps} durationInFrames={(38.62 - 36.56) * fps} zoom={1.4}>
            {/* engine_room.jpg: The dark interior of a massive engine room or power plant. */}
            <ImageLayer src="assets/images/engine_room.jpg" parallax={0.7} />
            {/* glowing_core.png: A bright, pulsating blue or orange energy core. Transparent background. */}
            <ImageLayer src="assets/images/glowing_core.png" parallax={1.3} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(36.56, 38.62)} />
      </Sequence>
      
      {/* Scene 14: Not the end goal */}
      <Sequence from={39.22 * fps} durationInFrames={(40.68 - 39.22) * fps}>
        <ParallaxScene from={39.22 * fps} durationInFrames={(40.68 - 39.22) * fps} zoom={1.1} panX={-120}>
            {/* endless_road.jpg: A road stretching to a distant horizon under a vast sky. */}
            <ImageLayer src="assets/images/endless_road.jpg" parallax={0.5} />
            {/* dissolving_finish_line.png: A finish line tape that appears to be breaking apart into particles. Transparent background. */}
            <ImageLayer src="assets/images/dissolving_finish_line.png" parallax={1.2} opacity={0.6}/>
        </ParallaxScene>
        <Subtitle words={getWordsForTime(39.22, 40.68)} />
      </Sequence>
      
      {/* Scene 15: Build, experiment, take risks */}
      <Sequence from={41.16 * fps} durationInFrames={(48.24 - 41.16) * fps}>
        <ParallaxScene from={41.16 * fps} durationInFrames={(48.24 - 41.16) * fps} zoom={1.2}>
          {/* abstract_tech_background.jpg: A dark, abstract background with flowing lines of light and data points. */}
          <ImageLayer src="assets/images/abstract_tech_background.jpg" parallax={0.3} />
          {/* rocket_launch.png: A rocket taking off, angled from the side. Transparent background. */}
          <ImageLayer src="assets/images/rocket_launch.png" parallax={1.5} opacity={interpolate(useCurrentFrame(), [45*fps, 46*fps], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'})} style={{left: '50%', top: '10%'}} />
          {/* dna_strand.png: A glowing DNA helix for 'experiment'. Transparent background. */}
          <ImageLayer src="assets/images/dna_strand.png" parallax={1.2} opacity={interpolate(useCurrentFrame(), [43.8*fps, 44.8*fps], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'})} style={{left: '10%', top: '20%'}} />
          {/* crane_building.png: A silhouette of a crane building a skyscraper. Transparent background. */}
          <ImageLayer src="assets/images/crane_building.png" parallax={1.0} opacity={interpolate(useCurrentFrame(), [42.7*fps, 43.5*fps], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'})} style={{left: '25%', top: '50%'}} />
        </ParallaxScene>
        <Subtitle words={getWordsForTime(41.16, 48.24)} />
      </Sequence>
      
      {/* Scene 16: Foundation for war */}
      <Sequence from={48.24 * fps} durationInFrames={videoDuration - (48.24 * fps)}>
        <ParallaxScene from={48.24 * fps} durationInFrames={videoDuration - (48.24 * fps)} zoom={1.3} panY={-100}>
            {/* concrete_foundation.jpg: A massive, epic-scale construction foundation with steel rebar. */}
            <ImageLayer src="assets/images/concrete_foundation.jpg" parallax={0.6} />
            {/* looming_shadows.png: Dark, shadowy silhouettes of corporate skyscrapers in the misty background. Transparent. */}
            <ImageLayer src="assets/images/looming_shadows.png" parallax={1.1} opacity={0.5}/>
        </ParallaxScene>
        <Subtitle words={getWordsForTime(48.24, 51.78)} />
      </Sequence>

    </AbsoluteFill>
  );
};
```