// src/templates/Diagonal.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface DiagonalProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const Diagonal: React.FC<DiagonalProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  // normalized progress
  const progress = interpolate(
    t,
    [startTime, endTime],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => {
        // parallax depth by layer
        let xOffset = 0;
        let yOffset = 0;

        if (a.layer === 'bg') {
          xOffset = interpolate(progress, [0, 1], [0, -20]);
          yOffset = interpolate(progress, [0, 1], [0, -20]);
        } else if (a.layer === 'md') {
          xOffset = interpolate(progress, [0, 1], [0, -50]);
          yOffset = interpolate(progress, [0, 1], [0, -50]);
        } else if (a.layer === 'fg') {
          xOffset = interpolate(progress, [0, 1], [0, -80]);
          yOffset = interpolate(progress, [0, 1], [0, -80]);
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
              transform: `translate(${xOffset}px, ${yOffset}px) ${a.position === 'c' ? 'translateX(-50%)' : ''}`,
            }}
          />
        );
      })}
    </div>
  );
};
