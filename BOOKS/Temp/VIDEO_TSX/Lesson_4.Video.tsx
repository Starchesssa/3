```tsx
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { interpolate, spring, Easing } from 'remotion';
import React from 'react';

const FPS = 30;

// Helper to convert seconds to frames
const sec = (seconds: number) => Math.round(seconds * FPS);

interface Word {
  start: number;
  end: number;
  text: string;
}

const transcript: Word[] = [
  { start: 0.0, end: 0.42, text: 'Key' },
  { start: 0.42, end: 0.82, text: 'lesson,' },
  { start: 1.26, end: 1.54, text: 'turn' },
  { start: 1.54, end: 1.78, text: 'your' },
  { start: 1.78, end: 2.16, text: 'biggest' },
  { start: 2.16, end: 2.64, text: 'expense' },
  { start: 2.64, end: 3.2, text: 'into' },
  { start: 3.2, end: 3.4, text: 'your' },
  { start: 3.4, end: 3.8, text: 'biggest' },
  { start: 3.8, end: 4.48, text: 'product.' },
  { start: 4.84, end: 5.5, text: 'The' },
  { start: 5.5, end: 5.78, text: 'year' },
  { start: 5.78, end: 6.0, text: 'is' },
  { start: 6.0, end: 6.84, text: '2006.' },
  { start: 7.4, end: 7.74, text: 'Amazon' },
  { start: 7.74, end: 8.08, text: 'is' },
  { start: 8.08, end: 8.22, text: 'a' },
  { start: 8.22, end: 8.62, text: 'successful' },
  { start: 8.62, end: 9.22, text: 'online' },
  { start: 9.22, end: 9.76, text: 'retailer.' },
  { start: 10.2, end: 10.48, text: 'That' },
  { start: 10.48, end: 10.66, text: 'is' },
  { start: 10.66, end: 10.82, text: 'what' },
  { start: 10.82, end: 11.22, text: 'everyone' },
  { start: 11.22, end: 11.62, text: 'sees.' },
  { start: 12.24, end: 12.42, text: 'But' },
  { start: 12.42, end: 12.9, text: 'inside,' },
  { start: 13.34, end: 13.54, text: 'something' },
  { start: 13.54, end: 13.86, text: 'else' },
  { start: 13.86, end: 14.06, text: 'is' },
  { start: 14.06, end: 14.4, text: 'happening.' },
  { start: 15.0, end: 15.2, text: 'For' },
  { start: 15.2, end: 15.54, text: 'years,' },
  { start: 15.88, end: 15.94, text: 'the' },
  { start: 15.94, end: 16.46, text: "company's" },
  { start: 16.46, end: 16.76, text: 'biggest' },
  { start: 16.76, end: 17.18, text: 'headache' },
  { start: 17.18, end: 17.52, text: 'and' },
  { start: 17.52, end: 17.84, text: 'biggest' },
  { start: 17.84, end: 18.34, text: 'expense' },
  { start: 18.34, end: 18.78, text: 'was' },
  { start: 18.78, end: 18.96, text: 'its' },
  { start: 18.96, end: 19.28, text: 'own' },
  { start: 19.28, end: 19.74, text: 'computing' },
  { start: 19.74, end: 20.5, text: 'infrastructure.' },
  { start: 21.0, end: 21.2, text: 'The' },
  { start: 21.2, end: 21.58, text: 'servers,' },
  { start: 21.96, end: 22.06, text: 'the' },
  { start: 22.06, end: 22.56, text: 'databases,' },
  { start: 22.98, end: 23.22, text: 'the' },
  { start: 23.22, end: 23.56, text: 'network' },
  { start: 23.56, end: 23.86, text: 'to' },
  { start: 23.86, end: 24.04, text: 'run' },
  { start: 24.04, end: 24.2, text: 'the' },
  { start: 24.2, end: 24.64, text: 'massive' },
  { start: 24.64, end: 25.1, text: 'Amazon' },
  { start: 25.1, end: 25.58, text: '.com' },
  { start: 25.58, end: 26.06, text: 'website.' },
  { start: 26.06, end: 26.74, text: 'It' },
  { start: 26.74, end: 26.92, text: 'was' },
  { start: 26.92, end: 27.14, text: 'a' },
  { start: 27.14, end: 27.62, text: 'beast.' },
  { start: 28.04, end: 28.16, text: 'It' },
  { start: 28.16, end: 28.32, text: 'was' },
  { start: 28.32, end: 28.82, text: 'complex' },
  { start: 28.82, end: 29.26, text: 'and' },
  { start: 29.26, end: 29.9, text: 'incredibly' },
  { start: 29.9, end: 30.58, text: 'expensive.' },
  { start: 31.14, end: 31.34, text: 'A' },
  { start: 31.34, end: 31.62, text: 'normal' },
  { start: 31.62, end: 32.06, text: 'company' },
  { start: 32.06, end: 32.38, text: 'sees' },
  { start: 32.38, end: 32.56, text: 'a' },
  { start: 32.56, end: 32.76, text: 'cost' },
  { start: 32.76, end: 33.1, text: 'center.' },
  { start: 33.54, end: 33.72, text: 'They' },
  { start: 33.72, end: 33.96, text: 'try' },
  { start: 33.96, end: 34.1, text: 'to' },
  { start: 34.1, end: 34.24, text: 'make' },
  { start: 34.24, end: 34.4, text: 'it' },
  { start: 34.4, end: 34.54, text: 'a' },
  { start: 34.54, end: 34.78, text: 'little' },
  { start: 34.78, end: 35.14, text: 'cheaper,' },
  { start: 35.5, end: 35.56, text: 'a' },
  { start: 35.56, end: 35.8, text: 'little' },
  { start: 35.8, end: 36.0, text: 'more' },
  { start: 36.0, end: 36.4, text: 'efficient.' },
  { start: 37.06, end: 37.42, text: 'Amazon' },
  { start: 37.42, end: 37.78, text: 'saw' },
  { start: 37.78, end: 37.9, text: 'an' },
  { start: 37.9, end: 38.48, text: 'opportunity.' },
  { start: 39.02, end: 39.24, text: 'They' },
  { start: 39.24, end: 39.48, text: 'thought,' },
  { start: 39.8, end: 40.0, text: 'if' },
  { start: 40.0, end: 40.18, text: 'we' },
  { start: 40.18, end: 40.34, text: 'have' },
  { start: 40.34, end: 40.6, text: 'gotten' },
  { start: 40.6, end: 40.86, text: 'this' },
  { start: 40.86, end: 41.2, text: 'good' },
  { start: 41.2, end: 41.4, text: 'at' },
  { start: 41.4, end: 41.66, text: 'running' },
  { start: 41.66, end: 42.2, text: 'massive,' },
  { start: 2.48, end: 42.86, text: 'reliable' },
  { start: 42.86, end: 43.32, text: 'computer' },
  { start: 43.32, end: 43.8, text: 'systems' },
  { start: 43.8, end: 44.04, text: 'for' },
  { start: 44.04, end: 44.48, text: 'ourselves,' },
  { start: 45.06, end: 45.22, text: 'maybe' },
  { start: 45.22, end: 45.58, text: 'other' },
  { start: 45.58, end: 45.92, text: 'people' },
  { start: 45.92, end: 46.14, text: 'would' },
  { start: 46.14, end: 46.36, text: 'pay' },
  { start: 46.36, end: 46.5, text: 'to' },
  { start: 46.5, end: 46.76, text: 'use' },
  { start: 46.76, end: 47.02, text: 'it.' },
  { start: 47.42, end: 47.7, text: 'In' },
  { start: 47.7, end: 48.36, text: '2006,' },
  { start: 48.76, end: 48.84, text: 'they' },
  { start: 48.84, end: 49.12, text: 'launched' },
  { start: 49.12, end: 49.58, text: 'Amazon' },
  { start: 49.58, end: 49.94, text: 'Web' },
  { start: 49.94, end: 50.46, text: 'Services,' },
  { start: 50.78, end: 50.98, text: 'or' },
  { start: 50.98, end: 51.52, text: 'AWS.' },
  { start: 52.28, end: 52.54, text: 'They' },
  { start: 52.54, end: 52.92, text: 'started' },
  { start: 52.92, end: 53.28, text: 'renting' },
  { start: 53.28, end: 53.58, text: 'out' },
  { start: 53.58, end: 53.74, text: 'their' },
  { start: 53.74, end: 54.12, text: 'computer' },
  { start: 54.12, end: 54.46, text: 'power.' },
  { start: 54.46, end: 55.08, text: 'It' },
  { start: 55.08, end: 55.2, text: 'was' },
  { start: 55.2, end: 55.38, text: 'like' },
  { start: 55.38, end: 55.52, text: 'a' },
  { start: 55.52, end: 55.82, text: 'power' },
  { start: 55.82, end: 56.26, text: 'company,' },
  { start: 56.48, end: 56.64, text: 'but' },
  { start: 56.64, end: 56.84, text: 'for' },
  { start: 56.84, end: 57.28, text: 'computing.' },
  { start: 58.06, end: 58.2, text: 'At' },
  { start: 58.2, end: 58.58, text: 'first,' },
  { start: 58.86, end: 59.04, text: 'no' },
  { start: 59.04, end: 59.18, text: 'one' },
  { start: 59.18, end: 59.6, text: 'understood' },
  { start: 59.6, end: 59.88, text: 'it.' },
  { start: 60.2, end: 60.4, text: 'An' },
  { start: 60.4, end: 60.78, text: 'online' },
  { start: 60.78, end: 61.3, text: 'bookstore' },
  { start: 61.3, end: 61.66, text: 'was' },
  { start: 61.66, end: 61.84, text: 'now' },
  { start: 61.84, end: 62.18, text: 'selling' },
  { start: 62.18, end: 62.6, text: 'server' },
  { start: 2.6, end: 62.98, text: 'time.' },
  { start: 63.3, end: 63.42, text: 'It' },
  { start: 63.42, end: 63.6, text: 'made' },
  { start: 63.6, end: 63.98, text: 'no' },
  { start: 63.98, end: 64.42, text: 'sense.' },
  { start: 64.9, end: 65.1, text: 'But' },
  { start: 65.1, end: 65.26, text: 'it' },
  { start: 65.26, end: 65.4, text: 'was' },
  { start: 65.4, end: 65.58, text: 'the' },
  { start: 65.58, end: 65.96, text: 'start' },
  { start: 65.96, end: 66.18, text: 'of' },
  { start: 66.18, end: 66.3, text: 'the' },
  { start: 66.3, end: 66.64, text: 'cloud' },
  { start: 66.64, end: 67.16, text: 'computing' },
  { start: 67.16, end: 67.8, text: 'revolution.' },
  { start: 68.4, end: 68.5, text: 'A' },
  { start: 68.5, end: 68.94, text: 'multi' },
  { start: 68.94, end: 69.58, text: '-trillion' },
  { start: 69.58, end: 69.94, text: 'dollar' },
  { start: 69.94, end: 70.42, text: 'industry' },
  { start: 70.42, end: 70.7, text: 'was' },
  { start: 70.7, end: 71.0, text: 'born' },
  { start: 71.0, end: 71.26, text: 'from' },
  { start: 71.26, end: 71.46, text: 'what' },
  { start: 71.46, end: 71.76, text: 'used' },
  { start: 71.76, end: 71.96, text: 'to' },
  { start: 71.96, end: 72.04, text: 'be' },
  { start: 72.04, end: 72.2, text: 'a' },
  { start: 72.2, end: 72.44, text: 'line' },
  { start: 72.44, end: 72.76, text: 'item' },
  { start: 72.76, end: 72.94, text: 'in' },
  { start: 72.94, end: 73.12, text: 'their' },
  { start: 73.12, end: 73.44, text: 'expense' },
  { start: 73.44, end: 73.82, text: 'report.' },
];

const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [sec(word.start), sec(word.start) + 6, sec(word.end) - 6, sec(word.end)],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  const style: React.CSSProperties = {
    opacity,
  };

  return <span style={style}> {word.text} </span>;
};

const TextOverlay: React.FC = () => {
  const textStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    fontSize: '72px',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: '1.4',
    textShadow: '0px 0px 20px rgba(0,0,0,0.7)',
  };

  const currentSentence = [
    transcript.slice(0, 10),
    transcript.slice(10, 16),
    transcript.slice(16, 22),
    transcript.slice(22, 29),
    transcript.slice(29, 36),
    transcript.slice(36, 40),
    transcript.slice(40, 44),
    transcript.slice(44, 48),
    transcript.slice(48, 59),
    transcript.slice(59, 64),
    transcript.slice(64, 71),
    transcript.slice(71, 77),
    transcript.slice(77, 83),
    transcript.slice(83, 90),
    transcript.slice(90),
  ];
  
  const sentenceDurations = [
    { start: 0, end: 4.8 },
    { start: 4.8, end: 10 },
    { start: 10, end: 14.8 },
    { start: 14.8, end: 20.8 },
    { start: 20.8, end: 28 },
    { start: 28, end: 31 },
    { start: 31, end: 37 },
    { start: 37, end: 39 },
    { start: 39, end: 47.4 },
    { start: 47.4, end: 52 },
    { start: 52, end: 57.8 },
    { start: 57.8, end: 64.8 },
    { start: 64.8, end: 68.2 },
    { start: 68.2, end: 74 },
  ];

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 10%',
      }}
    >
      <div style={textStyle}>
        {currentSentence.map((sentence, i) => (
          <Sequence from={sec(sentenceDurations[i]?.start ?? 0)} durationInFrames={sec((sentenceDurations[i]?.end ?? 75) - (sentenceDurations[i]?.start ?? 0))}>
            <p>
              {sentence.map((word, j) => (
                <WordComponent key={j} word={word} />
              ))}
            </p>
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// --- SCENES ---

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = sec(4.8);
  const progress = frame / durationInFrames;

  const scale = interpolate(progress, [0, 1], [1.2, 1]);
  const bgTranslateX = interpolate(progress, [0, 1], [-50, 50]);
  const dollarSignOpacity = interpolate(progress, [0.3, 0.5, 0.8, 1], [0, 1, 1, 0]);
  const dollarSignScale = interpolate(progress, [0.4, 0.7], [0.8, 1.2]);
  const productBoxOpacity = interpolate(progress, [0.7, 0.9], [0, 1]);

  const sceneStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
  };
  const bgStyle: React.CSSProperties = {
    width: '110%',
    height: '110%',
    objectFit: 'cover',
    transform: `translateX(${bgTranslateX}px)`,
  };
  const dollarStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: dollarSignOpacity,
    transform: `scale(${dollarSignScale})`,
    filter: 'drop-shadow(0 0 40px #ffee00)',
  };
  const productStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: productBoxOpacity,
    transform: 'scale(1.1)',
  };

  return (
    <AbsoluteFill style={sceneStyle}>
      <Img src={staticFile('assets/images/abstract_gears.jpg')} style={bgStyle} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Img src={staticFile('assets/images/dollar_sign.png')} style={dollarStyle} />
        <Img src={staticFile('assets/images/product_box.png')} style={productStyle} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = spring({ frame, fps: FPS, config: { stiffness: 30 }, durationInFrames });

    const scale = interpolate(progress, [0, 1], [1, 1.1]);
    const panX = interpolate(progress, [0, 1], [0, -100]);

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${scale}) translateX(${panX}px)`,
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/amazon_2006_bg.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </AbsoluteFill>
    );
};

const Scene3: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const pullBack = interpolate(progress, [0, 1], [1.2, 1]);
    const frontendOpacity = interpolate(progress, [0, 0.5, 1], [1, 0.8, 0]);
    const dataStreamsOpacity = interpolate(progress, [0.4, 1], [0, 0.5]);

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${pullBack})`,
    };
    const frontendStyle: React.CSSProperties = {
        opacity: frontendOpacity,
        position: 'absolute',
        width: '100%',
        height: '100%',
    };
    const dataStreamsStyle: React.CSSProperties = {
        opacity: dataStreamsOpacity,
        mixBlendMode: 'screen',
        position: 'absolute',
        width: '100%',
        height: '100%',
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/server_network.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Img src={staticFile('assets/images/data_streams.png')} style={dataStreamsStyle} />
            <Img src={staticFile('assets/images/amazon_2006_bg.jpg')} style={frontendStyle} />
        </AbsoluteFill>
    );
};

const Scene4: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const zoom = interpolate(progress, [0, 1], [1.1, 1]);
    const rotate = interpolate(progress, [0, 1], [-2, 2]);
    const redGlowOpacity = 0.4 + Math.sin(frame / 5) * 0.2;

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${zoom}) rotate(${rotate}deg)`,
    };
    const redGlowStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,0,0,0.5) 0%, rgba(0,0,0,0) 70%)',
        opacity: redGlowOpacity,
    };
    
    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/dark_server_room.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.5) brightness(0.7)' }} />
            <div style={redGlowStyle} />
        </AbsoluteFill>
    );
};

const Scene5: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const zoom = interpolate(progress, [0, 1], [1, 1.2]);
    const panY = interpolate(progress, [0, 1], [20, -20]);
    const frontPanX = interpolate(progress, [0, 1], [-50, 50]);

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${zoom}) translateY(${panY}px)`,
    };
    const backgroundStyle: React.CSSProperties = {
        transform: 'scale(1.05)'
    };
    const midStyle: React.CSSProperties = {
        transform: 'scale(1.1) translateX(-20px)'
    };
    const frontStyle: React.CSSProperties = {
        transform: `scale(1.2) translateX(${frontPanX}px)`
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/server_rack_back.jpg')} style={{ ...backgroundStyle, width: '100%', height: '100%', objectFit: 'cover' }} />
            <Img src={staticFile('assets/images/server_rack_mid.png')} style={{ ...midStyle, position: 'absolute', width: '100%', height: '100%' }} />
            <Img src={staticFile('assets/images/server_rack_front.png')} style={{ ...frontStyle, position: 'absolute', width: '100%', height: '100%' }} />
        </AbsoluteFill>
    );
};

const Scene6: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = Easing.inOut(Easing.ease)(frame / durationInFrames);

    const scale = interpolate(progress, [0, 1], [1.3, 1]);
    const rotate = interpolate(progress, [0, 1], [5, 0]);

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${scale}) rotate(${rotate}deg)`,
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/tangled_wires_bg.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }} />
        </AbsoluteFill>
    );
};

const Scene7: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const zoom = interpolate(progress, [0, 1], [1, 1.05]);
    const panX = interpolate(progress, [0, 1], [0, 20]);

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${zoom}) translateX(${panX}px)`,
        filter: 'grayscale(0.7) brightness(1.1)',
    };
    const graphStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '10%', right: '10%',
        width: '40%',
        opacity: interpolate(progress, [0.2, 0.4], [0, 1]),
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/corporate_meeting_room.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Img src={staticFile('assets/images/cost_graph.png')} style={graphStyle} />
        </AbsoluteFill>
    );
};

const Scene8: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;
    const springProgress = spring({ frame, fps: FPS, config: { stiffness: 50, damping: 200 } });

    const zoom = interpolate(springProgress, [0, 1], [3, 1]);
    const lightOpacity = interpolate(progress, [0, 0.5], [0, 1]);

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${zoom})`,
    };
    const lightBeamStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: lightOpacity,
        mixBlendMode: 'screen',
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/dark_server_room.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
            <Img src={staticFile('assets/images/light_beam.png')} style={lightBeamStyle} />
        </AbsoluteFill>
    );
};

const Scene9: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const scale = interpolate(progress, [0, 1], [1, 1.2]);
    const opacity = interpolate(progress, [0, 0.2], [0, 1]);
    
    const sceneStyle: React.CSSProperties = {
        transform: `scale(${scale})`,
        backgroundColor: '#000'
    };
    
    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/server_to_clients.png')} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity }} />
        </AbsoluteFill>
    );
};

const Scene10: React.FC = () => {
    const frame = useCurrentFrame();
    const springProgress = spring({ frame, fps: FPS, config: { stiffness: 100 } });

    const scale = interpolate(springProgress, [0, 1], [0.5, 1]);
    const opacity = interpolate(springProgress, [0, 0.5], [0, 1]);
    const glowRadius = interpolate(springProgress, [0, 1], [0, 50]);

    const logoStyle: React.CSSProperties = {
        transform: `scale(${scale})`,
        opacity,
        filter: `drop-shadow(0 0 ${glowRadius}px rgba(255, 153, 0, 0.7))`,
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#232F3E', justifyContent: 'center', alignItems: 'center' }}>
            <Img src={staticFile('assets/images/cloud_tech_bg.jpg')} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />
            <Img src={staticFile('assets/images/aws_logo.png')} style={logoStyle} />
        </AbsoluteFill>
    );
};

const Scene11: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const zoom = interpolate(progress, [0, 1], [1.1, 1]);
    const dataCenterOpacity = interpolate(progress, [0.4, 0.8], [0, 1]);

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${zoom})`,
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/power_plant.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Img src={staticFile('assets/images/data_center.jpg')} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: dataCenterOpacity }} />
        </AbsoluteFill>
    );
};

const Scene12: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const rotate = interpolate(progress, [0, 1], [-3, 3]);
    const zoom = interpolate(progress, [0, 1], [1, 1.1]);
    const questionMarksOpacity = 0.5 + Math.sin(frame / 10) * 0.3;

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${zoom}) rotate(${rotate}deg)`,
    };
    const questionMarksStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%', height: '100%',
        objectFit: 'cover',
        opacity: questionMarksOpacity,
        mixBlendMode: 'screen',
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/book_and_server.png')} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'sepia(0.3)' }} />
            <Img src={staticFile('assets/images/question_marks.png')} style={questionMarksStyle} />
        </AbsoluteFill>
    );
};

const Scene13: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const pullBack = interpolate(progress, [0, 1], [3, 1], { easing: Easing.bezier(0.22, 1, 0.36, 1) });
    const networkOpacity = interpolate(progress, [0.5, 1], [0, 0.7]);
    
    const sceneStyle: React.CSSProperties = {
        transform: `scale(${pullBack})`,
    };
    const networkStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%', height: '100%',
        objectFit: 'cover',
        opacity: networkOpacity,
        mixBlendMode: 'lighten',
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/earth_network.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Img src={staticFile('assets/images/data_streams.png')} style={networkStyle} />
        </AbsoluteFill>
    );
};

const Scene14: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    const reportOpacity = interpolate(progress, [0.8, 1], [1, 0]);
    const cityOpacity = interpolate(progress, [0.2, 0.5], [0, 1]);
    const zoom = interpolate(progress, [0.1, 1], [1, 1.2]);

    const sceneStyle: React.CSSProperties = {
        transform: `scale(${zoom})`,
    };
    const cityStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%', height: '100%',
        objectFit: 'cover',
        opacity: cityOpacity,
    };
    const reportStyle: React.CSSProperties = {
        position: 'absolute',
        width: '100%', height: '100%',
        objectFit: 'contain',
        opacity: reportOpacity,
    };

    return (
        <AbsoluteFill style={sceneStyle}>
            <Img src={staticFile('assets/images/futuristic_cityscape.jpg')} style={cityStyle} />
            <Img src={staticFile('assets/images/expense_report.png')} style={reportStyle} />
        </AbsoluteFill>
    );
};


// --- MAIN COMPONENT ---

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="StorytellingVideo"
        component={Main}
        durationInFrames={sec(75)}
        fps={FPS}
        width={3840}
        height={2160}
      />
    </>
  );
};

const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_4.wav')} />
      
      <Sequence from={sec(0)} durationInFrames={sec(4.8)}>
        <Scene1 />
      </Sequence>
      <Sequence from={sec(4.8)} durationInFrames={sec(5.2)}>
        <Scene2 />
      </Sequence>
      <Sequence from={sec(10)} durationInFrames={sec(4.8)}>
        <Scene3 />
      </Sequence>
      <Sequence from={sec(14.8)} durationInFrames={sec(6)}>
        <Scene4 />
      </Sequence>
      <Sequence from={sec(20.8)} durationInFrames={sec(7.2)}>
        <Scene5 />
      </Sequence>
      <Sequence from={sec(28)} durationInFrames={sec(3)}>
        <Scene6 />
      </Sequence>
      <Sequence from={sec(31)} durationInFrames={sec(6)}>
        <Scene7 />
      </Sequence>
      <Sequence from={sec(37)} durationInFrames={sec(2)}>
        <Scene8 />
      </Sequence>
      <Sequence from={sec(39)} durationInFrames={sec(8.4)}>
        <Scene9 />
      </Sequence>
      <Sequence from={sec(47.4)} durationInFrames={sec(4.6)}>
        <Scene10 />
      </Sequence>
      <Sequence from={sec(52)} durationInFrames={sec(5.8)}>
        <Scene11 />
      </Sequence>
      <Sequence from={sec(57.8)} durationInFrames={sec(7)}>
        <Scene12 />
      </Sequence>
      <Sequence from={sec(64.8)} durationInFrames={sec(3.4)}>
        <Scene13 />
      </Sequence>
      <Sequence from={sec(68.2)} durationInFrames={sec(6)}>
        <Scene14 />
      </Sequence>

      <TextOverlay />
    </AbsoluteFill>
  );
};
```