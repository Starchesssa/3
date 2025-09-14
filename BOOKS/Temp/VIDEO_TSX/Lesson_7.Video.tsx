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
  spring,
} from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

// Audio file is located in the public folder.
// Ensure you have a folder structure like: public/BOOKS/Temp/TTS/Lesson_7.wav
import audioFile from './BOOKS/Temp/TTS/Lesson_7.wav';

const FADE_DURATION = 15; // Frames for fade in/out of words and scenes

const transcript = [
  { "start": 0.00, "end": 0.44, "text": "Key" },
  { "start": 0.44, "end": 0.84, "text": "lesson," },
  { "start": 1.28, "end": 1.42, "text": "the" },
  { "start": 1.42, "end": 1.80, "text": "price" },
  { "start": 1.80, "end": 2.04, "text": "of" },
  { "start": 2.04, "end": 2.58, "text": "innovation" },
  { "start": 2.58, "end": 3.04, "text": "is" },
  { "start": 3.04, "end": 3.68, "text": "expensive" },
  { "start": 3.68, "end": 4.36, "text": "public" },
  { "start": 4.36, "end": 4.84, "text": "failure." },
  { "start": 5.53, "end": 5.88, "text": "We" },
  { "start": 5.88, "end": 6.24, "text": "need" },
  { "start": 6.24, "end": 6.42, "text": "to" },
  { "start": 6.42, "end": 6.62, "text": "talk" },
  { "start": 6.62, "end": 6.84, "text": "about" },
  { "start": 6.84, "end": 7.46, "text": "2019," },
  { "start": 8.00, "end": 8.26, "text": "but" },
  { "start": 8.26, "end": 8.48, "text": "to" },
  { "start": 8.48, "end": 9.02, "text": "understand" },
  { "start": 9.02, "end": 9.74, "text": "2019," },
  { "start": 10.12, "end": 10.30, "text": "you" },
  { "start": 10.30, "end": 10.52, "text": "have" },
  { "start": 10.52, "end": 10.68, "text": "to" },
  { "start": 10.68, "end": 11.12, "text": "understand" },
  { "start": 11.12, "end": 11.30, "text": "the" },
  { "start": 11.30, "end": 11.62, "text": "ghosts" },
  { "start": 11.62, "end": 11.96, "text": "of" },
  { "start": 11.96, "end": 12.28, "text": "failures" },
  { "start": 12.28, "end": 12.68, "text": "passed." },
  { "start": 13.34, "end": 13.54, "text": "The" },
  { "start": 13.54, "end": 13.88, "text": "biggest" },
  { "start": 13.88, "end": 14.12, "text": "one" },
  { "start": 14.12, "end": 14.34, "text": "was" },
  { "start": 14.34, "end": 14.46, "text": "the" },
  { "start": 14.46, "end": 14.82, "text": "fire" },
  { "start": 14.82, "end": 15.12, "text": "phone" },
  { "start": 15.12, "end": 15.30, "text": "from" },
  { "start": 15.30, "end": 15.98, "text": "2014." },
  { "start": 16.64, "end": 16.76, "text": "It" },
  { "start": 16.76, "end": 16.90, "text": "was" },
  { "start": 16.90, "end": 17.02, "text": "a" },
  { "start": 17.02, "end": 17.50, "text": "complete" },
  { "start": 17.50, "end": 17.94, "text": "disaster," },
  { "start": 18.40, "end": 18.50, "text": "a" },
  { "start": 18.50, "end": 18.90, "text": "total" },
  { "start": 18.90, "end": 19.26, "text": "flop." },
  { "start": 19.76, "end": 19.92, "text": "The" },
  { "start": 19.92, "end": 20.24, "text": "company" },
  { "start": 20.24, "end": 20.50, "text": "took" },
  { "start": 20.50, "end": 20.72, "text": "a" },
  { "start": 20.72, "end": 21.78, "text": "$170" },
  { "start": 21.78, "end": 22.38, "text": "million" },
  { "start": 22.38, "end": 22.92, "text": "write" },
  { "start": 22.92, "end": 23.20, "text": "down" },
  { "start": 23.20, "end": 23.42, "text": "on" },
  { "start": 23.42, "end": 23.84, "text": "Unsold" },
  { "start": 23.84, "end": 24.44, "text": "Inventory." },
  { "start": 24.68, "end": 24.98, "text": "It" },
  { "start": 24.98, "end": 25.10, "text": "was" },
  { "start": 25.10, "end": 25.24, "text": "a" },
  { "start": 25.24, "end": 25.66, "text": "public" },
  { "start": 25.66, "end": 26.32, "text": "humiliation." },
  { "start": 26.32, "end": 27.18, "text": "They" },
  { "start": 27.18, "end": 27.42, "text": "tried" },
  { "start": 27.42, "end": 27.58, "text": "to" },
  { "start": 27.58, "end": 27.86, "text": "compete" },
  { "start": 27.86, "end": 28.14, "text": "with" },
  { "start": 28.14, "end": 28.42, "text": "Apple" },
  { "start": 28.42, "end": 28.62, "text": "and" },
  { "start": 28.62, "end": 28.90, "text": "Google" },
  { "start": 28.90, "end": 29.20, "text": "and" },
  { "start": 29.20, "end": 29.32, "text": "they" },
  { "start": 29.32, "end": 29.70, "text": "failed" },
  { "start": 29.70, "end": 30.78, "text": "spectacularly." },
  { "start": 31.14, "end": 31.44, "text": "A" },
  { "start": 31.44, "end": 31.74, "text": "normal" },
  { "start": 31.74, "end": 32.18, "text": "company" },
  { "start": 32.18, "end": 32.38, "text": "would" },
  { "start": 32.38, "end": 32.70, "text": "fire" },
  { "start": 32.70, "end": 32.92, "text": "the" },
  { "start": 32.92, "end": 33.26, "text": "entire" },
  { "start": 33.26, "end": 33.76, "text": "team." },
  { "start": 34.12, "end": 34.22, "text": "They" },
  { "start": 34.22, "end": 34.34, "text": "would" },
  { "start": 34.34, "end": 34.64, "text": "never" },
  { "start": 34.64, "end": 35.00, "text": "mention" },
  { "start": 35.00, "end": 35.12, "text": "the" },
  { "start": 35.12, "end": 35.46, "text": "project" },
  { "start": 35.46, "end": 35.82, "text": "again." },
  { "start": 36.30, "end": 36.40, "text": "They" },
  { "start": 36.40, "end": 36.56, "text": "would" },
  { "start": 36.56, "end": 36.98, "text": "conclude," },
  { "start": 37.30, "end": 37.42, "text": "we" },
  { "start": 37.42, "end": 37.66, "text": "are" },
  { "start": 37.66, "end": 37.94, "text": "not" },
  { "start": 37.94, "end": 38.14, "text": "a" },
  { "start": 38.14, "end": 38.38, "text": "hardware" },
  { "start": 38.38, "end": 38.86, "text": "company." },
  { "start": 39.54, "end": 39.84, "text": "Amazon" },
  { "start": 39.84, "end": 40.24, "text": "did" },
  { "start": 40.24, "end": 40.52, "text": "not" },
  { "start": 40.52, "end": 40.76, "text": "do" },
  { "start": 40.76, "end": 41.02, "text": "that." },
  { "start": 41.58, "end": 41.82, "text": "Bezos" },
  { "start": 41.82, "end": 42.24, "text": "said," },
  { "start": 42.42, "end": 42.50, "text": "if" },
  { "start": 42.50, "end": 42.62, "text": "you" },
  { "start": 42.62, "end": 42.72, "text": "are" },
  { "start": 42.72, "end": 42.98, "text": "not" },
  { "start": 2.98, "end": 43.38, "text": "failing," },
  { "start": 43.70, "end": 43.80, "text": "you" },
  { "start": 43.80, "end": 43.90, "text": "are" },
  { "start": 43.90, "end": 44.18, "text": "not" },
  { "start": 44.18, "end": 44.76, "text": "innovating." },
  { "start": 45.28, "end": 45.46, "text": "The" },
  { "start": 45.46, "end": 46.38, "text": "$170" },
  { "start": 46.38, "end": 46.92, "text": "million" },
  { "start": 46.92, "end": 47.54, "text": "was" },
  { "start": 47.54, "end": 47.72, "text": "the" },
  { "start": 47.72, "end": 48.10, "text": "tuition" },
  { "start": 48.10, "end": 48.46, "text": "fee." },
  { "start": 49.08, "end": 49.28, "text": "The" },
  { "start": 49.28, "end": 49.58, "text": "lessons" },
  { "start": 49.58, "end": 49.86, "text": "they" },
  { "start": 49.86, "end": 50.12, "text": "learned" },
  { "start": 50.12, "end": 50.32, "text": "from" },
  { "start": 50.32, "end": 50.46, "text": "the" },
  { "start": 50.46, "end": 50.70, "text": "fire" },
  { "start": 50.70, "end": 51.12, "text": "phone's" },
  { "start": 51.12, "end": 51.40, "text": "failure," },
  { "start": 51.70, "end": 51.78, "text": "the" },
  { "start": 51.78, "end": 52.10, "text": "engineers" },
  { "start": 52.10, "end": 52.60, "text": "they" },
  { "start": 52.60, "end": 52.98, "text": "trained," },
  { "start": 53.14, "end": 53.20, "text": "the" },
  { "start": 53.20, "end": 53.60, "text": "supply" },
  { "start": 53.60, "end": 53.92, "text": "chains" },
  { "start": 53.92, "end": 54.14, "text": "they" },
  { "start": 54.14, "end": 54.36, "text": "built" },
  { "start": 54.36, "end": 54.64, "text": "were" },
  { "start": 54.64, "end": 54.90, "text": "not" },
  { "start": 54.90, "end": 55.16, "text": "thrown" },
  { "start": 55.16, "end": 55.46, "text": "away." },
  { "start": 55.46, "end": 56.26, "text": "They" },
  { "start": 56.26, "end": 56.42, "text": "were" },
  { "start": 56.42, "end": 57.28, "text": "repurposed." },
  { "start": 57.82, "end": 57.96, "text": "That" },
  { "start": 57.96, "end": 58.30, "text": "same" },
  { "start": 58.30, "end": 58.68, "text": "team," },
  { "start": 58.90, "end": 59.04, "text": "that" },
  { "start": 59.04, "end": 59.38, "text": "same" },
  { "start": 59.38, "end": 59.80, "text": "knowledge" },
  { "start": 59.80, "end": 60.22, "text": "went" },
  { "start": 60.22, "end": 60.38, "text": "on" },
  { "start": 60.38, "end": 60.52, "text": "to" },
  { "start": 60.52, "end": 60.82, "text": "create" },
  { "start": 60.82, "end": 61.02, "text": "the" },
  { "start": 61.02, "end": 61.34, "text": "Amazon" },
  { "start": 61.34, "end": 61.82, "text": "Echo" },
  { "start": 61.82, "end": 62.08, "text": "and" },
  { "start": 62.08, "end": 62.46, "text": "Alexa," },
  { "start": 63.00, "end": 63.18, "text": "a" },
  { "start": 63.18, "end": 63.52, "text": "product" },
  { "start": 63.52, "end": 63.76, "text": "that" },
  { "start": 3.76, "end": 64.10, "text": "created" },
  { "start": 64.10, "end": 64.34, "text": "an" },
  { "start": 64.34, "end": 64.86, "text": "entirely" },
  { "start": 64.86, "end": 65.32, "text": "new" },
  { "start": 65.32, "end": 65.80, "text": "category" },
  { "start": 65.80, "end": 66.04, "text": "of" },
  { "start": 66.04, "end": 66.60, "text": "technology." },
  { "start": 67.12, "end": 67.36, "text": "By" },
  { "start": 67.36, "end": 68.04, "text": "2019," },
  { "start": 68.50, "end": 68.80, "text": "tens" },
  { "start": 68.80, "end": 69.06, "text": "of" },
  { "start": 69.06, "end": 69.32, "text": "millions" },
  { "start": 69.32, "end": 69.58, "text": "of" },
  { "start": 69.58, "end": 69.86, "text": "homes" },
  { "start": 69.86, "end": 70.08, "text": "had" },
  { "start": 70.08, "end": 70.26, "text": "an" },
  { "start": 70.26, "end": 70.48, "text": "Echo" },
  { "start": 70.48, "end": 70.80, "text": "device." },
  { "start": 71.48, "end": 71.62, "text": "The" },
  { "start": 71.62, "end": 71.96, "text": "ashes" },
  { "start": 71.96, "end": 72.18, "text": "of" },
  { "start": 72.18, "end": 72.32, "text": "their" },
  { "start": 72.32, "end": 72.66, "text": "biggest" },
  { "start": 72.66, "end": 73.08, "text": "failure" },
  { "start": 73.08, "end": 73.52, "text": "became" },
  { "start": 73.52, "end": 73.72, "text": "the" },
  { "start": 73.72, "end": 74.10, "text": "soil" },
  { "start": 74.10, "end": 74.36, "text": "for" },
  { "start": 74.36, "end": 74.52, "text": "one" },
  { "start": 74.52, "end": 74.60, "text": "of" },
  { "start": 74.60, "end": 74.74, "text": "their" },
  { "start": 74.74, "end": 75.08, "text": "biggest" },
  { "start": 75.08, "end": 75.68, "text": "successes." },
  { "start": 76.54, "end": 76.96, "text": "Failure" },
  { "start": 76.96, "end": 77.16, "text": "is" },
  { "start": 77.16, "end": 77.60, "text": "only" },
  { "start": 77.60, "end": 78.04, "text": "failure" },
  { "start": 78.04, "end": 78.32, "text": "if" },
  { "start": 78.32, "end": 78.44, "text": "you" },
  { "start": 78.44, "end": 78.66, "text": "learn" },
  { "start": 78.66, "end": 79.10, "text": "nothing" },
  { "start": 79.10, "end": 79.40, "text": "from" },
  { "start": 79.40, "end": 79.60, "text": "it." }
];

const Word: React.FC<{
  text: string;
  start: number; // in seconds
  end: number; // in seconds
}> = ({ text, start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = Math.floor(start * fps);
  const endFrame = Math.floor(end * fps);
  const durationInFrames = endFrame - startFrame;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + FADE_DURATION, endFrame - FADE_DURATION, endFrame],
    [0, 1, 1, 0]
  );

  const y = interpolate(
    frame,
    [startFrame, startFrame + FADE_DURATION],
    [10, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translateY(${y}px)`,
        marginLeft: '0.25em',
        marginRight: '0.25em',
      }}
    >
      {text}
    </span>
  );
};

const ParallaxScene: React.FC<{
  from: number;
  durationInFrames: number;
  bgImage: string;
  midImage?: string;
  fgImage?: string;
  children?: React.ReactNode;
}> = ({ from, durationInFrames, bgImage, midImage, fgImage, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Scene-specific progress
  const progress = interpolate(frame, [from, from + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sceneOpacity = interpolate(
    progress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0]
  );

  // Parallax factors
  const bgScale = 1.2;
  const midScale = 1.3;
  const fgScale = 1.4;

  const bgX = interpolate(progress, [0, 1], [0, -width * 0.05]);
  const bgY = interpolate(progress, [0, 1], [0, height * 0.02]);
  
  const midX = interpolate(progress, [0, 1], [0, -width * 0.1]);
  const midY = interpolate(progress, [0, 1], [0, height * 0.04]);
  
  const fgX = interpolate(progress, [0, 1], [0, -width * 0.15]);
  const fgY = interpolate(progress, [0, 1], [0, height * 0.06]);
  
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <Img
        src={bgImage}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${bgScale}) translate(${bgX}px, ${bgY}px)`,
        }}
      />
      {midImage && (
        <Img
          src={midImage}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${midScale}) translate(${midX}px, ${midY}px)`,
          }}
        />
      )}
      {fgImage && (
        <Img
          src={fgImage}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${fgScale}) translate(${fgX}px, ${fgY}px)`,
          }}
        />
      )}
      {children}
    </AbsoluteFill>
  );
};

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();

  // Global cinematic camera movement
  const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  const cameraPanX = interpolate(frame, [0, durationInFrames], [0, -width * 0.05]);
  const cameraPanY = interpolate(frame, [0, durationInFrames], [0, height * 0.05]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${cameraZoom}) translate(${cameraPanX}px, ${cameraPanY}px)`,
        }}
      >

        {/* Scene 1: 0.00s - 5.5s */}
        <Sequence from={0} durationInFrames={5.5 * fps}>
          <ParallaxScene
            from={0}
            durationInFrames={5.5 * fps}
            // A dark, moody background with subtle, warm light rays.
            bgImage={'assets/images/workshop_bg.jpg'}
            // A blurry midground of a cluttered workbench with tools and schematics.
            midImage={'assets/images/workshop_mid.jpg'}
            // A sharp, high-resolution vintage brass key with transparent background.
            fgImage={'assets/images/key.png'}
          />
        </Sequence>

        {/* Scene 2: 5.5s - 13.3s */}
        <Sequence from={5.5 * fps} durationInFrames={7.8 * fps}>
          <ParallaxScene
            from={5.5 * fps}
            durationInFrames={7.8 * fps}
            // A dark, empty, and slightly foggy background.
            bgImage={'assets/images/foggy_bg.jpg'}
            // A wide shot of a vast, dimly lit, empty warehouse interior.
            midImage={'assets/images/dark_warehouse_mid.jpg'}
            // A semi-transparent, glowing blue circuit board that looks ethereal or ghostly.
            fgImage={'assets/images/ghostly_circuit.png'}
          />
        </Sequence>

        {/* Scene 3: 13.3s - 16.6s */}
        <Sequence from={13.3 * fps} durationInFrames={3.3 * fps}>
          <ParallaxScene
            from={13.3 * fps}
            durationInFrames={3.3 * fps}
            // A dark background with floating, out-of-focus orange embers.
            bgImage={'assets/images/ember_bg.jpg'}
            // A wide shot of an empty presentation stage, lit by a single spotlight.
            midImage={'assets/images/empty_stage_mid.jpg'}
            // A clean, black silhouette of a modern smartphone, with transparency.
            fgImage={'assets/images/fire_phone_silhouette.png'}
          />
        </Sequence>

        {/* Scene 4: 16.6s - 26.3s */}
        <Sequence from={16.6 * fps} durationInFrames={9.7 * fps}>
          <ParallaxScene
            from={16.6 * fps}
            durationInFrames={9.7 * fps}
            // A cold, grey, textured concrete wall.
            bgImage={'assets/images/concrete_wall_bg.jpg'}
            // A collage of blurred newspaper headlines about financial loss and failure.
            midImage={'assets/images/negative_headlines_mid.jpg'}
            // A transparent PNG overlay of cracked/shattered glass.
            fgImage={'assets/images/shattered_glass.png'}
          />
        </Sequence>

        {/* Scene 5: 26.3s - 31.1s */}
        <Sequence from={26.3 * fps} durationInFrames={4.8 * fps}>
          <ParallaxScene
            from={26.3 * fps}
            durationInFrames={4.8 * fps}
            // A dark, dramatic, and stormy cloudscape.
            bgImage={'assets/images/stormy_sky_bg.jpg'}
            // Two massive, imposing glass-and-steel skyscrapers, representing corporate giants.
            midImage={'assets/images/corporate_towers_mid.jpg'}
            // A small, lone human silhouette looking up at the towers, with transparency.
            fgImage={'assets/images/lone_figure_silhouette.png'}
          />
        </Sequence>

        {/* Scene 6: 31.1s - 39.5s */}
        <Sequence from={31.1 * fps} durationInFrames={8.4 * fps}>
          <ParallaxScene
            from={31.1 * fps}
            durationInFrames={8.4 * fps}
            // A view through a large window with rain streaks running down the glass.
            bgImage={'assets/images/rainy_window_bg.jpg'}
            // A disheveled, dark, and empty corporate boardroom with chairs askew.
            midImage={'assets/images/empty_boardroom_mid.jpg'}
          />
        </Sequence>

        {/* Scene 7: 39.5s - 45.2s */}
        <Sequence from={39.5 * fps} durationInFrames={5.7 * fps}>
          <ParallaxScene
            from={39.5 * fps}
            durationInFrames={5.7 * fps}
            // A beautiful, warm sunrise breaking through clouds.
            bgImage={'assets/images/sunrise_bg.jpg'}
            // A semi-transparent, glowing tech blueprint or schematic diagram.
            midImage={'assets/images/blueprint_schematic_mid.jpg'}
            // A vibrant green plant sprout growing from a crack in grey concrete.
            fgImage={'assets/images/sprout_from_concrete.png'}
          />
        </Sequence>

        {/* Scene 8: 45.2s - 57.8s */}
        <Sequence from={45.2 * fps} durationInFrames={12.6 * fps}>
          <ParallaxScene
            from={45.2 * fps}
            durationInFrames={12.6 * fps}
            // A clean, futuristic data center or server room with rows of machines.
            bgImage={'assets/images/server_room_bg.jpg'}
            // A motion-blurred image of a team of engineers collaborating at workstations.
            midImage={'assets/images/blurry_engineers_mid.jpg'}
            // A transparent overlay of a glowing network of lines and dots, like a neural network.
            fgImage={'assets/images/neural_network_overlay.png'}
          />
        </Sequence>
        
        {/* Scene 9: 57.8s - 67.1s */}
        <Sequence from={57.8 * fps} durationInFrames={9.3 * fps}>
          <ParallaxScene
            from={57.8 * fps}
            durationInFrames={9.3 * fps}
            // A warm, cozy, and slightly out-of-focus living room interior at dusk.
            bgImage={'assets/images/cozy_living_room_bg.jpg'}
            // The iconic, simple silhouette of an Amazon Echo device.
            midImage={'assets/images/echo_silhouette.png'}
            // A circular, glowing sound wave graphic emanating from the center.
            fgImage={'assets/images/soundwave_effect.png'}
          />
        </Sequence>
        
        {/* Scene 10: 67.1s - 71.4s */}
        <Sequence from={67.1 * fps} durationInFrames={4.3 * fps}>
          <ParallaxScene
            from={67.1 * fps}
            durationInFrames={4.3 * fps}
            // An aerial, out-of-focus shot of a sprawling city grid at night.
            bgImage={'assets/images/city_at_night_bg.jpg'}
            // A transparent overlay of a country map with many animated glowing points appearing.
            fgImage={'assets/images/glowing_map_dots.png'}
          />
        </Sequence>
        
        {/* Scene 11: 71.4s - 80s */}
        <Sequence from={71.4 * fps}>
          <ParallaxScene
            from={71.4 * fps}
            durationInFrames={9 * fps}
            // A bright, clear blue sky with soft, wispy clouds.
            bgImage={'assets/images/bright_sky_bg.jpg'}
            // A vibrant, sun-dappled green forest, full of life.
            midImage={'assets/images/lush_forest_mid.jpg'}
            // A stylized, glowing phoenix silhouette rising, with transparent background.
            fgImage={'assets/images/phoenix_from_ash.png'}
          />
        </Sequence>

      </AbsoluteFill>

      {/* Subtitles */}
      <AbsoluteFill>
        <div
          style={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            position: 'absolute',
            bottom: '10%',
            width: '100%',
            padding: '0 5%',
            textShadow: '0 0 15px rgba(0,0,0,0.8)',
          }}
        >
          {transcript.map((word, i) => (
            <Word key={i} text={word.text} start={word.start} end={word.end} />
          ))}
        </div>
      </AbsoluteFill>

      {/* Dust/Glow Overlay */}
      <AbsoluteFill
        style={{
          // A subtle dust particle overlay can be made with a repeating transparent png.
          // backgroundImage: `url(assets/images/dust_overlay.png)`,
          // backgroundSize: 'cover',
          mixBlendMode: 'screen',
          opacity: 0.2,
        }}
      />

      <Audio src={audioFile} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  // Calculate total duration from the last word's end time.
  const lastWord = transcript[transcript.length - 1];
  const durationInSeconds = lastWord.end + 0.5; // Add a little buffer

  return (
    <Composition
      id="Story"
      component={RemotionVideo}
      durationInFrames={Math.ceil(durationInSeconds * fps)}
      fps={fps}
      width={1920}
      height={1080}
    />
  );
};
```