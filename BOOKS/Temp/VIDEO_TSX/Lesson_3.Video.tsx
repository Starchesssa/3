```tsx
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const AnimatedWord: React.FC<{ text: string }> = ({ text }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const progress = spring({ frame, fps, config: { damping: 200 } });

  const textStyle: React.CSSProperties = {
    color: 'white',
    fontSize: 130,
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadow: '0 0 30px rgba(0,0,0,0.8)',
    opacity: interpolate(progress, [0, 1], [0, 1]),
    transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
  };
  return <div style={textStyle}>{text}</div>;
};

export const RemotionVideo: React.FC = () => {
  const { frame, durationInFrames, fps } = useVideoConfig();

  const keywords = [
    { text: 'Profitability', start: 1.66 }, { text: 'weapon', start: 2.68 },
    { text: '.com graveyard', start: 7.46 }, { text: 'wounded', start: 12.06 },
    { text: 'immense', start: 13.8 }, { text: 'first ever profit', start: 23.2 },
    { text: 'tiny', start: 25.32 }, { text: 'consistently profitable', start: 32.04 },
    { text: 'own fuel', start: 37.88 }, { text: 'experiment more', start: 44.38 },
    { text: 'bigger risks', start: 45.96 }, { text: 'foundation', start: 49.4 },
  ];

  // Pre-calculate parallax transformations
  const overallScale = interpolate(frame, [0, durationInFrames], [1, 1.25]);
  const bgPan = interpolate(frame, [0, durationInFrames], [0, -250]);
  const midPan = interpolate(frame, [0, durationInFrames], [50, -550]);
  const fgPan = interpolate(frame, [0, durationInFrames], [-50, -900]);

  // Pre-defined style objects
  const parallaxContainerStyle: React.CSSProperties = {
    transform: `scale(${overallScale})`,
  };
  const baseImageStyle: React.CSSProperties = {
    position: 'absolute',
    width: '120%', // Overscan for smooth panning
    height: '100%',
    objectFit: 'cover',
  };
  const backgroundStyle: React.CSSProperties = {
    ...baseImageStyle,
    transform: `translateX(${bgPan}px)`,
  };
  const midgroundStyle: React.CSSProperties = {
    ...baseImageStyle,
    opacity: 0.7,
    transform: `translateX(${midPan}px)`,
  };
  const foregroundStyle: React.CSSProperties = {
    ...baseImageStyle,
    opacity: 0.6,
    transform: `translateX(${fgPan}px)`,
  };
  const textContainer: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_3.wav')} />

      <AbsoluteFill style={parallaxContainerStyle}>
        <Img src={staticFile('assets/images/tech_cityscape.jpg')} style={backgroundStyle} />
        <Img src={staticFile('assets/images/digital_grid.png')} style={midgroundStyle} />
        <Img src={staticFile('assets/images/data_stream.png')} style={foregroundStyle} />
      </AbsoluteFill>

      <AbsoluteFill style={textContainer}>
        {keywords.map(({ text, start }) => (
          <Sequence from={Math.floor(start * fps)} durationInFrames={75} key={text}>
            <AnimatedWord text={text} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```