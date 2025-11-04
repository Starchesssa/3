
import {useEffect, useRef} from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import gsap from "gsap";

const ParallaxScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const imgRef = useRef<HTMLDivElement>(null);

  // Animate entry
  useEffect(() => {
    gsap.fromTo(
      imgRef.current,
      { scale: 1.15, x: -40 },
      { scale: 1, x: 40, duration: 8, ease: "power2.out" }
    );
  }, []);

  // Manual parallax for playback sync
  const progress = frame / (fps * 8); // 8s animation
  const px = -40 + progress * 80; // left to right pan
  const scale = 1.15 - progress * 0.15;

  return (
    <div style={{flex: 1, overflow: "hidden"}}>
      <div
        ref={imgRef}
        style={{
          width: "110%",
          height: "110%",
          transform: `translateX(${px}px) scale(${scale})`,
          backgroundImage: "url(/image-of-new-york-in-sunshine-without-people.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
    </div>
  );
};

export default ParallaxScene;
