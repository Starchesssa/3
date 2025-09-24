// src/templates/Scale.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface ScaleProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const Scale: React.FC<ScaleProps> = ({assets, startTime, endTime}) => {
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
        // Different zoom intensity depending on layer
        let scaleStart = 1;
        let scaleEnd = 1.05;

        if (a.layer === 'bg') {
          scaleEnd = 1.05;
        } else if (a.layer === 'md') {
          scaleEnd = 1.1;
        } else if (a.layer === 'fg') {
          scaleEnd = 1.15;
        }

        const scale = interpolate(progress, [0, 1], [scaleStart, scaleEnd]);

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
              transform: `scale(${scale}) ${a.position === 'c' ? 'translateX(-50%)' : ''}`,
              transformOrigin: 'center center',
            }}
          />
        );
      })}
    </div>
  );
};
