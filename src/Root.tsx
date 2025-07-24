
import React from 'react';
import { Composition, useCurrentFrame, interpolate } from 'remotion';

// Common style for Zdog-like visuals
const cartoonStyle = {
  border: '4px solid #333',
  boxShadow: '2px 2px 4px #0004',
};

// Scene 1: Cute Bank Eating Money
const HouseEatingMoney = () => {
  const frame = useCurrentFrame();
  const moneyX = interpolate(frame, [0, 45], [1280, 600], { extrapolateRight: 'clamp' });
  const opacity = frame < 60 ? 1 : 0;

  return (
    <div style={{ flex: 1, backgroundColor: '#f9f1e7', position: 'relative' }}>
      {/* Cute Bank */}
      <div
        style={{
          ...cartoonStyle,
          position: 'absolute',
          top: 300,
          left: 550,
          width: 180,
          height: 180,
          backgroundColor: '#FFD580',
          borderRadius: 20,
        }}
      >
        <div
          style={{
            ...cartoonStyle,
            position: 'absolute',
            top: -60,
            left: 40,
            width: 100,
            height: 100,
            backgroundColor: '#FFAA00',
            borderRadius: '50%',
            border: '6px solid #000',
            transform: 'rotate(45deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 65,
            fontSize: 24,
          }}
        >
          🏦
        </div>
      </div>

      {/* Money flying in */}
      <div
        style={{
          ...cartoonStyle,
          position: 'absolute',
          top: 360,
          left: moneyX,
          width: 80,
          height: 40,
          backgroundColor: '#8BC34A',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          opacity,
        }}
      >
        💵
      </div>
    </div>
  );
};

// Scene 2: Crowd Stealing Money
const CrowdStealingMoney = () => {
  const frame = useCurrentFrame();
  const people = Array.from({ length: 5 }).map((_, i) => {
    const delay = i * 10;
    const personX = interpolate(frame, [delay, delay + 30], [550, 300 + i * 100], {
      extrapolateRight: 'clamp',
    });

    return (
      <div
        key={i}
        style={{
          ...cartoonStyle,
          position: 'absolute',
          top: 500,
          left: personX,
          width: 40,
          height: 40,
          backgroundColor: '#FF6B6B',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          color: 'white',
        }}
      >
        🧍
      </div>
    );
  });

  return (
    <div style={{ flex: 1, backgroundColor: '#f1f1f1', position: 'relative' }}>
      <div
        style={{
          ...cartoonStyle,
          position: 'absolute',
          top: 300,
          left: 550,
          width: 180,
          height: 180,
          backgroundColor: '#FFD580',
          borderRadius: 20,
        }}
      />
      {people}
    </div>
  );
};

// Scene 3: People with Money Bellies
const MoneyBellies = () => {
  const frame = useCurrentFrame();
  const people = Array.from({ length: 4 }).map((_, i) => {
    const delay = i * 15;
    const y = interpolate(frame, [delay, delay + 30], [800, 400], {
      extrapolateRight: 'clamp',
    });

    return (
      <div
        key={i}
        style={{
          ...cartoonStyle,
          position: 'absolute',
          top: y,
          left: 200 + i * 250,
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: '#FFDD57',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: 16,
          color: '#333',
        }}
      >
        💰
      </div>
    );
  });

  return <div style={{ flex: 1, backgroundColor: '#FAF3E0', position: 'relative' }}>{people}</div>;
};

// Master animation controller
const MoneyExplainer = () => {
  const frame = useCurrentFrame();
  if (frame < 60) return <HouseEatingMoney />;
  if (frame < 120) return <CrowdStealingMoney />;
  return <MoneyBellies />;
};

// Final export
export const RemotionRoot = () => (
  <>
    <Composition
      id="MyComp"
      component={MoneyExplainer}
      durationInFrames={180}
      fps={30}
      width={1280}
      height={720}
    />
  </>
);

export default RemotionRoot;
