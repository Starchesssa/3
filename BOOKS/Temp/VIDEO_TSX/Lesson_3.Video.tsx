```tsx
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import React from 'react';
import { registerRoot } from 'remotion';

// --- Data & Assets ---
// All asset paths are relative to the /public folder in your Remotion project.
const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_3.wav');

const subtitles = [
  { start: 0, end: 1.66, text: 'Key lesson.' },
  { start: 1.66, end: 5.38, text: 'Profitability is a weapon, not just a goal.' },
  { start: 5.38, end: 7.38, text: 'Now is 2003.' },
  { start: 7.38, end: 9.9, text: 'The .com graveyard is full.' },
  { start: 9.9, end: 12.92, text: 'Amazon is still standing, but it is wounded.' },
  { start: 12.92, end: 14.96, text: 'The pressure is immense.' },
  { start: 14.96, end: 17.28, text: 'They had to prove the model worked.' },
  { start: 17.28, end: 20.48, text: 'They had to show they could actually make money.' },
  { start: 20.48, end: 24.92, text: 'And in the fourth quarter of 2001, they posted their first ever profit.' },
  { start: 24.92, end: 30.48, text: 'It was tiny, just $5 million on over $1 billion in sales.' },
  { start: 30.48, end: 33.82, text: 'By 2003, they were consistently profitable.' },
  { start: 33.82, end: 36.56, text: "This wasn't about pleasing Wall Street anymore." },
  { start: 36.56, end: 39.22, text: 'It was about generating their own fuel.' },
  { start: 39.22, end: 41.16, text: "Profit wasn't the end goal." },
  { start: 41.16, end: 44.2, text: 'Profit was the cash that allowed them to build more,' },
  { start: 44.2, end: 49.08, text: 'to experiment more, to take bigger risks without asking for permission.' },
  { start: 49.08, end: 52.0, text: 'It was the foundation for the next decade of war.' },
];
const keyWords = ['Profitability','weapon','graveyard','Amazon','wounded','pressure','prove','money','profit','tiny','profitable','fuel','cash','build','experiment','risks','foundation','war'];

const sceneAssets = [
  { bg: staticFile('images/dark_clouds.jpg'), mg: staticFile('images/empty_city_street_background.jpg'), fg: staticFile('images/rain_overlay.png') },
  { bg: staticFile('images/blueprint_bg.jpg'), mg: staticFile('images/gears-midground.png'), fg: staticFile('images/data_stream_foreground.png') },
  { bg: staticFile('images/tech_cityscape.jpg'), mg: staticFile('images/server-racks-midground.png'), fg: staticFile('images/delivery_drone_foreground.png') },
];

// --- Main Video Component ---
const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sToF = (s: number) => s * fps;

  const sceneIndex = Math.floor(frame / (durationInFrames / sceneAssets.length));
  const { bg, mg, fg } = sceneAssets[sceneIndex];
  
  const pan = interpolate(frame, [0, durationInFrames], [0, -300]);
  const bgTranslateX = pan * 0.5;
  const mgTranslateX = pan * 1;
  const fgTranslateX = pan * 1.5;

  const layerStyle: React.CSSProperties = { position: 'absolute', width: '120%', height: '100%', objectFit: 'cover', left: '-10%' };
  const textContainerStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', padding: '0 10%', fontSize: '120px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: 'white', textShadow: '0 0 20px black', textAlign: 'center' };

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Img src={bg} style={{ ...layerStyle, transform: `translateX(${bgTranslateX}px)` }} />
      <Img src={mg} style={{ ...layerStyle, transform: `translateX(${mgTranslateX}px)` }} />
      
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {subtitles.map(({ start, end, text }, i) => {
          const inFrame = sToF(start);
          const duration = sToF(end) - inFrame;
          return (
            <Sequence key={i} from={inFrame} durationInFrames={duration}>
              <div style={textContainerStyle}>
                {text.split(' ').map((word, j) => {
                  const isKeyWord = keyWords.includes(word.replace(/[^a-zA-Z0-9$]/g, ''));
                  const wordProgress = spring({ frame: frame - inFrame - j * 3, fps, durationInFrames: 30 });
                  const scale = isKeyWord ? 1 + wordProgress * 0.1 : 1;
                  const opacity = interpolate(wordProgress, [0, 0.5, 1], [0, 1, 1]);
                  const translateY = interpolate(wordProgress, [0, 1], [20, 0]);
                  const wordStyle = { transform: `scale(${scale}) translateY(${translateY}px)`, opacity, color: isKeyWord ? '#FFD700' : 'white', marginRight: '24px', display: 'inline-block' };
                  return <span key={j} style={wordStyle}>{word}</span>;
                })}
              </div>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      
      <Img src={fg} style={{ ...layerStyle, transform: `translateX(${fgTranslateX}px)`, mixBlendMode: 'screen', opacity: 0.7 }} />
      <Audio src={audioSrc} />
    </AbsoluteFill>
  );
};

// --- Remotion Registration ---
const DURATION_IN_SECONDS = 52;
const VIDEO_FPS = 30;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionVideo"
    component={RemotionVideo}
    durationInFrames={DURATION_IN_SECONDS * VIDEO_FPS}
    fps={VIDEO_FPS}
    width={3840}
    height={2160}
  />
);

registerRoot(RemotionRoot);
```