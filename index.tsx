// src/index.tsx
import {Composition} from 'remotion';
import Video, {getVideoMetadata} from './Video';

export const RemotionRoot: React.FC = () => {
  const {durationInFrames, fps, width, height} = getVideoMetadata();

  return (
    <Composition
      id="MainVideo"
      component={Video}
      durationInFrames={durationInFrames}
      fps={fps}
      width={width}
      height={height}
    />
  );
};
