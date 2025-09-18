```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Img,
  interpolate,
  Easing,
  spring,
} from 'remotion';
import React from 'react';

// Helper to convert seconds to frames
const secToFrames = (seconds: number, fps: number): number => Math.round(seconds * fps);

// Word-level animation component
const Word: React.FC<{
  text: string;
  start: number;
  end: number;
}> = ({ text, start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = secToFrames(start, fps);
  const endFrame = secToFrames(end, fps);
  const fadeInDuration = 3;
  const fadeOutDuration = 3;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + fadeInDuration, endFrame - fadeOutDuration, endFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const translateY = interpolate(
    frame,
    [startFrame, startFrame + fadeInDuration],
    [10, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.ease),
    }
  );

  const wordStyle: React.CSSProperties = {
    display: 'inline-block',
    opacity,
    transform: `translateY(${translateY}px)`,
    marginLeft: '0.5em',
    textShadow: '0 0 20px rgba(255, 255, 255, 0.7)',
  };

  return <span style={wordStyle}>{text}</span>;
};

// Component for a sentence or phrase with multiple words
const TextSequence: React.FC<{
  words: { text: string; start: number; end: number }[];
  style?: React.CSSProperties;
}> = ({ words, style }) => {
  const baseStyle: React.CSSProperties = {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '72px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
    position: 'absolute',
    bottom: '15%',
    padding: '0 5%',
    ...style,
  };

  return (
    <div style={baseStyle}>
      {words.map((word, index) => (
        <Word key={`${word.text}-${index}`} {...word} />
      ))}
    </div>
  );
};


// Subtle dust/particle overlay
const DustOverlay: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const particleCount = 100;

    return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
            {Array.from({ length: particleCount }).map((_, i) => {
                const x = (Math.sin(i * 0.3 + frame * 0.01) * 0.5 + 0.5) * width;
                const y = (Math.cos(i * 0.5 + frame * 0.015) * 0.5 + 0.5) * height;
                const size = (Math.sin(i * 0.7) * 0.5 + 0.5) * 3 + 1;
                const opacity = Math.sin(i * 0.4 + frame * 0.02) * 0.2 + 0.2;

                const particleStyle: React.CSSProperties = {
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    opacity,
                };

                return <div key={i} style={particleStyle} />;
            })}
        </AbsoluteFill>
    );
};

// Main Video Component
export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // --- SCENE 1: Key Lesson / Mood Swing (0.00s - 3.42s) ---
  const scene1Start = 0;
  const scene1End = secToFrames(3.42, fps);
  const scene1Progress = interpolate(frame, [scene1Start, scene1End], [0, 1], { extrapolateRight: 'clamp' });
  const scene1Scale = interpolate(scene1Progress, [0, 1], [1, 1.05]);
  const marketChartX = interpolate(scene1Progress, [0, 1], [0, -width / 2]);
  const compassX = interpolate(scene1Progress, [0, 1], [0, width / 2]);
  const compassOpacity = interpolate(frame, [secToFrames(1.34,fps), secToFrames(1.5, fps)], [0, 1]);

  // --- SCENE 2: Strategy / Compass (3.42s - 5.82s) ---
  const scene2Start = secToFrames(3.42, fps);
  const scene2End = secToFrames(5.82, fps);
  const scene2Progress = interpolate(frame, [scene2Start, scene2End], [0, 1], { extrapolateRight: 'clamp' });
  const scene2Scale = interpolate(scene2Progress, [0, 1], [1.1, 1.2]);
  const mapOpacity = interpolate(scene2Progress, [0, 0.5], [0, 1]);

  // --- SCENE 3: Bubble Burst (5.82s - 11.52s) ---
  const scene3Start = secToFrames(5.82, fps);
  const scene3End = secToFrames(11.52, fps);
  const scene3Progress = interpolate(frame, [scene3Start, scene3End], [0, 1], { extrapolateRight: 'clamp' });
  const bubbleScale = interpolate(scene3Progress, [0, 0.15], [1, 1.2], {easing: Easing.ease});
  const bubbleOpacity = interpolate(scene3Progress, [0.1, 0.15], [1, 0]);
  const aftermathZoom = interpolate(scene3Progress, [0.15, 1], [1, 1.1]);

  // --- SCENE 4: Companies Vanished (11.52s - 16.92s) ---
  const scene4Start = secToFrames(11.52, fps);
  const scene4End = secToFrames(16.92, fps);
  const scene4Progress = interpolate(frame, [scene4Start, scene4End], [0, 1], { extrapolateRight: 'clamp' });
  const petsComOpacity = interpolate(frame, [secToFrames(14.28, fps), secToFrames(15.2, fps)], [1, 0]);
  const webvanOpacity = interpolate(frame, [secToFrames(15.34, fps), secToFrames(16.1, fps)], [1, 0]);
  const serverRoomScale = 1 + scene4Progress * 0.1;

  // --- SCENE 5: Amazon Bomb (16.92s - 21.20s) ---
  const scene5Start = secToFrames(16.92, fps);
  const scene5End = secToFrames(21.20, fps);
  const scene5Progress = interpolate(frame, [scene5Start, scene5End], [0, 1], { extrapolateRight: 'clamp' });
  const newspaperZoom = interpolate(scene5Progress, [0, 1], [1.5, 1]);
  const newspaperOpacity = interpolate(scene5Progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const bullRotate = interpolate(scene5Progress, [0, 1], [-5, 5]);

  // --- SCENE 6: Stock Crash (21.20s - 31.80s) ---
  const scene6Start = secToFrames(21.20, fps);
  const scene6End = secToFrames(31.80, fps);
  const scene6Progress = interpolate(frame, [scene6Start, scene6End], [0, 1], { extrapolateRight: 'clamp' });
  const chartPullback = interpolate(scene6Progress, [0, 1], [1.2, 1]);
  const ninetyPercentOpacity = interpolate(frame, [secToFrames(30.5, fps), secToFrames(31.8, fps)], [0, 1]);

  // --- SCENE 7: Evaporating (31.80s - 38.30s) ---
  const scene7Start = secToFrames(31.80, fps);
  const scene7End = secToFrames(38.30, fps);
  const scene7Progress = interpolate(frame, [scene7Start, scene7End], [0, 1], { extrapolateRight: 'clamp' });
  const founderPullback = interpolate(scene7Progress, [0, 1], [1, 1.15]);
  const founderX = interpolate(scene7Progress, [0, 1], [0, -100]);
  
  // --- SCENE 8: Panic (38.30s - 46.84s) ---
  const scene8Start = secToFrames(38.30, fps);
  const scene8End = secToFrames(46.84, fps);
  const scene8Progress = interpolate(frame, [scene8Start, scene8End], [0, 1], { extrapolateRight: 'clamp' });
  const shakeX = Math.sin(frame * 0.5) * 5 * scene8Progress;
  const shakeY = Math.cos(frame * 0.7) * 5 * scene8Progress;

  // --- SCENE 9: Building (46.84s - 50.02s) ---
  const scene9Start = secToFrames(46.84, fps);
  const scene9End = secToFrames(50.02, fps);
  const scene9Progress = interpolate(frame, [scene9Start, scene9End], [0, 1], { extrapolateRight: 'clamp' });
  const buildZoom = interpolate(scene9Progress, [0, 1], [1.2, 1]);
  const blueprintOpacity = interpolate(scene9Progress, [0, 1], [0.5, 0]);

  // --- SCENE 10: Noise vs Signal (50.02s - 54.22s) ---
  const scene10Start = secToFrames(50.02, fps);
  const scene10End = secToFrames(54.22, fps);
  const scene10Progress = interpolate(frame, [scene10Start, scene10End], [0, 1], { extrapolateRight: 'clamp' });
  const noiseBlur = interpolate(scene10Progress, [0, 1], [0, 15]);
  const founderFocusZoom = interpolate(scene10Progress, [0, 1], [1, 1.1]);

  // --- SCENE 11: Survive the Storm (54.22s - 59.68s) ---
  const scene11Start = secToFrames(54.22, fps);
  const scene11End = durationInFrames;
  const scene11Progress = interpolate(frame, [scene11Start, scene11End], [0, 1], { extrapolateRight: 'clamp' });
  const shipPan = interpolate(scene11Progress, [0, 1], [100, -100]);
  const shipScale = interpolate(scene11Progress, [0, 1], [1, 1.1]);
  const lightOpacity = Math.sin(frame * 0.1) * 0.25 + 0.75;

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={'BOOKS/Temp/TTS/Lesson_2.wav'} />
      <DustOverlay/>

      {/* Scene 1: Key Lesson / Mood Swing */}
      <Sequence from={scene1Start} durationInFrames={scene1End - scene1Start + 10}>
        <AbsoluteFill style={{ transform: `scale(${scene1Scale})` }}>
           <Img 
            src={`assets/images/stock_market_crash.jpg`} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translateX(${marketChartX}px)`}}
          />
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Img
              src={`assets/images/compass_rose.png`}
              style={{
                opacity: compassOpacity,
                width: '50%',
                transform: `translateX(${compassX}px) scale(0.9)`,
                filter: 'drop-shadow(0 0 30px #ffffff)',
              }}
            />
          </AbsoluteFill>
        </AbsoluteFill>
        <TextSequence words={[{ text: 'Key', start: 0.0, end: 0.48 }, { text: 'lesson.', start: 0.48, end: 0.94 }]} />
        <TextSequence words={[{ text: 'The', start: 1.34, end: 1.56 }, { text: 'market', start: 1.56, end: 1.96 }, { text: 'is', start: 1.96, end: 2.28 }, { text: 'a', start: 2.28, end: 2.36 }, { text: 'mood', start: 2.36, end: 2.62 }, { text: 'swing.', start: 2.62, end: 3.0 }]} />
      </Sequence>
      
      {/* Scene 2: Strategy / Compass */}
      <Sequence from={scene2Start} durationInFrames={scene2End - scene2Start}>
        <AbsoluteFill>
          <Img src={`assets/images/old_map.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scene2Scale})`, opacity: mapOpacity}} />
          <Img src={`assets/images/compass_close_up.png`} style={{ position: 'absolute', top: '20%', left: '30%', width: '40%', filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.7))', transform: `scale(${scene2Scale * 0.9})` }}/>
        </AbsoluteFill>
        <TextSequence words={[{ text: 'Your', start: 3.42, end: 3.52 }, { text: 'strategy', start: 3.52, end: 4.12 }, { text: 'is', start: 4.12, end: 4.5 }, { text: 'a', start: 4.5, end: 4.56 }, { text: 'compass.', start: 4.56, end: 4.92 }]} />
      </Sequence>

      {/* Scene 3: Bubble Burst */}
      <Sequence from={scene3Start} durationInFrames={scene3End - scene3Start}>
        <AbsoluteFill>
          <Img src={`assets/images/dot_com_city.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${aftermathZoom})` }} />
          <Img src={`assets/images/bubble.png`} style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', opacity: bubbleOpacity, transform: `scale(${bubbleScale})` }} />
        </AbsoluteFill>
        <TextSequence words={[{ text: 'The', start: 5.82, end: 5.88 }, { text: 'bubble', start: 5.88, end: 6.2 }, { text: 'burst.', start: 6.2, end: 6.74 }]} />
        <TextSequence words={[{ text: 'From', start: 7.26, end: 7.36 }, { text: 'late', start: 7.36, end: 7.64 }, { text: '1999', start: 7.64, end: 8.22 }, { text: 'through', start: 8.22, end: 8.88 }, { text: '2001,', start: 8.88, end: 9.62 }, { text: 'the', start: 10.06, end: 10.12 }, { text: 'party', start: 10.12, end: 10.42 }, { text: 'ended.', start: 10.42, end: 10.92 }]} />
      </Sequence>

      {/* Scene 4: Companies Vanished */}
      <Sequence from={scene4Start} durationInFrames={scene4End - scene4Start}>
         <AbsoluteFill style={{ transform: `scale(${serverRoomScale})`}}>
           <Img src={`assets/images/dark_server_room.jpg`} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)'}} />
         </AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: '50px'}}>
            <Img src={`assets/images/pets_com_logo.png`} style={{ width: '20%', opacity: petsComOpacity, filter: 'grayscale(1)'}}/>
            <Img src={`assets/images/webvan_logo.png`} style={{ width: '20%', opacity: webvanOpacity, filter: 'grayscale(1)'}}/>
          </AbsoluteFill>
        <TextSequence words={[{ text: '.com', start: 11.52, end: 11.9 }, { text: 'companies', start: 11.9, end: 12.44 }, { text: 'vanished', start: 12.44, end: 13.02 }, { text: 'overnight.', start: 13.02, end: 13.64 }]} />
        <TextSequence words={[{ text: 'Gone.', start: 16.22, end: 16.40 }]} style={{fontSize: '100px'}} />
      </Sequence>
      
      {/* Scene 5: Amazon Bomb */}
      <Sequence from={scene5Start} durationInFrames={scene5End - scene5Start}>
         <AbsoluteFill>
            <Img src={`assets/images/wall_street_bull.jpg`} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `rotate(${bullRotate}deg) scale(1.1)`}} />
            <AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.5)'}} />
            <Img src={`assets/images/amazon_bomb_headline.png`} style={{ opacity: newspaperOpacity, transform: `scale(${newspaperZoom})`, objectFit: 'contain' }}/>
         </AbsoluteFill>
        <TextSequence words={[{ text: 'Wall', start: 16.92, end: 17.26 }, { text: 'Street', start: 17.26, end: 17.56 }, { text: 'turned', start: 17.56, end: 17.98 }, { text: 'on', start: 17.98, end: 18.3 }, { text: 'Amazon.', start: 18.3, end: 18.58 }]} />
        <TextSequence words={[{ text: 'They', start: 19.1, end: 19.3 }, { text: 'called', start: 19.3, end: 19.52 }, { text: 'it', start: 19.52, end: 19.74 }, { text: 'Amazon', start: 19.74, end: 20.24 }, { text: 'Bomb.', start: 20.24, end: 20.64 }]} />
      </Sequence>

      {/* Scene 6: Stock Crash */}
      <Sequence from={scene6Start} durationInFrames={scene6End - scene6Start}>
        <AbsoluteFill style={{ transform: `scale(${chartPullback})`}}>
          <Img src={`assets/images/trading_floor_panic.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(5px) brightness(0.6)' }}/>
          <Img src={`assets/images/amazon_stock_crash_chart.png`} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{opacity: ninetyPercentOpacity, fontSize: '200px', color: '#ff4136', fontWeight: 'bold', textShadow: '0 0 20px #ff4136'}}>90% DROP</div>
          </AbsoluteFill>
        </AbsoluteFill>
        <TextSequence words={[{ text: 'The', start: 21.20, end: 21.46 }, { text: 'stock', start: 21.46, end: 21.82 }, { text: '...crashed.', start: 23.58, end: 24.58 }]} />
        <TextSequence words={[{ text: 'It', start: 25.22, end: 25.44 }, { text: 'fell...until', start: 25.44, end: 26.92 }, { text: 'worth less than', start: 27.20, end: 27.96 }, { text: '$6 a share.', start: 27.96, end: 29.24 }]} />
      </Sequence>

      {/* Scene 7: Evaporating */}
      <Sequence from={scene7Start} durationInFrames={scene7End - scene7Start}>
        <AbsoluteFill style={{ transform: `scale(${founderPullback}) translateX(${founderX}px)`}}>
            <Img src={`assets/images/bleak_cityscape.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)'}}/>
            <Img src={`assets/images/founder_silhouette.png`} style={{ width: '100%', height: '100%', objectFit: 'contain'}}/>
        </AbsoluteFill>
        <TextSequence words={[{ text: 'Your', start: 33.56, end: 33.6 }, { text: "life's", start: 33.6, end: 34.14 }, { text: 'work.', start: 34.14, end: 34.38 }]} />
        <TextSequence words={[{ text: 'Your', start: 34.74, end: 34.8 }, { text: 'entire', start: 34.8, end: 35.34 }, { text: 'net worth', start: 35.34, end: 35.96 }, { text: 'evaporating by', start: 35.96, end: 37.12 }, { text: '90%.', start: 37.12, end: 38.3 }]} />
      </Sequence>

      {/* Scene 8: Panic */}
      <Sequence from={scene8Start} durationInFrames={scene8End - scene8Start}>
        <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)`}}>
          <Img src={`assets/images/boardroom_panic.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.5) brightness(0.6)'}}/>
        </AbsoluteFill>
        <TextSequence words={[{ text: 'Most', start: 38.3, end: 39.0 }, { text: 'founders', start: 39.0, end: 39.42 }, { text: 'would', start: 39.42, end: 39.64 }, { text: 'panic.', start: 39.64, end: 40.02 }]} />
        <TextSequence words={[{ text: 'They would', start: 40.52, end: 40.76 }, { text: 'cut costs', start: 40.76, end: 41.44 }, { text: 'to the bone.', start: 41.44, end: 42.06 }]} />
        <TextSequence words={[{ text: 'To', start: 45.1, end: 45.2 }, { text: 'calm', start: 45.2, end: 45.46 }, { text: 'the', start: 45.46, end: 45.66 }, { text: 'investors.', start: 45.66, end: 46.2 }]} />
      </Sequence>

      {/* Scene 9: Building */}
      <Sequence from={scene9Start} durationInFrames={scene9End - scene9Start}>
        <AbsoluteFill style={{backgroundColor: '#111'}}>
          <Img src={`assets/images/warehouse_construction.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, transform: `scale(${buildZoom})`}}/>
          <Img src={`assets/images/blueprints.png`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: blueprintOpacity, mixBlendMode: 'screen' }} />
        </AbsoluteFill>
        <TextSequence words={[{ text: 'Bezos', start: 46.84, end: 47.22 }, { text: 'did the', start: 47.22, end: 47.66 }, { text: 'opposite.', start: 47.66, end: 48.08 }]} />
        <TextSequence words={[{ text: 'He', start: 48.54, end: 48.66 }, { text: 'kept', start: 48.66, end: 49.02 }, { text: 'building.', start: 49.02, end: 49.44 }]} />
      </Sequence>

      {/* Scene 10: Noise vs Signal */}
      <Sequence from={scene10Start} durationInFrames={scene10End - scene10Start}>
        <AbsoluteFill>
          <Img src={`assets/images/market_noise.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${noiseBlur}px) brightness(0.7)`, transform: `scale(1.2)` }}/>
          <Img src={`assets/images/focused_founder.png`} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${founderFocusZoom})` }} />
        </AbsoluteFill>
        <TextSequence words={[{ text: 'He', start: 50.02, end: 50.26 }, { text: 'knew the', start: 50.26, end: 50.68 }, { text: 'market', start: 50.68, end: 51.04 }, { text: 'was just noise.', start: 51.04, end: 52.00 }]} />
        <TextSequence words={[{ text: 'It was', start: 52.52, end: 52.78 }, { text: 'fear', start: 52.78, end: 53.08 }, { text: 'and', start: 53.08, end: 53.42 }, { text: 'greed.', start: 53.42, end: 53.66 }]} />
      </Sequence>

      {/* Scene 11: Survive the Storm */}
      <Sequence from={scene11Start}>
        <AbsoluteFill>
          <Img src={`assets/images/ship_in_storm.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${shipScale}) translateX(${shipPan}px)` }}/>
          <Img src={`assets/images/lighthouse_beam.png`} style={{ position: 'absolute', top: '-10%', right: '0%', width: '80%', opacity: lightOpacity, mixBlendMode: 'soft-light' }} />
        </AbsoluteFill>
        <TextSequence words={[{ text: 'His', start: 54.22, end: 54.42 }, { text: 'strategy', start: 54.42, end: 54.96 }, { text: 'was the', start: 54.96, end: 55.50 }, { text: 'signal.', start: 55.50, end: 55.88 }]} />
        <TextSequence words={[{ text: 'He needed to', start: 56.56, end: 57.10 }, { text: 'survive', start: 57.10, end: 57.48 }, { text: 'the storm.', start: 57.48, end: 58.22 }]} />
        <TextSequence words={[{ text: 'Not', start: 58.6, end: 58.76 }, { text: 'abandon', start: 58.76, end: 59.24 }, { text: 'the ship.', start: 59.24, end: 59.68 }]} />
      </Sequence>

    </AbsoluteFill>
  );
};
```