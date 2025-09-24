// src/templates/FocusPull.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
}

interface FocusPullProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const FocusPull: React.FC<FocusPullProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  // Interpolate scale for focus effect
  const scale = interpolate(t, [startTime, endTime], [1.1, 1], {extrapolateRight: 'clamp'});

  // Interpolate blur for depth-of-field effect
  const blur = interpolate(t, [startTime, endTime], [15, 0], {extrapolateRight: 'clamp'});

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => (
        <img
          key={idx}
          src={`../assets/images/${a.asset}`}
          style={{
            position: 'absolute',
            objectFit: 'cover',
            left: a.position === 'l' ? '0%' : a.position === 'c' ? '50%' : a.position === 'r' ? '100%' : '0%',
            top: '50%',
            width: a.position === 'full' ? '100%' : '50%',
            transform: `translate(-50%, -50%) scale(${scale})`,
            filter: `blur(${blur}px)`,
          }}
        />
      ))}
    </div>
  );
};
