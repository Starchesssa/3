// src/templates/MaskReveal.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
}

interface MaskRevealProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const MaskReveal: React.FC<MaskRevealProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  // Progress goes from 0 → 1 across the duration
  const progress = interpolate(t, [startTime, endTime], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height,
            overflow: 'hidden',
            clipPath: `inset(0 ${100 - progress * 100}% 0 0)`, // reveals from left to right
          }}
        >
          <img
            src={`../assets/images/${a.asset}`}
            style={{
              position: 'absolute',
              objectFit: 'cover',
              width: a.position === 'full' ? '100%' : '50%',
              left:
                a.position === 'l'
                  ? '0%'
                  : a.position === 'c'
                  ? '25%'
                  : a.position === 'r'
                  ? '50%'
                  : '0%',
              top: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
};
