
// src/Parallax.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import nyImage from "../BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg";

export const Parallax: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = 240;
  const layers = 5;

  const splitStartFrame = 40; // start splitting after this frame
  const minScale = 0.8;
  const maxScale = 1.2;

  // Camera moves along Z
  const cameraZ = interpolate(frame, [0, totalFrames], [-600, 100]);

  return (
    <AbsoluteFill style={{ perspective: 1500, overflow: "hidden", background: "#000" }}>
      {frame < splitStartFrame ? (
        // Full image at the beginning
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100%",
            backgroundImage: `url(${nyImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translate(-50%, -50%)`,
          }}
        />
      ) : (
        // Show slices progressively
        Array.from({ length: layers }).map((_, i) => {
          const sliceProgress = interpolate(frame, [splitStartFrame, totalFrames], [0, 1]);
          const sliceZ = interpolate(i, [0, layers - 1], [-400, 0]);
          const offsetX = (i - layers / 2) * 100;
          const offsetY = (i - layers / 2) * 50;
          const scale = interpolate(sliceZ + cameraZ, [-400, 0], [minScale, maxScale]);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "120%",
                height: "120%",
                backgroundImage: `url(${nyImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "50% / 50%",
                transform: `
                  translate3d(${offsetX}px, ${offsetY}px, ${(sliceZ + cameraZ) * sliceProgress}px)
                  translate(-50%, -50%)
                  scale(${scale})
                `,
                zIndex: layers - i,
                opacity: sliceProgress * (1 - i * 0.05),
              }}
            />
          );
        })
      )}
    </AbsoluteFill>
  );
};
