
// src/Parallax.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import nyImage from "../BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg";

export const Parallax: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = 240;
  const layers = 5; // number of oval slices

  // Size of each slice
  const maxScale = 1.5; // center slice scale
  const minScale = 0.7; // outer slice scale

  return (
    <AbsoluteFill style={{ perspective: 1500, overflow: "hidden", background: "#000" }}>
      {Array.from({ length: layers }).map((_, i) => {
        const progress = frame / totalFrames;
        
        // Each slice moves differently in X/Y based on depth
        const x = interpolate(progress, [0, 1], [0, -20 * (i+1)]);
        const y = interpolate(progress, [0, 1], [0, 10 * (i+1)]);
        
        // Z-axis: center slice is farthest
        const z = interpolate(i, [0, layers-1], [-300, 0]);
        
        // Scale slice based on Z-depth
        const scale = interpolate(i, [0, layers-1], [minScale, maxScale]);

        // Clip each div into oval shape using border-radius
        const borderRadius = "50% / 50%"; // makes it ellipse

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${100}%`,
              height: `${100}%`,
              backgroundImage: `url(${nyImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `
                translate3d(${x}px, ${y}px, ${z}px) 
                translate(-50%, -50%) 
                scale(${scale})
              `,
              borderRadius: borderRadius,
              zIndex: layers - i,
              opacity: 1 - i * 0.05,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
