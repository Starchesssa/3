```tsx
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import React from 'react';

// Audio and a representative subset of images for parallax layers are used
// to meet the simplicity and line-count requirements.
import audioSource from './assets/BOOKS/Temp/TTS/Intro.wav';
import bg1 from './assets/images/blueprint_bg.jpg';
import mg1 from './assets/images/gears-midground.png';
import bg2 from './assets/images/rainy-city.jpg';
import mg2 from './assets/images/sad-people.png';
import fg2 from './assets/images/rain_overlay.png';
import bg3 from './assets/images/tech_cityscape.jpg';
import mg3 from './assets/images/server-racks-midground.png';
import fg3 from './assets/images/data_stream_foreground.png';

const textStyle: React.CSSProperties = {
  fontFamily: `Arial, Helvetica, sans-serif`,
  fontSize: 140,
  fontWeight: 'bold',
  textAlign: 'center',
  color: 'white',
  textShadow: '0 0 30px rgba(0,0,0,0.8)',
  padding: '0 150px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

// Component to animate individual words
const AnimatedWord: React.FC<{ children: React.ReactNode; startFrame: number }> = ({
  children,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scaleProgress = spring({ frame: frame - startFrame, fps });
  const scale = interpolate(scaleProgress, [0, 1], [1, 1.1]);
  return <span style={{ display: 'inline-block', transform: `scale(${scale})` }}>{children}</span>;
};

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Parallax animation calculated once
  const parallaxShift = interpolate(frame, [0, durationInFrames], [0, -800]);
  const bgTranslateX = parallaxShift * 0.3;
  const mgTranslateX = parallaxShift * 0.6;
  const fgTranslateX = parallaxShift * 1.0;

  // Scene fade transitions calculated once
  const scene1Opacity = interpolate(frame, [0, 60, 210, 240], [1, 1, 1, 0]);
  const scene2Opacity = interpolate(frame, [210, 240, 390, 420], [0, 1, 1, 0]);
  const scene3Opacity = interpolate(frame, [390, 420, durationInFrames], [0, 1, 1]);

  const imageStyle = (translateX: number): React.CSSProperties => ({
    height: '100%',
    width: '120%', // Slightly larger for panning without showing edges
    objectFit: 'cover',
    position: 'absolute',
    transform: `translateX(${translateX}px)`,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={audioSource} />

      {/* Scene 1: "follow the rules" */}
      <AbsoluteFill style={{ opacity: scene1Opacity }}>
        <Img src={bg1} style={imageStyle(bgTranslateX)} />
        <Img src={mg1} style={imageStyle(mgTranslateX)} />
        <p style={textStyle}>
          They tell you to follow the&nbsp;<AnimatedWord startFrame={55}>rules.</AnimatedWord>
        </p>
      </AbsoluteFill>

      {/* Scene 2: "forgettable companies" */}
      <AbsoluteFill style={{ opacity: scene2Opacity }}>
        <Img src={bg2} style={imageStyle(bgTranslateX)} />
        <Img src={mg2} style={{ ...imageStyle(mgTranslateX), opacity: 0.8 }} />
        <Img src={fg2} style={{ ...imageStyle(fgTranslateX), opacity: 0.5 }} />
        <p style={textStyle}>
          Advice that creates small,&nbsp;<AnimatedWord startFrame={368}>forgettable</AnimatedWord>&nbsp;companies.
        </p>
      </AbsoluteFill>

      {/* Scene 3: "a machine that ate the world" */}
      <AbsoluteFill style={{ opacity: scene3Opacity }}>
        <Img src={bg3} style={imageStyle(bgTranslateX)} />
        <Img src={mg3} style={imageStyle(mgTranslateX)} />
        <Img src={fg3} style={{ ...imageStyle(fgTranslateX), opacity: 0.7 }} />
        <p style={textStyle}>
          A&nbsp;<AnimatedWord startFrame={595}>machine</AnimatedWord>&nbsp;that&nbsp;<AnimatedWord startFrame={730}>ate</AnimatedWord>&nbsp;the world.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Root component to register composition
export const RemotionRoot: React.FC = () => (
  <Composition
    id="RemotionVideo"
    component={RemotionVideo}
    durationInFrames={780} // 26 seconds to match audio duration (25.5s)
    fps={30}
    width={3840}
    height={2160}
  />
);
```