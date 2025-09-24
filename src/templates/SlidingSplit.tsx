// src/templates/SlidingSplit.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
}

interface SlidingSplitProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const SlidingSplit: React.FC<SlidingSplitProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;

  // Animation progress (0 → 1)
  const progress = interpolate(t, [startTime, endTime], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => {
        const isLeft = idx % 2 === 0; // alternate split sides
        const offset = isLeft
          ? -width * (1 - progress) // slide from left
          : width * (1 - progress); // slide from right

        return (
          <img
            key={idx}
            src={`../assets/images/${a.asset}`}
            style={{
              position: 'absolute',
              objectFit: 'cover',
              width: a.position === 'full' ? '100%' : '50%',
              height: '100%',
              left:
                a.position === 'l'
                  ? '0%'
                  : a.position === 'c'
                  ? '25%'
                  : a.position === 'r'
                  ? '50%'
                  : '0%',
              top: 0,
              transform: `translateX(${offset}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
