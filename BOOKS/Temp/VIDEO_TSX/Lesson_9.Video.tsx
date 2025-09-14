```typescript
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
} from 'remotion';
import React from 'react';
import { interpolate } from 'remotion';
import { z } from 'zod';

export const myCompSchema = z.object({});

// --- Data Section ---

// Define the structure for each word in the transcript
interface TranscriptWord {
  start: number;
  end: number;
  text: string;
}

// Full transcript with word timings
const transcript: TranscriptWord[] = [
  { start: 0.0, end: 0.52, text: 'Key' },
  { start: 0.52, end: 0.96, text: 'lesson,' },
  { start: 1.42, end: 1.76, text: 'growth' },
  { start: 1.76, end: 2.16, text: 'is' },
  { start: 2.16, end: 2.64, text: 'never' },
  { start: 2.64, end: 2.9, text: 'a' },
  { start: 2.9, end: 3.14, text: 'straight' },
  { start: 3.14, end: 3.54, text: 'line.' },
  { start: 4.22, end: 4.76, text: 'Finally,' },
  { start: 5.04, end: 5.14, text: 'we' },
  { start: 5.14, end: 5.42, text: 'arrive' },
  { start: 5.42, end: 5.62, text: 'at' },
  { start: 5.62, end: 6.26, text: '2022.' },
  { start: 7.08, end: 7.18, text: 'The' },
  { start: 7.18, end: 7.46, text: 'world' },
  { start: 7.46, end: 7.72, text: 'is' },
  { start: 7.72, end: 8.26, text: 'reopening,' },
  { start: 8.72, end: 8.84, text: 'but' },
  { start: 8.84, end: 9.1, text: 'there' },
  { start: 9.1, end: 9.3, text: 'is' },
  { start: 9.3, end: 9.4, text: 'a' },
  { start: 9.4, end: 9.62, text: 'new' },
  { start: 9.62, end: 10.2, text: 'reality.' },
  { start: 10.82, end: 11.38, text: 'Inflation' },
  { start: 11.38, end: 11.62, text: 'is' },
  { start: 11.62, end: 11.94, text: 'high,' },
  { start: 12.32, end: 12.52, text: 'the' },
  { start: 12.52, end: 12.84, text: 'stock' },
  { start: 12.84, end: 13.2, text: 'market' },
  { start: 13.2, end: 13.44, text: 'is' },
  { start: 13.44, end: 13.92, text: 'punishing' },
  { start: 13.92, end: 14.22, text: 'tech' },
  { start: 14.22, end: 14.62, text: 'companies.' },
  { start: 15.24, end: 15.42, text: 'The' },
  { start: 15.42, end: 15.88, text: 'pandemic' },
  { start: 15.88, end: 16.2, text: 'boom' },
  { start: 16.2, end: 16.56, text: 'is' },
  { start: 16.56, end: 16.94, text: 'over.' },
  { start: 17.6, end: 17.94, text: 'Amazon' },
  { start: 17.94, end: 18.48, text: 'stock' },
  { start: 18.48, end: 18.72, text: 'fell' },
  { start: 18.72, end: 18.98, text: 'nearly' },
  { start: 18.98, end: 19.52, text: '50' },
  { start: 19.52, end: 19.96, text: '%' },
  { start: 19.96, end: 20.26, text: 'during' },
  { start: 20.26, end: 20.96, text: '2022,' },
  { start: 21.58, end: 21.7, text: 'a' },
  { start: 21.7, end: 22.18, text: 'massive' },
  { start: 22.18, end: 22.56, text: 'drop.' },
  { start: 23.08, end: 23.42, text: 'They' },
  { start: 23.42, end: 23.62, text: 'had' },
  { start: 23.62, end: 24.3, text: 'overbuilt,' },
  { start: 24.66, end: 24.86, text: 'they' },
  { start: 24.86, end: 25.02, text: 'had' },
  { start: 25.02, end: 25.34, text: 'hired' },
  { start: 25.34, end: 25.7, text: 'too' },
  { start: 25.7, end: 25.9, text: 'many' },
  { start: 25.9, end: 26.26, text: 'people' },
  { start: 26.26, end: 26.54, text: 'during' },
  { start: 26.54, end: 26.68, text: 'the' },
  { start: 26.68, end: 27.08, text: 'pandemic' },
  { start: 27.08, end: 27.56, text: 'frenzy.' },
  { start: 28.03, end: 28.36, text: 'Now' },
  { start: 28.36, end: 28.74, text: 'they' },
  { start: 28.74, end: 29.0, text: 'had' },
  { start: 29.0, end: 29.2, text: 'to' },
  { start: 29.2, end: 29.5, text: 'correct.' },
  { start: 29.98, end: 30.34, text: 'The' },
  { start: 30.34, end: 30.66, text: 'company' },
  { start: 30.66, end: 31.14, text: 'announced' },
  { start: 31.14, end: 31.6, text: 'layoffs,' },
  { start: 31.9, end: 32.36, text: 'eventually' },
  { start: 32.36, end: 32.86, text: 'totalling' },
  { start: 32.86, end: 33.14, text: 'over' },
  { start: 33.14, end: 33.84, text: '27' },
  { start: 33.84, end: 34.46, text: ',000' },
  { start: 34.46, end: 35.0, text: 'employees.' },
  { start: 35.42, end: 35.94, text: 'The' },
  { start: 35.94, end: 36.3, text: 'media' },
  { start: 36.3, end: 36.5, text: 'wrote' },
  { start: 36.5, end: 36.96, text: 'stories' },
  { start: 36.96, end: 37.2, text: 'about' },
  { start: 37.2, end: 37.82, text: 'Amazon\'s' },
  { start: 37.82, end: 38.1, text: 'decline,' },
  { start: 38.68, end: 38.8, text: 'but' },
  { start: 38.8, end: 38.98, text: 'they' },
  { start: 38.98, end: 39.12, text: 'were' },
  { start: 39.12, end: 39.46, text: 'missing' },
  { start: 39.46, end: 39.66, text: 'the' },
  { start: 39.66, end: 39.88, text: 'point' },
  { start: 39.88, end: 40.2, text: 'again.' },
  { start: 40.84, end: 41.0, text: 'They' },
  { start: 41.0, end: 41.14, text: 'were' },
  { start: 41.14, end: 41.44, text: 'looking' },
  { start: 41.44, end: 41.64, text: 'at' },
  { start: 41.64, end: 41.78, text: 'the' },
  { start: 41.78, end: 42.12, text: 'stock' },
  { start: 42.12, end: 42.5, text: 'price,' },
  { start: 42.74, end: 43.0, text: 'not' },
  { start: 43.0, end: 43.2, text: 'the' },
  { start: 43.2, end: 43.56, text: 'machine.' },
  { start: 44.26, end: 44.56, text: 'Yes,' },
  { start: 44.9, end: 45.0, text: 'the' },
  { start: 45.0, end: 45.26, text: 'e' },
  { start: 45.26, end: 45.44, text: '-commerce' },
  { start: 45.44, end: 45.9, text: 'business' },
  { start: 45.9, end: 46.16, text: 'was' },
  { start: 46.16, end: 46.54, text: 'slowing' },
  { start: 46.54, end: 46.8, text: 'down' },
  { start: 46.8, end: 47.06, text: 'from' },
  { start: 47.06, end: 47.24, text: 'its' },
  { start: 47.24, end: 47.9, text: 'impossible' },
  { start: 47.9, end: 48.44, text: 'pandemic' },
  { start: 48.44, end: 48.84, text: 'highs.' },
  { start: 49.32, end: 49.54, text: 'But' },
  { start: 49.54, end: 49.7, text: 'the' },
  { start: 49.7, end: 50.02, text: 'real' },
  { start: 50.02, end: 50.44, text: 'engine,' },
  { start: 50.76, end: 51.12, text: 'AWS,' },
  { start: 51.78, end: 51.9, text: 'was' },
  { start: 51.9, end: 52.32, text: 'still' },
  { start: 52.32, end: 52.78, text: 'growing.' },
  { start: 53.42, end: 54.0, text: 'AWS' },
  { start: 54.0, end: 54.84, text: 'generated' },
  { start: 54.84, end: 55.34, text: '$80' },
  { start: 55.34, end: 55.74, text: 'billion' },
  { start: 55.74, end: 56.34, text: 'in' },
  { start: 56.34, end: 56.7, text: 'revenue' },
  { start: 56.7, end: 56.84, text: 'in' },
  { start: 56.84, end: 57.54, text: '2022.' },
  { start: 58.1, end: 58.54, text: 'Its' },
  { start: 58.54, end: 59.04, text: 'operating' },
  { start: 59.04, end: 59.48, text: 'income' },
  { start: 59.48, end: 59.76, text: 'was' },
  { start: 59.76, end: 60.24, text: '$22' },
  { start: 60.24, end: 61.0, text: '.8' },
  { start: 61.0, end: 61.36, text: 'billion.' },
  { start: 62.08, end: 62.58, text: 'The' },
  { start: 62.58, end: 63.0, text: 'retail' },
  { start: 63.0, end: 63.42, text: 'business' },
  { start: 63.42, end: 63.96, text: 'actually' },
  { start: 63.96, end: 64.28, text: 'lost' },
  { start: 64.28, end: 64.68, text: 'money' },
  { start: 64.68, end: 64.92, text: 'that' },
  { start: 64.92, end: 65.16, text: 'year.' },
  { start: 65.74, end: 65.92, text: 'The' },
  { start: 65.92, end: 66.32, text: 'cash' },
  { start: 66.32, end: 66.52, text: 'cow' },
  { start: 66.52, end: 66.8, text: 'was' },
  { start: 66.8, end: 67.1, text: 'keeping' },
  { start: 67.1, end: 67.36, text: 'the' },
  { start: 67.36, end: 67.92, text: 'entire' },
  { start: 67.92, end: 68.46, text: 'empire' },
  { start: 68.46, end: 69.02, text: 'afloat' },
  { start: 69.02, end: 69.2, text: 'during' },
  { start: 69.2, end: 69.36, text: 'the' },
  { start: 69.36, end: 69.7, text: 'storm.' },
  { start: 70.36, end: 70.64, text: 'This' },
  { start: 70.64, end: 70.9, text: 'is' },
  { start: 70.9, end: 71.06, text: 'the' },
  { start: 71.06, end: 71.44, text: 'final' },
  { start: 71.44, end: 71.84, text: 'lesson.' },
  { start: 72.42, end: 72.54, text: 'The' },
  { start: 72.54, end: 72.96, text: 'system' },
  { start: 72.96, end: 73.24, text: 'is' },
  { start: 73.24, end: 73.54, text: 'more' },
  { start: 73.54, end: 74.08, text: 'resilient' },
  { start: 74.08, end: 74.42, text: 'than' },
  { start: 74.42, end: 74.84, text: 'any' },
  { start: 74.84, end: 75.2, text: 'single' },
  { start: 75.2, end: 75.46, text: 'year' },
  { start: 75.46, end: 75.78, text: 'stock' },
  { start: 75.78, end: 76.3, text: 'performance.' },
  { start: 76.86, end: 77.26, text: 'You' },
  { start: 77.26, end: 77.52, text: 'build' },
  { start: 77.52, end: 77.7, text: 'a' },
  { start: 77.7, end: 78.42, text: 'diversified' },
  { start: 78.42, end: 78.86, text: 'machine' },
  { start: 78.86, end: 79.32, text: 'so' },
  { start: 79.32, end: 79.46, text: 'that' },
  { start: 79.46, end: 79.64, text: 'when' },
  { start: 79.64, end: 79.88, text: 'one' },
  { start: 79.88, end: 80.12, text: 'part' },
  { start: 80.12, end: 80.32, text: 'is' },
  { start: 80.32, end: 80.52, text: 'weak,' },
  { start: 80.86, end: 81.14, text: 'another' },
  { start: 81.14, end: 81.38, text: 'is' },
  { start: 81.38, end: 81.68, text: 'strong.' },
  { start: 82.28, end: 82.52, text: 'It' },
  { start: 82.52, end: 82.66, text: 'is' },
  { start: 82.66, end: 82.88, text: 'not' },
  { start: 82.88, end: 83.14, text: 'about' },
  { start: 83.14, end: 83.62, text: 'avoiding' },
  { start: 83.62, end: 84.5, text: 'downturns.' },
  { start: 84.8, end: 84.92, text: 'It' },
  { start: 84.92, end: 85.04, text: 'is' },
  { start: 85.04, end: 85.26, text: 'about' },
  { start: 85.26, end: 85.68, text: 'building' },
  { start: 85.68, end: 85.86, text: 'a' },
  { start: 85.86, end: 86.18, text: 'business' },
  { start: 86.18, end: 86.42, text: 'that' },
  { start: 86.42, end: 86.58, text: 'can' },
  { start: 86.58, end: 86.96, text: 'survive' },
  { start: 86.96, end: 87.3, text: 'them.' },
  { start: 87.82, end: 87.98, text: 'And' },
  { start: 87.98, end: 88.24, text: 'then,' },
  { start: 88.46, end: 88.64, text: 'when' },
  { start: 88.64, end: 88.78, text: 'the' },
  { start: 88.78, end: 89.04, text: 'sun' },
  { start: 89.04, end: 89.26, text: 'comes' },
  { start: 89.26, end: 89.48, text: 'out' },
  { start: 89.48, end: 89.72, text: 'again,' },
  { start: 90.08, end: 90.32, text: 'you' },
  { start: 90.32, end: 90.52, text: 'are' },
  { start: 90.52, end: 90.66, text: 'the' },
  { start: 90.66, end: 91.1, text: 'only' },
  { start: 91.1, end: 91.34, text: 'one' },
  { start: 91.34, end: 91.68, text: 'left' },
  { start: 91.68, end: 91.88, text: 'on' },
  { start: 91.88, end: 91.98, text: 'the' },
  { start: 91.98, end: 92.3, text: 'battlefield.' },
];

// --- Helper Components ---

// Word Component: Animates a single word based on its timestamp
const Word: React.FC<{ word: TranscriptWord; fps: number }> = ({
  word,
  fps,
}) => {
  const frame = useCurrentFrame();
  const startFrame = word.start * fps;

  // Animate word opacity to sync with audio
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 5, word.end * fps - 5, word.end * fps],
    [0, 1, 1, 0]
  );

  // Animate word position for a subtle "pop in" effect
  const translateY = interpolate(
    frame,
    [startFrame, startFrame + 10],
    [10, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translateY(${translateY}px)`,
        marginRight: '12px',
        fontSize: '72px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 0 15px rgba(0,0,0,0.8), 0 0 25px rgba(255,255,255,0.4)',
      }}
    >
      {word.text}
    </span>
  );
};

// Parallax Layer Component: Renders and animates a single image layer
const ParallaxLayer: React.FC<{
  src: string;
  z: number; // Simulates Z-depth for parallax effect
  pan: number; // Controlled by the main component's camera animation
  scale: number; // Base scale for the layer
  opacity?: number; // Optional opacity for fading layers
}> = ({ src, z, pan, scale, opacity = 1 }) => {
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: 'absolute',
        width: '120%',
        height: '120%',
        objectFit: 'cover',
        opacity,
        // The core of the parallax effect:
        // translateZ creates depth.
        // translateX is multiplied by depth, so layers further away move less.
        transform: `translateZ(${z}px) translateX(${
          pan * (z * -0.1)
        }px) scale(${scale})`,
        top: '-10%',
        left: '-10%',
      }}
    />
  );
};

// --- Main Video Component ---
export const RemotionVideo: React.FC<z.infer<typeof myCompSchema>> = ({}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // --- Cinematic Camera Animation ---
  const overallProgress = frame / durationInFrames;

  // Slow zoom in across the whole video
  const cameraScale = interpolate(overallProgress, [0, 1], [1, 1.2]);
  // Gentle pan from left to right
  const cameraPan = interpolate(overallProgress, [0, 1], [-50, 50]);

  // --- Scene Definitions ---
  // Each scene has a start time and image layers.
  // Comments describe the intended look and feel for each image.
  const scenes = [
    {
      start: 0,
      end: 6.5,
      layers: {
        // background: A dramatic sky to set a thoughtful tone.
        background: 'assets/images/sky_with_clouds.jpg',
        // midground: A winding path to visually represent "growth is never a straight line".
        midground: 'assets/images/winding_mountain_path.jpg',
        // foreground: Gnarled branches (as a PNG with transparency) to frame the shot and add depth.
        foreground: 'assets/images/gnarled_tree_branch.png',
      },
    },
    {
      start: 6.5,
      end: 17,
      layers: {
        // background: A blurry, abstract stock ticker representing the financial market.
        background: 'assets/images/stock_ticker_blurry.jpg',
        // midground: Imposing skyscrapers, symbolizing corporations and the "punishing" market.
        midground: 'assets/images/skyscrapers_downtown_looking_down.jpg',
        // foreground: A red downward arrow graphic (PNG) to explicitly show decline.
        foreground: 'assets/images/red_graph_arrow_down.png',
      },
    },
    {
      start: 17,
      end: 28,
      layers: {
        // background: An ominous, dark sky to signify trouble.
        background: 'assets/images/dark_cloudy_sky.jpg',
        // midground: A vast, empty warehouse to illustrate the "overbuilt" problem.
        midground: 'assets/images/massive_empty_warehouse.jpg',
        // foreground: Silhouettes of people (PNG) to represent layoffs.
        foreground: 'assets/images/silhouettes_of_people_leaving.png',
      },
    },
    {
      start: 28,
      end: 44,
      layers: {
        // background: The inner workings of a complex machine, representing the true business.
        background: 'assets/images/abstract_gear_mechanism.jpg',
        // midground: A collage of newspaper headlines, symbolizing media noise and superficial analysis.
        midground: 'assets/images/newspaper_clippings_collage.jpg',
        // foreground: A subtle dust particle overlay (PNG) to add texture and atmosphere.
        foreground: 'assets/images/dust_overlay.png',
      },
    },
    {
      start: 44,
      end: 62,
      layers: {
        // background: Glowing blue server racks, the "real engine" of AWS.
        background: 'assets/images/server_racks_glowing_blue.jpg',
        // midground: Abstract data stream lines (PNG) to show information flow and tech power.
        midground: 'assets/images/data_stream_lines.png',
        // foreground: A simple cardboard box (PNG), fading out, representing the less critical e-commerce side.
        foreground: 'assets/images/amazon_box_fading_out.png',
      },
    },
    {
      start: 62,
      end: 72,
      layers: {
        // background: A stormy sea, representing the difficult economic "storm".
        background: 'assets/images/stormy_sea.jpg',
        // midground: A large, solid anchor on the seafloor, symbolizing the stability AWS provided.
        midground: 'assets/images/heavy_anchor.jpg',
        // foreground: A subtle rain-on-glass effect overlay (PNG) to enhance the storm theme.
        foreground: 'assets/images/rain_on_glass_overlay.png',
      },
    },
    {
      start: 72,
      end: 93, // To the end of the video
      layers: {
        // background: The sun breaking through clouds, signifying hope and the end of the downturn.
        background: 'assets/images/sun_breaking_through_clouds.jpg',
        // midground: A lone, strong castle on a hill, representing the resilient business that survived.
        midground: 'assets/images/lone_castle_on_hill.jpg',
        // foreground: A cinematic light flare effect overlay (PNG).
        foreground: 'assets/images/light_flares_overlay.png',
      },
    },
  ];

  const audioFile = staticFile('BOOKS/Temp/TTS/Lesson_9.wav');

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={audioFile} />

      {/* Camera and Parallax Container */}
      <AbsoluteFill
        style={{
          transformStyle: 'preserve-3d',
          perspective: '150px', // This is the key to parallax depth
          transform: `scale(${cameraScale})`,
        }}
      >
        {scenes.map((scene) => {
          const startFrame = scene.start * fps;
          const endFrame = scene.end * fps;

          // Animate scene opacity for smooth crossfades (1 second fade)
          const sceneOpacity = interpolate(
            frame,
            [startFrame, startFrame + fps, endFrame - fps, endFrame],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          if (sceneOpacity === 0) return null;

          return (
            <AbsoluteFill
              key={scene.start}
              style={{ opacity: sceneOpacity, transformStyle: 'preserve-3d' }}
            >
              <ParallaxLayer
                src={scene.layers.background}
                z={-20}
                pan={cameraPan}
                scale={1.5}
              />
              <ParallaxLayer
                src={scene.layers.midground}
                z={-10}
                pan={cameraPan}
                scale={1.2}
              />
              <ParallaxLayer
                src={scene.layers.foreground}
                z={0}
                pan={cameraPan}
                scale={1}
                // Example of fading a specific layer within a scene
                opacity={scene.start === 44 ?
                  interpolate(frame, [startFrame + (fps * 3), startFrame + (fps * 4)], [1, 0], {extrapolateRight: 'clamp'}) : 1
                }
              />
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>

      {/* Text Overlay */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 10%',
        }}
      >
        <div style={{ maxWidth: '80%', textAlign: 'center' }}>
          {transcript.map((word, i) => (
            <Word key={i} word={word} fps={fps} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```