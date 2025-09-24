
// src/templates/Basic.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface BasicProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const Basic: React.FC<BasicProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  // Fade in between startTime and (startTime+0.5s), then stay visible
  const opacity = interpolate(
    t,
    [startTime, startTime + 0.5],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => (
        <img
          key={idx}
          src={`../assets/images/${a.asset}`}
          style={{
            position: 'absolute',
            objectFit: 'cover',
            opacity,
            left: a.position === 'l' ? '0%' : a.position === 'c' ? '50%' : a.position === 'r' ? '100%' : '0%',
            top: '0%',
            width: a.position === 'full' ? '100%' : '50%',
            transform: a.position === 'c' ? 'translateX(-50%)' : 'none',
          }}
        />
      ))}
    </div>
  );
};
