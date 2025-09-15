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

const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_5.wav');

const transcript = [
  { start: 0.0, end: 0.42, text: 'Key' },
  { start: 0.42, end: 0.82, text: 'lesson,' },
  { start: 1.26, end: 1.46, text: 'while' },
  { start: 1.46, end: 1.82, text: 'others' },
  { start: 1.82, end: 2.3, text: 'retreat,' },
  { start: 2.78, end: 2.9, text: 'you' },
  { start: 2.9, end: 3.4, text: 'attack.' },
  { start: 4.06, end: 4.34, text: 'The' },
  { start: 4.34, end: 4.64, text: 'year' },
  { start: 4.64, end: 4.86, text: 'is' },
  { start: 4.86, end: 5.66, text: '2008.' },
  { start: 6.16, end: 6.22, text: 'The' },
  { start: 6.22, end: 6.54, text: 'global' },
  { start: 6.54, end: 6.98, text: 'financial' },
  { start: 6.98, end: 7.56, text: 'system' },
  { start: 7.56, end: 7.78, text: 'is' },
  { start: 7.78, end: 8.4, text: 'collapsing.' },
  { start: 9.02, end: 9.26, text: 'Lehman' },
  { start: 9.26, end: 9.52, text: 'Brothers' },
  { start: 9.52, end: 9.82, text: 'is' },
  { start: 9.82, end: 10.12, text: 'gone.' },
  { start: 10.74, end: 10.84, text: 'The' },
  { start: 10.84, end: 11.32, text: 'entire' },
  { start: 11.32, end: 11.88, text: 'economy' },
  { start: 11.88, end: 12.2, text: "isn't" },
  { start: 12.2, end: 12.26, text: 'a' },
  { start: 12.26, end: 12.54, text: 'free' },
  { start: 12.54, end: 12.76, text: 'fall.' },
  { start: 13.36, end: 13.86, text: 'Businesses' },
  { start: 13.86, end: 14.0, text: 'are' },
  { start: 14.0, end: 14.22, text: 'laying' },
  { start: 14.22, end: 14.56, text: 'people' },
  { start: 14.56, end: 14.84, text: 'off.' },
  { start: 15.2, end: 15.3, text: 'They' },
  { start: 15.3, end: 15.4, text: 'are' },
  { start: 15.4, end: 15.94, text: 'canceling' },
  { start: 15.94, end: 16.36, text: 'projects.' },
  { start: 16.76, end: 16.88, text: 'They' },
  { start: 16.88, end: 17.0, text: 'are' },
  { start: 17.0, end: 17.52, text: 'hoarding' },
  { start: 17.52, end: 17.78, text: 'cash.' },
  { start: 18.26, end: 18.82, text: 'Survival' },
  { start: 18.82, end: 19.06, text: 'mode.' },
  { start: 19.6, end: 19.84, text: 'What' },
  { start: 19.84, end: 20.04, text: 'does' },
  { start: 20.04, end: 20.26, text: 'Amazon' },
  { start: 20.26, end: 20.66, text: 'do?' },
  { start: 21.1, end: 21.24, text: 'They' },
  { start: 21.24, end: 21.46, text: 'push' },
  { start: 21.46, end: 21.92, text: 'forward' },
  { start: 21.92, end: 22.12, text: 'with' },
  { start: 22.12, end: 22.3, text: 'one' },
  { start: 22.3, end: 22.4, text: 'of' },
  { start: 22.4, end: 22.54, text: 'their' },
  { start: 22.54, end: 23.22, text: 'strangest' },
  { start: 23.22, end: 23.42, text: 'and' },
  { start: 23.42, end: 23.7, text: 'most' },
  { start: 23.7, end: 24.16, text: 'ambitious' },
  { start: 24.16, end: 24.62, text: 'products' },
  { start: 24.62, end: 24.96, text: 'yet.' },
  { start: 25.4, end: 25.52, text: 'The' },
  { start: 25.52, end: 26.0, text: 'Kindle,' },
  { start: 26.32, end: 26.46, text: 'an' },
  { start: 26.46, end: 26.92, text: 'electronic' },
  { start: 26.92, end: 27.28, text: 'book' },
  { start: 27.28, end: 27.6, text: 'reader.' },
  { start: 27.94, end: 28.26, text: 'In' },
  { start: 28.26, end: 28.38, text: 'the' },
  { start: 28.38, end: 28.68, text: 'middle' },
  { start: 28.68, end: 28.88, text: 'of' },
  { start: 28.88, end: 28.98, text: 'a' },
  { start: 28.98, end: 29.5, text: 'historic' },
  { start: 29.5, end: 30.06, text: 'recession,' },
  { start: 30.48, end: 30.58, text: 'they' },
  { start: 30.58, end: 30.7, text: 'were' },
  { start: 30.7, end: 30.94, text: 'trying' },
  { start: 30.94, end: 31.1, text: 'to' },
  { start: 31.1, end: 31.44, text: 'change' },
  { start: 31.44, end: 31.64, text: 'how' },
  { start: 31.64, end: 32.1, text: 'humanity' },
  { start: 32.1, end: 32.48, text: 'had' },
  { start: 32.48, end: 32.64, text: 'read' },
  { start: 32.64, end: 32.96, text: 'books' },
  { start: 32.96, end: 33.22, text: 'for' },
  { start: 33.22, end: 33.5, text: 'over' },
  { start: 33.5, end: 34.12, text: '500' },
  { start: 34.12, end: 34.62, text: 'years.' },
  { start: 34.94, end: 35.3, text: 'They' },
  { start: 35.3, end: 35.42, text: 'were' },
  { start: 35.42, end: 35.72, text: 'building' },
  { start: 35.72, end: 35.94, text: 'new' },
  { start: 35.94, end: 36.34, text: 'hardware.' },
  { start: 36.78, end: 36.86, text: 'They' },
  { start: 36.86, end: 36.98, text: 'were' },
  { start: 36.98, end: 37.3, text: 'fighting' },
  { start: 37.3, end: 37.54, text: 'with' },
  { start: 37.54, end: 37.98, text: 'publishers.' },
  { start: 38.46, end: 38.66, text: 'They' },
  { start: 38.66, end: 38.8, text: 'were' },
  { start: 38.8, end: 39.28, text: 'investing' },
  { start: 39.28, end: 39.78, text: 'hundreds' },
  { start: 39.78, end: 40.02, text: 'of' },
  { start: 40.02, end: 40.4, text: 'millions' },
  { start: 40.4, end: 40.66, text: 'of' },
  { start: 40.66, end: 40.96, text: 'dollars' },
  { start: 40.96, end: 41.3, text: 'while' },
  { start: 41.3, end: 41.62, text: 'other' },
  { start: 41.62, end: 42.0, text: 'companies' },
  { start: 42.0, end: 42.2, text: 'were' },
  { start: 42.2, end: 42.56, text: 'fighting' },
  { start: 42.56, end: 42.78, text: 'for' },
  { start: 42.78, end: 42.92, text: 'their' },
  { start: 42.92, end: 43.38, text: 'lives.' },
  { start: 44.02, end: 44.56, text: 'Recessions' },
  { start: 44.56, end: 44.76, text: 'are' },
  { start: 44.76, end: 44.86, text: 'a' },
  { start: 44.86, end: 45.14, text: 'clearing' },
  { start: 45.14, end: 45.62, text: 'event.' },
  { start: 46.02, end: 46.08, text: 'The' },
  { start: 46.08, end: 46.32, text: 'week' },
  { start: 46.32, end: 46.62, text: 'get' },
  { start: 46.62, end: 46.84, text: 'wiped' },
  { start: 46.84, end: 47.18, text: 'out.' },
  { start: 47.52, end: 47.62, text: 'The' },
  { start: 47.62, end: 47.98, text: 'strong' },
  { start: 47.98, end: 48.36, text: 'get' },
  { start: 48.36, end: 48.84, text: 'stronger.' },
  { start: 49.46, end: 49.72, text: 'Amazon' },
  { start: 49.72, end: 50.18, text: 'used' },
  { start: 50.18, end: 50.38, text: 'the' },
  { start: 50.38, end: 50.98, text: '2008' },
  { start: 50.98, end: 51.36, text: 'crisis' },
  { start: 51.36, end: 51.72, text: 'to' },
  { start: 51.72, end: 52.0, text: 'grab' },
  { start: 52.0, end: 52.4, text: 'market' },
  { start: 52.4, end: 52.66, text: 'share' },
  { start: 52.66, end: 52.92, text: 'and' },
  { start: 52.92, end: 53.22, text: 'create' },
  { start: 53.22, end: 53.42, text: 'a' },
  { start: 53.42, end: 53.72, text: 'brand' },
  { start: 53.72, end: 54.0, text: 'new' },
  { start: 54.0, end: 54.64, text: 'ecosystem' },
  { start: 54.64, end: 55.04, text: 'around' },
  { start: 55.04, end: 55.42, text: 'digital' },
  { start: 55.42, end: 55.88, text: 'books.' },
  { start: 56.29, end: 56.56, text: 'While' },
  { start: 56.56, end: 57.04, text: 'everyone' },
  { start: 57.04, end: 57.32, text: 'else' },
  { start: 57.32, end: 57.48, text: 'was' },
  { start: 57.48, end: 57.76, text: 'looking' },
  { start: 57.76, end: 57.92, text: 'at' },
  { start: 57.92, end: 58.06, text: 'their' },
  { start: 58.06, end: 58.32, text: 'feet,' },
  { start: 58.74, end: 58.84, text: 'they' },
  { start: 58.84, end: 58.98, text: 'were' },
  { start: 58.98, end: 59.26, text: 'looking' },
  { start: 59.26, end: 59.5, text: 'at' },
  { start: 59.5, end: 59.68, text: 'the' },
  { start: 59.68, end: 60.1, text: 'horizon.' },
];

const Word: React.FC<{
  word: { text: string; start: number; end: number };
}> = ({ word }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = word.start * fps;
  const endFrame = word.end * fps;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 5, endFrame - 5, endFrame],
    [0, 1, 1, 0]
  );

  return (
    <span
      style={{
        display: 'inline-block',
        marginLeft: '1.2rem',
        marginRight: '1.2rem',
        opacity,
        filter: `drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))`,
      }}
    >
      {word.text}
    </span>
  );
};

// Scene components for better organization
const Scene1: React.FC = () => { // 0.00 -> 3.40
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = 0 * fps;
  const endFrame = 4 * fps;

  const zoom = interpolate(frame, [startFrame, endFrame], [1, 1.15]);
  const bgTranslateX = interpolate(frame, [startFrame, endFrame], [0, -50]);
  const fgTranslateX = interpolate(frame, [startFrame, endFrame], [0, 80]);

  const retreatOpacity = interpolate(frame, [0, 15, 69, 83], [0, 1, 1, 0]);
  const attackOpacity = interpolate(frame, [83, 90, 102, 110], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      {/* assets/images/chess-board-blurry.jpg - A dark, dramatic, out-of-focus chessboard background. */}
      <Img
        src={staticFile('assets/images/chess-board-blurry.jpg')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `translateX(${bgTranslateX}px)` }}
      />
      {/* assets/images/chess-pieces-retreating.png - White chess pieces with a slight motion blur effect, on a transparent background. */}
      <Img
        src={staticFile('assets/images/chess-pieces-retreating.png')}
        style={{ position: 'absolute', width: '60%', top: '20%', left: '0%', opacity: retreatOpacity }}
      />
      {/* assets/images/chess-king-attack.png - A single black king/queen piece, glowing slightly, on a transparent background. */}
      <Img
        src={staticFile('assets/images/chess-king-attack.png')}
        style={{ position: 'absolute', width: '40%', bottom: '10%', right: '0%', opacity: attackOpacity, transform: `translateX(${fgTranslateX}px)` }}
      />
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => { // 4.06 -> 8.40
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = 4 * fps;
  const endFrame = 8.5 * fps;
  
  const zoom = interpolate(frame, [startFrame, endFrame], [1.2, 1]);
  const panY = interpolate(frame, [startFrame, endFrame], [-50, 20]);
  const rotation = interpolate(frame, [startFrame, endFrame], [-2, 2]);

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom}) translateY(${panY}px) rotate(${rotation}deg)` }}>
      {/* assets/images/stock-market-crash-graph.jpg - A red, downward-trending stock market graph on a digital screen, slightly blurry. */}
      <Img
        src={staticFile('assets/images/stock-market-crash-graph.jpg')}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* assets/images/collapsing-buildings-silhouette.png - Silhouettes of skyscrapers with a crumbling effect, on a transparent background. */}
      <Img
        src={staticFile('assets/images/collapsing-buildings-silhouette.png')}
        style={{ position: 'absolute', width: '100%', bottom: 0, opacity: 0.8 }}
      />
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => { // 9.02 -> 12.76
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = 9 * fps;
  const endFrame = 13 * fps;

  const lehmanZoom = interpolate(frame, [startFrame, startFrame + 4 * fps], [1, 1.1]);
  const economyZoom = interpolate(frame, [startFrame + 1.7 * fps, endFrame], [1.3, 1]);
  const economyRotation = interpolate(frame, [startFrame + 1.7 * fps, endFrame], [-10, 0]);

  const lehmanOpacity = interpolate(frame, [startFrame, startFrame + 15, startFrame + 50, startFrame + 60], [0, 1, 1, 0]);
  const economyOpacity = interpolate(frame, [startFrame + 50, startFrame + 60, endFrame, endFrame + 10], [0, 1, 1, 0]);

  return (
    <>
      <AbsoluteFill style={{ opacity: lehmanOpacity, transform: `scale(${lehmanZoom})` }}>
        {/* assets/images/lehman-brothers-building-night.jpg - A dark, moody shot of the Lehman Brothers building exterior. */}
        <Img
          src={staticFile('assets/images/lehman-brothers-building-night.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* assets/images/empty-office-desk.png - An empty, abandoned office desk on a transparent background. */}
        <Img
          src={staticFile('assets/images/empty-office-desk.png')}
          style={{ position: 'absolute', width: '50%', bottom: 0, left: '25%', opacity: 0.9 }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: economyOpacity, transform: `scale(${economyZoom}) rotate(${economyRotation}deg)` }}>
        {/* assets/images/vortex-background.jpg - A dark, abstract spiraling vortex. */}
        <Img
          src={staticFile('assets/images/vortex-background.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
    </>
  );
};

const Scene4: React.FC = () => { // 13.36 -> 19.06
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = 13 * fps;
  const endFrame = 19.5 * fps;
  
  const zoom = interpolate(frame, [startFrame, endFrame], [1, 1.2]);
  const panX = interpolate(frame, [startFrame, endFrame], [0, -100]);
  const cashOpacity = interpolate(frame, [startFrame + 3.5 * fps, startFrame + 4 * fps], [0, 1]);
  const survivalOpacity = interpolate(frame, [startFrame + 5 * fps, startFrame + 5.5 * fps], [0, 1]);

  return (
    <>
      <AbsoluteFill style={{ transform: `scale(${zoom}) translateX(${panX}px)` }}>
        {/* assets/images/empty-cubicles-office.jpg - A long shot of an empty, sterile office with rows of cubicles. */}
        <Img
          src={staticFile('assets/images/empty-cubicles-office.jpg')}
          style={{ width: '110%', height: '100%', objectFit: 'cover' }}
        />
        {/* assets/images/hands-holding-cash.png - Hands clutching cash tightly on a transparent background. */}
        <Img
          src={staticFile('assets/images/hands-holding-cash.png')}
          style={{ position: 'absolute', width: '40%', bottom: '5%', right: '5%', opacity: cashOpacity, filter: 'brightness(0.8)' }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: 'rgba(0,0,0,0.8)', opacity: survivalOpacity }} />
    </>
  );
};

const Scene5: React.FC = () => { // 19.60 -> 27.60
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = 19.5 * fps;
  const endFrame = 28 * fps;

  const revealOpacity = interpolate(frame, [startFrame, startFrame + 30], [0, 1]);
  const zoom = interpolate(frame, [startFrame, endFrame], [1.5, 1]);
  const kindleRotation = interpolate(frame, [startFrame + 5.5 * fps, endFrame], [-15, 0]);
  const kindleOpacity = interpolate(frame, [startFrame + 5.5 * fps, startFrame + 6 * fps], [0, 1]);
  const kindleGlow = interpolate(frame, [startFrame + 6 * fps, endFrame], [20, 5]);

  return (
    <AbsoluteFill style={{ opacity: revealOpacity, transform: `scale(${zoom})` }}>
      {/* assets/images/library-background-warm.jpg - A warm, inviting, classic library, but slightly out of focus. */}
      <Img
        src={staticFile('assets/images/library-background-warm.jpg')}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {/* assets/images/kindle-first-gen.png - A clean hero shot of the first-generation Kindle on a transparent background. */}
      <Img
        src={staticFile('assets/images/kindle-first-gen.png')}
        style={{
          position: 'absolute',
          width: '50%',
          top: '25%',
          left: '25%',
          opacity: kindleOpacity,
          transform: `rotateY(${kindleRotation}deg)`,
          filter: `drop-shadow(0 0 ${kindleGlow}px rgba(255, 255, 220, 0.9))`,
        }}
      />
    </AbsoluteFill>
  );
};

const Scene6: React.FC = () => { // 27.94 -> 34.62
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const startFrame = 27.8 * fps;
    const endFrame = 34.8 * fps;

    const zoom = interpolate(frame, [startFrame, endFrame], [1.2, 1]);
    const kindleScale = interpolate(frame, [startFrame, endFrame], [0.8, 1]);
    const bookOpacity = interpolate(frame, [startFrame + 4.5 * fps, startFrame + 5.5 * fps], [0, 0.5]);
  
    return (
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {/* assets/images/gutenberg-press.jpg - An old, historic image or drawing of the Gutenberg printing press, sepia-toned. */}
        <Img
          src={staticFile('assets/images/gutenberg-press.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.7) brightness(0.6)' }}
        />
        {/* assets/images/ancient-books-stack.png - A stack of old, leather-bound books on a transparent background. */}
        <Img
          src={staticFile('assets/images/ancient-books-stack.png')}
          style={{ position: 'absolute', width: '100%', bottom: -150, opacity: bookOpacity }}
        />
        {/* assets/images/kindle-first-gen.png - The same Kindle, representing the new technology. */}
        <Img
          src={staticFile('assets/images/kindle-first-gen.png')}
          style={{
            position: 'absolute',
            width: '40%',
            top: '30%',
            left: '30%',
            transform: `scale(${kindleScale})`,
            filter: `drop-shadow(0 0 20px rgba(255, 255, 220, 1))`,
          }}
        />
      </AbsoluteFill>
    );
};

const Scene7: React.FC = () => { // 34.94 -> 43.38
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const hardwareOpacity = interpolate(frame, [35 * fps, 35.5 * fps, 36.5 * fps, 37 * fps], [0, 1, 1, 0]);
    const publisherOpacity = interpolate(frame, [37 * fps, 37.5 * fps, 38.5 * fps, 39 * fps], [0, 1, 1, 0]);
    const investmentOpacity = interpolate(frame, [39 * fps, 39.5 * fps, 43 * fps, 43.5 * fps], [0, 1, 1, 0]);

    return (
        <>
            {/* assets/images/circuit-board-close-up.jpg - A macro shot of a circuit board with glowing traces. */}
            <AbsoluteFill style={{ opacity: hardwareOpacity }}>
                <Img src={staticFile('assets/images/circuit-board-close-up.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </AbsoluteFill>
            {/* assets/images/contract-document-pen.jpg - A shot of a contract with a pen, implying negotiation or conflict. */}
            <AbsoluteFill style={{ opacity: publisherOpacity }}>
                <Img src={staticFile('assets/images/contract-document-pen.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </AbsoluteFill>
            {/* assets/images/factory-assembly-line.jpg - A modern, clean factory assembly line for electronics. */}
            <AbsoluteFill style={{ opacity: investmentOpacity }}>
                <Img src={staticFile('assets/images/factory-assembly-line.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </AbsoluteFill>
        </>
    );
};

const Scene8: React.FC = () => { // 44.02 -> 48.84
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const startFrame = 44 * fps;
    const endFrame = 49 * fps;

    const panX = interpolate(frame, [startFrame, endFrame], [100, -100]);
    const sproutScale = interpolate(frame, [startFrame + fps, startFrame + 2 * fps], [0, 1]);
    const strongTreeOpacity = interpolate(frame, [startFrame + 3.5 * fps, startFrame + 4 * fps], [0, 0.7]);

    return (
      <AbsoluteFill style={{ transform: `translateX(${panX}px)` }}>
        {/* assets/images/forest-fire-aftermath.jpg - A stark image of a forest after a fire, with smoke lingering. */}
        <Img
          src={staticFile('assets/images/forest-fire-aftermath.jpg')}
          style={{ width: '120%', height: '100%', objectFit: 'cover' }}
        />
        {/* assets/images/green-sprout.png - A single small green sprout growing from the burnt ground, on a transparent background. */}
        <Img
          src={staticFile('assets/images/green-sprout.png')}
          style={{ position: 'absolute', width: '20%', bottom: '10%', left: '40%', transform: `scale(${sproutScale})` }}
        />
         {/* assets/images/strong-oak-tree.png - A vibrant, strong oak tree silhouette, transparent background. */}
         <Img
          src={staticFile('assets/images/strong-oak-tree.png')}
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: strongTreeOpacity }}
        />
      </AbsoluteFill>
    );
};

const Scene9: React.FC = () => { // 49.46 -> 55.88
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const startFrame = 49.2 * fps;
    const endFrame = 56 * fps;

    const zoom = interpolate(frame, [startFrame, endFrame], [1, 1.2]);
    const rotation = interpolate(frame, [startFrame, endFrame], [0, -360]);

    return (
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {/* assets/images/world-map-digital.jpg - A glowing, digital world map with network lines. */}
        <Img
          src={staticFile('assets/images/world-map-digital.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* assets/images/amazon-logo-strong.png - The Amazon logo, solid and central, on a transparent background. */}
        <Img
          src={staticFile('assets/images/amazon-logo-strong.png')}
          style={{ position: 'absolute', width: '20%', top: '40%', left: '40%' }}
        />
        {/* assets/images/book-icons-orbiting.png - Icons of books and Kindle devices orbiting, on a transparent background. */}
        <Img
          src={staticFile('assets/images/book-icons-orbiting.png')}
          style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${rotation}deg)` }}
        />
      </AbsoluteFill>
    );
};

const Scene10: React.FC = () => { // 56.29 -> 60.10
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const startFrame = 56 * fps;
    const endFrame = 61 * fps;

    const panY = interpolate(frame, [startFrame + fps, endFrame], [0, -1080]);
  
    return (
      <AbsoluteFill style={{ transform: `translateY(${panY}px)` }}>
        {/* assets/images/stormy-sea-at-feet.jpg - A perspective shot looking down at stormy, chaotic waves at someone's feet. */}
        <Img
          src={staticFile('assets/images/stormy-sea-at-feet.jpg')}
          style={{ position: 'absolute', top: '100%', width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* assets/images/clear-horizon-sunrise.jpg - A beautiful, clear sunrise over the ocean. */}
        <Img
          src={staticFile('assets/images/clear-horizon-sunrise.jpg')}
          style={{ position: 'absolute', top: '0%', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
    );
};

export const RemotionVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const VIDEO_DURATION_IN_FRAMES = 61 * fps;
  const sentenceGroups = [
    transcript.slice(0, 7), // "Key lesson... you attack."
    transcript.slice(7, 18), // "The year is 2008... collapsing."
    transcript.slice(18, 22), // "Lehman Brothers is gone."
    transcript.slice(22, 29), // "The entire economy... free fall."
    transcript.slice(29, 41), // "Businesses are laying people off... hoarding cash."
    transcript.slice(41, 43), // "Survival mode."
    transcript.slice(43, 55), // "What does Amazon do?... products yet."
    transcript.slice(55, 61), // "The Kindle... book reader."
    transcript.slice(61, 76), // "In the middle... 500 years."
    transcript.slice(76, 94), // "They were building... their lives."
    transcript.slice(94, 99), // "Recessions are a clearing event."
    transcript.slice(99, 107), // "The weak... get stronger."
    transcript.slice(107, 121), // "Amazon used... digital books."
    transcript.slice(121, 131), // "While everyone else... the horizon."
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={audioSrc} />

      <Sequence from={0 * fps} durationInFrames={4 * fps}><Scene1 /></Sequence>
      <Sequence from={4 * fps} durationInFrames={4.5 * fps}><Scene2 /></Sequence>
      <Sequence from={8.5 * fps} durationInFrames={5 * fps}><Scene3 /></Sequence>
      <Sequence from={13.5 * fps} durationInFrames={6 * fps}><Scene4 /></Sequence>
      <Sequence from={19.5 * fps} durationInFrames={8.5 * fps}><Scene5 /></Sequence>
      <Sequence from={27.8 * fps} durationInFrames={7 * fps}><Scene6 /></Sequence>
      <Sequence from={34.8 * fps} durationInFrames={9 * fps}><Scene7 /></Sequence>
      <Sequence from={43.8 * fps} durationInFrames={5.2 * fps}><Scene8 /></Sequence>
      <Sequence from={49 * fps} durationInFrames={7 * fps}><Scene9 /></Sequence>
      <Sequence from={56 * fps} durationInFrames={5 * fps}><Scene10 /></Sequence>
      
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 10%',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: '1.4',
          }}
        >
          {transcript.map((word, index) => (
            <Word key={index} word={word} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

```