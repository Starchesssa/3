```typescript
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
  staticFile,
} from 'remotion';
import React from 'react';

// --- Helper Components ---

const sec = (seconds: number) => 30 * seconds;

// A component to display a sentence with a fade in and out animation
const AnimatedSentence = ({
  children,
  start,
  duration,
}: {
  children: React.ReactNode;
  start: number;
  duration: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeInDuration = 15;
  const fadeOutDuration = 15;

  const sentenceStartFrame = sec(start);
  const sentenceEndFrame = sec(start + duration);

  const opacity = interpolate(
    frame,
    [
      sentenceStartFrame,
      sentenceStartFrame + fadeInDuration,
      sentenceEndFrame - fadeOutDuration,
      sentenceEndFrame,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const textStyle: React.CSSProperties = {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '80px',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadow: '0 0 20px rgba(0,0,0,0.7)',
    opacity,
    padding: '0 10%',
  };

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p style={textStyle}>{children}</p>
    </AbsoluteFill>
  );
};

// --- Scene Components ---

const Scene1 = () => {
  const frame = useCurrentFrame();
  const durationInFrames = sec(4);

  // Parallax zoom effect
  const bgScale = interpolate(frame, [0, durationInFrames], [1.1, 1], {
    easing: Easing.bezier(0.5, 0, 0.5, 1),
  });
  const knightScale = interpolate(frame, [0, durationInFrames], [1, 1.15], {
    easing: Easing.bezier(0.5, 0, 0.5, 1),
  });
  const knightX = interpolate(frame, [sec(2.5), sec(3.5)], [100, 0], {
    extrapolateLeft: 'clamp',
    easing: Easing.out(Easing.ease),
  });
  const knightOpacity = interpolate(frame, [sec(2.5), sec(3)], [0, 1], {
    extrapolateLeft: 'clamp',
  });

  const bgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${bgScale})`,
  };

  const knightStyle: React.CSSProperties = {
    position: 'absolute',
    width: '40%',
    bottom: '5%',
    left: '30%',
    opacity: knightOpacity,
    transform: `scale(${knightScale}) translateX(${knightX}px)`,
    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))',
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      <Img src={staticFile('assets/images/chessboard_background.jpg')} style={bgStyle} />
      <Img
        src={staticFile('assets/images/black_knight_attack.png')}
        style={knightStyle}
      />
      <AnimatedSentence start={0} duration={3.6}>
        Key lesson, while others retreat, you attack.
      </AnimatedSentence>
    </AbsoluteFill>
  );
};

const Scene2 = () => {
  const frame = useCurrentFrame();
  const durationInFrames = sec(4.5);

  // Pan and zoom
  const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.1]);
  const bgX = interpolate(frame, [0, durationInFrames], [0, -100]);
  const graphY = interpolate(frame, [sec(2), durationInFrames], [-100, 10], {
    easing: Easing.in(Easing.cubic),
  });
  const graphOpacity = interpolate(frame, [sec(1.5), sec(2.5)], [0, 1]);

  const bgStyle: React.CSSProperties = {
    width: '120%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${bgScale}) translateX(${bgX}px)`,
  };

  const graphStyle: React.CSSProperties = {
    position: 'absolute',
    width: '80%',
    top: '10%',
    left: '10%',
    opacity: graphOpacity,
    transform: `translateY(${graphY}%)`,
    filter: 'drop-shadow(0 0 25px #ff4444)',
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#050510' }}>
      <Img
        src={staticFile('assets/images/new_york_skyline_night.jpg')}
        style={bgStyle}
      />
      <Img
        src={staticFile('assets/images/falling_stock_graph.png')}
        style={graphStyle}
      />
      <AnimatedSentence start={0} duration={4.5}>
        The year is 2008. The global financial system is collapsing.
      </AnimatedSentence>
    </AbsoluteFill>
  );
};

const Scene3 = () => {
    const frame = useCurrentFrame();
    const durationInFrames = sec(4.5);

    // Dolly zoom effect
    const bgScale = interpolate(frame, [0, durationInFrames], [1.5, 1]);
    const paper1Y = interpolate(frame, [0, durationInFrames], [-20, 120]);
    const paper1X = interpolate(frame, [0, durationInFrames], [10, -10]);
    const paper1Rot = interpolate(frame, [0, durationInFrames], [-20, 20]);
    const paper2Y = interpolate(frame, [0, durationInFrames], [-30, 110]);
    
    const bgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${bgScale})`,
        filter: 'saturate(0.5) brightness(0.7)',
    };

    const paper1Style: React.CSSProperties = {
        position: 'absolute',
        width: '20%',
        left: '15%',
        top: `${paper1Y}%`,
        transform: `translateX(${paper1X}%) rotate(${paper1Rot}deg)`,
        opacity: 0.8,
    };
    
    const paper2Style: React.CSSProperties = {
        position: 'absolute',
        width: '15%',
        right: '20%',
        top: `${paper2Y}%`,
        transform: 'rotate(30deg)',
        opacity: 0.7,
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#222' }}>
            <Img src={staticFile('assets/images/empty_trading_floor.jpg')} style={bgStyle} />
            <Img src={staticFile('assets/images/falling_papers.png')} style={paper1Style} />
            <Img src={staticFile('assets/images/falling_papers.png')} style={paper2Style} />
            <AnimatedSentence start={0} duration={4}>
                Lehman Brothers is gone. The entire economy is in a free fall.
            </AnimatedSentence>
        </AbsoluteFill>
    );
};

const Scene4 = () => {
    const frame = useCurrentFrame();
    const durationInFrames = sec(5);

    const bgPanX = interpolate(frame, [0, durationInFrames], [0, -150]);
    const documentOpacity = interpolate(frame, [sec(1.5), sec(2), sec(3), sec(3.5)], [0, 1, 1, 0]);
    const cashOpacity = interpolate(frame, [sec(3.5), sec(4), sec(4.5), sec(5)], [0, 1, 1, 0]);

    const bgStyle: React.CSSProperties = {
        width: '110%',
        height: '100%',
        objectFit: 'cover',
        transform: `translateX(${bgPanX}px)`,
        filter: 'brightness(0.6)'
    };
    
    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        width: '60%',
        top: '20%',
        left: '20%',
        filter: 'drop-shadow(0 0 20px black)',
    };
    
    return (
        <AbsoluteFill style={{backgroundColor: 'black'}}>
            <Img src={staticFile('assets/images/dark_office_background.jpg')} style={bgStyle} />
            <Img src={staticFile('assets/images/redacted_document.png')} style={{...overlayStyle, opacity: documentOpacity}} />
            <Img src={staticFile('assets/images/piggy_bank_locked.png')} style={{...overlayStyle, opacity: cashOpacity}} />
            <AnimatedSentence start={0} duration={5}>
                Businesses are laying people off. They are canceling projects. They are hoarding cash.
            </AnimatedSentence>
        </AbsoluteFill>
    );
};

const Scene5 = () => {
    const frame = useCurrentFrame();
    const durationInFrames = sec(7);
    
    const zoom = interpolate(frame, [0, durationInFrames], [1, 1.5]);
    const blueprintOpacity = interpolate(frame, [sec(2.5), sec(3.5)], [0, 1]);
    const blueprintGlow = interpolate(frame, [sec(3), durationInFrames], [0, 1], {easing: Easing.inOut(Easing.ease)});

    const bgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${zoom})`,
    };

    const blueprintStyle: React.CSSProperties = {
        position: 'absolute',
        width: '50%',
        top: '25%',
        left: '25%',
        opacity: blueprintOpacity,
        filter: `drop-shadow(0 0 ${30 * blueprintGlow}px #87ceeb) drop-shadow(0 0 ${10 * blueprintGlow}px #ffffff)`,
    };
    
    return (
        <AbsoluteFill style={{backgroundColor: 'black'}}>
            <Img src={staticFile('assets/images/dark_tunnel.jpg')} style={bgStyle} />
            <Img src={staticFile('assets/images/glowing_blueprint.png')} style={blueprintStyle} />
            <AnimatedSentence start={0} duration={6.7}>
                Survival mode. What does Amazon do? They push forward with one of their strangest and most ambitious products yet.
            </AnimatedSentence>
        </AbsoluteFill>
    );
};

const Scene6 = () => {
    const frame = useCurrentFrame();
    const durationInFrames = sec(7);

    const bgFlow = interpolate(frame, [0, durationInFrames], [0, -200]);
    const kindleRotation = interpolate(frame, [0, durationInFrames], [-10, 10]);
    const kindleScale = interpolate(frame, [0, sec(1)], [3, 1], {easing: Easing.out(Easing.back(1))});

    const bgStyle: React.CSSProperties = {
        width: '150%',
        height: '150%',
        objectFit: 'cover',
        transform: `translateX(${bgFlow}px) translateY(${bgFlow / 2}px)`,
        opacity: 0.5,
    };
    
    const kindleStyle: React.CSSProperties = {
        width: '60%',
        position: 'absolute',
        top: '20%',
        left: '20%',
        transform: `scale(${kindleScale}) rotateZ(${kindleRotation}deg)`,
        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
    };

    return (
        <AbsoluteFill style={{backgroundColor: '#1a1a2a'}}>
            <Img src={staticFile('assets/images/digital_pages_background.jpg')} style={bgStyle} />
            <Img src={staticFile('assets/images/first_gen_kindle.png')} style={kindleStyle} />
            <Sequence from={sec(2.5)}>
                <AnimatedSentence start={0} duration={3}>
                    The Kindle, an electronic book reader.
                </AnimatedSentence>
            </Sequence>
        </AbsoluteFill>
    );
};

const Scene7 = () => {
    const frame = useCurrentFrame();
    const durationInFrames = sec(7);

    const zoomOut = interpolate(frame, [0, durationInFrames], [1.3, 1]);
    const overlayOpacity = interpolate(frame, [sec(2), sec(3.5)], [0, 0.9]);
    
    const bgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${zoomOut})`,
    };
    
    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        width: '35%',
        top: '15%',
        left: '32.5%',
        opacity: overlayOpacity,
        filter: 'drop-shadow(0 0 50px white)',
    };
    
    return (
        <AbsoluteFill style={{backgroundColor: '#382e21'}}>
            <Img src={staticFile('assets/images/old_library.jpg')} style={bgStyle} />
            <Img src={staticFile('assets/images/glowing_kindle_screen.png')} style={overlayStyle} />
            <AnimatedSentence start={0} duration={6.7}>
                In the middle of a historic recession, they were trying to change how humanity had read books for over 500 years.
            </AnimatedSentence>
        </AbsoluteFill>
    );
};

const Scene8 = () => {
    return (
        <AbsoluteFill style={{backgroundColor: 'black'}}>
            <Sequence from={0} duration={sec(3)}>
                <Img src={staticFile('assets/images/factory_gears.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </Sequence>
            <Sequence from={sec(3)} duration={sec(2)}>
                 <Img src={staticFile('assets/images/corporate_showdown.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)'}} />
            </Sequence>
             <Sequence from={sec(5)} duration={sec(3.5)}>
                 <Img src={staticFile('assets/images/sinking_ship.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </Sequence>
            <AnimatedSentence start={0} duration={8.5}>
                 They were building new hardware. They were fighting with publishers. They were investing hundreds of millions of dollars while other companies were fighting for their lives.
            </AnimatedSentence>
        </AbsoluteFill>
    );
};

const Scene9 = () => {
    const frame = useCurrentFrame();
    const durationInFrames = sec(5);
    
    const panY = interpolate(frame, [0, durationInFrames], [0, -200]);
    const sproutScale = interpolate(frame, [sec(3), durationInFrames], [0, 1], {easing: Easing.out(Easing.back(2))});
    const sproutOpacity = interpolate(frame, [sec(3), sec(3.5)], [0, 1]);
    
    const bgStyle: React.CSSProperties = {
        width: '100%',
        height: '120%',
        objectFit: 'cover',
        transform: `translateY(${panY}px)`
    };

    const sproutStyle: React.CSSProperties = {
        position: 'absolute',
        width: '20%',
        bottom: '25%',
        left: '40%',
        transform: `scale(${sproutScale})`,
        opacity: sproutOpacity,
        filter: 'drop-shadow(0 0 20px #aaffaa) drop-shadow(0 0 10px white)',
    };
    
    return (
        <AbsoluteFill style={{backgroundColor: '#444'}}>
            <Img src={staticFile('assets/images/forest_fire_aftermath.jpg')} style={bgStyle} />
            <Img src={staticFile('assets/images/green_sprout.png')} style={sproutStyle} />
            <AnimatedSentence start={0} duration={4.8}>
                Recessions are a clearing event. The weak get wiped out. The strong get stronger.
            </AnimatedSentence>
        </AbsoluteFill>
    );
};

const Scene10 = () => {
    const frame = useCurrentFrame();
    const durationInFrames = sec(6.5);

    const pullBack = interpolate(frame, [0, durationInFrames], [1.5, 1]);
    const rotation = interpolate(frame, [0, durationInFrames], [0, -10]);

    const bgStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${pullBack}) rotate(${rotation}deg)`,
    };
    
    return (
        <AbsoluteFill style={{backgroundColor: '#020210'}}>
            <Img src={staticFile('assets/images/kindle_ecosystem_constellation.png')} style={bgStyle} />
            <AnimatedSentence start={0} duration={6.5}>
                Amazon used the 2008 crisis to grab market share and create a brand new ecosystem around digital books.
            </AnimatedSentence>
        </AbsoluteFill>
    );
};

const Scene11 = () => {
    const frame = useCurrentFrame();
    const durationInFrames = sec(4.5);
    
    const feetOpacity = interpolate(frame, [0, sec(1), sec(2), sec(2.5)], [1, 1, 0, 0]);
    const horizonOpacity = interpolate(frame, [sec(2), sec(3)], [0, 1]);
    const horizonZoom = interpolate(frame, [sec(2), durationInFrames], [1.2, 1]);

    const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    };

    return (
        <AbsoluteFill style={{backgroundColor: 'black'}}>
            <AbsoluteFill style={{opacity: feetOpacity}}>
                <Img src={staticFile('assets/images/man_looking_down.jpg')} style={{...imageStyle, filter: 'brightness(0.7)'}}/>
            </AbsoluteFill>
            <AbsoluteFill style={{opacity: horizonOpacity}}>
                <Img src={staticFile('assets/images/woman_on_clifftop.jpg')} style={{...imageStyle, transform: `scale(${horizonZoom})`}} />
            </AbsoluteFill>
            <AnimatedSentence start={0} duration={4.1}>
                 While everyone else was looking at their feet, they were looking at the horizon.
            </AnimatedSentence>
        </AbsoluteFill>
    );
};

// --- Dust Overlay Effect ---

const DustParticle = ({ seed }: { seed: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const x = (Math.sin(seed * 2) + 1) / 2 * width;
  const y = (Math.cos(seed * 3) + 1) / 2 * height;
  const initialSize = (Math.sin(seed * 5) + 1) / 2 * 3 + 1;
  
  const driftX = Math.sin(frame / 40 + seed * 7) * 20;
  const driftY = Math.cos(frame / 50 + seed * 9) * 20;
  const opacity = (Math.sin(frame / 60 + seed * 11) + 1) / 2 * 0.4 + 0.1;

  const particleStyle: React.CSSProperties = {
    position: 'absolute',
    left: x + driftX,
    top: y + driftY,
    width: initialSize,
    height: initialSize,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    opacity,
  };

  return <div style={particleStyle} />;
};

const DustOverlay = ({ count = 100 }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, i) => (
        <DustParticle key={i} seed={i} />
      ))}
    </AbsoluteFill>
  );
};


// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
  const fps = 30;
  const durationInSeconds = 62;

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_5.wav')} />

      <Sequence from={0} durationInFrames={sec(4.0)}>
        <Scene1 />
      </Sequence>
      <Sequence from={sec(4.0)} durationInFrames={sec(4.6)}>
        <Scene2 />
      </Sequence>
      <Sequence from={sec(8.6)} durationInFrames={sec(4.5)}>
        <Scene3 />
      </Sequence>
      <Sequence from={sec(13.1)} durationInFrames={sec(5.1)}>
        <Scene4 />
      </Sequence>
      <Sequence from={sec(18.2)} durationInFrames={sec(7)}>
        <Scene5 />
      </Sequence>
      <Sequence from={sec(25.2)} durationInFrames={sec(2.8)}>
        <Scene6 />
      </Sequence>
      <Sequence from={sec(27.8)} durationInFrames={sec(7)}>
        <Scene7 />
      </Sequence>
       <Sequence from={sec(34.8)} durationInFrames={sec(8.7)}>
        <Scene8 />
      </Sequence>
       <Sequence from={sec(43.5)} durationInFrames={sec(5.5)}>
        <Scene9 />
      </Sequence>
       <Sequence from={sec(49.0)} durationInFrames={sec(7)}>
        <Scene10 />
      </Sequence>
       <Sequence from={sec(56.0)} durationInFrames={sec(4.5)}>
        <Scene11 />
      </Sequence>
      
      <DustOverlay />
    </AbsoluteFill>
  );
};
```