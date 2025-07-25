
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Canvas } from '@react-three/fiber';
import BankScene from './BankScene';

export const MoneyExplainer = () => {
  return (
    <AbsoluteFill>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <BankScene />
      </Canvas>
    </AbsoluteFill>
  );
};
