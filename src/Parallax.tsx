
// src/Parallax.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const image = "/image-of-new-york-in-sunshine-without-people.jpg";

export const Parallax: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ perspective: 1200 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        // true 3D coordinates
        const x = interpolate(frame, [0, 240], [0, i * -50]);   // horizontal movement
        const y = interpolate(frame, [0, 240], [0, i * 20]);    // vertical movement
        const z = interpolate(frame, [0, 240], [0, -300 - i * 100]); // depth from camera

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translate3d(${x}px, ${y}px, ${z}px)`,
              zIndex: 10 - i,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
