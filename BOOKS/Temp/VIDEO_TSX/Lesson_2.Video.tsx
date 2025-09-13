```tsx
import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

// --- Data ---
// Transcript with timestamps converted to a data structure
const transcript = [
  { start: 0.0, end: 0.48, text: 'Key' },
  { start: 0.48, end: 0.94, text: 'lesson.' },
  { start: 1.34, end: 1.56, text: 'The' },
  { start: 1.56, end: 1.96, text: 'market' },
  { start: 1.96, end: 2.28, text: 'is' },
  { start: 2.28, end: 2.36, text: 'a' },
  { start: 2.36, end: 2.62, text: 'mood' },
  { start: 2.62, end: 3.0, text: 'swing.' },
  { start: 3.42, end: 3.52, text: 'Your' },
  { start: 3.52, end: 4.12, text: 'strategy' },
  { start: 4.12, end: 4.5, text: 'is' },
  { start: 4.5, end: 4.56, text: 'a' },
  { start: 4.56, end: 4.92, text: 'compass.' },
  { start: 5.82, end: 5.88, text: 'The' },
  { start: 5.88, end: 6.2, text: 'bubble' },
  { start: 6.2, end: 6.74, text: 'burst.' },
  { start: 7.26, end: 7.36, text: 'From' },
  { start: 7.36, end: 7.64, text: 'late' },
  { start: 7.64, end: 8.22, text: '1999' },
  { start: 8.22, end: 8.88, text: 'through' },
  { start: 8.88, end: 9.62, text: '2001,' },
  { start: 10.06, end: 10.12, text: 'the' },
  { start: 10.12, end: 10.42, text: 'party' },
  { start: 10.42, end: 10.92, text: 'ended.' },
  { start: 11.52, end: 11.9, text: '.com' },
  { start: 11.9, end: 12.44, text: 'companies' },
  { start: 12.44, end: 13.02, text: 'vanished' },
  { start: 13.02, end: 13.64, text: 'overnight.' },
  { start: 14.28, end: 14.48, text: 'Pets' },
  { start: 14.48, end: 14.98, text: '.com.' },
  { start: 15.34, end: 15.78, text: 'Webvan.' },
  { start: 16.22, end: 16.4, text: 'Gone.' },
  { start: 16.92, end: 17.26, text: 'Wall' },
  { start: 17.26, end: 17.56, text: 'Street' },
  { start: 17.56, end: 17.98, text: 'turned' },
  { start: 17.98, end: 18.3, text: 'on' },
  { start: 18.3, end: 18.58, text: 'Amazon.' },
  { start: 19.1, end: 19.3, text: 'They' },
  { start: 19.3, end: 19.52, text: 'called' },
  { start: 19.52, end: 19.74, text: 'it' },
  { start: 19.74, end: 20.24, text: 'Amazon' },
  { start: 20.24, end: 20.64, text: 'Bomb.' },
  { start: 21.2, end: 21.46, text: 'The' },
  { start: 21.46, end: 21.82, text: 'stock' },
  { start: 21.82, end: 22.2, text: 'which' },
  { start: 22.2, end: 22.58, text: 'peaked' },
  { start: 22.58, end: 22.68, text: 'at' },
  { start: 22.68, end: 22.94, text: 'over' },
  { start: 22.94, end: 23.58, text: '$100' },
  { start: 23.58, end: 24.58, text: 'crashed.' },
  { start: 25.22, end: 25.44, text: 'It' },
  { start: 25.44, end: 25.7, text: 'fell' },
  { start: 25.7, end: 26.08, text: 'and' },
  { start: 26.08, end: 26.38, text: 'fell' },
  { start: 26.38, end: 26.92, text: 'until' },
  { start: 26.92, end: 27.1, text: 'it' },
  { start: 27.1, end: 27.2, text: 'was' },
  { start: 27.2, end: 27.44, text: 'worth' },
  { start: 27.44, end: 27.72, text: 'less' },
  { start: 27.72, end: 27.96, text: 'than' },
  { start: 27.96, end: 28.5, text: '$6' },
  { start: 28.5, end: 28.94, text: 'a' },
  { start: 28.94, end: 29.24, text: 'share.' },
  { start: 29.24, end: 29.84, text: 'A' },
  { start: 29.84, end: 30.06, text: 'drop' },
  { start: 30.06, end: 30.32, text: 'of' },
  { start: 30.32, end: 30.58, text: 'over' },
  { start: 30.58, end: 31.8, text: '90%.' },
  { start: 31.8, end: 32.68, text: 'Imagine' },
  { start: 32.68, end: 33.02, text: 'that.' },
  { start: 33.56, end: 33.6, text: 'Your' },
  { start: 33.6, end: 34.14, text: "life's" },
  { start: 34.14, end: 34.38, text: 'work.' },
  { start: 34.74, end: 34.8, text: 'Your' },
  { start: 34.8, end: 35.34, text: 'entire' },
  { start: 35.34, end: 35.62, text: 'net' },
  { start: 35.62, end: 35.96, text: 'worth' },
  { start: 35.96, end: 36.92, text: 'evaporating' },
  { start: 36.92, end: 37.12, text: 'by' },
  { start: 37.12, end: 38.3, text: '90%.' },
  { start: 38.3, end: 39.0, text: 'Most' },
  { start: 39.0, end: 39.42, text: 'founders' },
  { start: 39.42, end: 39.64, text: 'would' },
  { start: 39.64, end: 40.02, text: 'panic.' },
  { start: 40.52, end: 40.64, text: 'They' },
  { start: 40.64, end: 40.76, text: 'would' },
  { start: 40.76, end: 40.98, text: 'cut' },
  { start: 40.98, end: 41.44, text: 'costs' },
  { start: 41.44, end: 41.6, text: 'to' },
  { start: 41.6, end: 41.72, text: 'the' },
  { start: 41.72, end: 42.06, text: 'bone.' },
  { start: 42.42, end: 42.5, text: 'They' },
  { start: 42.5, end: 42.6, text: 'would' },
  { start: 42.6, end: 42.86, text: 'try' },
  { start: 42.86, end: 42.98, text: 'to' },
  { start: 42.98, end: 43.16, text: 'show' },
  { start: 43.16, end: 43.3, text: 'a' },
  { start: 43.3, end: 43.76, text: 'profit.' },
  { start: 44.1, end: 44.32, text: 'Any' },
  { start: 44.32, end: 44.76, text: 'profit.' },
  { start: 45.1, end: 45.2, text: 'To' },
  { start: 45.2, end: 45.46, text: 'calm' },
  { start: 45.46, end: 45.66, text: 'the' },
  { start: 45.66, end: 46.2, text: 'investors.' },
  { start: 46.84, end: 47.22, text: 'Bezos' },
  { start: 47.22, end: 47.5, text: 'did' },
  { start: 47.5, end: 47.66, text: 'the' },
  { start: 47.66, end: 48.08, text: 'opposite.' },
  { start: 48.54, end: 48.66, text: 'He' },
  { start: 48.66, end: 49.02, text: 'kept' },
  { start: 49.02, end: 49.44, text: 'building.' },
  { start: 50.02, end: 50.26, text: 'He' },
  { start: 50.26, end: 50.52, text: 'knew' },
  { start: 50.52, end: 50.68, text: 'the' },
  { start: 50.68, end: 51.04, text: 'market' },
  { start: 51.04, end: 51.3, text: 'was' },
  { start: 51.3, end: 51.6, text: 'just' },
  { start: 51.6, end: 52.0, text: 'noise.' },
  { start: 52.52, end: 52.62, text: 'It' },
  { start: 52.62, end: 52.78, text: 'was' },
  { start: 52.78, end: 53.08, text: 'fear' },
  { start: 53.08, end: 53.42, text: 'and' },
  { start: 53.42, end: 53.66, text: 'greed.' },
  { start: 54.22, end: 54.42, text: 'His' },
  { start: 54.42, end: 54.96, text: 'strategy' },
  { start: 54.96, end: 55.32, text: 'was' },
  { start: 55.32, end: 55.5, text: 'the' },
  { start: 55.5, end: 55.88, text: 'signal.' },
  { start: 56.56, end: 56.88, text: 'He' },
  { start: 56.88, end: 57.1, text: 'needed' },
  { start: 57.1, end: 57.48, text: 'to' },
  { start: 57.48, end: 57.8, text: 'survive' },
  { start: 57.8, end: 58.22, text: 'the' },
  { start: 58.22, end: 58.6, text: 'storm.' }, // Adjusted end time for smoother transition
  { start: 58.6, end: 58.76, text: 'Not' },
  { start: 58.76, end: 59.24, text: 'abandon' },
  { start: 59.24, end: 59.46, text: 'the' },
  { start: 59.46, end: 59.8, text: 'ship.' }, // Adjusted end time for smoother transition
];

// --- Styles ---
const textStyle: React.CSSProperties = {
  fontFamily: `Georgia, 'Times New Roman', Times, serif`,
  fontSize: '72px',
  fontWeight: 'bold',
  color: 'rgba(255, 255, 255, 0.9)',
  textAlign: 'center',
  textShadow: '0 0 15px rgba(0, 0, 0, 0.7)',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#000',
};

// --- Helper Components ---
// Fading text component for synchronized captions
const AnimatedText: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return <div style={{ opacity }}>{children}</div>;
};

// Parallax image layer component
const ParallaxLayer: React.FC<{
  src: string;
  depth: number;
  opacity?: number;
}> = ({ src, depth, opacity = 1 }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${1 + depth})`,
        opacity,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
};

// --- Main Video Component ---
export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Cinematic Camera Movement (slow zoom and pan)
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.15], {
    easing: Easing.bezier(0.5, 0, 0.5, 1),
  });
  const cameraPanX = interpolate(
    frame,
    [0, durationInFrames],
    [0, 100],
    { easing: Easing.sin }
  );
  const cameraPanY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -50],
    { easing: Easing.sin }
  );

  const cameraTransform = `scale(${cameraScale}) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`;

  // Scene fade transitions
  const scene1Opacity = interpolate(frame, [0, 210, 240], [1, 1, 0]);
  const scene2Opacity = interpolate(frame, [210, 240, 600, 630], [0, 1, 1, 0]);
  const scene3Opacity = interpolate(frame, [600, 630, 1350, 1380], [0, 1, 1, 0]);
  const scene4Opacity = interpolate(frame, [1350, 1380, durationInFrames], [0, 1, 1]);

  return (
    <AbsoluteFill style={containerStyle}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_2.wav')} />

      {/* Visuals Container with Camera Movement */}
      <AbsoluteFill style={{ transform: cameraTransform }}>
        {/*
          SCENE 1: The Lesson (0s - 8s)
          Replace with your own images.
        */}
        <Sequence from={0} durationInFrames={240}>
          <ParallaxLayer
            src="assets/images/dark_texture.jpg"
            depth={0.05}
            opacity={scene1Opacity}
          />
          <ParallaxLayer
            src="assets/images/moody_chart.jpg"
            depth={0.15}
            opacity={scene1Opacity}
          />
          <ParallaxLayer
            src="assets/images/compass.jpg"
            depth={0.3}
            opacity={scene1Opacity}
          />
        </Sequence>

        {/*
          SCENE 2: The Crash (7s - 21s)
          Replace with your own images.
        */}
        <Sequence from={210} durationInFrames={420}>
          <ParallaxLayer
            src="assets/images/dark_texture.jpg"
            depth={0.05}
            opacity={scene2Opacity}
          />
          <ParallaxLayer
            src="assets/images/exploding_bubble.jpg"
            depth={0.15}
            opacity={scene2Opacity}
          />
          <ParallaxLayer
            src="assets/images/dotcom_logos.jpg"
            depth={0.3}
            opacity={scene2Opacity * 0.7}
          />
        </Sequence>
        
        {/*
          SCENE 3: The Aftermath (20s - 46s)
          Replace with your own images.
        */}
        <Sequence from={600} durationInFrames={780}>
          <ParallaxLayer
            src="assets/images/dark_texture.jpg"
            depth={0.05}
            opacity={scene3Opacity}
          />
          <ParallaxLayer
            src="assets/images/worried_founder.jpg"
            depth={0.15}
            opacity={scene3Opacity}
          />
           <ParallaxLayer
            src="assets/images/crashing_graph.jpg"
            depth={0.3}
            opacity={scene3Opacity * 0.8}
          />
        </Sequence>

        {/*
          SCENE 4: The Strategy (45s - End)
          Replace with your own images.
        */}
        <Sequence from={1350}>
           <ParallaxLayer
            src="assets/images/dark_texture.jpg"
            depth={0.05}
            opacity={scene4Opacity}
          />
          <ParallaxLayer
            src="assets/images/bezos_portrait.jpg"
            depth={0.15}
            opacity={scene4Opacity}
          />
           <ParallaxLayer
            src="assets/images/ship_in_storm.jpg"
            depth={0.3}
            opacity={scene4Opacity * 0.9}
          />
        </Sequence>
      </AbsoluteFill>

      {/* Artistic Overlay Effects */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          // You can add a static dust/scratch overlay image here
          // backgroundImage: `url(${staticFile('assets/images/dust_overlay.png')})`,
          // backgroundSize: 'cover',
          opacity: 0.1,
        }}
      />

      {/* Text Sequences */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 10%',
        }}
      >
        <div style={textStyle}>
          {transcript.map((item, index) => {
            const startFrame = Math.round(item.start * fps);
            const endFrame = Math.round(item.end * fps);
            const duration = endFrame - startFrame;

            if (duration <= 0) return null;

            return (
              <Sequence
                key={index}
                from={startFrame}
                durationInFrames={duration}
              >
                <AnimatedText>{item.text}</AnimatedText>
              </Sequence>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```