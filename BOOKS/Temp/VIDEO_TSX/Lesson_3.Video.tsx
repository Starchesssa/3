```tsx
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import React from 'react';

// --- Helper Functions and Components ---

// Converts time in seconds to frames
const F = (seconds: number, fps: number) => Math.round(seconds * fps);

// Props for our Word component
interface WordProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

// Component to animate individual words or phrases
const Word: React.FC<WordProps> = ({ children, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in for the first 5 frames, and fade out for the last 10 frames
  const opacity = interpolate(
    frame,
    [0, 5, durationInFrames - 10, durationInFrames],
    [0, 1, 1, 0]
  );

  // Slight upward movement on entrance
  const transform = `translateY(${interpolate(
    frame,
    [0, 8],
    [10, 0],
    { extrapolateRight: 'clamp' }
  )}px)`;

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform,
        color: '#FFFFFF',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '6.5vw',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '0 0 15px rgba(255, 255, 255, 0.7)',
        ...style
      }}
    >
      {children}
    </span>
  );
};


// Props for our Scene component
interface SceneProps {
  from: number;
  durationInFrames: number;
  children: React.ReactNode;
  bgImage: string; // Background image, moves the least
  mgImage?: string; // Midground image, moves moderately
  fgImage?: string; // Foreground image, moves the most
  cameraX: number; // Camera horizontal pan interpolation value
  cameraY: number; // Camera vertical pan interpolation value
  cameraZoom: number; // Camera zoom interpolation value
}

// Component to manage a scene with parallax effect
const Scene: React.FC<SceneProps> = ({
  from,
  durationInFrames,
  children,
  bgImage,
  mgImage,
  fgImage,
  cameraX,
  cameraY,
  cameraZoom,
}) => {
  const { fps } = useVideoConfig();
  const FADE_DURATION = 0.5 * fps; // 0.5 second fade in/out

  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <AbsoluteFill
        style={{
          opacity: interpolate(
            useCurrentFrame(),
            [0, FADE_DURATION, durationInFrames - FADE_DURATION, durationInFrames],
            [0, 1, 1, 0]
          ),
          transform: `scale(${cameraZoom}) translateX(${cameraX}px) translateY(${cameraY}px)`,
        }}
      >
        {/* Background Layer */}
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile(bgImage)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(1.2) translateX(${cameraX * 0.1}px) translateY(${cameraY * 0.1}px)`,
          }}
        />
        {/* Midground Layer */}
        {mgImage && (
          <AbsoluteFill
            style={{
              backgroundImage: `url(${staticFile(mgImage)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(1.1) translateX(${cameraX * 0.3}px) translateY(${cameraY * 0.3}px)`,
            }}
          />
        )}
        {/* Foreground Layer */}
        {fgImage && (
          <AbsoluteFill
            style={{
              backgroundImage: `url(${staticFile(fgImage)})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center bottom',
              transform: `translateX(${cameraX * 0.6}px) translateY(${cameraY * 0.6}px)`,
            }}
          />
        )}
        {/* Text content */}
        <AbsoluteFill style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 5%'
        }}>
          <div>{children}</div>
        </AbsoluteFill>
      </AbsoluteFill>
    </Sequence>
  );
};


// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Main cinematic camera movement across the entire video
  const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  const cameraX = interpolate(frame, [0, durationInFrames], [0, -80]);
  const cameraY = interpolate(frame, [0, durationInFrames], [20, -20]);

  // Transcript data with frame calculations
  const words = [
    { text: "Key lesson.", start: 0.00, end: 0.80, scene: 1 },
    { text: "Profitability is a weapon,", start: 1.66, end: 3.02, scene: 1 },
    { text: "not just a goal.", start: 3.40, end: 4.30, scene: 1 },
    { text: "Now is 2003.", start: 5.38, end: 6.76, scene: 2 },
    { text: "The .com graveyard is full.", start: 7.38, end: 9.24, scene: 2 },
    { text: "Amazon is still standing,", start: 9.90, end: 11.28, scene: 3 },
    { text: "but it is wounded.", start: 11.66, end: 12.44, scene: 3 },
    { text: "The pressure is immense.", start: 12.92, end: 14.18, scene: 3 },
    { text: "They had to prove the model worked.", start: 14.96, end: 16.82, scene: 4 },
    { text: "They had to show they could actually make money.", start: 17.28, end: 19.66, scene: 4 },
    { text: "And the fourth quarter of 2001,", start: 20.48, end: 22.06, scene: 5 },
    { text: "they posted their first ever profit.", start: 22.46, end: 24.40, scene: 5 },
    { text: "It was tiny,", start: 24.92, end: 25.74, scene: 6 },
    { text: "just $5 million", start: 26.14, end: 27.20, scene: 6 },
    { text: "on over $1 billion in sales.", start: 27.20, end: 29.78, scene: 6 },
    { text: "By 2003, they were consistently profitable.", start: 30.48, end: 33.38, scene: 7 },
    { text: "This wasn't about pleasing Wall Street anymore.", start: 33.82, end: 36.02, scene: 7 },
    { text: "It was about generating their own fuel.", start: 36.56, end: 38.62, scene: 8 },
    { text: "Profit wasn't the end goal.", start: 39.22, end: 40.68, scene: 8 },
    { text: "Profit was the cash that allowed them", start: 41.16, end: 43.02, scene: 9 },
    { text: "to build more, to experiment more,", start: 43.20, end: 45.22, scene: 9 },
    { text: "to take bigger risks without asking for permission.", start: 45.54, end: 48.24, scene: 9 },
    { text: "It was the foundation for the next decade of war.", start: 49.08, end: 51.78, scene: 10 },
  ].map(w => ({
    ...w,
    from: F(w.start, fps),
    duration: F(w.end - w.start, fps),
  }));

  const getWordsForScene = (sceneId: number) => {
    return words
      .filter(w => w.scene === sceneId)
      .map(word => (
        <Sequence key={word.text} from={word.from} durationInFrames={word.duration}>
          <Word>{word.text}</Word>
        </Sequence>
      ));
  };


  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_3.wav')} />

      {/* --- SCENES --- */}
      
      {/* Scene 1: 0s - 5.3s */}
      {/* Image: Abstract glowing key (mg) on a dark, textured background (bg). */}
      <Scene from={0} durationInFrames={F(5.3, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/dark_texture_bg.jpg"
        mgImage="assets/images/glowing_key_mg.png"
      >
        {getWordsForScene(1)}
      </Scene>
      
      {/* Scene 2: 5.3s - 9.8s */}
      {/* Image: A digital graveyard with computer monitors as tombstones under a dark sky. */}
      <Scene from={F(5.3, fps)} durationInFrames={F(4.5, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/dotcom_graveyard_bg.jpg"
        mgImage="assets/images/tombstones_mg.png"
      >
        {getWordsForScene(2)}
      </Scene>

      {/* Scene 3: 9.8s - 14.9s */}
      {/* Image: A single, slightly damaged skyscraper in a desolate city (mg). Scratched glass overlay (fg). */}
      <Scene from={F(9.8, fps)} durationInFrames={F(5.1, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/desolate_city_bg.jpg"
        mgImage="assets/images/wounded_skyscraper_mg.png"
        fgImage="assets/images/scratched_glass_fg.png"
      >
        {getWordsForScene(3)}
      </Scene>

      {/* Scene 4: 14.9s - 20.4s */}
      {/* Image: A glowing blueprint background with financial charts overlaid. */}
      <Scene from={F(14.9, fps)} durationInFrames={F(5.5, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/blueprint_bg.jpg"
        mgImage="assets/images/financial_charts_mg.png"
      >
        {getWordsForScene(4)}
      </Scene>
      
      {/* Scene 5: 20.4s - 24.9s */}
      {/* Image: A close-up on a financial document with a single number highlighted. */}
      <Scene from={F(20.4, fps)} durationInFrames={F(4.5, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/document_closeup_bg.jpg"
        fgImage="assets/images/highlighted_profit_fg.png"
      >
        {getWordsForScene(5)}
      </Scene>
      
      {/* Scene 6: 24.9s - 30.4s */}
      {/* Image: A vast warehouse full of boxes (bg) with a tiny, glowing pile of coins (fg). */}
      <Scene from={F(24.9, fps)} durationInFrames={F(5.5, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/vast_warehouse_bg.jpg"
        fgImage="assets/images/tiny_coin_pile_fg.png"
      >
        {getWordsForScene(6)}
      </Scene>
      
      {/* Scene 7: 30.4s - 36.5s */}
      {/* Image: A powerful factory (mg) against a sunrise (bg), with Wall Street skyline distant and out of focus. */}
      <Scene from={F(30.4, fps)} durationInFrames={F(6.1, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/sunrise_sky_bg.jpg"
        mgImage="assets/images/power_factory_mg.png"
      >
        {getWordsForScene(7)}
      </Scene>
      
      {/* Scene 8: 36.5s - 41.1s */}
      {/* Image: A powerful, glowing industrial engine (mg) in a dark engine room (bg). */}
      <Scene from={F(36.5, fps)} durationInFrames={F(4.6, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/dark_engine_room_bg.jpg"
        mgImage="assets/images/glowing_engine_mg.png"
      >
        {getWordsForScene(8)}
      </Scene>
      
      {/* Scene 9: 41.1s - 49s */}
      {/* Image: A workbench with scattered tools and blueprints (bg), with lightbulbs lighting up (fg). */}
      <Scene from={F(41.1, fps)} durationInFrames={F(7.9, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/workbench_bg.jpg"
        fgImage="assets/images/idea_lightbulbs_fg.png"
      >
        {getWordsForScene(9)}
      </Scene>

      {/* Scene 10: 49s - 52.5s */}
      {/* Image: A grand chessboard with one piece lit up, ready to move, on a dark background. */}
      <Scene from={F(49, fps)} durationInFrames={F(3.5, fps)}
        cameraX={cameraX} cameraY={cameraY} cameraZoom={cameraZoom}
        bgImage="assets/images/dark_texture_bg.jpg"
        mgImage="assets/images/chessboard_mg.png"
      >
        {getWordsForScene(10)}
      </Scene>

      {/* --- VFX Overlays --- */}

      {/* Dust Particles Overlay */}
      {/* Image: A transparent PNG with subtle, floating dust motes. */}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('assets/images/dust_overlay.png')})`,
          backgroundSize: 'cover',
          opacity: 0.1,
          transform: `translateX(${frame * 0.1}px) translateY(${-frame * 0.05}px)`,
        }}
      />

      {/* Vignette Overlay */}
      <AbsoluteFill
        style={{
          boxShadow: 'inset 0 0 150px 50px rgba(0,0,0,0.7)',
        }}
      />
    </AbsoluteFill>
  );
};
```