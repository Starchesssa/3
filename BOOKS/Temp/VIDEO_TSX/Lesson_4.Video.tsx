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
import { Easing, interpolate, spring } from 'remotion';
import React from 'react';

const FPS = 30;

// Helper function to convert time string (ss.ms) to frames
const toF = (time: number) => Math.round(time * FPS);

const transcript = [
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
  { start: 33.96, end: 4.1, text: 'to' },
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
  { start: 42.48, end: 42.86, text: 'reliable' },
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
  { start: 62.6, end: 62.98, text: 'time.' },
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

const Word: React.FC<{
  text: string;
  start: number;
  end: number;
}> = ({ text, start, end }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [toF(start), toF(start) + 15, toF(end) - 15, toF(end)],
    [0, 1, 1, 0]
  );
  const translateY = interpolate(
    frame,
    [toF(start), toF(start) + 15],
    [10, 0],
    {
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.ease),
    }
  );

  return (
    <span
      style={{
        display: 'inline-block',
        margin: '0 0.25em',
        opacity,
        transform: `translateY(${translateY}px)`,
        textShadow: '0 0 20px rgba(0,0,0,0.7)',
      }}
    >
      {text}
    </span>
  );
};

const TextDisplay: React.FC = () => {
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
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '72px',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {transcript.map((word, i) => (
          <Word key={i} {...word} />
        ))}
      </p>
    </AbsoluteFill>
  );
};

// Generic component for a parallax layer
const ParallaxLayer: React.FC<{
  src: string;
  speed: number;
  cameraTransform: React.CSSProperties['transform'];
  style?: React.CSSProperties;
  isImage?: boolean;
}> = ({
  src,
  speed,
  cameraTransform,
  style,
  isImage = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // This is a simplified way to create parallax from camera transform
  // For a real parallax effect, we'd parse the transform string, which is complex.
  // Instead, we'll base it on a simple zoom animation.
  const scale = spring({ frame, fps: FPS, from: 1, to: 1.2 });
  const parallaxScale = 1 + (scale - 1) * speed;

  return (
    <AbsoluteFill
      style={{
        transform: cameraTransform,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isImage ? (
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${parallaxScale})`,
            ...style,
          }}
        />
      ) : (
        <div style={{ transform: `scale(${parallaxScale})`, ...style }}>
          {children}
        </div>
      )}
    </AbsoluteFill>
  );
};

// --- SCENES ---

// Scene 1: Key Lesson (0s - 4.5s)
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = toF(4.5);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  const panX = interpolate(frame, [0, durationInFrames], [0, -50]);

  const cameraTransform = `scale(${zoom}) translateX(${panX}px)`;

  return (
    <>
      {/* assets/images/abstract-background-1.jpg: Dark, tech-inspired background with subtle glowing elements. Full-screen JPG. */}
      <ParallaxLayer
        src="assets/images/abstract-background-1.jpg"
        speed={-0.1}
        cameraTransform={cameraTransform}
      />
      {/* assets/images/glowing-key.png: A single, ornate key with a visible outer glow. Transparent background PNG. */}
      <ParallaxLayer
        src="assets/images/glowing-key.png"
        speed={0.3}
        cameraTransform={cameraTransform}
        style={{
          width: '30%',
          height: 'auto',
          opacity: interpolate(frame, [0, 20, toF(1), toF(1.2)], [0, 1, 1, 0]),
        }}
      />
      {/* assets/images/expense-to-product.png: A graphic showing a red down-arrow (expense) transforming into a green factory/box icon (product). Transparent PNG. */}
      <ParallaxLayer
        src="assets/images/expense-to-product.png"
        speed={0.5}
        cameraTransform={cameraTransform}
        style={{
          width: '50%',
          height: 'auto',
          opacity: interpolate(
            frame,
            [toF(1.5), toF(2), durationInFrames - 20, durationInFrames],
            [0, 1, 1, 0]
          ),
        }}
      />
    </>
  );
};

// Scene 2: Amazon 2006 (4.5s - 10s)
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = toF(10 - 4.5);

  const zoom = interpolate(frame, [0, durationInFrames], [1.3, 1]);
  const panY = interpolate(frame, [0, durationInFrames], [-100, 0]);
  const cameraTransform = `scale(${zoom}) translateY(${panY}px)`;

  return (
    <>
      {/* assets/images/amazon-warehouse-2006.jpg: A slightly grainy photo of a large warehouse filled with shelves and boxes. Full-screen JPG. */}
      <ParallaxLayer
        src="assets/images/amazon-warehouse-2006.jpg"
        speed={-0.1}
        cameraTransform={cameraTransform}
      />
      {/* assets/images/calendar-2006.png: A close-up of a desk calendar showing the year 2006. Transparent background PNG. */}
      <ParallaxLayer
        src="assets/images/calendar-2006.png"
        speed={0.4}
        cameraTransform={cameraTransform}
        style={{
          width: '40%',
          height: 'auto',
          opacity: interpolate(
            frame,
            [0, 20, toF(3), toF(3.5)],
            [0, 1, 1, 0]
          ),
        }}
      />
    </>
  );
};

// Scene 3: The Inside Story (10s - 14.5s)
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = toF(14.5 - 10);

  // Dolly Zoom effect
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.5], {
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });
  const pullBack = interpolate(frame, [0, durationInFrames], [1.5, 1], {
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });

  return (
    <>
      {/* assets/images/tech-background-2.jpg: Dark background with glowing blue circuit board lines. Full-screen JPG. */}
      <AbsoluteFill
        style={{
          backgroundColor: 'black',
          transform: `scale(${zoom})`,
        }}
      >
        <Img
          src={staticFile('assets/images/tech-background-2.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
      {/* assets/images/server-blueprint.png: A detailed, blue and white technical drawing of server architecture. Transparent background PNG. */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          opacity: interpolate(
            frame,
            [durationInFrames / 2, durationInFrames],
            [0.5, 1]
          ),
        }}
      >
        <Img
          src={staticFile('assets/images/server-blueprint.png')}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </AbsoluteFill>
      {/* Re-use previous scene for transition */}
      <AbsoluteFill
        style={{
          transform: `scale(${pullBack})`,
          opacity: interpolate(frame, [0, durationInFrames / 2], [1, 0]),
        }}
      >
        <Img
          src={staticFile('assets/images/amazon-warehouse-2006.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
    </>
  );
};

// Scene 4: The Problem (14.5s - 27.8s)
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = toF(27.8 - 14.5);

  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.2]);
  const panX = interpolate(frame, [0, durationInFrames], [-100, 100], {
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  });
  const cameraTransform = `scale(${zoom}) translateX(${panX}px)`;

  return (
    <>
      {/* assets/images/server-racks-dark.jpg: A long, dark corridor lined with server racks, glowing LEDs. Full-screen JPG. */}
      <ParallaxLayer
        src="assets/images/server-racks-dark.jpg"
        speed={-0.1}
        cameraTransform={cameraTransform}
      />
      {/* assets/images/tangled-cables.png: A chaotic cluster of red and black cables to overlay in the foreground. Transparent PNG. */}
      <ParallaxLayer
        src="assets/images/tangled-cables.png"
        speed={0.6}
        cameraTransform={cameraTransform}
        style={{
          width: '120%',
          height: '120%',
          objectFit: 'contain',
          opacity: interpolate(
            frame,
            [toF(1), toF(2), toF(6), toF(7)],
            [0, 0.3, 0.3, 0]
          ),
          filter: 'blur(5px)',
        }}
      />
      {/* assets/images/glowing-data-lines.png: Streaks of light to animate across the screen, representing data flow. Transparent PNG. */}
      <ParallaxLayer
        src="assets/images/glowing-data-lines.png"
        speed={0.2}
        cameraTransform={cameraTransform}
        style={{
          mixBlendMode: 'screen',
          opacity: 0.7,
        }}
      />
    </>
  );
};

// Scene 5: The Opportunity (27.8s - 38.5s)
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = toF(38.5 - 27.8);
  const zoom = interpolate(frame, [0, durationInFrames], [1.2, 1]);

  return (
    <>
      {/* assets/images/generic-office.jpg: A standard, slightly boring corporate office background. Full-screen JPG. */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          opacity: interpolate(
            frame,
            [toF(8), toF(9)],
            [1, 0]
          ),
        }}
      >
        <Img
          src={staticFile('assets/images/generic-office.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(0.5) brightness(0.7)',
          }}
        />
        {/* assets/images/cost-cutting-graph.png: A graph with a downward trend and a dollar sign, representing cost-cutting. Transparent PNG. */}
        <AbsoluteFill
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <Img
            src={staticFile('assets/images/cost-cutting-graph.png')}
            style={{
              width: '50%',
              opacity: interpolate(
                frame,
                [toF(3), toF(4), toF(7.5), toF(8)],
                [0, 1, 1, 0]
              ),
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* assets/images/idea-background.jpg: A bright, optimistic background, perhaps a blue sky with sun rays. Full-screen JPG. */}
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [toF(8.5), toF(9.5)], [0, 1]),
        }}
      >
        <Img
          src={staticFile('assets/images/idea-background.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* assets/images/lightbulb-idea.png: A classic, glowing lightbulb icon. Transparent PNG. */}
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${interpolate(
              frame,
              [toF(9), durationInFrames],
              [0.5, 1.1]
            )})`,
          }}
        >
          <Img
            src={staticFile('assets/images/lightbulb-idea.png')}
            style={{
              width: '30%',
              filter: 'drop-shadow(0 0 30px #ffeeaa)',
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </>
  );
};

// Scene 6: The Big Idea (38.5s - 51.8s)
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = toF(51.8 - 38.5);

  const zoomOut = interpolate(frame, [0, durationInFrames], [2, 1]);
  const cameraTransform = `scale(${zoomOut})`;

  return (
    <>
      {/* assets/images/blue-tech-background.jpg: A clean, professional blue background with subtle geometric patterns. Full-screen JPG. */}
      <ParallaxLayer
        src="assets/images/blue-tech-background.jpg"
        speed={-0.1}
        cameraTransform={cameraTransform}
      />
      {/* assets/images/aws-network-hub.png: A central AWS logo with lines extending outwards to other smaller company logos. Transparent PNG. */}
      <ParallaxLayer
        src="assets/images/aws-network-hub.png"
        speed={0.2}
        cameraTransform={cameraTransform}
        style={{
          width: '90%',
          opacity: interpolate(
            frame,
            [toF(1), toF(2)],
            [0, 1]
          ),
        }}
      />
      {/* assets/images/aws-logo.png: The official Amazon Web Services logo. Transparent PNG. */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${interpolate(
            frame,
            [toF(9), durationInFrames],
            [0, 1]
          )})`,
          opacity: interpolate(
            frame,
            [toF(9), toF(10)],
            [0, 1]
          ),
        }}
      >
        <Img
          src={staticFile('assets/images/aws-logo.png')}
          style={{ width: '40%' }}
        />
      </AbsoluteFill>
    </>
  );
};

// Scene 7: New Business Model (51.8s - 64.5s)
const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = toF(64.5 - 51.8);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.1]);

  const powerPlantOpacity = interpolate(
    frame,
    [toF(3), toF(4), toF(6), toF(7)],
    [0, 1, 1, 0]
  );
  const dataCenterOpacity = interpolate(
    frame,
    [toF(5), toF(6)],
    [0, 1]
  );
  const confusedOpacity = interpolate(
    frame,
    [toF(6.5), toF(7.5)],
    [0, 1]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      {/* Power company analogy */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          opacity: interpolate(
            frame,
            [toF(7), toF(7.5)],
            [1, 0]
          ),
        }}
      >
        <Img
          src={staticFile('assets/images/sky-background.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* assets/images/power-plant-silhouette.png: A silhouette of a power plant. Transparent PNG. */}
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: powerPlantOpacity,
          }}
        >
          <Img
            src={staticFile('assets/images/power-plant-silhouette.png')}
            style={{ width: '60%' }}
          />
        </AbsoluteFill>
        {/* assets/images/data-center-silhouette.png: A silhouette of a data center in a similar style. Transparent PNG. */}
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            opacity: dataCenterOpacity,
          }}
        >
          <Img
            src={staticFile('assets/images/data-center-silhouette.png')}
            style={{ width: '60%' }}
          />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Confusion */}
      <AbsoluteFill
        style={{
          opacity: confusedOpacity,
          transform: `rotate(${interpolate(
            frame,
            [toF(7.5), durationInFrames],
            [0, 5]
          )}deg) scale(1.1)`,
        }}
      >
        <Img
          src={staticFile('assets/images/confused-background.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* assets/images/book-icon.png: A simple icon of a book, representing a bookstore. Transparent PNG. */}
        <AbsoluteFill
          style={{ justifyContent: 'center', alignItems: 'flex-start' }}
        >
          <Img
            src={staticFile('assets/images/book-icon.png')}
            style={{ width: '25%', marginLeft: '10%' }}
          />
        </AbsoluteFill>
        {/* assets/images/server-icon.png: A simple icon of a server rack. Transparent PNG. */}
        <AbsoluteFill
          style={{ justifyContent: 'center', alignItems: 'flex-end' }}
        >
          <Img
            src={staticFile('assets/images/server-icon.png')}
            style={{ width: '25%', marginRight: '10%' }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 8: The Revolution (64.5s - END)
const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = toF(74) - toF(64.5);
  const zoomIn = interpolate(frame, [0, durationInFrames], [1, 1.5]);

  const cloudOpacity = interpolate(frame, [toF(0.5), toF(2)], [0, 1]);
  const reportOpacity = interpolate(frame, [toF(4), toF(5)], [1, 0]);

  return (
    <>
      {/* assets/images/futuristic-sky.jpg: A beautiful, inspiring background of a futuristic sky or space scene. Full-screen JPG. */}
      <AbsoluteFill style={{ transform: `scale(${zoomIn})` }}>
        <Img
          src={staticFile('assets/images/futuristic-sky.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
      {/* assets/images/cloud-icon-glowing.png: A stylized, glowing icon of a cloud. Transparent PNG. */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: cloudOpacity,
          transform: `scale(${interpolate(frame, [0, toF(4)], [0.5, 1])})`,
        }}
      >
        <Img
          src={staticFile('assets/images/cloud-icon-glowing.png')}
          style={{ width: '40%' }}
        />
      </AbsoluteFill>
      {/* assets/images/expense-report.png: A close-up image of a generic business expense report. Transparent background PNG. */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: reportOpacity,
          transform: `scale(${interpolate(
            frame,
            [toF(4), toF(5)],
            [1, 5]
          )})`,
        }}
      >
        <Img
          src={staticFile('assets/images/expense-report.png')}
          style={{
            width: '80%',
            filter: 'drop-shadow(0 0 20px black)',
          }}
        />
      </AbsoluteFill>
      {/* assets/images/dollar-explosion.png: A burst of golden dollar signs to use as an overlay. Transparent PNG. */}
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [toF(9), toF(9.5)], [0, 1]),
          transform: `scale(${interpolate(frame, [toF(9), durationInFrames], [0.5, 1])})`,
          mixBlendMode: 'screen'
        }}
      >
        <Img
          src={staticFile('assets/images/dollar-explosion.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
    </>
  );
};

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <AbsoluteFill style={{ backgroundColor: 'black' }}>
        <Sequence from={0} durationInFrames={toF(4.5)}>
          <Scene1 />
        </Sequence>
        <Sequence from={toF(4.5)} durationInFrames={toF(10 - 4.5)}>
          <Scene2 />
        </Sequence>
        <Sequence from={toF(10)} durationInFrames={toF(14.5 - 10)}>
          <Scene3 />
        </Sequence>
        <Sequence from={toF(14.5)} durationInFrames={toF(27.8 - 14.5)}>
          <Scene4 />
        </Sequence>
        <Sequence from={toF(27.8)} durationInFrames={toF(38.5 - 27.8)}>
          <Scene5 />
        </Sequence>
        <Sequence from={toF(38.5)} durationInFrames={toF(51.8 - 38.5)}>
          <Scene6 />
        </Sequence>
        <Sequence from={toF(51.8)} durationInFrames={toF(64.5 - 51.8)}>
          <Scene7 />
        </Sequence>
        <Sequence from={toF(64.5)}>
          <Scene8 />
        </Sequence>

        <TextDisplay />
      </AbsoluteFill>

      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_4.wav')} />
    </>
  );
};

export const RemotionVideoComposition = () => {
  return (
    <Composition
      id="RemotionVideo"
      component={RemotionVideo}
      durationInFrames={2250} // ~75 seconds
      fps={FPS}
      width={3840}
      height={2160}
    />
  );
};
```