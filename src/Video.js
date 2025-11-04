
import { Parallax } from "./Parallax";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Parallax"
        component={Parallax}
        durationInFrames={180} // 6 seconds @ 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
