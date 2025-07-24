
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const MoneyCounterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Money counting animation: from $0 to $100,000 in 5 seconds
  const moneyAmount = Math.floor(
    interpolate(frame, [0, fps * 5], [0, 100000], {
      extrapolateRight: 'clamp',
    })
  );

  // Number of visible money stacks (one added every 15 frames)
  const visibleStacks = Math.min(Math.floor(frame / 15), 10);

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#0a0f0d',
        color: '#00ffcc',
        fontFamily: 'Courier New, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated Money Counter */}
      <div style={{fontSize: 80, marginBottom: 40}}>
        ${moneyAmount.toLocaleString()}
      </div>

      {/* Stacking cash blocks animation */}
      <div style={{display: 'flex', gap: 10}}>
        {Array.from({length: visibleStacks}).map((_, i) => (
          <div
            key={i}
            style={{
              width: 40,
              height: 20,
              backgroundColor: '#16ff8a',
              border: '2px solid #00cc66',
              borderRadius: 4,
              transform: `translateY(${-(i * 6)}px)`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
