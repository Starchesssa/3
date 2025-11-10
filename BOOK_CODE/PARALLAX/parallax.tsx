// parallax.tsx
import { registerRoot, Composition, useCurrentFrame, interpolate, AbsoluteFill, Img, staticFile } from "remotion";

const ParallaxScene = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 150], [1, 1.2]); // smooth zoom-in

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      <Img
        src={staticFile("BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

// Register composition directly here
registerRoot(() => (
  <Composition
    id="Parallax"
    component={ParallaxScene}
    durationInFrames={150}
    fps={30}
    width={1080}
    height={1080}
  />
));
