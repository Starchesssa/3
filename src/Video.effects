
// src/Video.tsx
import React from 'react';
import { Audio } from '@remotion/media-utils';
import { DollyZoom } from './templates/DollyZoom';
import { Basic } from './templates/Basic';
import { Vertical } from './templates/Vertical';
import { Diagonal } from './templates/Diagonal';
import { Scale } from './templates/Scale';
import { Orbit } from './templates/Orbit';
import { Blur } from './templates/Blur';
import { MaskReveal } from './templates/MaskReveal';
import { SlidingSplit } from './templates/SlidingSplit';
import { FloatingObjects } from './templates/FloatingObjects';
import { FocusPull } from './templates/FocusPull';

interface AssetProps {
  asset: string;
  layer: 'bg' | 'md' | 'fg';
  position: 'l' | 'c' | 'r' | 'full';
  word?: string;
}

interface Sentence {
  assets: AssetProps[];
  effect: string;
  startTime: number;
  endTime: number;
}

interface VideoProps {
  sentences: Sentence[];
  audioPath?: string;
}

const templatesMap: Record<string, React.FC<any>> = {
  dolly_zoom: DollyZoom,
  basic: Basic,
  vertical: Vertical,
  diagonal: Diagonal,
  scale: Scale,
  orbit: Orbit,
  blur: Blur,
  mask_reveal: MaskReveal,
  sliding_split: SlidingSplit,
  floating_objects: FloatingObjects,
  focus_pull: FocusPull,
};

export const Video: React.FC<VideoProps> = ({ sentences, audioPath }) => {
  return (
    <>
      {audioPath && (
        <Audio src={audioPath} startFrom={0} endAt={sentences[sentences.length - 1]?.end || 10} />
      )}

      {sentences.map((s, idx) => {
        const TemplateComponent = templatesMap[s.effect] || Basic;
        return (
          <TemplateComponent
            key={idx}
            assets={s.assets}
            startTime={s.startTime}
            endTime={s.endTime}
          />
        );
      })}
    </>
  );
};
