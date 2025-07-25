// src/Root.tsx or src/RemotionRoot.tsx
import { Composition } from 'remotion';
import { MoneyExplainer } from './MoneyExplainer';

const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MoneyExplainer}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

export default RemotionRoot; // ✅ Add this line
