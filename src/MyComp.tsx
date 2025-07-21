
import {Composition} from 'remotion';

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComp"
      component={() => <h1>Hello Remotion!</h1>}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
