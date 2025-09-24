
// src/templates/DollyZoom.tsx
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface DollyZoomProps {
  assets: AssetProps[];
  startTime: number;
  endTime: number;
}

export const DollyZoom: React.FC<DollyZoomProps> = ({assets, startTime, endTime}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = (frame / fps);

  // interpolate scale from 1 to 1.2 across the duration
  const scale = interpolate(t, [startTime, endTime], [1, 1.2], {extrapolateRight: 'clamp'});

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => (
        <img
          key={idx}
          src={`../assets/images/${a.asset}`}
          style={{
            position: 'absolute',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            left: a.position === 'l' ? '0%' : a.position === 'c' ? '50%' : a.position === 'r' ? '100%' : '0%',
            top: '0%',
            width: a.position === 'full' ? '100%' : '50%',
          }}
        />
      ))}
    </div>
  );
};
