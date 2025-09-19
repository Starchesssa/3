```typescript
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import React from 'react';

// Assumes all image files are in /public/images/
const backgrounds = [
  'abstract_gears_background.jpg', 'bright_sky.jpg', 'city-background.jpg', 'rainy-city.jpg',
  'city_background.jpg', 'tech_city_background.jpg', 'sunrise-field.jpg', 'tech_cityscape.jpg',
  'blueprint_bg.jpg', 'data_center_background.jpg', 'dark_clouds.jpg', 'winding-path.jpg',
  'sky-background.jpg', 'empty_city_street_background.jpg', 'data-center-background.jpg', 'server-room.jpg',
];
const midgrounds = [
  'mountains-far.png', 'gears-midground.png', 'stock-chart-midground.png', 'single-tree.png',
  'falling-chart.png', 'city-skyline-mid.png', 'modern_city.png', 'amazon_warehouse_midground.png',
  'cloud_servers_midground.png', 'server-racks-midground.png', 'buildings_midground.png',
  'broken_gears.png', 'gears-background.png', 'forest-midground.png',
];
const foregrounds = [
  'data_overlay_foreground.png', 'buildings-foreground.png', 'glowing-data.png', 'soundwaves_overlay.png',
  'delivery_drone_foreground.png', 'digital_grid.png', 'fortress.png', 'cracked_glass_overlay.png',
  'biohazard_symbol_overlay.png', 'amazon_box_foreground.png', 'sad-people.png', 'glowing_particles.png',
  'data_stream.png', 'rain_overlay.png', 'phoenix_from_ashes.png', 'resilient-plant.png',
  'data_stream_foreground.png', 'aws-logo.png', 'tech-overlay-foreground.png', 'gears-foreground.png',
];
const keyPhrases = [
  { text: 'Key lesson.', start: 0.0 }, { text: 'Ignore short-term reality', start: 1.48 },
  { text: 'for a long-term vision.', start: 3.2 }, { text: 'The year is 1999.', start: 5.76 },
  { text: 'The dot-com bubble.', start: 9.54 }, { text: 'Stocks only go up.', start: 12.38 },
  { text: 'Amazon is the poster child.', start: 14.28 }, { text: 'Jeff Bezos', start: 19.96 },
  { text: 'is telling Wall Street', start: 21.0 }, { text: 'he is going to lose money.', start: 25.56 },
  { text: 'building the everything store.', start: 34.18 }, { text: 'All about the long-term.', start: 40.28 },
  { text: 'Stocks soared over $100.', start: 46.08 }, { text: 'Not even close.', start: 51.96 },
  { text: 'A bet on a distant future.', start: 55.02 }, { text: 'A global logistics and data empire.', start: 61.56 },
  { text: 'It looked like insanity.', start: 65.96 },
];

const VideoComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- 1. Parallax Layer Animation ---
  const sceneDuration = 4 * fps;
  const sceneIndex = Math.floor(frame / sceneDuration);
  const sceneProgress = (frame % sceneDuration) / sceneDuration;

  const bgImage = staticFile(`images/${backgrounds[sceneIndex % backgrounds.length]}`);
  const mgImage = staticFile(`images/${midgrounds[sceneIndex % midgrounds.length]}`);
  const fgImage = staticFile(`images/${foregrounds[sceneIndex % foregrounds.length]}`);

  const bgScale = interpolate(sceneProgress, [0, 1], [1.1, 1.3]);
  const bgTranslateX = interpolate(sceneProgress, [0, 1], [0, -100]);
  const mgScale = interpolate(sceneProgress, [0, 1], [1.1, 1.4]);
  const mgTranslateX = interpolate(sceneProgress, [0, 1], [0, -250]);
  const fgOpacity = interpolate(sceneProgress, [0, 0.2, 0.8, 1], [0, 0.6, 0.6, 0]);

  // --- 2. Text Animation ---
  const animatedTexts = keyPhrases.map((phrase) => {
    const startFrame = phrase.start * fps;
    const animProgress = spring({ frame, fps, from: startFrame, durationInFrames: 90 });
    const opacity = interpolate(animProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = interpolate(animProgress, [0, 0.2], [0.9, 1], { extrapolateRight: 'clamp' });
    const translateY = interpolate(animProgress, [0, 0.2], [40, 0]);
    return { ...phrase, opacity, scale, translateY };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_1.wav')} />
      <Img src={bgImage} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${bgScale}) translateX(${bgTranslateX}px)` }} />
      <Img src={mgImage} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen', opacity: 0.7, transform: `scale(${mgScale}) translateX(${mgTranslateX}px)` }} />
      <Img src={fgImage} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'plus-lighter', opacity: fgOpacity }} />
      
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '90%', textAlign: 'center' }}>
          {animatedTexts.map((text) => (
            <span key={text.text} style={{
              position: 'absolute', left: '50%', top: '50%', color: 'white',
              fontSize: 140, fontWeight: 'bold', fontFamily: 'Helvetica, Arial, sans-serif',
              textShadow: '0 0 40px rgba(0,0,0,0.8)',
              opacity: text.opacity,
              transform: `translate(-50%, -50%) scale(${text.scale}) translateY(${text.translateY}px)`,
            }}>{text.text}</span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const RemotionVideo: React.FC = () => (
  <Composition
    id="RemotionVideo"
    component={VideoComponent}
    durationInFrames={2040} // 68 seconds at 30 FPS
    fps={30}
    width={3840}
    height={2160}
  />
);
```