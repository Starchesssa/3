
import {Composition} from "remotion";
import ParallaxScene from "./ParallaxScene";

export const RemotionVideo = () => {
  return (
    <Composition
      id="ParallaxScene"
      component={ParallaxScene}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
