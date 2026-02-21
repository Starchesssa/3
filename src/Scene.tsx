import React from 'react';
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  useAudioData,
  visualizeAudio,
} from 'remotion';

interface Props {
  audioSrc: string;
  label: string;
}

const Scene: React.FC<Props> = ({ audioSrc, label }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  const audioData = useAudioData(staticFile(audioSrc));

  if (!audioData) {
    return <AbsoluteFill style={{ backgroundColor: '#111' }} />;
  }

  const bars = 80;

  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: bars,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial Black, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Neobrutalist Title */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '5px solid #000',
          boxShadow: '12px 12px 0 #000',
          padding: '40px 80px',
          marginBottom: 80,
          fontSize: 60,
          fontWeight: 900,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>

      {/* Audio Bars */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'flex-end',
          height: height * 0.5,
        }}
      >
        {visualization.map((v, i) => {
          const barHeight = Math.max(10, v * height * 0.45);

          return (
            <div
              key={i}
              style={{
                width: 14,
                height: barHeight,
                backgroundColor: '#000',
                border: '3px solid #000',
                boxShadow: '4px 4px 0 #000',
              }}
            />
          );
        })}
      </div>

      <Audio src={staticFile(audioSrc)} />
    </AbsoluteFill>
  );
};

export default Scene;
