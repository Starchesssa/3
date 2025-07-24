
import React from 'react';
import {Composition, useCurrentFrame, interpolate} from 'remotion';

// Scene 1: House eating money
const HouseEatingMoney = () => {
  const frame = useCurrentFrame();
  const moneyX = interpolate(frame, [0, 45], [1280, 600], {extrapolateRight: 'clamp'});
  const opacity = frame < 60 ? 1 : 0;

  return (
    <div style={{flex: 1, backgroundColor: '#222', position: 'relative'}}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 550,
          width: 180,
          height: 180,
          backgroundColor: '#964B00',
          border: '8px solid #654321',
          transform: 'rotate(0deg)',
          clipPath: 'polygon(50% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 360,
          left: moneyX,
          width: 80,
          height: 40,
          backgroundColor: 'green',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          opacity,
        }}
      >
        💵
      </div>
    </div>
  );
};

// Scene 2: Crowd stealing money from house
const CrowdStealingMoney = () => {
  const frame = useCurrentFrame();
  const people = Array.from({length: 5}).map((_, i) => {
    const delay = i * 10;
    const personX = interpolate(frame, [delay, delay + 30], [550, 300 + i * 100], {
      extrapolateRight: 'clamp',
    });

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: 500,
          left: personX,
          width: 40,
          height: 40,
          backgroundColor: '#ff4444',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          color: 'white',
        }}
      >
        🏃
      </div>
    );
  });

  return (
    <div style={{flex: 1, backgroundColor: '#111', position: 'relative'}}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 550,
          width: 180,
          height: 180,
          backgroundColor: '#964B00',
          border: '8px solid #654321',
          clipPath: 'polygon(50% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)',
        }}
      />
      {people}
    </div>
  );
};

// Scene 3: People with money bellies
const MoneyBellies = () => {
  const frame = useCurrentFrame();
  const people = Array.from({length: 4}).map((_, i) => {
    const delay = i * 15;
    const y = interpolate(frame, [delay, delay + 30], [800, 400], {
      extrapolateRight: 'clamp',
    });

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: y,
          left: 200 + i * 250,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#ffaa00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: 16,
          color: '#000',
        }}
      >
        💰 Belly
      </div>
    );
  });

  return <div style={{flex: 1, backgroundColor: '#222', position: 'relative'}}>{people}</div>;
};

// Main Animation Sequence
const MoneyExplainer = () => {
  const frame = useCurrentFrame();

  if (frame < 60) return <HouseEatingMoney />;
  if (frame < 120) return <CrowdStealingMoney />;
  return <MoneyBellies />;
};

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
