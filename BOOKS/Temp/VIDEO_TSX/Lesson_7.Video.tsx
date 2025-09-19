```typescript
import React from 'react';
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

// Grouped timeline from the provided transcript for better visual pacing
// prettier-ignore
const timeline = [
  { start: 0.00, end: 0.84, text: "Key lesson," }, { start: 1.28, end: 2.58, text: "the price of innovation" },
  { start: 2.58, end: 4.84, text: "is expensive public failure." }, { start: 5.53, end: 7.46, text: "We need to talk about 2019," },
  { start: 8.00, end: 12.68, text: "but to understand 2019, you have to understand the ghosts of failures passed." },
  { start: 13.34, end: 15.98, text: "The biggest one was the fire phone from 2014." },
  { start: 16.64, end: 19.26, text: "It was a complete disaster, a total flop." },
  { start: 19.76, end: 24.44, text: "The company took a $170 million write down on Unsold Inventory." },
  { start: 24.68, end: 26.32, text: "It was a public humiliation." }, { start: 26.32, end: 30.78, text: "They failed spectacularly." },
  { start: 31.14, end: 33.76, text: "A normal company would fire the entire team." }, { start: 34.12, end: 35.82, text: "They would never mention the project again." },
  { start: 36.30, end: 38.86, text: "They would conclude, we are not a hardware company." },
  { start: 39.54, end: 41.02, text: "Amazon did not do that." }, { start: 41.58, end: 44.76, text: "Bezos said, if you are not failing, you are not innovating." },
  { start: 45.28, end: 48.46, text: "The $170 million was the tuition fee." },
  { start: 49.08, end: 55.46, text: "The lessons they learned from the fire phone's failure, the engineers they trained, the supply chains they built were not thrown away." },
  { start: 55.46, end: 57.28, text: "They were repurposed." },
  { start: 57.82, end: 66.60, text: "That same team went on to create the Amazon Echo and Alexa, a product that created an entirely new category of technology." },
  { start: 67.12, end: 70.80, text: "By 2019, tens of millions of homes had an Echo device." },
  { start: 71.48, end: 75.68, text: "The ashes of their biggest failure became the soil for one of their biggest successes." },
  { start: 76.54, end: 79.60, text: "Failure is only failure if you learn nothing from it." },
];

const keywords = ['innovation', 'failure', 'failures', 'expensive', 'disaster', 'flop', 'humiliation', 'failed', 'failing', 'successes', 'repurposed', 'echo', 'alexa'];

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  // 1. Calculate all animated values for parallax and overlays
  const bgTranslateX = interpolate(progress, [0, 1], [0, -250]);
  const mgTranslateX = interpolate(progress, [0, 1], [0, -500]);
  const phoenixOpacity = interpolate(progress, [0.65, 0.8], [0, 1], { extrapolateRight: 'clamp' });
  const phoenixTranslateY = interpolate(progress, [0, 1], [200, -200]);
  const overlayOpacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 0.5, 0.5, 0]);

  // 2. Generate and calculate animated values for each word
  const textSpans = timeline.flatMap(({ start, end, text }) => {
    const words = text.split(' ');
    const phraseDuration = end - start;
    return words.map((word, i) => {
      const wordStartTime = start + (i / words.length) * phraseDuration;
      const startFrame = wordStartTime * fps;
      if (frame < startFrame) return null;

      const cleanedWord = word.replace(/[,.]/g, '').toLowerCase();
      const isKeyword = keywords.includes(cleanedWord);
      
      const baseOpacity = interpolate(frame - startFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
      let scale = 1;
      let translateY = 0;
      let color = `rgba(255, 255, 255, ${baseOpacity * 0.9})`;
      
      if (isKeyword) {
        const anim = spring({ frame: frame - startFrame, fps, config: { damping: 10, stiffness: 100 }, durationInFrames: 30 });
        scale = 1 + anim * 0.2;
        translateY = -anim * 20;
        color = `rgba(255, ${255 - anim * 50}, ${255 - anim * 50}, ${baseOpacity})`;
      }

      const textShadow = `0 0 10px black, 0 0 10px black`;
      const styles: React.CSSProperties = { display: 'inline-block', color, textShadow, marginRight: '1.2rem', transform: `scale(${scale}) translateY(${translateY}px)` };

      return <span key={`${start}-${i}`} style={styles}>{word}</span>;
    });
  });

  // 3. Apply calculated values in JSX
  return (
    <AbsoluteFill style={{ backgroundColor: '#050A10' }}>
      <Img src={staticFile('images/tech_city_background.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translateX(${bgTranslateX}px) scale(1.1)` }} />
      <Img src={staticFile('images/gears-midground.png')} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, transform: `translateX(${mgTranslateX}px) scale(1.2)` }} />
      <Img src={staticFile('images/phoenix_from_ashes.png')} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', opacity: phoenixOpacity, transform: `translateY(${phoenixTranslateY}px) scale(0.8)` }}/>
      <Img src={staticFile('images/data_overlay_foreground.png')} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: overlayOpacity }} />
      
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '150px', fontSize: '90px', fontWeight: 'bold', textAlign: 'center' }}>
        <p style={{ maxWidth: '85%' }}>{textSpans}</p>
      </AbsoluteFill>
      
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_7.wav')} />
    </AbsoluteFill>
  );
};

export const RemotionVideoComposition = () => (
  <Composition
    id="RemotionVideo"
    component={RemotionVideo}
    durationInFrames={Math.ceil(79.60 * 30) + 60}
    fps={30}
    width={3840}
    height={2160}
  />
);
```