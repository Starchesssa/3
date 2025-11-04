
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { gsap } from "gsap";

const image = "/image-of-new-york-in-sunshine-without-people.jpg";

export const Parallax = () => {
  const frame = useCurrentFrame();
  const layersRef = useRef([]);

  useLayoutEffect(() => {
    const layers = layersRef.current;

    gsap.fromTo(
      layers,
      {
        scale: (i) => 1.02 + i * 0.04,
        x: (i) => i * -5,
      },
      {
        scale: (i) => 1.2 + i * 0.1,
        x: (i) => i * -40,
        ease: "power2.inOut",
        duration: 6,
      }
    );
  }, []);

  return (
    <AbsoluteFill style={{ perspective: 1200 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (layersRef.current[i] = el)}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(${1 + i * 0.05})`,
            zIndex: 10 - i,
            opacity: 1 - i * 0.05,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
