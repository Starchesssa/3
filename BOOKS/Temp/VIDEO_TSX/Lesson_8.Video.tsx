```tsx
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Easing,
} from 'remotion';
import React from 'react';

// --- Helper Functions and Components ---

// Converts seconds to frames
const sec = (seconds: number) => Math.round(seconds * 30);

// Component for displaying a single word with fade-in/out animation
const Word: React.FC<{
  children: React.ReactNode;
  start: number;
  end: number;
}> = ({ children, start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationInFrames = (end - start) * fps;
  const opacity = interpolate(
    frame,
    [start * fps, start * fps + 15, end * fps - 15, end * fps],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <span
      style={{
        opacity,
        display: 'inline-block',
        marginRight: '1vw',
      }}
    >
      {children}
    </span>
  );
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // --- Animation Calculations ---

  // Scene 1: Crisis Test (0s - 5s)
  const scene1Zoom = interpolate(frame, [0, sec(5)], [1, 1.1]);
  const scene1GearsRotation = interpolate(frame, [0, sec(5)], [0, 45]);
  const crisisGlow = interpolate(
    frame,
    [sec(3.8), sec(4.4), sec(5)],
    [0, 1, 0],
    {
      easing: Easing.elastic(1),
    }
  );

  // Scene 2: The World Stops (5s - 9.8s)
  const scene2Pan = interpolate(frame, [sec(5), sec(9.8)], [0, 100]);
  const earthRotation = interpolate(frame, [sec(5), sec(8.9)], [0, 20]);
  const freezeOpacity = interpolate(frame, [sec(8.9), sec(9.5)], [0, 0.7]);

  // Scene 3: Pandemic (9.8s - 14s)
  const scene3DollyZoom = interpolate(frame, [sec(9.8), sec(14)], [1.2, 1]);
  const virusDrift = interpolate(frame, [sec(9.8), sec(14)], [-100, width + 100]);
  const closedSignOpacity = interpolate(
    frame,
    [sec(12.5), sec(13.5)],
    [0, 1]
  );
  
  // Scene 4: Lockdown (14s - 18.5s)
  const scene4Zoom = interpolate(frame, [sec(14), sec(18.5)], [1, 1.05]);
  const scene4ParallaxBg = interpolate(frame, [sec(14), sec(18.5)], [0, -20]);

  // Scene 5: The Machine (18.5s - 24.8s)
  const scene5Track = interpolate(frame, [sec(18.5), sec(24.8)], [-150, 150]);
  
  // Scene 6: Essential Infrastructure (24.8s - 35.7s)
  const scene6Zoom = interpolate(frame, [sec(24.8), sec(35.7)], [1.3, 1]);
  const testGlow = spring({
    frame: frame - sec(34.5),
    fps,
    config: { damping: 200, stiffness: 100 },
    durationInFrames: 30,
  });

  // Scene 7: Strained but Not Broken (35.7s - 40.2s)
  const scene7Pan = interpolate(frame, [sec(35.7), sec(40.2)], [200, 0]);
  const strainShake =
    Math.sin(frame * 0.8) *
    interpolate(frame, [sec(36.8), sec(37.4)], [0, 5], {
      extrapolateRight: 'clamp',
    });
    
  // Scene 8: Amazon Hired (40.2s - 48.1s)
  const scene8Pan = interpolate(frame, [sec(40.2), sec(48.1)], [-100, 100]);
  const workersScale = interpolate(frame, [sec(42.5), sec(47.8)], [0, 1.1]);

  // Scene 9: Revenue Exploded (48.1s - 55.5s)
  const graphProgress = interpolate(frame, [sec(50), sec(51.8)], [0, 1], {
    easing: Easing.bezier(0.61, 1, 0.88, 1),
  });
  const numbersSpring = spring({
    frame: frame - sec(52),
    fps,
    config: { stiffness: 100 }
  });

  // Scene 10: Validation (55.5s - 62.5s)
  const scene10Zoom = interpolate(frame, [sec(55.5), sec(62.5)], [1, 1.2]);
  const validationGlowOpacity = interpolate(frame, [sec(61), sec(62.2)], [0, 1]);

  // Scene 11: Bets Paid Off (62.5s - 71s)
  const scene11ZoomOut = interpolate(frame, [sec(62.5), sec(71)], [1.2, 1]);
  const lightLinesOpacity = interpolate(frame, [sec(68), sec(70)], [0, 1]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_8.wav')} />

      {/* --- SCENES --- */}
      
      {/* Scene 1: The Test */}
      <Sequence from={0} durationInFrames={sec(5.2)}>
        <AbsoluteFill style={{ transform: `scale(${scene1Zoom})` }}>
          {/* background_blueprint.jpg: A dark, intricate, and detailed technical blueprint of a complex machine. */}
          <Img src={staticFile('images/background_blueprint.jpg')} style={{ width: '100%', height: '100%' }} />
          {/* midground_glowing_lines.png: Abstract cyan lines forming a network grid over the blueprint. Transparent background. */}
          <Img src={staticFile('images/midground_glowing_lines.png')} style={{ width: '100%', height: '100%', opacity: 0.7, mixBlendMode: 'screen' }} />
           <div style={{
              width: '100%',
              height: '100%',
              boxShadow: `inset 0 0 250px 150px rgba(255, 0, 0, ${crisisGlow})`,
              position: 'absolute'
            }}/>
          {/* foreground_gears.png: Several large, photorealistic metallic gears with a slight glow. Transparent background. */}
          <Img src={staticFile('images/foreground_gears.png')} style={{ width: '100%', height: '100%', opacity: 0.8, transform: `rotate(${scene1GearsRotation}deg)` }} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: The World Stops */}
      <Sequence from={sec(5.2)} durationInFrames={sec(4.6)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(5.2), sec(5.5), sec(9.5), sec(9.8)], [0, 1, 1, 0]) }}>
           {/* background_space.jpg: A beautiful, high-resolution image of deep space with nebulae and distant stars. */}
           <Img src={staticFile('images/background_space.jpg')} style={{ width: '100%', height: '100%' }} />
           {/* midground_earth.png: A high-detail, realistic render of planet Earth. Transparent background. */}
           <Img src={staticFile('images/midground_earth.png')} style={{ transform: `translateX(${scene2Pan}px) rotateY(${earthRotation}deg) scale(0.8)`, width: '100%', height: '100%' }} />
           {/* overlay_ice.png: A semi-transparent texture of frost and ice crystals. Transparent background. */}
           <Img src={staticFile('images/overlay_ice.png')} style={{ width: '100%', height: '100%', opacity: freezeOpacity, mixBlendMode: 'screen' }} />
         </AbsoluteFill>
      </Sequence>

      {/* Scene 3: The Pandemic */}
      <Sequence from={sec(9.8)} durationInFrames={sec(4.2)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(9.8), sec(10.1), sec(13.7), sec(14.0)], [0, 1, 1, 0]), transform: `scale(${scene3DollyZoom})` }}>
           {/* background_empty_city.jpg: A wide, cinematic shot of a famous city street (e.g., Times Square) completely empty and desolate. */}
           <Img src={staticFile('images/background_empty_city.jpg')} style={{ width: '100%', height: '100%' }} />
           {/* midground_virus_particles.png: Stylized, softly glowing green viral particles floating. Transparent background. */}
           <Img src={staticFile('images/midground_virus_particles.png')} style={{ width: '100%', height: '100%', opacity: 0.3, transform: `translateX(${virusDrift}px)`}} />
           {/* overlay_closed_sign.png: A "CLOSED" sign hanging in a window, slightly blurred. Transparent background. */}
           <Img src={staticFile('images/overlay_closed_sign.png')} style={{ width: '100%', height: '100%', opacity: closedSignOpacity }} />
         </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Lockdown */}
      <Sequence from={sec(14.0)} durationInFrames={sec(4.5)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(14.0), sec(14.3), sec(18.2), sec(18.5)], [0, 1, 1, 0]), transform: `scale(${scene4Zoom})` }}>
           {/* background_rainy_window.jpg: A view from inside a dark room, looking out a window with raindrops at a blurred city street at dusk. */}
           <Img src={staticFile('images/background_rainy_window.jpg')} style={{ width: '100%', height: '100%', transform: `translateX(${scene4ParallaxBg}px)` }} />
           {/* foreground_window_frame.png: A dark silhouette of a window frame to enhance the feeling of being indoors. Transparent background. */}
           <Img src={staticFile('images/foreground_window_frame.png')} style={{ width: '100%', height: '100%' }} />
         </AbsoluteFill>
      </Sequence>

      {/* Scene 5: The Amazon Machine */}
      <Sequence from={sec(18.5)} durationInFrames={sec(6.3)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(18.5), sec(18.8), sec(24.5), sec(24.8)], [0, 1, 1, 0]) }}>
            {/* background_amazon_warehouse.jpg: A massive, slightly futuristic Amazon fulfillment center, with rows of shelves stretching into the distance. */}
           <Img src={staticFile('images/background_amazon_warehouse.jpg')} style={{ width: '120%', height: '100%', objectFit: 'cover', transform: `translateX(${scene5Track * 0.5}px)` }} />
           {/* midground_conveyor_belts.png: Multiple layers of conveyor belts with packages moving. Transparent background. */}
           <Img src={staticFile('images/midground_conveyor_belts.png')} style={{ width: '120%', height: '100%', transform: `translateX(${scene5Track}px)` }} />
           {/* foreground_robotic_arm.png: A large, slightly out-of-focus robotic arm in the foreground. Transparent background. */}
           <Img src={staticFile('images/foreground_robotic_arm.png')} style={{ width: '120%', height: '100%', transform: `translateX(${scene5Track * 1.5}px)` }} />
         </AbsoluteFill>
      </Sequence>

      {/* Scene 6: Essential Infrastructure */}
      <Sequence from={sec(24.8)} durationInFrames={sec(10.9)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(24.8), sec(25.1), sec(35.4), sec(35.7)], [0, 1, 1, 0]), transform: `scale(${scene6Zoom})`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* background_network.jpg: An abstract, dark background with glowing blue and white data streams. */}
           <Img src={staticFile('images/background_network.jpg')} style={{ position: 'absolute', width: '100%', height: '100%' }} />
           <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              boxShadow: `0 0 250px 150px rgba(255, 100, 100, ${testGlow})`,
              position: 'absolute'
            }}/>
           {/* Icons can be simple white PNGs. I'll animate them in using Sequence. */}
           {/* overlay_warehouse_icon.png, overlay_truck_icon.png, etc. */}
         </AbsoluteFill>
      </Sequence>

      {/* Scene 7: Strained but Not Broken */}
      <Sequence from={sec(35.7)} durationInFrames={sec(4.5)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(35.7), sec(36), sec(39.9), sec(40.2)], [0, 1, 1, 0]) }}>
           {/* background_stormy_sky.jpg: A dark, dramatic sky with turbulent clouds. */}
           <Img src={staticFile('images/background_stormy_sky.jpg')} style={{ width: '100%', height: '100%' }} />
           {/* foreground_bridge.png: A strong, modern suspension bridge viewed from a low angle. Transparent background. */}
           <Img src={staticFile('images/foreground_bridge.png')} style={{ width: '100%', height: '100%', transform: `translateY(${scene7Pan}px) translateX(${strainShake}px)` }} />
         </AbsoluteFill>
      </Sequence>

      {/* Scene 8: Amazon Hired */}
      <Sequence from={sec(40.2)} durationInFrames={sec(7.9)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(40.2), sec(40.5), sec(47.8), sec(48.1)], [0, 1, 1, 0]) }}>
           {/* background_collapsing_businesses.jpg: A street with closed, derelict small business storefronts. */}
           <Img src={staticFile('images/background_collapsing_businesses.jpg')} style={{ width: '100%', height: '100%', filter: 'grayscale(0.5) brightness(0.7)' }} />
           {/* foreground_worker_silhouettes.png: Silhouettes of a diverse crowd of people. Transparent background. */}
           <Img src={staticFile('images/foreground_worker_silhouettes.png')} style={{ width: '100%', height: '100%', transform: `scale(${workersScale})`, opacity: workersScale, transformOrigin: 'bottom center' }} />
         </AbsoluteFill>
      </Sequence>

      {/* Scene 9: Revenue Exploded */}
      <Sequence from={sec(48.1)} durationInFrames={sec(7.4)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(48.1), sec(48.4), sec(55.2), sec(55.5)], [0, 1, 1, 0]), display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
           {/* background_digital_grid.jpg: A dark background with a subtle, glowing blue digital grid. */}
           <Img src={staticFile('images/background_digital_grid.jpg')} style={{ position: 'absolute', width: '100%', height: '100%' }} />
           <svg viewBox="0 0 1000 500" width="70%">
             <path d={`M 100 400 Q 500 ${400 - (graphProgress * 300)} 900 100`} stroke="cyan" strokeWidth="10" fill="none" strokeDasharray="2000" strokeDashoffset={2000 - (graphProgress * 2000)} />
           </svg>
           <div style={{ position: 'absolute', color: 'white', fontSize: '10rem', transform: `scale(${numbersSpring})`, opacity: numbersSpring, bottom: '20%', right: '20%', textShadow: '0 0 20px cyan' }}>$88.9 Billion</div>
         </AbsoluteFill>
      </Sequence>
      
      {/* Scene 10: Validation */}
      <Sequence from={sec(55.5)} durationInFrames={sec(7.0)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(55.5), sec(55.8), sec(62.2), sec(62.5)], [0, 1, 1, 0]), transform: `scale(${scene10Zoom})` }}>
           {/* background_chaotic_blur.jpg: A dark, abstract background with motion-blurred streaks of light, suggesting chaos. */}
           <Img src={staticFile('images/background_chaotic_blur.jpg')} style={{ width: '100%', height: '100%' }} />
           <div style={{ width: '100%', height: '100%', position: 'absolute', background: `radial-gradient(circle, rgba(255,200,100,${validationGlowOpacity * 0.4}) 0%, rgba(0,0,0,0) 60%)` }} />
           {/* foreground_amazon_box.png: A single, clean, perfectly lit Amazon box in the center. Transparent background. */}
           <Img src={staticFile('images/foreground_amazon_box.png')} style={{ width: '100%', height: '100%', transform: 'scale(0.8)' }} />
         </AbsoluteFill>
      </Sequence>

      {/* Scene 11: Bets Paid Off */}
      <Sequence from={sec(62.5)}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [sec(62.5), sec(62.8)], [0, 1]), transform: `scale(${scene11ZoomOut})` }}>
           {/* background_world_map_dark.jpg: A stylized, dark world map with glowing city points. */}
           <Img src={staticFile('images/background_world_map_dark.jpg')} style={{ width: '100%', height: '100%' }} />
           {/* overlay_light_lines.png: Animated lines of light connecting infrastructure icons to the map. Transparent background. */}
           <Img src={staticFile('images/overlay_light_lines.png')} style={{ width: '100%', height: '100%', mixBlendMode: 'screen', opacity: lightLinesOpacity }} />
         </AbsoluteFill>
      </Sequence>

      {/* --- TEXT OVERLAY --- */}

      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 10%',
        }}
      >
        <div
          style={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: '5.5vw',
            lineHeight: '1.2',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(0,0,0,0.8)',
          }}
        >
          {/* Key lesson. */}
          <Word start={0.0} end={0.86}>Key lesson.</Word>
          {/* Your system is only tested in a true crisis. */}
          <Word start={1.38} end={4.42}>Your system is only tested in a true crisis.</Word>
          {/* Late 2019 rolled into 2020, and the world stopped. */}
          <Word start={5.26} end={9.52}>Late 2019 rolled into 2020, and the world stopped.</Word>
          {/* A global pandemic called COVID-19 shut down everything. */}
          <Word start={9.98} end={13.76}>A global pandemic called COVID-19 shut down everything.</Word>
          {/* Stores closed, offices closed, people were locked in their homes. */}
          <Word start={14.28} end={18.16}>Stores closed, offices closed, people were locked in their homes.</Word>
          {/* And suddenly, the machine that Amazon had been building for 25 years was not just a convenience. */}
          <Word start={18.68} end={24.52}>And suddenly, the machine that Amazon had been building for 25 years was not just a convenience.</Word>
          {/* It became essential infrastructure. */}
          <Word start={24.98} end={27.06}>It became essential infrastructure.</Word>
          {/* The warehouses, the delivery trucks, the website, the cloud servers, powering Netflix and Zoom, it was all put to the ultimate test. */}
          <Word start={27.06} end={35.48}>The warehouses, the delivery trucks, the website, the cloud servers, powering Netflix and Zoom, it was all put to the ultimate test.</Word>
          {/* The system strained, delivery time slipped, but it did not break. */}
          <Word start={35.84} end={39.92}>The system strained, delivery time slipped, but it did not break.</Word>
          {/* While other businesses collapsed, Amazon hired. */}
          <Word start={40.48} end={43.24}>While other businesses collapsed, Amazon hired.</Word>
          {/* They hired 175,000 new workers in just a few months. */}
          <Word start={43.62} end={47.82}>They hired 175,000 new workers in just a few months.</Word>
          {/* Their revenue for the second quarter of 2020 exploded, up 40% to $88.9 billion. */}
          <Word start={48.38} end={55.08}>Their revenue for the second quarter of 2020 exploded, up 40% to $88.9 billion.</Word>
          {/* The pandemic was a tragedy for the world, but for Amazon's business model, it was the ultimate validation. */}
          <Word start={55.84} end={62.22}>The pandemic was a tragedy for the world, but for Amazon's business model, it was the ultimate validation.</Word>
          {/* Every bet they had ever made on logistics, on infrastructure, on long-term thinking, paid off in the moment the world needed it most. */}
          <Word start={62.80} end={70.40}>Every bet they had ever made on logistics, on infrastructure, on long-term thinking, paid off in the moment the world needed it most.</Word>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```