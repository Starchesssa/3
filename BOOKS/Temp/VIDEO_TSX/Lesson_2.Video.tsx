```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
  interpolate,
  Easing,
} from 'remotion';
import React from 'react';

// Audio file is imported via staticFile
const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_2.wav');

// --- Asset Imports ---
// Comment: A dark, abstract, chaotic background representing market volatility. Full-screen JPG.
const marketChaosBg = staticFile('images/market_chaos.jpg');
// Comment: A clean compass image with a transparent background. PNG format.
const compassImage = staticFile('images/compass.png');
// Comment: A background with a retro late-90s internet aesthetic. Full-screen JPG.
const retroWebBg = staticFile('images/retro_web_bg.jpg');
// Comment: Logos of failed dot-com companies (e.g., Pets.com, Webvan) with transparent backgrounds. PNGs.
const petsDotComLogo = staticFile('images/pets_dot_com_logo.png');
const webvanLogo = staticFile('images/webvan_logo.png');
// Comment: An image of Wall Street buildings at night, looking imposing. Full-screen JPG.
const wallStreetBg = staticFile('images/wall_street_night.jpg');
// Comment: A mock newspaper headline with "Amazon.BOMB" text. Transparent background PNG.
const amazonBombHeadline = staticFile('images/amazon_bomb_headline.png');
// Comment: A dark office environment, viewed from the perspective of a founder. Full-screen JPG.
const darkOfficeBg = staticFile('images/dark_office.jpg');
// Comment: A desk with a monitor, isolated with a transparent background. PNG format.
const deskWithMonitor = staticFile('images/desk_with_monitor.png');
// Comment: Scattered papers to be used as a foreground element. Transparent background PNG.
const scatteredPapers = staticFile('images/scattered_papers.png');
// Comment: A background showing blurred financial documents. Full-screen JPG.
const financialDocsBg = staticFile('images/financial_docs.jpg');
// Comment: A pair of scissors with a transparent background. PNG format.
const scissorsImage = staticFile('images/scissors.png');
// Comment: A single glowing gold coin with a transparent background. PNG format.
const goldCoinImage = staticFile('images/gold_coin.png');
// Comment: A dramatic image of a ship in a stormy sea. Full-screen JPG.
const shipInStormBg = staticFile('images/ship_in_storm.jpg');
// Comment: A technical blueprint overlay with a transparent background. PNG format.
const blueprintImage = staticFile('images/blueprint.png');
// Comment: A subtle dust/particle overlay to add texture. Semi-transparent PNG.
const dustOverlay = staticFile('images/dust_overlay.png');


// --- Data: Transcript Sentences ---
const sentences = [
	{ text: "Key lesson.", start: 0.00, end: 1.34 },
	{ text: "The market is a mood swing.", start: 1.34, end: 3.42 },
	{ text: "Your strategy is a compass.", start: 3.42, end: 5.82 },
	{ text: "The bubble burst.", start: 5.82, end: 7.26 },
	{ text: "From late 1999 through 2001, the party ended.", start: 7.26, end: 11.52 },
	{ text: ".com companies vanished overnight.", start: 11.52, end: 14.28 },
	{ text: "Pets.com. Webvan. Gone.", start: 14.28, end: 16.92 },
	{ text: "Wall Street turned on Amazon.", start: 16.92, end: 19.10 },
	{ text: "They called it Amazon Bomb.", start: 19.10, end: 21.20 },
	{ text: "The stock which peaked at over $100 crashed.", start: 21.20, end: 25.22 },
	{ text: "It fell and fell until it was worth less than $6 a share.", start: 25.22, end: 29.24 },
	{ text: "A drop of over 90%.", start: 29.24, end: 32.68 },
	{ text: "Imagine that.", start: 31.80, end: 33.56 },
	{ text: "Your life's work. Your entire net worth evaporating by 90%.", start: 33.56, end: 39.00 },
	{ text: "Most founders would panic.", start: 39.00, end: 40.52 },
	{ text: "They would cut costs to the bone.", start: 40.52, end: 42.42 },
	{ text: "They would try to show a profit. Any profit.", start: 42.42, end: 45.10 },
	{ text: "To calm the investors.", start: 45.10, end: 46.84 },
	{ text: "Bezos did the opposite.", start: 46.84, end: 48.54 },
	{ text: "He kept building.", start: 48.54, end: 50.02 },
	{ text: "He knew the market was just noise.", start: 50.02, end: 52.52 },
	{ text: "It was fear and greed.", start: 52.52, end: 54.22 },
	{ text: "His strategy was the signal.", start: 54.22, end: 56.56 },
	{ text: "He needed to survive the storm. Not abandon the ship.", start: 56.56, end: 59.68 },
];

const sToF = (seconds: number, fps: number) => Math.round(seconds * fps);

// --- Reusable Components ---

const Text: React.FC<{ text: string; start: number; end: number; }> = ({ text, start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = sToF(start, fps);
  const endFrame = sToF(end, fps);
  const duration = endFrame - startFrame;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + fps * 0.5, endFrame - fps * 0.5, endFrame],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [startFrame, startFrame + fps * 0.5],
    [20, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
  );

  const textStyle: React.CSSProperties = {
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: '80px',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadow: '0 0 15px rgba(0,0,0,0.7)',
    opacity,
    transform: `translateY(${translateY}px)`,
  };

  return <p style={textStyle}>{text}</p>;
};

const DustEffect: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const opacity = interpolate(frame, [0, 60, durationInFrames - 60, durationInFrames], [0, 0.4, 0.4, 0]);
    const transform = `scale(1.5) rotate(${frame / 20}deg) translateX(${Math.sin(frame / 50) * 20}px)`;

    const dustStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity,
        transform,
    };
    return <Img src={dustOverlay} style={dustStyle} />;
}

// --- Scene Components ---

const Scene1: React.FC = () => { // 0.00 -> 5.82
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Camera movement
    const sceneProgress = frame / durationInFrames;
    const cameraZoom = interpolate(sceneProgress, [0, 1], [1, 1.1]);
    const cameraPanX = interpolate(sceneProgress, [0, 1], [0, -50]);
    
    // Parallax calculation
    const bgScale = cameraZoom * 1.1;
    const fgScale = cameraZoom * 1.0;
    const bgTranslateX = cameraPanX * 1.2;
    const fgTranslateX = cameraPanX * 0.8;

    // Element-specific animations
    const compassOpacity = interpolate(frame, [sToF(3, 30), sToF(4, 30)], [0, 1], { extrapolateRight: 'clamp' });

    // Styles
    const bgStyle: React.CSSProperties = {
        width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${bgScale}) translateX(${bgTranslateX}px)`,
    };
    const compassStyle: React.CSSProperties = {
        position: 'absolute', top: '50%', left: '50%',
        width: '30%',
        opacity: compassOpacity,
        transform: `scale(${fgScale}) translate(-50%, -50%) translateX(${fgTranslateX}px)`,
        filter: 'drop-shadow(0 0 20px rgba(255, 223, 186, 0.5))'
    };
    
    return (
        <AbsoluteFill>
            <Img src={marketChaosBg} style={bgStyle} />
            <Img src={compassImage} style={compassStyle} />
        </AbsoluteFill>
    );
};

const Scene2: React.FC = () => { // 5.82 -> 16.92
    const frame = useCurrentFrame();

    // Camera movement
    const cameraPullback = interpolate(frame, [0, sToF(11.1, 30)], [1.5, 1], { easing: Easing.bezier(0.5, 0, 0.5, 1) });
    
    // Bubble burst animation
    const bubbleStart = sToF(0.2, 30);
    const bubbleBurst = sToF(1.2, 30);
    const bubbleScale = interpolate(frame, [bubbleStart, bubbleBurst, bubbleBurst + 10], [0, 1.2, 0], { extrapolateRight: 'clamp' });
    const bubbleOpacity = interpolate(frame, [bubbleBurst, bubbleBurst + 10], [1, 0], { extrapolateRight: 'clamp' });

    // Logo animations
    const logoFadeInStart = sToF(5.7, 30);
    const logoFadeOutStart = sToF(8, 30);
    const petsLogoOpacity = interpolate(frame, [logoFadeInStart, logoFadeInStart + 30, logoFadeOutStart, logoFadeOutStart + 15], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
    const webvanLogoOpacity = interpolate(frame, [logoFadeInStart + 15, logoFadeInStart + 45, logoFadeOutStart + 15, logoFadeOutStart + 30], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

    // Styles
    const containerStyle: React.CSSProperties = { transform: `scale(${cameraPullback})` };
    const bgStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.5)' };
    const bubbleStyle: React.CSSProperties = { 
        position: 'absolute', width: '100%', height: '100%',
        background: 'radial-gradient(circle, rgba(100,150,255,0.4) 0%, rgba(255,255,255,0) 70%)',
        transform: `scale(${bubbleScale})`, opacity: bubbleOpacity
    };
    const petsLogoStyle: React.CSSProperties = { position: 'absolute', top: '30%', left: '25%', width: '20%', opacity: petsLogoOpacity };
    const webvanLogoStyle: React.CSSProperties = { position: 'absolute', top: '50%', left: '60%', width: '25%', opacity: webvanLogoOpacity };

    return (
        <AbsoluteFill style={containerStyle}>
            <Img src={retroWebBg} style={bgStyle} />
            <div style={bubbleStyle} />
            <Img src={petsDotComLogo} style={petsLogoStyle} />
            <Img src={webvanLogo} style={webvanLogoStyle} />
        </AbsoluteFill>
    );
};

const Scene3: React.FC = () => { // 16.92 -> 32.68
    const frame = useCurrentFrame();

    // Camera movement
    const cameraZoom = interpolate(frame, [0, sToF(15.76, 30)], [1, 1.3]);
    const cameraPanY = interpolate(frame, [sToF(7, 30), sToF(12, 30)], [0, 150]);

    // Graph crash animation
    const crashStartFrame = sToF(5.5, 30);
    const crashEndFrame = sToF(11, 30);
    const graphHeight = interpolate(frame, [crashStartFrame, crashEndFrame], [100, 940], { extrapolateLeft: 'clamp', easing: Easing.in(Easing.exp) });

    // Headline flash
    const headlineStart = sToF(2.5, 30);
    const headlineOpacity = interpolate(frame, [headlineStart, headlineStart + 5, headlineStart + 25, headlineStart + 30], [0, 1, 1, 0]);

    // Styles
    const bgStyle: React.CSSProperties = { 
        width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${cameraZoom}) translateY(${cameraPanY}px)`
    };
    const graphContainerStyle: React.CSSProperties = {
        position: 'absolute', top: '100px', left: '10%', width: '80%', height: '900px',
    };
    const graphLineStyle: React.CSSProperties = {
        position: 'absolute', top: 0, right: '10%', width: '8px',
        height: `${graphHeight}px`,
        background: 'linear-gradient(to bottom, #ff4136, #85144b)',
        boxShadow: '0 0 20px #ff4136',
    };
    const headlineStyle: React.CSSProperties = {
        position: 'absolute', top: '50%', left: '50%',
        width: '50%',
        transform: 'translate(-50%, -50%) rotate(-5deg)',
        opacity: headlineOpacity
    };

    return (
        <AbsoluteFill>
            <Img src={wallStreetBg} style={bgStyle} />
            <div style={graphContainerStyle}>
                <div style={graphLineStyle} />
            </div>
            <Img src={amazonBombHeadline} style={headlineStyle} />
        </AbsoluteFill>
    );
};

const Scene4: React.FC = () => { // 31.80 -> 40.52
    const frame = useCurrentFrame();
    
    // Camera dolly zoom
    const cameraZoom = interpolate(frame, [0, sToF(8.72, 30)], [1, 1.4]);
    const paperZoom = interpolate(frame, [0, sToF(8.72, 30)], [1, 0.8]); // Foreground moves slower

    // Styles
    const bgStyle: React.CSSProperties = {
        width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${cameraZoom})`,
        filter: 'brightness(0.7)'
    };
    const deskStyle: React.CSSProperties = {
        width: '100%', height: '100%', objectFit: 'contain',
        transform: `scale(${cameraZoom})`
    };
    const paperStyle: React.CSSProperties = {
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: '120%', 
        transform: `scale(${paperZoom})`,
        opacity: 0.8
    };

    return (
        <AbsoluteFill>
            <Img src={darkOfficeBg} style={bgStyle} />
            <Img src={deskWithMonitor} style={deskStyle} />
            <Img src={scatteredPapers} style={paperStyle} />
        </AbsoluteFill>
    );
};

const Scene5: React.FC = () => { // 40.52 -> 46.84
    const frame = useCurrentFrame();
    
    // Animations
    const scissorsX = interpolate(frame, [sToF(0.5, 30), sToF(2, 30)], [-1000, 1000]);
    const coinStart = sToF(3, 30);
    const coinOpacity = interpolate(frame, [coinStart, coinStart + 30], [0, 1]);
    const coinScale = interpolate(frame, [coinStart, sToF(6.32, 30)], [0.5, 1.2]);

    // Styles
    const bgStyle: React.CSSProperties = {
        width: '100%', height: '100%', objectFit: 'cover',
        filter: 'blur(10px) brightness(0.5)'
    };
    const scissorsStyle: React.CSSProperties = {
        position: 'absolute', top: '40%', left: '50%', width: '50%',
        transform: `translate(-50%, -50%) translateX(${scissorsX}px) rotate(10deg)`
    };
    const coinStyle: React.CSSProperties = {
        position: 'absolute', top: '50%', left: '50%', width: '15%',
        opacity: coinOpacity,
        transform: `translate(-50%, -50%) scale(${coinScale})`,
        filter: 'drop-shadow(0 0 30px #FFD700)'
    };
    
    return (
        <AbsoluteFill>
            <Img src={financialDocsBg} style={bgStyle} />
            <Img src={scissorsImage} style={scissorsStyle} />
            <Img src={goldCoinImage} style={coinStyle} />
        </AbsoluteFill>
    );
};

const Scene6: React.FC = () => { // 46.84 -> 59.68
    const frame = useCurrentFrame();
    
    // Scene transition
    const buildStart = sToF(1.7, 30);
    const blueprintOpacity = interpolate(frame, [buildStart, buildStart + 45], [0, 0.8]);
    
    // Camera movement
    const cameraZoomOut = interpolate(frame, [0, sToF(12.84, 30)], [1.3, 1]);
    
    // Element animations
    const compassStart = sToF(7.3, 30);
    const compassOpacity = interpolate(frame, [compassStart, compassStart + 30], [0, 1]);
    const compassScale = interpolate(frame, [compassStart, sToF(12.84, 30)], [2, 1]);

    // Styles
    const containerStyle: React.CSSProperties = { transform: `scale(${cameraZoomOut})`};
    const bgStyle: React.CSSProperties = {
        width: '100%', height: '100%', objectFit: 'cover',
    };
    const blueprintStyle: React.CSSProperties = {
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        objectFit: 'cover',
        opacity: blueprintOpacity,
    };
    const compassStyle: React.CSSProperties = {
        position: 'absolute', top: '50%', left: '50%',
        width: '25%',
        opacity: compassOpacity,
        transform: `translate(-50%, -50%) scale(${compassScale})`,
        filter: 'drop-shadow(0 0 20px rgba(173, 216, 230, 0.7))'
    };

    return (
        <AbsoluteFill style={containerStyle}>
            <Img src={shipInStormBg} style={bgStyle} />
            <Img src={blueprintImage} style={blueprintStyle} />
            <Img src={compassImage} style={compassStyle} />
        </AbsoluteFill>
    );
};


// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const durationInSeconds = 59.68;
  const durationInFrames = sToF(durationInSeconds, fps) + 30; // Add a second for fade out

  return (
    <>
      <AbsoluteFill style={{ backgroundColor: 'black' }}>
        
        <Sequence from={sToF(0.00, fps)} durationInFrames={sToF(5.82, fps)}>
            <Scene1 />
        </Sequence>
        <Sequence from={sToF(5.82, fps)} durationInFrames={sToF(11.1, fps)}>
            <Scene2 />
        </Sequence>
        <Sequence from={sToF(16.92, fps)} durationInFrames={sToF(15.76, fps)}>
            <Scene3 />
        </Sequence>
        <Sequence from={sToF(31.80, fps)} durationInFrames={sToF(8.72, fps)}>
            <Scene4 />
        </Sequence>
         <Sequence from={sToF(40.52, fps)} durationInFrames={sToF(6.32, fps)}>
            <Scene5 />
        </Sequence>
         <Sequence from={sToF(46.84, fps)} durationInFrames={sToF(12.84, fps)}>
            <Scene6 />
        </Sequence>

        {/* Dust and Glow Overlay */}
        <AbsoluteFill>
          <DustEffect />
        </AbsoluteFill>

        {/* Text Layer */}
        <AbsoluteFill style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 10%',
        }}>
          {sentences.map((s, i) => (
            <Sequence
              key={i}
              from={sToF(s.start, fps)}
              durationInFrames={sToF(s.end - s.start, fps) + fps}
            >
              <Text text={s.text} start={s.start} end={s.end} />
            </Sequence>
          ))}
        </AbsoluteFill>

      </AbsoluteFill>

      <Audio src={audioSrc} />
    </>
  );
};
```