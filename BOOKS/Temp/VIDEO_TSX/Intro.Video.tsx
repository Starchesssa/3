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
  spring,
  interpolate,
} from 'remotion';
import React from 'react';

// --- Type Definitions ---
interface Word {
  text: string;
  start: number;
  end: number;
}

const transcript: Word[] = [
  { text: 'They', start: 0.0, end: 0.48 },
  { text: 'tell', start: 0.48, end: 0.72 },
  { text: 'you', start: 0.72, end: 0.96 },
  { text: 'to', start: 0.96, end: 1.14 },
  { text: 'follow', start: 1.14, end: 1.54 },
  { text: 'the', start: 1.54, end: 1.82 },
  { text: 'rules.', start: 1.82, end: 2.24 },
  { text: 'They', start: 2.54, end: 2.98 },
  { text: 'tell', start: 2.98, end: 3.2 },
  { text: 'you', start: 3.2, end: 3.42 },
  { text: 'to', start: 3.42, end: 3.56 },
  { text: 'build', start: 3.56, end: 3.88 },
  { text: 'a', start: 3.88, end: 4.04 },
  { text: 'business', start: 4.04, end: 4.38 },
  { text: 'that', start: 4.38, end: 4.66 },
  { text: 'makes', start: 4.66, end: 4.88 },
  { text: 'sense', start: 4.88, end: 5.22 },
  { text: 'on', start: 5.22, end: 5.46 },
  { text: 'a', start: 5.46, end: 5.58 },
  { text: 'spreadsheet', start: 5.58, end: 6.0 },
  { text: 'from', start: 6.0, end: 6.32 },
  { text: 'day', start: 6.32, end: 6.58 },
  { text: 'one.', start: 6.58, end: 6.9 },
  { text: 'They', start: 7.44, end: 7.66 },
  { text: 'tell', start: 7.66, end: 7.9 },
  { text: 'you', start: 7.9, end: 8.1 },
  { text: 'to', start: 8.1, end: 8.32 },
  { text: 'be', start: 8.32, end: 8.5 },
  { text: 'profitable.', start: 8.5, end: 9.12 },
  { text: 'This', start: 9.86, end: 10.18 },
  { text: 'is', start: 10.18, end: 10.44 },
  { text: 'the', start: 10.44, end: 10.6 },
  { text: 'advice', start: 10.6, end: 10.9 },
  { text: 'that', start: 10.9, end: 11.18 },
  { text: 'creates', start: 11.18, end: 11.48 },
  { text: 'small,', start: 11.48, end: 12.08 },
  { text: 'forgettable', start: 12.28, end: 12.94 },
  { text: 'companies.', start: 12.94, end: 13.36 },
  { text: 'This', start: 14.08, end: 14.42 },
  { text: 'is', start: 14.42, end: 14.66 },
  { text: 'not', start: 14.66, end: 15.0 },
  { text: 'the', start: 15.0, end: 15.18 },
  { text: 'story', start: 15.18, end: 15.5 },
  { text: 'of', start: 15.5, end: 15.72 },
  { text: 'one', start: 15.72, end: 15.88 },
  { text: 'of', start: 15.88, end: 16.0 },
  { text: 'those', start: 16.0, end: 16.24 },
  { text: 'companies.', start: 16.24, end: 16.7 },
  { text: 'This', start: 17.26, end: 17.62 },
  { text: 'is', start: 17.62, end: 17.86 },
  { text: 'the', start: 17.86, end: 18.02 },
  { text: 'story', start: 18.02, end: 18.36 },
  { text: 'of', start: 18.36, end: 18.58 },
  { text: 'a', start: 18.58, end: 18.66 },
  { text: 'system,', start: 18.66, end: 19.16 },
  { text: 'a', start: 19.7, end: 19.82 },
  { text: 'machine', start: 19.82, end: 20.22 },
  { text: 'built', start: 20.22, end: 20.6 },
  { text: 'on', start: 20.6, end: 20.86 },
  { text: 'a', start: 20.86, end: 20.96 },
  { text: 'completely', start: 20.96, end: 21.44 },
  { text: 'different', start: 21.44, end: 22.08 },
  { text: 'set', start: 22.08, end: 22.36 },
  { text: 'of', start: 22.36, end: 22.48 },
  { text: 'rules,', start: 22.48, end: 22.8 },
  { text: 'a', start: 23.32, end: 23.48 },
  { text: 'machine', start: 23.48, end: 23.86 },
  { text: 'that', start: 23.86, end: 24.34 },
  { text: 'ate', start: 24.34, end: 24.7 },
  { text: 'the', start: 24.7, end: 25.1 },
  { text: 'world.', start: 25.1, end: 25.5 },
];

const VIDEO_DURATION = 26 * 30; // 26 seconds

// --- Helper Components ---

const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const startFrame = word.start * fps;
  const endFrame = word.end * fps;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 5, endFrame, endFrame + 5],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return <span style={{ opacity, marginRight: '1rem' }}>{word.text}</span>;
};

const TextContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    }}
  >
    <p
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '100px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 0 20px rgba(0,0,0,0.7)',
        lineHeight: 1.2,
        margin: 0,
        padding: '0 10%',
      }}
    >
      {children}
    </p>
  </AbsoluteFill>
);

// --- Scenes ---

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slow zoom in
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.1]);
  // Parallax: Foreground moves less than background
  const foregroundTranslateY = interpolate(frame, [0, durationInFrames], [0, -20]);

  return (
    <AbsoluteFill>
      {/* 
        Image: 'assets/images/rules-background.jpg' 
        A slightly out-of-focus image of a gridded, oppressive-looking city or library.
      */}
      <Img
        src={staticFile('assets/images/rules-background.jpg')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }}
      />
      {/* 
        Image: 'assets/images/rulebook-overlay.png' 
        A semi-transparent, glowing rulebook or set of geometric lines with a transparent background.
      */}
      <Img
        src={staticFile('assets/images/rulebook-overlay.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'absolute',
          opacity: 0.5,
          transform: `scale(${scale * 0.98}) translateY(${foregroundTranslateY}px)`,
        }}
      />
      <TextContainer>
        {transcript.slice(0, 7).map((word, i) => (
          <WordComponent key={i} word={word} />
        ))}
      </TextContainer>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slow pan right
  const translateX = interpolate(frame, [0, durationInFrames], [0, -100]);
  // Parallax: Spreadsheet moves across the screen
  const spreadsheetX = interpolate(frame, [0, durationInFrames], [-200, 200]);
  const spreadsheetOpacity = spring({
    frame,
    fps: 30,
    from: 0,
    to: 1,
    durationInFrames: 30,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      {/* 
        Image: 'assets/images/office-background.jpg' 
        A sterile, modern but soulless office environment.
      */}
      <Img
        src={staticFile('assets/images/office-background.jpg')}
        style={{
          width: '120%',
          height: '100%',
          objectFit: 'cover',
          transform: `translateX(${translateX}px)`,
        }}
      />
      {/* 
        Image: 'assets/images/spreadsheet.png' 
        A stylized, glowing spreadsheet grid with a transparent background.
      */}
      <Img
        src={staticFile('assets/images/spreadsheet.png')}
        style={{
          position: 'absolute',
          width: '80%',
          top: '10%',
          left: '10%',
          opacity: spreadsheetOpacity * 0.7,
          transform: `translateX(${spreadsheetX}px) rotateZ(-10deg)`,
        }}
      />
      <TextContainer>
        {transcript.slice(7, 23).map((word, i) => (
          <WordComponent key={i} word={word} />
        ))}
      </TextContainer>
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
  
    // Pull back reveal (dolly zoom)
    const bgScale = interpolate(frame, [0, durationInFrames], [1.2, 1]);
    const fgScale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
    const fgOpacity = spring({ frame, fps: 30, from: 0, to: 1, durationInFrames: 20 });
  
    return (
      <AbsoluteFill style={{ backgroundColor: '#0c0c0c' }}>
        {/* 
          Image: 'assets/images/money-background.jpg' 
          A dark, moody background with abstract shapes resembling coins or currency.
        */}
        <Img
          src={staticFile('assets/images/money-background.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${bgScale})`,
            opacity: 0.6,
          }}
        />
        {/* 
          Image: 'assets/images/profit-graph.png' 
          A glowing green, upward-trending stock chart with a transparent background.
        */}
        <Img
          src={staticFile('assets/images/profit-graph.png')}
          style={{
            position: 'absolute',
            width: '70%',
            bottom: '5%',
            left: '15%',
            opacity: fgOpacity,
            transform: `scale(${fgScale})`,
          }}
        />
        <TextContainer>
          {transcript.slice(23, 29).map((word, i) => (
            <WordComponent key={i} word={word} />
          ))}
        </TextContainer>
      </AbsoluteFill>
    );
};
  
const Scene4: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Slow zoom and pan down
    const scale = interpolate(frame, [0, durationInFrames], [1, 1.1]);
    const translateY = interpolate(frame, [0, durationInFrames], [0, 50]);
    const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0]);

    return (
        <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* 
            Image: 'assets/images/forgettable-street.jpg' 
            A sepia-toned or desaturated photo of a row of identical, small, boring buildings.
        */}
        <Img
            src={staticFile('assets/images/forgettable-street.jpg')}
            style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translateY(${translateY}px)`,
            filter: 'grayscale(0.5) contrast(0.9)',
            }}
        />
        <TextContainer>
            {transcript.slice(29, 37).map((word, i) => (
            <WordComponent key={i} word={word} />
            ))}
        </TextContainer>
        </AbsoluteFill>
    );
};

const Scene5: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const { fps } = useVideoConfig();

    const fadeIn = spring({ frame, fps, from: 0, to: 1, durationInFrames: 30 });
    // Camera tilts up
    const translateY = interpolate(frame, [0, durationInFrames], [150, 0]);
    const scale = interpolate(frame, [0, durationInFrames], [1.2, 1]);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', opacity: fadeIn }}>
        {/* 
            Image: 'assets/images/imposing-building.jpg' 
            A dramatic, low-angle shot of a single, unique, futuristic skyscraper at night.
        */}
        <Img
            src={staticFile('assets/images/imposing-building.jpg')}
            style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translateY(${translateY}px)`,
            }}
        />
        <TextContainer>
            {transcript.slice(37, 46).map((word, i) => (
            <WordComponent key={i} word={word} />
            ))}
        </TextContainer>
        </AbsoluteFill>
    );
};

const Scene6: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Slow rotation and zoom
    const rotate = interpolate(frame, [0, durationInFrames], [-5, 5]);
    const scale = interpolate(frame, [0, durationInFrames], [1, 1.1]);
    
    // Parallax for overlay
    const overlayTranslate = interpolate(frame, [0, durationInFrames], [20, -20]);
    const overlayRotate = interpolate(frame, [0, durationInFrames], [10, -10]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#050515', overflow: 'hidden' }}>
        {/* 
            Image: 'assets/images/system-gears.jpg' 
            A dark background showing an intricate, glowing network of gears, circuits, or abstract lines.
        */}
        <Img
            src={staticFile('assets/images/system-gears.jpg')}
            style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) rotate(${rotate}deg)`,
            opacity: 0.8
            }}
        />
        {/* 
            Image: 'assets/images/abstract-rules.png' 
            A foreground layer of floating, glowing particles or symbols with a transparent background.
        */}
        <Img
            src={staticFile('assets/images/abstract-rules.png')}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                opacity: 0.5,
                transform: `translateX(${overlayTranslate}px) rotate(${overlayRotate}deg)`
            }}
        />
        <TextContainer>
            {transcript.slice(46, 62).map((word, i) => (
            <WordComponent key={i} word={word} />
            ))}
        </TextContainer>
        </AbsoluteFill>
    );
};
  
const Scene7: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const { fps } = useVideoConfig();

    // Dramatic zoom out to reveal scale
    const scale = interpolate(frame, [0, durationInFrames], [2.5, 1]);
    const machineScale = spring({ frame, fps, from: 0.8, to: 1, durationInFrames: durationInFrames, config: {damping: 200} });
    const machineOpacity = interpolate(frame, [0, fps], [0, 0.7]);
    
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
        {/* 
            Image: 'assets/images/earth-from-space.jpg' 
            A high-quality image of planet Earth from space.
        */}
        <Img
            src={staticFile('assets/images/earth-from-space.jpg')}
            style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            }}
        />
        {/* 
            Image: 'assets/images/world-eater.png' 
            A massive, shadowy, mechanical structure with a transparent background, positioned to look like it's encompassing the Earth.
        */}
        <Img
            src={staticFile('assets/images/world-eater.png')}
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: machineOpacity,
                transform: `scale(${machineScale})`,
            }}
        />
        <TextContainer>
            {transcript.slice(62).map((word, i) => (
            <WordComponent key={i} word={word} />
            ))}
        </TextContainer>
        </AbsoluteFill>
    );
};
// --- Main Component ---

export const RemotionVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Intro.wav')} />

      <Sequence from={0} durationInFrames={2.54 * fps}>
        <Scene1 />
      </Sequence>

      <Sequence from={2.54 * fps} durationInFrames={(7.44 - 2.54) * fps}>
        <Scene2 />
      </Sequence>
      
      <Sequence from={7.44 * fps} durationInFrames={(9.86 - 7.44) * fps}>
        <Scene3 />
      </Sequence>

      <Sequence from={9.86 * fps} durationInFrames={(14.08 - 9.86) * fps}>
        <Scene4 />
      </Sequence>

      <Sequence from={14.08 * fps} durationInFrames={(17.26 - 14.08) * fps}>
        <Scene5 />
      </Sequence>

      <Sequence from={17.26 * fps} durationInFrames={(23.32 - 17.26) * fps}>
        <Scene6 />
      </Sequence>

      <Sequence from={23.32 * fps} durationInFrames={VIDEO_DURATION - (23.32 * fps)}>
        <Scene7 />
      </Sequence>

    </AbsoluteFill>
  );
};

// --- Remotion Composition ---
export const RemotionRoot: React.FC = () => {
    return (
        <Composition
            id="StorytellingVideo"
            component={RemotionVideo}
            durationInFrames={VIDEO_DURATION}
            fps={30}
            width={3840}
            height={2160}
        />
    )
}

```