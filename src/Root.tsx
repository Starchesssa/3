
import React from 'react';
import {
  Composition,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion';

// 💸 Flying Coin Animation
const FlyingCoin = ({delay = 0, xStart = 0, xEnd = 400, yStart = 500, yEnd = 200}) => {
  const frame = useCurrentFrame() - delay;
  const progress = spring({
    frame: Math.max(0, frame),
    fps: 30,
    config: {damping: 12},
  });

  const x = interpolate(progress, [0, 1], [xStart, xEnd]);
  const y = interpolate(progress, [0, 1], [yStart, yEnd]);
  const scale = interpolate(progress, [0, 0.7, 1], [0, 1.3, 1]);

  return (
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        background: 'gold',
        border: '3px solid #e0c000',
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${scale})`,
        boxShadow: '0 0 10px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: 24,
        color: '#fff',
      }}
    >
      $
    </div>
  );
};

// 💵 Cash Stack Growing
const CashBar = ({delay = 0, heightEnd = 200, left = 300, color = '#0f0'}) => {
  const frame = useCurrentFrame() - delay;
  const progress = spring({
    frame: Math.max(0, frame),
    fps: 30,
    config: {damping: 18},
  });

  const height = interpolate(progress, [0, 1], [0, heightEnd]);

  return (
    <div
      style={{
        width: 50,
        height,
        backgroundColor: color,
        position: 'absolute',
        bottom: 80,
        left,
        borderRadius: 8,
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      }}
    />
  );
};

// 📈 Profit Line
const ProfitLine = ({delay = 0}) => {
  const frame = useCurrentFrame() - delay;
  const progress = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      width={600}
      height={200}
      style={{
        position: 'absolute',
        top: 120,
        left: 100,
        overflow: 'visible',
      }}
    >
      <polyline
        fill="none"
        stroke="#00cc66"
        strokeWidth={5}
        strokeLinecap="round"
        points={`0,150 ${150 * progress},120 ${300 * progress},90 ${450 * progress},40`}
      />
    </svg>
  );
};

// 🎬 Main Scene
const MoneyAnimationScene = () => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#101820',
        position: 'relative',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Flying Coins */}
      <FlyingCoin delay={0} xStart={-100} xEnd={300} />
      <FlyingCoin delay={15} xStart={-100} xEnd={400} />
      <FlyingCoin delay={30} xStart={-100} xEnd={500} />
      <FlyingCoin delay={45} xStart={-100} xEnd={600} />

      {/* Growing Money Bars */}
      <CashBar delay={60} left={200} heightEnd={180} color="#16ff8a" />
      <CashBar delay={75} left={280} heightEnd={160} color="#00e676" />
      <CashBar delay={90} left={360} heightEnd={190} color="#00c853" />

      {/* Profit Line */}
      <ProfitLine delay={105} />
    </div>
  );
};

// 🧩 Remotion Composition
export const RemotionRoot = () => (
  <>
    <Composition
      id="MyComp"
      component={MoneyAnimationScene}
      durationInFrames={180} // Ends when animation ends (~6 sec @ 30fps)
      fps={30}
      width={1280}
      height={720}
    />
  </>
);

export default RemotionRoot;
