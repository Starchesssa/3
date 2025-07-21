
import {Composition} from 'remotion';
import React from 'react';

export const MyComp: React.FC = () => {
  return (
    <div style={{flex: 1, backgroundColor: 'papayawhip', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
      <h1 style={{fontSize: 100}}>Hello Remotion!</h1>
    </div>
  );
};

// Register the composition
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComp}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
