```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  interpolate,
} from 'remotion';
import React from 'react';

const ParallaxLayer: React.FC<{src: string; speed: number}> = ({
  src,
  speed,
}) => {
  const {width, durationInFrames} = useVideoConfig();
  const frame = useCurrentFrame();

  const progress = frame / durationInFrames;
  const movement = interpolate(progress, [0, 1], [0, -width * 0.1]);

  const transform = `scale(1.2) translateX(${movement * speed}px)`;

  const layerStyle: React.CSSProperties = {
    width: '115%',
    height: '100%',
    objectFit: 'cover',
    transform,
  };
  return <Img style={layerStyle} src={staticFile(src)} />;
};

const AnimatedText: React.FC<{text: string; keywords: string[]}> = ({
  text,
  keywords,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const words = text.split(' ');

  return (
    <h1
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: 90,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        textShadow: '0 0 25px black',
        lineHeight: '1.2',
      }}
    >
      {words.map((word, i) => {
        const isKeyword = keywords.includes(word.replace(/[^a-zA-Z0-9-]/g, ''));
        const anim = spring({frame: frame - i * 4, fps, config: {damping: 100}});
        const scale = isKeyword ? interpolate(anim, [0, 1], [1, 1.15]) : 1;
        const color = isKeyword ? '#FFC107' : 'white';

        const wordStyle: React.CSSProperties = {
          display: 'inline-block',
          transform: `scale(${scale})`,
          color,
          margin: '0 10px',
        };
        return (
          <span key={i} style={wordStyle}>
            {word}
          </span>
        );
      })}
    </h1>
  );
};

export const RemotionVideo: React.FC = () => {
  const fps = 30;

  const scenes = [
    {
      from: 0,
      duration: 14,
      layers: [
        {src: 'images/abstract_gears_background.jpg', speed: 1},
        {src: 'images/cracked_glass_overlay.png', speed: 3},
      ],
    },
    {
      from: 14,
      duration: 22,
      layers: [
        {src: 'images/empty_city_street_background.jpg', speed: 1.2},
        {src: 'images/biohazard_symbol_overlay.png', speed: 2.5},
        {src: 'images/amazon_box_foreground.png', speed: 4},
      ],
    },
    {
      from: 36,
      duration: 35,
      layers: [
        {src: 'images/data_center_background.jpg', speed: 1.5},
        {src: 'images/amazon_warehouse_midground.png', speed: 2.8},
        {src: 'images/delivery_drone_foreground.png', speed: 5},
      ],
    },
  ];

  const subtitles = [
    {from: 1.38, text: 'Your system is only tested in a true crisis.', keywords: ['system', 'tested', 'crisis']},
    {from: 10.14, text: 'A global pandemic shut down everything.', keywords: ['pandemic', 'shut']},
    {from: 25.12, text: 'It became essential infrastructure.', keywords: ['essential', 'infrastructure']},
    {from: 36.08, text: 'The system strained but did not break.', keywords: ['strained', 'break']},
    {from: 42.72, text: 'Amazon hired 175,000 new workers.', keywords: ['hired', '175,000']},
    {from: 56.36, text: 'The ultimate validation.', keywords: ['ultimate', 'validation']},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_8.wav')} />

      {scenes.map((scene, index) => (
        <Sequence key={index} from={scene.from * fps} durationInFrames={scene.duration * fps}>
          {scene.layers.map((layer) => (
            <ParallaxLayer key={layer.src} src={layer.src} speed={layer.speed} />
          ))}
        </Sequence>
      ))}

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 10%'}}>
        {subtitles.map((sub, index) => (
          <Sequence key={index} from={sub.from * fps}>
            <AnimatedText text={sub.text} keywords={sub.keywords} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```