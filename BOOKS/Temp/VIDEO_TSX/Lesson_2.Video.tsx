```tsx
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from 'remotion';
import React from 'react';

const audioUrl = staticFile('BOOKS/Temp/TTS/Lesson_2.wav');

// Helper to convert seconds to frames
const sec = (seconds: number) => Math.round(seconds * 30);

// Data structure for the transcript
const transcript = [
    { start: 0.00, end: 0.48, text: "Key" },
    { start: 0.48, end: 0.94, text: "lesson." },
    { start: 1.34, end: 1.56, text: "The" },
    { start: 1.56, end: 1.96, text: "market" },
    { start: 1.96, end: 2.28, text: "is" },
    { start: 2.28, end: 2.36, text: "a" },
    { start: 2.36, end: 2.62, text: "mood" },
    { start: 2.62, end: 3.00, text: "swing." },
    { start: 3.42, end: 3.52, text: "Your" },
    { start: 3.52, end: 4.12, text: "strategy" },
    { start: 4.12, end: 4.50, text: "is" },
    { start: 4.50, end: 4.56, text: "a" },
    { start: 4.56, end: 4.92, text: "compass." },
    { start: 5.82, end: 5.88, text: "The" },
    { start: 5.88, end: 6.20, text: "bubble" },
    { start: 6.20, end: 6.74, text: "burst." },
    { start: 7.26, end: 7.36, text: "From" },
    { start: 7.36, end: 7.64, text: "late" },
    { start: 7.64, end: 8.22, text: "1999" },
    { start: 8.22, end: 8.88, text: "through" },
    { start: 8.88, end: 9.62, text: "2001," },
    { start: 10.06, end: 10.12, text: "the" },
    { start: 10.12, end: 10.42, text: "party" },
    { start: 10.42, end: 10.92, text: "ended." },
    { start: 11.52, end: 11.90, text: ".com" },
    { start: 11.90, end: 12.44, text: "companies" },
    { start: 12.44, end: 13.02, text: "vanished" },
    { start: 13.02, end: 13.64, text: "overnight." },
    { start: 14.28, end: 14.48, text: "Pets" },
    { start: 14.48, end: 14.98, text: ".com." },
    { start: 15.34, end: 15.78, text: "Webvan." },
    { start: 16.22, end: 16.40, text: "Gone." },
    { start: 16.92, end: 17.26, text: "Wall" },
    { start: 17.26, end: 17.56, text: "Street" },
    { start: 17.56, end: 17.98, text: "turned" },
    { start: 17.98, end: 18.30, text: "on" },
    { start: 18.30, end: 18.58, text: "Amazon." },
    { start: 19.10, end: 19.30, text: "They" },
    { start: 19.30, end: 19.52, text: "called" },
    { start: 19.52, end: 19.74, text: "it" },
    { start: 19.74, end: 20.24, text: "Amazon" },
    { start: 20.24, end: 20.64, text: "Bomb." },
    { start: 21.20, end: 21.46, text: "The" },
    { start: 21.46, end: 21.82, text: "stock" },
    { start: 21.82, end: 22.20, text: "which" },
    { start: 22.20, end: 22.58, text: "peaked" },
    { start: 22.58, end: 22.68, text: "at" },
    { start: 22.68, end: 22.94, text: "over" },
    { start: 22.94, end: 23.58, text: "$100" },
    { start: 23.58, end: 24.58, text: "crashed." },
    { start: 25.22, end: 25.44, text: "It" },
    { start: 25.44, end: 25.70, text: "fell" },
    { start: 25.70, end: 26.08, text: "and" },
    { start: 26.08, end: 26.38, text: "fell" },
    { start: 26.38, end: 26.92, text: "until" },
    { start: 26.92, end: 27.10, text: "it" },
    { start: 27.10, end: 27.20, text: "was" },
    { start: 27.20, end: 27.44, text: "worth" },
    { start: 27.44, end: 27.72, text: "less" },
    { start: 27.72, end: 27.96, text: "than" },
    { start: 27.96, end: 28.50, text: "$6" },
    { start: 28.50, end: 28.94, text: "a" },
    { start: 28.94, end: 29.24, text: "share." },
    { start: 29.24, end: 29.84, text: "A" },
    { start: 29.84, end: 30.06, text: "drop" },
    { start: 30.06, end: 30.32, text: "of" },
    { start: 30.32, end: 30.58, text: "over" },
    { start: 30.58, end: 31.80, text: "90%." },
    { start: 31.80, end: 32.68, text: "Imagine" },
    { start: 32.68, end: 33.02, text: "that." },
    { start: 33.56, end: 33.60, text: "Your" },
    { start: 33.60, end: 34.14, text: "life's" },
    { start: 34.14, end: 34.38, text: "work." },
    { start: 34.74, end: 34.80, text: "Your" },
    { start: 34.80, end: 35.34, text: "entire" },
    { start: 35.34, end: 35.62, text: "net" },
    { start: 35.62, end: 35.96, text: "worth" },
    { start: 35.96, end: 36.92, text: "evaporating" },
    { start: 36.92, end: 37.12, text: "by" },
    { start: 37.12, end: 38.30, text: "90%." },
    { start: 38.30, end: 39.00, text: "Most" },
    { start: 39.00, end: 39.42, text: "founders" },
    { start: 39.42, end: 39.64, text: "would" },
    { start: 39.64, end: 40.02, text: "panic." },
    { start: 40.52, end: 40.64, text: "They" },
    { start: 40.64, end: 40.76, text: "would" },
    { start: 40.76, end: 40.98, text: "cut" },
    { start: 40.98, end: 41.44, text: "costs" },
    { start: 41.44, end: 41.60, text: "to" },
    { start: 41.60, end: 41.72, text: "the" },
    { start: 41.72, end: 42.06, text: "bone." },
    { start: 42.42, end: 42.50, text: "They" },
    { start: 42.50, end: 42.60, text: "would" },
    { start: 42.60, end: 42.86, text: "try" },
    { start: 42.86, end: 42.98, text: "to" },
    { start: 42.98, end: 43.16, text: "show" },
    { start: 43.16, end: 43.30, text: "a" },
    { start: 43.30, end: 43.76, text: "profit." },
    { start: 44.10, end: 44.32, text: "Any" },
    { start: 44.32, end: 44.76, text: "profit." },
    { start: 45.10, end: 45.20, text: "To" },
    { start: 45.20, end: 45.46, text: "calm" },
    { start: 45.46, end: 45.66, text: "the" },
    { start: 45.66, end: 46.20, text: "investors." },
    { start: 46.84, end: 47.22, text: "Bezos" },
    { start: 47.22, end: 47.50, text: "did" },
    { start: 47.50, end: 47.66, text: "the" },
    { start: 47.66, end: 48.08, text: "opposite." },
    { start: 48.54, end: 48.66, text: "He" },
    { start: 48.66, end: 49.02, text: "kept" },
    { start: 49.02, end: 49.44, text: "building." },
    { start: 50.02, end: 50.26, text: "He" },
    { start: 50.26, end: 50.52, text: "knew" },
    { start: 50.52, end: 50.68, text: "the" },
    { start: 50.68, end: 51.04, text: "market" },
    { start: 51.04, end: 51.30, text: "was" },
    { start: 51.30, end: 51.60, text: "just" },
    { start: 51.60, end: 52.00, text: "noise." },
    { start: 52.52, end: 52.62, text: "It" },
    { start: 52.62, end: 52.78, text: "was" },
    { start: 52.78, end: 53.08, text: "fear" },
    { start: 53.08, end: 53.42, text: "and" },
    { start: 53.42, end: 53.66, text: "greed." },
    { start: 54.22, end: 54.42, text: "His" },
    { start: 54.42, end: 54.96, text: "strategy" },
    { start: 54.96, end: 55.32, text: "was" },
    { start: 55.32, end: 55.50, text: "the" },
    { start: 55.50, end: 55.88, text: "signal." },
    { start: 56.56, end: 56.88, text: "He" },
    { start: 56.88, end: 57.10, text: "needed" },
    { start: 57.10, end: 57.48, text: "to" },
    { start: 57.48, end: 57.80, text: "survive" },
    { start: 57.80, end: 58.22, text: "the" },
    { start: 58.22, end: 58.60, text: "storm." },
    { start: 58.60, end: 58.76, text: "Not" },
    { start: 58.76, end: 59.24, text: "abandon" },
    { start: 59.24, end: 59.46, text: "the" },
    { start: 59.46, end: 59.68, text: "ship." },
];

const Word: React.FC<{ word: { text: string; start: number; end: number } }> = ({ word }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5, sec(word.end - word.start) - 5], [0, 1, 0]);

  return (
    <span style={{ opacity, transition: 'opacity 0.2s', marginRight: '0.4em' }}>
      {word.text}
    </span>
  );
};

const Scene: React.FC<{
  start: number;
  duration: number;
  bg: string; // Image should be a wide, atmospheric background.
  mg: string; // Image should be a key mid-ground element with transparency.
  fg: string; // Image should be a foreground element to add depth, also with transparency.
  panX: number;
  children?: React.ReactNode;
}> = ({ start, duration, bg, mg, fg, panX, children }) => {
  const frame = useCurrentFrame();

  // Scene fade-in and fade-out
  const opacity = interpolate(
    frame,
    [sec(start), sec(start) + 30, sec(start + duration) - 30, sec(start + duration)],
    [0, 1, 1, 0]
  );
  
  // Parallax calculation based on overall camera pan
  const bgPan = panX * 0.2;
  const mgPan = panX * 0.5;
  const fgPan = panX * 0.8;

  const imageStyle: React.CSSProperties = {
    position: 'absolute',
    width: '120%', // Slightly larger to allow for panning
    height: '120%',
    objectFit: 'cover',
    left: '-10%',
    top: '-10%',
  };

  return (
    <Sequence from={sec(start)} durationInFrames={sec(duration)}>
      <AbsoluteFill style={{ opacity }}>
        <Img src={staticFile(bg)} style={{...imageStyle, transform: `translateX(${bgPan}px)`}} />
        <Img src={staticFile(mg)} style={{...imageStyle, transform: `translateX(${mgPan}px)`}} />
        <Img src={staticFile(fg)} style={{...imageStyle, transform: `translateX(${fgPan}px)`}} />
        {children}
      </AbsoluteFill>
    </Sequence>
  );
};


export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Cinematic Camera Movement (slow zoom and pan)
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  const panX = interpolate(frame, [0, durationInFrames], [50, -100]);
  const panY = interpolate(frame, [0, durationInFrames], [-20, 40]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${panX}px) translateY(${panY}px)` }}>
        
        {/* SCENE 1: Introduction */}
        <Scene start={0} duration={5.5} panX={panX}
          // bg.jpg: A dusty, sunlit library background, very out of focus.
          bg="assets/images/library_background.jpg"
          // mg.jpg: A single, open, old book in the mid-ground.
          mg="assets/images/open_book.jpg"
          // fg.jpg: A vintage brass key with some light glinting off it.
          fg="assets/images/vintage_key.jpg"
        />

        {/* SCENE 2: The Bubble */}
         <Scene start={5.5} duration={8.5} panX={panX}
          // bg.jpg: A stylized, futuristic city skyline at night from the late 90s.
          bg="assets/images/90s_skyline.jpg"
          // mg.jpg: A large, iridescent soap bubble floating in the air.
          mg="assets/images/bubble.jpg"
          // fg.jpg: Fading and glitching logos of fictional .com companies.
          fg="assets/images/fading_logos.jpg"
        />
        
        {/* SCENE 3: The Crash */}
        <Scene start={14} duration={18} panX={panX}
          // bg.jpg: A dark, chaotic stock-market floor with red down-arrows everywhere.
          bg="assets/images/market_crash.jpg"
          // mg.jpg: A dramatically falling stock chart line graphic, hitting the floor.
          mg="assets/images/plummeting_chart.jpg"
          // fg.jpg: A shattered piggy bank in the foreground with coins spilling out.
          fg="assets/images/shattered_piggybank.jpg"
        />

        {/* SCENE 4: The Panic */}
        <Scene start={32} duration={14.5} panX={panX}
          // bg.jpg: An empty, dark boardroom, viewed from the head of the table.
          bg="assets/images/dark_boardroom.jpg"
          // mg.jpg: A silhouette of a person holding their head in their hands.
          mg="assets/images/stressed_founder.jpg"
          // fg.jpg: Papers and documents turning into dust and blowing away.
          fg="assets/images/evaporating_papers.jpg"
        />

        {/* SCENE 5: The Strategy */}
        <Scene start={46.5} duration={13.5} panX={panX}
          // bg.jpg: A dark and stormy sea with massive waves.
          bg="assets/images/stormy_sea.jpg"
          // mg.jpg: A strong, sturdy ship navigating the storm.
          mg="assets/images/sturdy_ship.jpg"
          // fg.jpg: A lighthouse in the foreground, its beam cutting through the rain.
          fg="assets/images/lighthouse_beam.jpg"
        />

        {/* --- Visual Effects Overlay --- */}
        <AbsoluteFill>
          {/* Subtle dust particles floating through the air */}
          <Img 
            src={staticFile('assets/images/vfx/dust_overlay.png')} 
            style={{width: '100%', height: '100%', opacity: 0.1, objectFit: 'cover'}}
          />
          {/* A soft vignette to focus the viewer's attention */}
          <div style={{
            width: '100%',
            height: '100%',
            boxShadow: 'inset 0 0 150px black',
            position: 'absolute'
          }}/>
        </AbsoluteFill>
        
        {/* --- Text Sequences --- */}
        <AbsoluteFill style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '72px',
            color: 'white',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.7)',
            width: '80%',
            lineHeight: 1.3
          }}>
            {transcript.map((word, i) => (
              <Sequence key={i} from={sec(word.start)} durationInFrames={sec(word.end - word.start)}>
                <Word word={word} />
              </Sequence>
            ))}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      
      <Audio src={audioUrl} />
    </AbsoluteFill>
  );
};
```