
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
  const t = frame / fps;

  // Layer-specific scale (parallax effect)
  const layerScale = {
    bg: interpolate(t, [startTime, endTime], [1, 1.05], {extrapolateRight: 'clamp'}),
    md: interpolate(t, [startTime, endTime], [1, 1.1], {extrapolateRight: 'clamp'}),
    fg: interpolate(t, [startTime, endTime], [1, 1.2], {extrapolateRight: 'clamp'}),
  };

  // Layer-specific zIndex to ensure proper stacking
  const layerZIndex = { bg: 0, md: 1, fg: 2 };

  return (
    <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
      {assets.map((a, idx) => {
        const scale = layerScale[a.layer];
        let left: string;
        let widthStyle: string;

        switch (a.position) {
          case 'l':
            left = '0%';
            widthStyle = '50%';
            break;
          case 'c':
            left = '25%';
            widthStyle = '50%';
            break;
          case 'r':
            left = '50%';
            widthStyle = '50%';
            break;
          case 'full':
          default:
            left = '0%';
            widthStyle = '100%';
            break;
        }

        return (
          <img
            key={idx}
            src={`../assets/images/${a.asset}`}
            style={{
              position: 'absolute',
              objectFit: 'cover',
              transform: `scale(${scale})`,
              left,
              top: '0%',
              width: widthStyle,
              zIndex: layerZIndex[a.layer],
            }}
          />
        );
      })}
    </div>
  );
};
