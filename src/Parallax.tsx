
// src/Parallax.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const image = "/image-of-new-york-in-sunshine-without-people.jpg";

export const Parallax: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ perspective: 1200, overflow: "hidden" }}>
      {Array.from({ length: 5 }).map((_, i) => {
        // Horizontal and vertical movement
        const x = interpolate(frame, [0, 240], [0, i * 30]);
        const y = interpolate(frame, [0, 240], [0, i * 15]);

        // Depth (Z-axis) - keep it within camera view
        const z = interpolate(frame, [0, 240], [i * 10, i * 60]); // positive values move layers closer

        // Scale based on Z to simulate depth
        const scale = 1 + z / 500;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translate3d(${x}px, ${y}px, ${-z}px) scale(${scale})`,
              zIndex: 10 - i,
              opacity: 1 - i * 0.1,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
