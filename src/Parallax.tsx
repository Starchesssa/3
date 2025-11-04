import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import nyImage from "../BOOK_CODE/PARALLAX/image-of-new-york-in-sunshine-without-people.jpg";

export const Parallax: React.FC = () => {
  const frame = useCurrentFrame();
  const totalFrames = 240;
  const layers = 5; // Number of slices

  // Define height of each slice
  const sliceHeight = 100 / layers; // percentage

  return (
    <AbsoluteFill style={{ perspective: 1200, overflow: "hidden" }}>
      {Array.from({ length: layers }).map((_, i) => {
        const speed = 1 + i * 0.3; // closer layers move faster
        const x = interpolate(frame, [0, totalFrames], [0, -50 * speed]);
        const y = interpolate(frame, [0, totalFrames], [0, 20 * speed]);
        const z = -50 * i; // depth in scene
        const scale = 1 + i * 0.05;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${i * sliceHeight}%`,
              left: 0,
              width: "100%",
              height: `${sliceHeight}%`,
              backgroundImage: `url(${nyImage})`,
              backgroundSize: `100% ${100}%`, // full image stretched vertically
              backgroundPosition: `center -${i * sliceHeight}%`, // show only slice
              transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`,
              zIndex: layers - i,
              opacity: 1 - i * 0.05,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
