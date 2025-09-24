// src/templates/Blur.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface BlurProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const Blur: React.FC<BlurProps> = ({assets, startTime, endTime}) => {
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
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => {
        // More foreground blur depth, less background blur
        const maxBlur = a.layer === 'bg' ? 4 : a.layer === 'md' ? 8 : 12;

        // Animate blur from max → clear
        const blur = interpolate(progress, [0, 0.3, 1], [maxBlur, 0, 0]);

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
              filter: `blur(${blur}px)`,
              transform: a.position === 'c' ? 'translateX(-50%)' : '',
            }}
          />
        );
      })}
    </div>
  );
};
