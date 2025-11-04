
import { Composition } from "remotion";
import { Parallax } from "./Parallax";

export const RemotionVideo = () => {
  return (
    <Composition
      id="ParallaxScene"
      component={Parallax}       // Directly use Parallax
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
