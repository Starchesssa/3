```tsx
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  Img,
} from 'remotion';
import React from 'react';

// --- Helper Types ---
type Word = {
  start: number;
  end: number;
  text: string;
};

type Transcript = Word[];

// --- Transcript Data ---
const transcript: Transcript = [
    { text: 'Key', start: 0.00, end: 0.50 },
    { text: 'lesson.', start: 0.50, end: 0.94 },
    { text: 'Use', start: 1.50, end: 1.78 },
    { text: 'your', start: 1.78, end: 2.00 },
    { text: 'cash', start: 2.00, end: 2.28 },
    { text: 'cow', start: 2.28, end: 2.56 },
    { text: 'to', start: 2.56, end: 2.92 },
    { text: 'invade', start: 2.92, end: 3.30 },
    { text: 'new', start: 3.30, end: 3.72 },
    { text: 'territories.', start: 3.72, end: 4.30 },
    { text: 'It', start: 5.02, end: 5.22 },
    { text: 'is', start: 5.22, end: 5.34 },
    { text: 'now', start: 5.34, end: 5.54 },
    { text: '2017.', start: 5.54, end: 6.36 },
    { text: 'AWS', start: 7.18, end: 7.62 },
    { text: 'is', start: 7.62, end: 8.14 },
    { text: 'a', start: 8.14, end: 8.26 },
    { text: 'monster.', start: 8.26, end: 8.82 },
    { text: 'It', start: 9.38, end: 9.50 },
    { text: 'is', start: 9.50, end: 9.58 },
    { text: 'a', start: 9.58, end: 9.68 },
    { text: 'money', start: 9.68, end: 10.08 },
    { text: 'printing', start: 10.08, end: 10.56 },
    { text: 'machine.', start: 10.56, end: 11.08 },
    { text: 'In', start: 11.82, end: 11.88 },
    { text: '2017', start: 11.88, end: 12.48 },
    { text: 'alone,', start: 12.48, end: 12.96 },
    { text: 'AWS', start: 13.52, end: 13.80 },
    { text: 'would', start: 13.80, end: 14.28 },
    { text: 'generate', start: 14.28, end: 14.62 },
    { text: 'over', start: 14.62, end: 14.92 },
    { text: '$17', start: 14.92, end: 15.64 },
    { text: 'billion', start: 15.64, end: 16.36 },
    { text: 'in', start: 16.36, end: 17.02 },
    { text: 'revenue.', start: 17.02, end: 17.42 },
    { text: 'And', start: 17.94, end: 18.12 },
    { text: 'unlike', start: 18.12, end: 18.48 },
    { text: 'the', start: 18.48, end: 18.70 },
    { text: 'low', start: 18.70, end: 18.88 },
    { text: 'margin', start: 18.88, end: 19.24 },
    { text: 'retail', start: 19.24, end: 19.58 },
    { text: 'business,', start: 19.58, end: 20.06 },
    { text: 'AWS', start: 20.56, end: 20.84 },
    { text: 'was', start: 20.84, end: 21.30 },
    { text: 'incredibly', start: 21.30, end: 21.96 },
    { text: 'profitable.', start: 21.96, end: 22.64 },
    { text: 'It', start: 23.06, end: 23.32 },
    { text: 'was', start: 23.32, end: 23.44 },
    { text: 'a', start: 23.44, end: 23.58 },
    { text: 'cash', start: 23.58, end: 23.94 },
    { text: 'cow.', start: 23.94, end: 24.22 },
    { text: 'So', start: 24.74, end: 25.10 },
    { text: 'what', start: 25.10, end: 25.46 },
    { text: 'do', start: 25.46, end: 25.56 },
    { text: 'you', start: 25.56, end: 25.68 },
    { text: 'do', start: 25.68, end: 25.88 },
    { text: 'with', start: 25.88, end: 26.12 },
    { text: 'all', start: 26.12, end: 26.22 },
    { text: 'that', start: 26.22, end: 26.38 },
    { text: 'cash?', start: 26.38, end: 26.70 },
    { text: 'You', start: 27.18, end: 27.42 },
    { text: 'could', start: 27.42, end: 27.58 },
    { text: 'give', start: 27.58, end: 27.84 },
    { text: 'it', start: 27.84, end: 27.96 },
    { text: 'back', start: 27.96, end: 28.12 },
    { text: 'to', start: 28.12, end: 28.30 },
    { text: 'shareholders.', start: 28.30, end: 28.74 },
    { text: 'You', start: 28.74, end: 29.46 },
    { text: 'could', start: 29.46, end: 29.64 },
    { text: 'play', start: 29.64, end: 29.94 },
    { text: 'it', start: 29.94, end: 30.04 },
    { text: 'safe,', start: 30.04, end: 30.36 },
    { text: 'or', start: 30.76, end: 31.14 },
    { text: 'you', start: 31.14, end: 31.42 },
    { text: 'could', start: 31.42, end: 31.54 },
    { text: 'use', start: 31.54, end: 31.80 },
    { text: 'it', start: 31.80, end: 31.96 },
    { text: 'as', start: 31.96, end: 32.10 },
    { text: 'a', start: 32.10, end: 32.22 },
    { text: 'war', start: 32.22, end: 32.48 },
    { text: 'chest', start: 32.48, end: 32.92 },
    { text: 'to', start: 32.92, end: 33.14 },
    { text: 'attack', start: 33.14, end: 33.52 },
    { text: 'a', start: 33.52, end: 33.68 },
    { text: 'completely', start: 33.68, end: 34.16 },
    { text: 'new', start: 34.16, end: 34.58 },
    { text: 'industry.', start: 34.58, end: 35.08 },
    { text: 'On', start: 35.68, end: 35.86 },
    { text: 'June', start: 35.86, end: 36.06 },
    { text: '16,', start: 36.06, end: 36.56 },
    { text: '2017,', start: 36.64, end: 37.50 },
    { text: 'Amazon', start: 37.90, end: 38.28 },
    { text: 'announced', start: 38.28, end: 38.84 },
    { text: 'it', start: 38.84, end: 39.00 },
    { text: 'was', start: 39.00, end: 39.12 },
    { text: 'buying', start: 39.12, end: 39.38 },
    { text: 'whole', start: 39.38, end: 39.68 },
    { text: 'foods', start: 39.68, end: 40.10 },
    { text: 'for', start: 40.10, end: 40.34 },
    { text: '$13.7', start: 40.34, end: 41.74 },
    { text: 'billion.', start: 41.74, end: 42.30 },
    { text: 'In', start: 43.12, end: 43.50 },
    { text: 'cash,', start: 43.50, end: 43.80 },
    { text: 'the', start: 44.42, end: 44.64 },
    { text: 'world', start: 44.64, end: 44.88 },
    { text: 'was', start: 44.88, end: 45.12 },
    { text: 'stunned.', start: 45.12, end: 45.66 },
    { text: 'The', start: 46.16, end: 46.26 },
    { text: 'king', start: 46.26, end: 46.52 },
    { text: 'of', start: 46.52, end: 46.74 },
    { text: 'e-commerce', start: 46.74, end: 47.58 },
    { text: 'was', start: 47.58, end: 47.86 },
    { text: 'buying', start: 47.86, end: 48.02 },
    { text: 'a', start: 48.02, end: 48.30 },
    { text: 'brick', start: 48.30, end: 48.50 },
    { text: 'and', start: 48.50, end: 48.78 },
    { text: 'mortar', start: 48.78, end: 49.20 },
    { text: 'grocery', start: 49.20, end: 49.68 },
    { text: 'chain.', start: 49.68, end: 50.04 },
    { text: 'On', start: 50.42, end: 50.52 },
    { text: 'the', start: 50.52, end: 50.70 },
    { text: 'day', start: 50.70, end: 50.84 },
    { text: 'of', start: 50.84, end: 50.96 },
    { text: 'the', start: 50.96, end: 51.38 },
    { text: 'announcement,', start: 51.38, end: 51.80 },
    { text: 'the', start: 51.86, end: 52.12 },
    { text: 'stocks', start: 52.12, end: 52.36 },
    { text: 'of', start: 52.36, end: 52.76 },
    { text: 'competing', start: 52.76, end: 53.16 },
    { text: 'grocery', start: 53.16, end: 53.62 },
    { text: 'stores', start: 53.62, end: 53.86 },
    { text: 'like', start: 53.86, end: 54.28 },
    { text: 'Kroger', start: 54.28, end: 54.50 },
    { text: 'and', start: 54.50, end: 54.90 },
    { text: 'Costco', start: 54.90, end: 55.76 },
    { text: 'plummeted.', start: 55.76, end: 56.08 },
    { text: 'They', start: 56.36, end: 56.58 },
    { text: 'lost', start: 56.58, end: 56.96 },
    { text: 'more', start: 56.96, end: 57.14 },
    { text: 'in', start: 57.14, end: 57.44 },
    { text: 'market', start: 57.44, end: 57.78 },
    { text: 'value', start: 57.78, end: 57.96 },
    { text: 'that', start: 57.96, end: 58.24 },
    { text: 'day', start: 58.24, end: 58.60 },
    { text: 'than', start: 58.60, end: 58.72 },
    { text: 'the', start: 58.72, end: 59.12 },
    { text: '$13.7', start: 59.12, end: 59.80 },
    { text: 'billion', start: 59.80, end: 60.30 },
    { text: 'Amazon', start: 60.30, end: 61.14 },
    { text: 'paid.', start: 61.14, end: 61.52 },
    { text: 'Amazon', start: 62.10, end: 62.60 },
    { text: 'was', start: 62.60, end: 62.84 },
    { text: 'using', start: 62.84, end: 63.10 },
    { text: 'the', start: 63.10, end: 63.30 },
    { text: 'high-tech,', start: 63.30, end: 64.26 },
    { text: 'high-profit', start: 64.26, end: 64.90 },
    { text: 'engine', start: 64.90, end: 65.24 },
    { text: 'of', start: 65.24, end: 65.44 },
    { text: 'AWS', start: 65.44, end: 65.94 },
    { text: 'to', start: 65.94, end: 66.48 },
    { text: 'fund', start: 66.48, end: 66.72 },
    { text: 'an', start: 66.72, end: 66.92 },
    { text: 'invasion', start: 66.92, end: 67.44 },
    { text: 'into', start: 67.44, end: 67.80 },
    { text: 'the', start: 67.80, end: 67.96 },
    { text: 'old-world', start: 67.96, end: 68.54 },
    { text: 'business', start: 68.54, end: 68.96 },
    { text: 'of', start: 68.96, end: 69.22 },
    { text: 'selling', start: 69.22, end: 69.50 },
    { text: 'milk', start: 69.50, end: 69.82 },
    { text: 'and', start: 69.82, end: 70.10 },
    { text: 'eggs.', start: 70.10, end: 70.48 },
    { text: 'They', start: 70.84, end: 71.20 },
    { text: 'were', start: 71.20, end: 71.36 },
    { text: 'playing', start: 71.36, end: 71.68 },
    { text: 'a', start: 71.68, end: 71.94 },
    { text: 'different', start: 71.94, end: 72.36 },
    { text: 'game.', start: 72.36, end: 72.72 },
  ];

const sec = (seconds: number) => Math.round(seconds * 30);

// --- Subtitle Component ---
const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 10%',
      }}
    >
      <p
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '72px',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.3,
          textShadow: '0 0 20px rgba(0,0,0,0.8)',
        }}
      >
        {transcript.map((word, i) => {
          const wordStart = sec(word.start);
          const wordEnd = sec(word.end);
          const opacity = interpolate(
            frame,
            [wordStart, wordStart + 10, wordEnd, wordEnd + 10],
            [0, 1, 1, 0]
          );

          return (
            <span key={i} style={{ opacity, display: 'inline-block', marginRight: '15px' }}>
              {word.text}{' '}
            </span>
          );
        })}
      </p>
    </AbsoluteFill>
  );
};

// --- Scene Components ---

// Scene 1: The Principle (0.00 - 4.30)
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, 110, 129], [0, 1, 1, 0]);

  // Background map parallax
  const mapScale = interpolate(frame, [0, 129], [1.2, 1]);
  const mapX = interpolate(frame, [0, 129], [-5, 5]);

  // Cash Cow animation
  const cowOpacity = interpolate(frame, [sec(1.5), sec(1.8)], [0, 1]);
  const cowScale = interpolate(frame, [sec(1.5), sec(4.3)], [0.8, 1]);
  const cowY = interpolate(frame, [sec(1.5), sec(4.3)], [100, 0]);
  
  // Invasion arrows
  const arrowOpacity = interpolate(frame, [sec(2.9), sec(3.2)], [0, 1]);
  const arrowX = interpolate(frame, [sec(3.2), sec(4.3)], [0, 200]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/*
        Image requirements:
        - `assets/images/old_map_bg.jpg`: A full-frame, sepia-toned, vintage world map.
        - `assets/images/cash_cow.png`: A cartoonish cow with dollar bill spots, transparent background.
        - `assets/images/invasion_arrow.png`: A stylized, red arrow, transparent background.
      */}
      <Img
        src={staticFile('assets/images/old_map_bg.jpg')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${mapScale}) translateX(${mapX}%)`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Img
          src={staticFile('assets/images/cash_cow.png')}
          style={{
            opacity: cowOpacity,
            transform: `scale(${cowScale}) translateY(${cowY}px)`,
            width: '40%',
            filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.6))',
          }}
        />
        <Img
            src={staticFile('assets/images/invasion_arrow.png')}
            style={{
                position: 'absolute',
                opacity: arrowOpacity,
                width: '15%',
                transform: `translateX(${arrowX}px) rotate(15deg)`,
            }}
        />
         <Img
            src={staticFile('assets/images/invasion_arrow.png')}
            style={{
                position: 'absolute',
                opacity: arrowOpacity,
                width: '15%',
                transform: `translateX(-${arrowX}px) rotate(-15deg) scaleX(-1)`,
            }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 2: AWS The Monster (5.02 - 11.08)
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

  // Background parallax
  const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  const bgY = interpolate(frame, [0, durationInFrames], [0, -10]);

  // 2017 text
  const yearOpacity = interpolate(frame, [sec(0.5), sec(1.36)], [1, 0]);
  const yearScale = interpolate(frame, [sec(0.5), sec(1.36)], [1, 1.5]);

  // AWS logo
  const logoOpacity = interpolate(frame, [sec(2.1), sec(2.5)], [0, 1]);
  const logoScale = interpolate(frame, [sec(2.1), sec(3.8)], [0.8, 1.1]);
  
  // Money printing effect
  const moneyOpacity = interpolate(frame, [sec(4.6), sec(5.0)], [0, 1]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/*
        Image requirements:
        - `assets/images/server_room_bg.jpg`: A dark, atmospheric photo of a server rack with blinking lights.
        - `assets/images/aws_logo.png`: The official AWS logo, transparent background.
        - `assets/images/dollar_bill.png`: A single US dollar bill, slightly angled, transparent background.
      */}
      <Img
        src={staticFile('assets/images/server_room_bg.jpg')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${bgScale}) translateY(${bgY}%)`,
          filter: 'brightness(0.6)',
        }}
      />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{
          fontSize: 300,
          color: 'white',
          fontWeight: 'bold',
          opacity: yearOpacity,
          transform: `scale(${yearScale})`,
          textShadow: '0 0 20px black',
        }}>2017</h1>

        <Img
            src={staticFile('assets/images/aws_logo.png')}
            style={{
                opacity: logoOpacity,
                transform: `scale(${logoScale})`,
                width: '35%',
                filter: 'drop-shadow(0 0 40px #FF9900)',
            }}
        />
        {Array.from({ length: 20 }).map((_, i) => {
            const y = interpolate(frame - i * 2, [sec(4.8), sec(6.0)], [-500, 1500]);
            const x = (i % 5 - 2) * 400 + Math.sin(frame / 10 + i) * 50;
            const r = (i % 7 - 3) * 30 + Math.cos(frame / 15 + i) * 20;
            return (
                 <Img
                    key={i}
                    src={staticFile('assets/images/dollar_bill.png')}
                    style={{
                        position: 'absolute',
                        opacity: moneyOpacity,
                        width: 250,
                        transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
                    }}
                 />
            );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};


// Scene 3: The Numbers (11.82 - 24.22)
const Scene3: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

    const bgScale = interpolate(frame, [0, durationInFrames], [1.2, 1]);
    const revenueOpacity = interpolate(frame, [sec(3.1), sec(5.6)], [1, 0]);
    const graphOpacity = interpolate(frame, [sec(8.5), sec(9.0)], [0, 1]);
    const cowOpacity = interpolate(frame, [sec(11.2), sec(11.5)], [0, 1]);

    return (
        <AbsoluteFill style={{ opacity, backgroundColor: '#020d1f' }}>
            {/*
                Image requirements:
                - `assets/images/data_bg.jpg`: An abstract background with glowing lines and numbers, representing data.
                - `assets/images/profit_graph.png`: A simple line graph showing a steep upward curve, transparent background.
                - `assets/images/cash_cow.png`: The same cash cow image, transparent.
            */}
            <Img src={staticFile('assets/images/data_bg.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, transform: `scale(${bgScale})`}} />
            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
                <div style={{opacity: revenueOpacity}}>
                    <h1 style={{fontSize: 250, color: '#4CAF50', fontWeight: '900', textAlign: 'center', margin: 0}}>
                        $17,000,000,000
                    </h1>
                    <h2 style={{fontSize: 100, color: 'white', fontWeight: '400', textAlign: 'center', marginTop: 20}}>
                        in Revenue
                    </h2>
                </div>
                 <Img
                    src={staticFile('assets/images/profit_graph.png')}
                    style={{
                        position: 'absolute',
                        opacity: graphOpacity,
                        width: '60%',
                        transform: `scale(${interpolate(frame, [sec(8.5), sec(10.8)], [0.8, 1])})`,
                    }}
                />
                <Img
                    src={staticFile('assets/images/cash_cow.png')}
                    style={{
                        position: 'absolute',
                        opacity: cowOpacity,
                        width: '30%',
                        transform: `scale(${interpolate(frame, [sec(11.2), sec(12.4)], [0.7, 1])})`,
                        filter: 'drop-shadow(0 0 40px #ffffff44)'
                    }}
                />
            </AbsoluteFill>
        </AbsoluteFill>
    );
};


// Scene 4: The Plan (24.74 - 35.08)
const Scene4: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

    const cameraY = interpolate(frame, [0, durationInFrames], [0, -15]);
    const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.2]);

    const cashOpacity = interpolate(frame, [sec(1.6), sec(2.0)], [0, 1]);
    const safePathOpacity = interpolate(frame, [sec(3.0), sec(6.0)], [1, 0]);
    const warPathOpacity = interpolate(frame, [sec(6.3), sec(7.0)], [0, 1]);
    const chestScale = interpolate(frame, [sec(7.0), sec(10.3)], [1, 25]);
    const chestOpacity = interpolate(frame, [sec(10.0), sec(10.3)], [1, 0]);
    const groceryBgOpacity = interpolate(frame, [sec(9.8), sec(10.3)], [0, 1]);

    return (
        <AbsoluteFill style={{ opacity, backgroundColor: 'black', overflow: 'hidden' }}>
            {/*
                Image requirements:
                - `assets/images/cash_pile.png`: A large, clean pile of cash, transparent background.
                - `assets/images/vault.png`: A bank vault door, transparent background.
                - `assets/images/war_chest.png`: An old, wooden, reinforced chest, transparent background.
                - `assets/images/grocery_aisle_bg.jpg`: A bright, clean photo of a grocery aisle.
            */}
            <AbsoluteFill style={{ transform: `scale(${cameraZoom}) translateY(${cameraY}%)`}}>
                 <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Img src={staticFile('assets/images/cash_pile.png')} style={{width: '30%', opacity: cashOpacity}} />
                </AbsoluteFill>

                <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: safePathOpacity}}>
                    <Img src={staticFile('assets/images/vault.png')} style={{position: 'absolute', top: '20%', width: '15%'}} />
                </AbsoluteFill>

                <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: warPathOpacity}}>
                    <Img src={staticFile('assets/images/war_chest.png')} style={{position: 'absolute', bottom: '20%', width: '20%', opacity: chestOpacity, transform: `scale(${chestScale})`}} />
                </AbsoluteFill>
                 <Img src={staticFile('assets/images/grocery_aisle_bg.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: groceryBgOpacity}} />
            </AbsoluteFill>
        </AbsoluteFill>
    )
};


// Scene 5: The Acquisition (35.68 - 49.68)
const Scene5: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

    const newsOpacity = interpolate(frame, [sec(0), sec(7.0)], [1, 0]);
    const stunOpacity = interpolate(frame, [sec(8.7), sec(10.0)], [1, 0]);
    const ecommerceOpacity = interpolate(frame, [sec(10.4), sec(14.0)], [1, 0]);

    return (
        <AbsoluteFill style={{ opacity, backgroundColor: 'black' }}>
            {/*
                Image requirements:
                - `assets/images/news_bg.jpg`: A background resembling a news studio or graphic.
                - `assets/images/amazon_logo.png`: The Amazon logo, transparent.
                - `assets/images/whole_foods_logo.png`: The Whole Foods logo, transparent.
                - `assets/images/shattered_glass_overlay.png`: A black background with white crack lines for a "stunned" effect.
                - `assets/images/ecommerce_screen.png`: A computer screen showing an e-commerce website, transparent.
                - `assets/images/whole_foods_store.jpg`: A full-frame photo of a physical Whole Foods store exterior.
            */}
            <AbsoluteFill style={{opacity: newsOpacity}}>
                <Img src={staticFile('assets/images/news_bg.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5}}/>
                <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{backgroundColor: 'rgba(200, 0, 0, 0.8)', padding: '10px 40px'}}>
                        <h1 style={{fontSize: 100, color: 'white', fontWeight: 'bold', margin: 0}}>BREAKING NEWS</h1>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 50, marginTop: 40}}>
                        <Img src={staticFile('assets/images/amazon_logo.png')} style={{width: 300}} />
                        <span style={{fontSize: 100, color: 'white'}}>→</span>
                        <Img src={staticFile('assets/images/whole_foods_logo.png')} style={{width: 300}} />
                    </div>
                    <h2 style={{fontSize: 150, color: 'white', fontWeight: 'bold', textShadow: '0 0 20px black'}}>$13.7 Billion</h2>
                </AbsoluteFill>
            </AbsoluteFill>

            <AbsoluteFill style={{opacity: stunOpacity}}>
                <Img src={staticFile('assets/images/shattered_glass_overlay.png')} style={{width: '100%', height: '100%', mixBlendMode: 'screen', opacity: interpolate(frame, [sec(8.7), sec(9.2)], [0, 1])}} />
            </AbsoluteFill>
            
            <AbsoluteFill style={{opacity: ecommerceOpacity, transform: `translateX(${interpolate(frame, [sec(10.4), sec(14.0)], [0, -100])}%)`}}>
                 <Img src={staticFile('assets/images/whole_foods_store.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}}/>
                 <Img src={staticFile('assets/images/ecommerce_screen.png')} style={{position: 'absolute', width: '50%', top: '25%', left: '25%', filter: 'drop-shadow(0 0 30px black)'}}/>
            </AbsoluteFill>
        </AbsoluteFill>
    )
};

// Scene 6: The Aftermath (50.04 - 61.52)
const Scene6: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

    const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.1]);
    const stockY = interpolate(frame, [sec(2.0), sec(5.7)], [0, 800]);
    
    return (
        <AbsoluteFill style={{ opacity, backgroundColor: '#111' }}>
             {/*
                Image requirements:
                - `assets/images/stock_market_bg.jpg`: A background with abstract stock charts and numbers.
                - `assets/images/kroger_logo.png`: The Kroger logo, transparent.
                - `assets/images/costco_logo.png`: The Costco logo, transparent.
            */}
             <Img src={staticFile('assets/images/stock_market_bg.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, transform: `scale(${bgScale})`}}/>

            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
                 <div style={{
                    position: 'absolute', 
                    top: -400,
                    transform: `translateY(${stockY}px)`,
                    textAlign: 'center'
                }}>
                    <div style={{display: 'flex', gap: '100px'}}>
                        <Img src={staticFile('assets/images/kroger_logo.png')} style={{width: 300, filter: 'grayscale(1)'}}/>
                        <Img src={staticFile('assets/images/costco_logo.png')} style={{width: 300, filter: 'grayscale(1)'}}/>
                    </div>
                    <div style={{
                        width: '100%',
                        height: 20,
                        background: 'linear-gradient(90deg, red, darkred)',
                        marginTop: 30,
                        clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'
                    }} />
                     <div style={{
                        width: 0, height: 0,
                        borderLeft: '50px solid transparent',
                        borderRight: '50px solid transparent',
                        borderTop: '50px solid darkred',
                        margin: 'auto'
                    }} />
                </div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};


// Scene 7: Grand Strategy (62.10 - 72.72)
const Scene7: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

    const awsSceneOpacity = interpolate(frame, [sec(0), sec(8.3)], [1, 0]);
    const gameSceneOpacity = interpolate(frame, [sec(8.3), sec(9.0)], [0, 1]);
    const gameZoom = interpolate(frame, [sec(8.3), durationInFrames], [1.5, 1]);
    
    return (
         <AbsoluteFill style={{ opacity, backgroundColor: 'black' }}>
             {/*
                Image requirements:
                - `assets/images/server_room_bg.jpg`: Same as before.
                - `assets/images/aws_logo.png`: Same as before.
                - `assets/images/whole_foods_store.jpg`: Same as before.
                - `assets/images/data_flow.png`: A glowing line or circuit pattern to represent data flow, transparent.
                - `assets/images/chessboard_bg.jpg`: A dramatic, top-down shot of a chessboard.
                - `assets/images/amazon_chess_piece.png`: A unique, glowing chess king piece, transparent.
            */}
             <AbsoluteFill style={{opacity: awsSceneOpacity}}>
                <Img src={staticFile('assets/images/server_room_bg.jpg')} style={{position: 'absolute', width: '50%', height: '100%', objectFit: 'cover', left: 0}} />
                <Img src={staticFile('assets/images/whole_foods_store.jpg')} style={{position: 'absolute', width: '50%', height: '100%', objectFit: 'cover', right: 0}} />
                <AbsoluteFill style={{left: '20%', justifyContent: 'center'}}>
                    <Img src={staticFile('assets/images/aws_logo.png')} style={{width: '20%', filter: 'drop-shadow(0 0 30px #FF9900)'}} />
                </AbsoluteFill>
                <Img src={staticFile('assets/images/data_flow.png')} style={{position: 'absolute', width: '50%', top: '35%', left: '25%', opacity: interpolate(frame, [sec(3.8), sec(4.5)], [0, 1])}} />
             </AbsoluteFill>

             <AbsoluteFill style={{opacity: gameSceneOpacity}}>
                <Img src={staticFile('assets/images/chessboard_bg.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${gameZoom})`}} />
                <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Img src={staticFile('assets/images/amazon_chess_piece.png')} style={{width: '15%', filter: 'drop-shadow(0 0 50px #00a8e1)', transform: `translateY(${interpolate(frame, [sec(9.0), sec(10.6)], [0, -10])}px)`}}/>
                </AbsoluteFill>
             </AbsoluteFill>
        </AbsoluteFill>
    );
};


// --- Main Component ---
export const RemotionVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const durationInSeconds = 73;
  const durationInFrames = durationInSeconds * fps;

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <audio id="audio" src={staticFile('BOOKS/Temp/TTS/Lesson_6.wav')} />
      
      <Sequence from={sec(0)} durationInFrames={sec(5.0)}>
          <Scene1 />
      </Sequence>
      
      <Sequence from={sec(5.0)} durationInFrames={sec(6.1)}>
          <Scene2 />
      </Sequence>
      
      <Sequence from={sec(11.8)} durationInFrames={sec(12.5)}>
          <Scene3 />
      </Sequence>

       <Sequence from={sec(24.7)} durationInFrames={sec(10.4)}>
          <Scene4 />
      </Sequence>
      
      <Sequence from={sec(35.6)} durationInFrames={sec(14.5)}>
          <Scene5 />
      </Sequence>
      
      <Sequence from={sec(50.0)} durationInFrames={sec(11.6)}>
          <Scene6 />
      </Sequence>

      <Sequence from={sec(62.0)} durationInFrames={sec(11.0)}>
          <Scene7 />
      </Sequence>

      <Sequence from={0} durationInFrames={durationInFrames}>
        <Subtitles />
      </Sequence>
    </AbsoluteFill>
  );
};

```