```typescript
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

// Grouped transcript for better visual flow
const scenes = [
  {start: 0, end: 4.48, text: 'Key lesson: turn your biggest expense into your biggest product.'},
  {start: 4.84, end: 9.76, text: 'The year is 2006. Amazon is a successful online retailer.'},
  {start: 10.2, end: 14.4, text: 'That is what everyone sees. But inside, something else is happening.'},
  {start: 15.0, end: 20.5, text: "The company's biggest expense was its own computing infrastructure."},
  {start: 21.0, end: 26.06, text: 'The servers, databases, and network for the massive Amazon.com website.'},
  {start: 26.74, end: 30.58, text: 'It was a beast. Complex and incredibly expensive.'},
  {start: 31.14, end: 36.4, text: 'A normal company sees a cost center, trying to make it cheaper.'},
  {start: 37.06, end: 38.48, text: 'Amazon saw an opportunity.'},
  {start: 39.02, end: 47.02, text: 'If we are this good at running massive systems, maybe others would pay to use it.'},
  {start: 47.42, end: 51.52, text: 'In 2006, they launched Amazon Web Services, or AWS.'},
  {start: 52.28, end: 57.28, text: 'They started renting out their computer power, like a power company for computing.'},
  {start: 58.06, end: 64.42, text: 'At first, no one understood. An online bookstore selling server time.'},
  {start: 64.9, end: 67.8, text: 'But it was the start of the cloud computing revolution.'},
  {start: 68.4, end: 73.82, text: 'A multi-trillion dollar industry born from an expense report.'},
];

const keywords = new Set(['expense', 'product', 'Amazon', 'infrastructure', 'opportunity', 'AWS', 'revolution', 'industry']);

const Keyword: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{color: '#FF9900', transform: 'scale(1.05)', display: 'inline-block'}}>
    {children}
  </span>
);

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const progress = frame / durationInFrames;

  // Parallax calculations
  const bgTranslateX = interpolate(progress, [0, 1], [0, -250]);
  const mgTranslateX = interpolate(progress, [0, 1], [0, -600]);
  const fgTranslateX = interpolate(progress, [0, 1], [50, -900]);

  // Pre-calculated styles
  const layerStyle: React.CSSProperties = {position: 'absolute', width: '150%', height: '100%', objectFit: 'cover'};
  const bgStyle = {...layerStyle, transform: `translateX(${bgTranslateX}px) scale(1.2)`};
  const mgStyle = {...layerStyle, transform: `translateX(${mgTranslateX}px) scale(1.3)`};
  const fgStyle = {...layerStyle, transform: `translateX(${fgTranslateX}px) scale(1.4)`, opacity: 0.7};
  const containerStyle: React.CSSProperties = {display: 'flex', justifyContent: 'center', alignItems: 'center'};

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Img src={staticFile('images/data-center-background.jpg')} style={bgStyle} />
      <Img src={staticFile('images/server-racks-midground.png')} style={mgStyle} />
      <Img src={staticFile('images/glowing-lines-foreground.png')} style={fgStyle} />

      <AbsoluteFill style={containerStyle}>
        {scenes.map(({start, end, text}) => {
          const startFrame = start * fps;
          const durationInFrames = (end - start) * fps;
          const opacity = interpolate(frame - startFrame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
          const textStyle: React.CSSProperties = {
            fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 100, fontWeight: 'bold',
            color: 'white', textAlign: 'center', width: '80%', textShadow: '0 0 25px black', opacity: opacity,
          };

          return (
            <Sequence from={startFrame} durationInFrames={durationInFrames} key={start}>
              <div style={textStyle}>
                {text.split(' ').map((word) => {
                  const cleanWord = word.replace(/[.,]/g, '').toLowerCase();
                  return keywords.has(cleanWord) ? <><Keyword>{word}</Keyword>{' '}</> : <>{word}{' '}</>;
                })}
              </div>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_4.wav')} />
    </AbsoluteFill>
  );
};
```