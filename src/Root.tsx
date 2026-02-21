
import React from 'react';
import { Composition, getAudioDurationInSeconds } from 'remotion';
import Scene from './Scene';
import { audioFiles } from './audioFiles';

export const Root: React.FC = () => {
  return (
    <>
      {audioFiles.map((audio) => (
        <Composition
          key={audio.id}
          id={`Audio_${audio.id}`}
          component={Scene}
          fps={60}
          width={1920}
          height={1080}
          defaultProps={{
            audioSrc: audio.src,
            label: audio.label,
          }}
          calculateMetadata={async ({ props }) => {
            const durationInSeconds = await getAudioDurationInSeconds(
              props.audioSrc
            );

            return {
              durationInFrames: Math.ceil(durationInSeconds * 60),
            };
          }}
        />
      ))}
    </>
  );
};
