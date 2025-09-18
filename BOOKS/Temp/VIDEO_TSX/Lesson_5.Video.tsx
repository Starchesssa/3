```tsx
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import React from 'react';

// Data structure for the transcript
const transcript = [
  { start: 0.0, end: 0.42, text: 'Key' },
  { start: 0.42, end: 0.82, text: 'lesson,' },
  { start: 1.26, end: 1.46, text: 'while' },
  { start: 1.46, end: 1.82, text: 'others' },
  { start: 1.82, end: 2.3, text: 'retreat,' },
  { start: 2.78, end: 2.9, text: 'you' },
  { start: 2.9, end: 3.4, text: 'attack.' },
  { start: 4.06, end: 4.34, text: 'The' },
  { start: 4.34, end: 4.64, text: 'year' },
  { start: 4.64, end: 4.86, text: 'is' },
  { start: 4.86, end: 5.66, text: '2008.' },
  { start: 6.16, end: 6.22, text: 'The' },
  { start: 6.22, end: 6.54, text: 'global' },
  { start: 6.54, end: 6.98, text: 'financial' },
  { start: 6.98, end: 7.56, text: 'system' },
  { start: 7.56, end: 7.78, text: 'is' },
  { start: 7.78, end: 8.4, text: 'collapsing.' },
  { start: 9.02, end: 9.26, text: 'Lehman' },
  { start: 9.26, end: 9.52, text: 'Brothers' },
  { start: 9.52, end: 9.82, text: 'is' },
  { start: 9.82, end: 10.12, text: 'gone.' },
  { start: 10.74, end: 10.84, text: 'The' },
  { start: 10.84, end: 11.32, text: 'entire' },
  { start: 11.32, end: 11.88, text: 'economy' },
  { start: 11.88, end: 12.2, text: "isn't" },
  { start: 12.2, end: 12.26, text: 'a' },
  { start: 12.26, end: 12.54, text: 'free' },
  { start: 12.54, end: 12.76, text: 'fall.' },
  { start: 13.36, end: 13.86, text: 'Businesses' },
  { start: 13.86, end: 14.0, text: 'are' },
  { start: 14.0, end: 14.22, text: 'laying' },
  { start: 14.22, end: 14.56, text: 'people' },
  { start: 14.56, end: 14.84, text: 'off.' },
  { start: 15.2, end: 15.3, text: 'They' },
  { start: 15.3, end: 15.4, text: 'are' },
  { start: 15.4, end: 15.94, text: 'canceling' },
  { start: 15.94, end: 16.36, text: 'projects.' },
  { start: 16.76, end: 16.88, text: 'They' },
  { start: 16.88, end: 17.0, text: 'are' },
  { start: 17.0, end: 17.52, text: 'hoarding' },
  { start: 17.52, end: 17.78, text: 'cash.' },
  { start: 18.26, end: 18.82, text: 'Survival' },
  { start: 18.82, end: 19.06, text: 'mode.' },
  { start: 19.6, end: 19.84, text: 'What' },
  { start: 19.84, end: 20.04, text: 'does' },
  { start: 20.04, end: 20.26, text: 'Amazon' },
  { start: 20.26, end: 20.66, text: 'do?' },
  { start: 21.1, end: 21.24, text: 'They' },
  { start: 21.24, end: 21.46, text: 'push' },
  { start: 21.46, end: 21.92, text: 'forward' },
  { start: 21.92, end: 22.12, text: 'with' },
  { start: 22.12, end: 22.3, text: 'one' },
  { start: 22.3, end: 22.4, text: 'of' },
  { start: 22.4, end: 22.54, text: 'their' },
  { start: 22.54, end: 23.22, text: 'strangest' },
  { start: 23.22, end: 23.42, text: 'and' },
  { start: 23.42, end: 23.7, text: 'most' },
  { start: 23.7, end: 24.16, text: 'ambitious' },
  { start: 24.16, end: 24.62, text: 'products' },
  { start: 24.62, end: 24.96, text: 'yet.' },
  { start: 25.4, end: 25.52, text: 'The' },
  { start: 25.52, end: 26.0, text: 'Kindle,' },
  { start: 26.32, end: 26.46, text: 'an' },
  { start: 26.46, end: 26.92, text: 'electronic' },
  { start: 26.92, end: 27.28, text: 'book' },
  { start: 27.28, end: 27.6, text: 'reader.' },
  { start: 27.94, end: 28.26, text: 'In' },
  { start: 28.26, end: 28.38, text: 'the' },
  { start: 28.38, end: 28.68, text: 'middle' },
  { start: 28.68, end: 28.88, text: 'of' },
  { start: 28.88, end: 28.98, text: 'a' },
  { start: 28.98, end: 29.5, text: 'historic' },
  { start: 29.5, end: 30.06, text: 'recession,' },
  { start: 30.48, end: 30.58, text: 'they' },
  { start: 30.58, end: 30.7, text: 'were' },
  { start: 30.7, end: 30.94, text: 'trying' },
  { start: 30.94, end: 31.1, text: 'to' },
  { start: 31.1, end: 31.44, text: 'change' },
  { start: 31.44, end: 31.64, text: 'how' },
  { start: 31.64, end: 32.1, text: 'humanity' },
  { start: 32.1, end: 32.48, text: 'had' },
  { start: 32.48, end: 32.64, text: 'read' },
  { start: 32.64, end: 32.96, text: 'books' },
  { start: 32.96, end: 33.22, text: 'for' },
  { start: 33.22, end: 33.5, text: 'over' },
  { start: 33.5, end: 34.12, text: '500' },
  { start: 34.12, end: 34.62, text: 'years.' },
  { start: 34.94, end: 35.3, text: 'They' },
  { start: 35.3, end: 35.42, text: 'were' },
  { start: 35.42, end: 35.72, text: 'building' },
  { start: 35.72, end: 35.94, text: 'new' },
  { start: 35.94, end: 36.34, text: 'hardware.' },
  { start: 36.78, end: 36.86, text: 'They' },
  { start: 36.86, end: 36.98, text: 'were' },
  { start: 36.98, end: 37.3, text: 'fighting' },
  { start: 37.3, end: 37.54, text: 'with' },
  { start: 37.54, end: 37.98, text: 'publishers.' },
  { start: 38.46, end: 38.66, text: 'They' },
  { start: 38.66, end: 38.8, text: 'were' },
  { start: 38.8, end: 39.28, text: 'investing' },
  { start: 39.28, end: 39.78, text: 'hundreds' },
  { start: 39.78, end: 40.02, text: 'of' },
  { start: 40.02, end: 40.4, text: 'millions' },
  { start: 40.4, end: 40.66, text: 'of' },
  { start: 40.66, end: 40.96, text: 'dollars' },
  { start: 40.96, end: 41.3, text: 'while' },
  { start: 41.3, end: 41.62, text: 'other' },
  { start: 41.62, end: 42.0, text: 'companies' },
  { start: 42.0, end: 42.2, text: 'were' },
  { start: 42.2, end: 42.56, text: 'fighting' },
  { start: 42.56, end: 42.78, text: 'for' },
  { start: 42.78, end: 42.92, text: 'their' },
  { start: 42.92, end: 43.38, text: 'lives.' },
  { start: 44.02, end: 44.56, text: 'Recessions' },
  { start: 44.56, end: 44.76, text: 'are' },
  { start: 44.76, end: 44.86, text: 'a' },
  { start: 44.86, end: 45.14, text: 'clearing' },
  { start: 45.14, end: 45.62, text: 'event.' },
  { start: 46.02, end: 46.08, text: 'The' },
  { start: 46.08, end: 46.32, text: 'week' },
  { start: 46.32, end: 46.62, text: 'get' },
  { start: 46.62, end: 46.84, text: 'wiped' },
  { start: 46.84, end: 47.18, text: 'out.' },
  { start: 47.52, end: 47.62, text: 'The' },
  { start: 47.62, end: 47.98, text: 'strong' },
  { start: 47.98, end: 48.36, text: 'get' },
  { start: 48.36, end: 48.84, text: 'stronger.' },
  { start: 49.46, end: 49.72, text: 'Amazon' },
  { start: 49.72, end: 50.18, text: 'used' },
  { start: 50.18, end: 50.38, text: 'the' },
  { start: 50.38, end: 50.98, text: '2008' },
  { start: 50.98, end: 51.36, text: 'crisis' },
  { start: 51.36, end: 51.72, text: 'to' },
  { start: 51.72, end: 52.0, text: 'grab' },
  { start: 52.0, end: 52.4, text: 'market' },
  { start: 52.4, end: 52.66, text: 'share' },
  { start: 52.66, end: 52.92, text: 'and' },
  { start: 52.92, end: 53.22, text: 'create' },
  { start: 53.22, end: 53.42, text: 'a' },
  { start: 53.42, end: 53.72, text: 'brand' },
  { start: 53.72, end: 54.0, text: 'new' },
  { start: 54.0, end: 54.64, text: 'ecosystem' },
  { start: 54.64, end: 55.04, text: 'around' },
  { start: 55.04, end: 55.42, text: 'digital' },
  { start: 55.42, end: 55.88, text: 'books.' },
  { start: 56.29, end: 56.56, text: 'While' },
  { start: 56.56, end: 57.04, text: 'everyone' },
  { start: 57.04, end: 57.32, text: 'else' },
  { start: 57.32, end: 57.48, text: 'was' },
  { start: 57.48, end: 57.76, text: 'looking' },
  { start: 57.76, end: 57.92, text: 'at' },
  { start: 57.92, end: 58.06, text: 'their' },
  { start: 58.06, end: 58.32, text: 'feet,' },
  { start: 58.74, end: 58.84, text: 'they' },
  { start: 58.84, end: 58.98, text: 'were' },
  { start: 58.98, end: 59.26, text: 'looking' },
  { start: 59.26, end: 59.5, text: 'at' },
  { start: 59.5, end: 59.68, text: 'the' },
  { start: 59.68, end: 60.1, text: 'horizon.' },
];

const Word: React.FC<{
  frame: number;
  fps: number;
  text: string;
  start: number; // in seconds
  end: number; // in seconds
}> = ({ frame, fps, text, start, end }) => {
  const startFrame = start * fps;
  const endFrame = end * fps;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 15, endFrame - 15, endFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const style: React.CSSProperties = {
    display: 'inline-block',
    opacity,
    textShadow: '0 0 20px rgba(255,255,255,0.7)',
  };

  return <span style={style}>{text}&nbsp;</span>;
};

const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const style: React.CSSProperties = {
    position: 'absolute',
    bottom: '15%',
    width: '100%',
    textAlign: 'center',
    fontSize: '72px',
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  return (
    <div style={style}>
      {transcript.map((word, i) => (
        <Word
          key={i}
          frame={frame}
          fps={fps}
          text={word.text}
          start={word.start}
          end={word.end}
        />
      ))}
    </div>
  );
};

// Component for a simple parallax layer
const ParallaxLayer: React.FC<{
  src: string;
  pan: number;
  zoom: number;
  opacity?: number;
  parallaxFactor: number;
  yOffset?: number;
  children?: React.ReactNode;
}> = ({ src, pan, zoom, opacity = 1, parallaxFactor, yOffset = 0, children }) => {
  const transform = `scale(${zoom}) translateX(${pan * parallaxFactor}px) translateY(${yOffset}px)`;

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity,
    transform,
  };

  return (
    <AbsoluteFill>
      <Img src={src} style={style} />
      {children}
    </AbsoluteFill>
  );
};

export const RemotionVideo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={'BOOKS/Temp/TTS/Lesson_5.wav'} />

      {/* SCENE 1: Intro - Attack vs Retreat (0s - 4s) */}
      <Sequence from={0} durationInFrames={4 * fps}>
        <AbsoluteFill>
          {/* assets/images/abstract-background.jpg: A dark, textured background, slightly out of focus. */}
          <Img
            src={'assets/images/abstract-background.jpg'}
            style={{ width: '100%', height: '100%', transform: `scale(1.1)` }}
          />

          {/* assets/images/retreating-arrows.png: A cluster of faint, red arrows with transparent background. */}
          <Img
            src={'assets/images/retreating-arrows.png'}
            style={{
              position: 'absolute',
              width: '50%',
              left: '0%',
              top: '25%',
              opacity: interpolate(frame, [0, 1 * fps, 3 * fps], [0, 0.5, 0]),
              transform: `translateX(${interpolate(
                frame,
                [0, 4 * fps],
                [0, -400]
              )}px)`,
            }}
          />
          {/* assets/images/attacking-arrow.png: A single, glowing blue arrow with transparent background. */}
          <Img
            src={'assets/images/attacking-arrow.png'}
            style={{
              position: 'absolute',
              width: '40%',
              right: '5%',
              top: '30%',
              opacity: interpolate(
                frame,
                [2 * fps, 2.5 * fps, 4 * fps],
                [0, 1, 1]
              ),
              transform: `translateX(${interpolate(
                frame,
                [2 * fps, 4 * fps],
                [400, 0]
              )}px) scale(${interpolate(frame, [2 * fps, 4 * fps], [1, 1.2])})`,
              filter: 'drop-shadow(0 0 20px #00ffff)',
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 2: 2008 Financial Crisis (4s - 9s) */}
      <Sequence from={4 * fps} durationInFrames={5 * fps}>
        <AbsoluteFill style={{ transform: `scale(1.1)` }}>
          {/* assets/images/stock-market-blurry.jpg: A chaotic, blurred image of a stock exchange floor. */}
          <Img
            src={'assets/images/stock-market-blurry.jpg'}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.8,
              transform: `scale(${interpolate(
                frame,
                [4 * fps, 9 * fps],
                [1, 1.1]
              )})`,
            }}
          />
          {/* assets/images/downtrend-graph.png: A glowing red line graph, sharply declining. Transparent background. */}
          <Img
            src={'assets/images/downtrend-graph.png'}
            style={{
              width: '100%',
              height: '100%',
              opacity: interpolate(frame, [5 * fps, 6 * fps], [0, 1]),
            }}
          />
          {/* assets/images/cracked-glass-overlay.png: An overlay of cracked glass. Transparent background. */}
          <Img
            src={'assets/images/cracked-glass-overlay.png'}
            style={{
              width: '100%',
              height: '100%',
              opacity: interpolate(frame, [7.5 * fps, 8.5 * fps], [0, 0.7]),
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 3: The Fallout (9s - 19.5s) */}
      <Sequence from={9 * fps} durationInFrames={10.5 * fps}>
        {/* assets/images/lehman-building.jpg: A photo of the Lehman Brothers building. */}
        <AbsoluteFill
          style={{
            opacity: interpolate(
              frame,
              [9 * fps, 9.5 * fps, 10.5 * fps],
              [0, 1, 0]
            ),
          }}
        >
          <Img
            src={'assets/images/lehman-building.jpg'}
            style={{
              width: '100%',
              height: '100%',
              filter: 'grayscale(1)',
              transform: `scale(${interpolate(
                frame,
                [9 * fps, 10.5 * fps],
                [1.1, 1.2]
              )})`,
            }}
          />
        </AbsoluteFill>

        {/* assets/images/empty-office.jpg: A dark, empty office interior. */}
        <AbsoluteFill
          style={{
            opacity: interpolate(
              frame,
              [10.5 * fps, 11 * fps, 18 * fps, 19 * fps],
              [0, 1, 1, 0]
            ),
          }}
        >
          <Img
            src={'assets/images/empty-office.jpg'}
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(1.2) translateX(${interpolate(
                frame,
                [11 * fps, 19 * fps],
                [0, -100]
              )}px)`,
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 4: Amazon's Move - The Kindle (19.5s - 28s) */}
      <Sequence from={19.5 * fps} durationInFrames={8.5 * fps}>
        <AbsoluteFill>
          {/* assets/images/dark-blueprint-bg.jpg: A dark blue background with faint grid lines. */}
          <Img
            src={'assets/images/dark-blueprint-bg.jpg'}
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${interpolate(
                frame,
                [19.5 * fps, 28 * fps],
                [1.3, 1]
              )})`,
            }}
          />
          {/* assets/images/kindle-final.png: A clean product shot of the first Kindle. Transparent background. */}
          <Img
            src={'assets/images/kindle-final.png'}
            style={{
              position: 'absolute',
              width: '40%',
              left: '30%',
              top: '15%',
              opacity: interpolate(frame, [25 * fps, 26 * fps], [0, 1]),
              transform: `translateY(${interpolate(
                frame,
                [25 * fps, 28 * fps],
                [100, 0]
              )}px) scale(${interpolate(
                frame,
                [25 * fps, 28 * fps],
                [0.8, 1]
              )})`,
              filter: 'drop-shadow(0 0 30px white)',
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 5: The Audacity (28s - 44s) */}
      <Sequence from={28 * fps} durationInFrames={16 * fps}>
        {/* assets/images/old-library.jpg: A grand, classic library interior. */}
        <AbsoluteFill>
          <Img
            src={'assets/images/old-library.jpg'}
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${interpolate(
                frame,
                [28 * fps, 44 * fps],
                [1, 1.2]
              )}) translateX(${interpolate(
                frame,
                [28 * fps, 44 * fps],
                [0, -200]
              )}px)`,
              opacity: 0.6,
            }}
          />
        </AbsoluteFill>

        {/* assets/images/struggling-business.jpg: A grainy B&W photo of a 'Closed' sign. */}
        <AbsoluteFill
          style={{
            opacity: interpolate(
              frame,
              [41 * fps, 42 * fps, 43 * fps, 44 * fps],
              [0, 0.5, 0.5, 0]
            ),
          }}
        >
          <Img
            src={'assets/images/struggling-business.jpg'}
            style={{ width: '100%', height: '100%', filter: 'grayscale(1)' }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 6: Clearing Event (44s - 49s) */}
      <Sequence from={44 * fps} durationInFrames={5 * fps}>
        {/* assets/images/stormy-forest.jpg: A dark forest during a storm. */}
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [46 * fps, 47 * fps], [1, 0]),
          }}
        >
          <Img
            src={'assets/images/stormy-forest.jpg'}
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${interpolate(
                frame,
                [44 * fps, 47 * fps],
                [1, 1.1]
              )})`,
            }}
          />
        </AbsoluteFill>
        {/* assets/images/cleared-forest.jpg: A sunlit forest with one strong tree remaining. */}
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [47 * fps, 48 * fps], [0, 1]),
          }}
        >
          <Img
            src={'assets/images/cleared-forest.jpg'}
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${interpolate(
                frame,
                [47 * fps, 49 * fps],
                [1.2, 1]
              )})`,
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 7: The Outcome & Horizon (49s - 61s) */}
      <Sequence from={49 * fps} durationInFrames={12 * fps}>
        <AbsoluteFill>
          {/* assets/images/earth-from-space.jpg: A view of Earth from space. */}
          <Img
            src={'assets/images/earth-from-space.jpg'}
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${interpolate(
                frame,
                [49 * fps, 56 * fps],
                [1, 1.2]
              )})`,
              opacity: interpolate(
                frame,
                [55 * fps, 56 * fps],
                [1, 0],
                {
                  easing: Easing.ease,
                }
              ),
            }}
          />
          {/* assets/images/digital-network.png: A glowing network grid to overlay on Earth. Transparent BG. */}
          <Img
            src={'assets/images/digital-network.png'}
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${interpolate(
                frame,
                [51 * fps, 56 * fps],
                [0.5, 1.2]
              )})`,
              opacity: interpolate(
                frame,
                [51 * fps, 52 * fps, 55 * fps, 56 * fps],
                [0, 0.7, 0.7, 0],
                { easing: Easing.ease }
              ),
            }}
          />
        </AbsoluteFill>

        {/* assets/images/silhouette-horizon.jpg: A person's silhouette looking at a futuristic horizon. */}
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [56 * fps, 57 * fps], [0, 1]),
          }}
        >
          <Img
            src={'assets/images/silhouette-horizon.jpg'}
            style={{
              width: '100%',
              height: '100%',
              transform: `scale(${interpolate(
                frame,
                [56 * fps, 61 * fps],
                [1.3, 1]
              )})`,
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Subtitles on top of all scenes */}
      <Subtitles />
    </AbsoluteFill>
  );
};
```