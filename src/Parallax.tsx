
// src/Parallax.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import nyImage from "../BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg";

export const Parallax: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = 240;
  const layers = 5;

  // Max and min scale for front/back slices
  const maxScale = 1.5;
  const minScale = 0.5;

  // Camera moves forward along Z-axis
  const cameraZ = interpolate(frame, [0, totalFrames], [-500, 500]);

  return (
    <AbsoluteFill style={{ perspective: 1500, overflow: "hidden", background: "#000" }}>
      {Array.from({ length: layers }).map((_, i) => {
        // Depth of slice: back slices have smaller scale and more negative Z
        const sliceZ = interpolate(i, [0, layers - 1], [-400, 0]);
        const scale = interpolate(i, [0, layers - 1], minScale, maxScale);

        // Position slices in X/Y if you want a slight spread
        const offsetX = (i - layers / 2) * 50; // horizontal offset
        const offsetY = (i - layers / 2) * 30; // vertical offset

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              height: "100%",
              backgroundImage: `url(${nyImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "50% / 50%", // oval slice
              transform: `
                translate3d(${offsetX}px, ${offsetY}px, ${sliceZ + cameraZ}px)
                translate(-50%, -50%)
                scale(${scale})
              `,
              zIndex: layers - i,
              opacity: 1 - i * 0.05,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
