
// src/templates/Orbit.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface OrbitProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const Orbit: React.FC<OrbitProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  const progress = interpolate(
    t,
    [startTime, endTime],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden', perspective: 1000}}>
      {assets.map((a, idx) => {
        // Orbit angle strength per layer
        let orbitStart = 0;
        let orbitEnd = 0;

        if (a.layer === 'bg') {
          orbitEnd = -5; // small orbit for background
        } else if (a.layer === 'md') {
          orbitEnd = -10;
        } else if (a.layer === 'fg') {
          orbitEnd = -15; // strong orbit for foreground
        }

        const rotateY = interpolate(progress, [0, 1], [orbitStart, orbitEnd]);

        return (
          <img
            key={idx}
            src={`../assets/images/${a.asset}`}
            style={{
              position: 'absolute',
              objectFit: 'cover',
              left: a.position === 'l' ? '0%' : a.position === 'c' ? '50%' : a.position === 'r' ? '100%' : '0%',
              top: '0%',
              width: a.position === 'full' ? '100%' : '50%',
              transform: `rotateY(${rotateY}deg) ${a.position === 'c' ? 'translateX(-50%)' : ''}`,
              transformOrigin: 'center center',
            }}
          />
        );
      })}
    </div>
  );
};
