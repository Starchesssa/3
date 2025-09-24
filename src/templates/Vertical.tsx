// src/templates/Vertical.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface VerticalProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const Vertical: React.FC<VerticalProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  // Normalized progress of the sentence
  const progress = interpolate(
    t,
    [startTime, endTime],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => {
        // Define vertical movement by layer
        let yOffset = 0;
        if (a.layer === 'bg') {
          yOffset = interpolate(progress, [0, 1], [0, -20]); // bg slight up
        } else if (a.layer === 'md') {
          yOffset = interpolate(progress, [0, 1], [0, -60]); // md moves more
        } else if (a.layer === 'fg') {
          yOffset = interpolate(progress, [0, 1], [0, -100]); // fg moves most
        }

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
              transform: `translateY(${yOffset}px) ${a.position === 'c' ? 'translateX(-50%)' : ''}`,
            }}
          />
        );
      })}
    </div>
  );
};
