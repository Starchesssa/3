
// src/Parallax.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import nyImage from "../BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg";

export const Parallax: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = 240;

  return (
    <AbsoluteFill style={{ perspective: 1200, overflow: "hidden" }}>
      {Array.from({ length: 5 }).map((_, i) => {
        // Each layer moves differently based on depth
        const speed = 1 + i * 0.3; // closer layers move faster
        const x = interpolate(frame, [0, totalFrames], [0, -50 * speed]);
        const y = interpolate(frame, [0, totalFrames], [0, 20 * speed]);
        const z = -50 * i; // Z position (negative goes into scene)

        const scale = 1 + i * 0.05; // closer layers slightly larger

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${nyImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`,
              zIndex: 10 - i,
              opacity: 1 - i * 0.1,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
