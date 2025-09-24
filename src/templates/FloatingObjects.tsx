// src/templates/FloatingObjects.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
}

interface FloatingObjectsProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const FloatingObjects: React.FC<FloatingObjectsProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => {
        // Floating animation: vertical oscillation using sine
        const amplitude = 30 + idx * 10; // different amplitude per object
        const speed = 2 + idx * 0.5; // different speed
        const offsetY = Math.sin(t * speed) * amplitude;

        let leftPos = a.position === 'l' ? '10%' : a.position === 'c' ? '50%' : a.position === 'r' ? '80%' : '0%';
        let widthVal = a.position === 'full' ? '100%' : '30%';

        return (
          <img
            key={idx}
            src={`../assets/images/${a.asset}`}
            style={{
              position: 'absolute',
              objectFit: 'cover',
              left: leftPos,
              top: `calc(50% + ${offsetY}px)`,
              width: widthVal,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </div>
  );
};
