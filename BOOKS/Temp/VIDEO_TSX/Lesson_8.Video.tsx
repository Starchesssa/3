```tsx
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import React from 'react';

// Define the structure of a single word in the transcript
type Word = {
  text: string;
  start: number; // in seconds
  end: number; // in seconds
};

// --- Transcript Data ---
const transcript: Word[] = [
	{ text: 'Key', start: 0.00, end: 0.42 },
	{ text: 'lesson.', start: 0.42, end: 0.86 },
	{ text: 'Your', start: 1.38, end: 1.56 },
	{ text: 'system', start: 1.56, end: 2.06 },
	{ text: 'is', start: 2.06, end: 2.32 },
	{ text: 'only', start: 2.32, end: 2.76 },
	{ text: 'tested', start: 2.76, end: 3.26 },
	{ text: 'in', start: 3.26, end: 3.52 },
	{ text: 'a', start: 3.52, end: 3.62 },
	{ text: 'true', start: 3.62, end: 3.90 },
	{ text: 'crisis.', start: 3.90, end: 4.42 },
	{ text: 'Late', start: 5.26, end: 5.52 },
	{ text: '2019', start: 5.52, end: 6.26 },
	{ text: 'rolled', start: 6.26, end: 6.78 },
	{ text: 'into', start: 6.78, end: 7.12 },
	{ text: '2020,', start: 7.12, end: 7.72 },
	{ text: 'and', start: 7.92, end: 8.40 },
	{ text: 'the', start: 8.40, end: 8.66 },
	{ text: 'world', start: 8.66, end: 8.92 },
	{ text: 'stopped.', start: 8.92, end: 9.52 },
	{ text: 'A', start: 9.98, end: 10.14 },
	{ text: 'global', start: 10.14, end: 10.52 },
	{ text: 'pandemic', start: 10.52, end: 11.12 },
	{ text: 'called', start: 11.12, end: 11.46 },
	{ text: 'COVID', start: 11.46, end: 11.82 },
	{ text: '-19', start: 11.82, end: 12.36 },
	{ text: 'shut', start: 12.36, end: 12.78 },
	{ text: 'down', start: 12.78, end: 13.04 },
	{ text: 'everything.', start: 13.04, end: 13.76 },
	{ text: 'Stores', start: 14.28, end: 14.68 },
	{ text: 'closed,', start: 14.68, end: 15.02 },
	{ text: 'offices', start: 15.44, end: 15.82 },
	{ text: 'closed,', start: 15.82, end: 16.24 },
	{ text: 'people', start: 16.58, end: 16.90 },
	{ text: 'were', start: 16.90, end: 17.10 },
	{ text: 'locked', start: 17.10, end: 17.42 },
	{ text: 'in', start: 17.42, end: 17.66 },
	{ text: 'their', start: 17.66, end: 17.82 },
	{ text: 'homes.', start: 17.82, end: 18.16 },
	{ text: 'And', start: 18.68, end: 18.80 },
	{ text: 'suddenly,', start: 18.80, end: 19.28 },
	{ text: 'the', start: 19.62, end: 19.70 },
	{ text: 'machine', start: 19.70, end: 20.10 },
	{ text: 'that', start: 20.10, end: 20.40 },
	{ text: 'Amazon', start: 20.40, end: 20.70 },
	{ text: 'had', start: 20.70, end: 21.04 },
	{ text: 'been', start: 21.04, end: 21.20 },
	{ text: 'building', start: 21.20, end: 21.54 },
	{ text: 'for', start: 21.54, end: 21.78 },
	{ text: '25', start: 21.78, end: 22.38 },
	{ text: 'years', start: 22.38, end: 22.88 },
	{ text: 'was', start: 22.88, end: 23.26 },
	{ text: 'not', start: 23.26, end: 23.54 },
	{ text: 'just', start: 23.54, end: 23.86 },
	{ text: 'a', start: 23.86, end: 24.02 },
	{ text: 'convenience.', start: 24.02, end: 24.52 },
	{ text: 'It', start: 24.98, end: 25.12 },
	{ text: 'became', start: 25.12, end: 25.48 },
	{ text: 'essential', start: 25.48, end: 26.26 },
	{ text: 'infrastructure.', start: 26.26, end: 27.06 },
	{ text: 'The', start: 27.06, end: 27.70 },
	{ text: 'warehouses,', start: 27.70, end: 28.28 },
	{ text: 'the', start: 28.60, end: 28.64 },
	{ text: 'delivery', start: 28.64, end: 28.94 },
	{ text: 'trucks,', start: 28.94, end: 29.38 },
	{ text: 'the', start: 29.70, end: 29.78 },
	{ text: 'website,', start: 29.78, end: 30.24 },
	{ text: 'the', start: 30.52, end: 30.60 },
	{ text: 'cloud', start: 30.60, end: 30.90 },
	{ text: 'servers,', start: 30.90, end: 31.34 },
	{ text: 'powering', start: 31.58, end: 31.92 },
	{ text: 'Netflix', start: 31.92, end: 32.14 },
	{ text: 'and', start: 32.14, end: 32.58 },
	{ text: 'Zoom,', start: 32.58, end: 32.82 },
	{ text: 'it', start: 33.16, end: 33.36 },
	{ text: 'was', start: 33.36, end: 33.48 },
	{ text: 'all', start: 33.48, end: 33.84 },
	{ text: 'put', start: 33.84, end: 34.12 },
	{ text: 'to', start: 34.12, end: 34.38 },
	{ text: 'the', start: 34.38, end: 34.50 },
	{ text: 'ultimate', start: 34.50, end: 34.94 },
	{ text: 'test.', start: 34.94, end: 35.48 },
	{ text: 'The', start: 35.84, end: 36.08 },
	{ text: 'system', start: 36.08, end: 36.50 },
	{ text: 'strained,', start: 36.50, end: 37.14 },
	{ text: 'delivery', start: 37.44, end: 37.74 },
	{ text: 'time', start: 37.74, end: 38.04 },
	{ text: 'slipped,', start: 38.04, end: 38.44 },
	{ text: 'but', start: 38.80, end: 38.94 },
	{ text: 'it', start: 38.94, end: 39.08 },
	{ text: 'did', start: 39.08, end: 39.24 },
	{ text: 'not', start: 39.24, end: 39.56 },
	{ text: 'break.', start: 39.56, end: 39.92 },
	{ text: 'While', start: 40.48, end: 40.70 },
	{ text: 'other', start: 40.70, end: 41.00 },
	{ text: 'businesses', start: 41.00, end: 41.50 },
	{ text: 'collapsed,', start: 41.50, end: 42.02 },
	{ text: 'Amazon', start: 42.48, end: 42.72 },
	{ text: 'hired.', start: 42.72, end: 43.24 },
	{ text: 'They', start: 43.62, end: 43.86 },
	{ text: 'hired', start: 43.86, end: 44.14 },
	{ text: '175', start: 44.14, end: 45.14 },
	{ text: ',000', start: 45.14, end: 46.02 },
	{ text: 'new', start: 46.02, end: 46.26 },
	{ text: 'workers', start: 46.26, end: 46.58 },
	{ text: 'in', start: 46.58, end: 46.84 },
	{ text: 'just', start: 46.84, end: 47.12 },
	{ text: 'a', start: 47.12, end: 47.36 },
	{ text: 'few', start: 47.36, end: 47.48 },
	{ text: 'months.', start: 47.48, end: 47.82 },
	{ text: 'Their', start: 48.38, end: 48.56 },
	{ text: 'revenue', start: 48.56, end: 48.98 },
	{ text: 'for', start: 48.98, end: 49.22 },
	{ text: 'the', start: 49.22, end: 49.32 },
	{ text: 'second', start: 49.32, end: 49.64 },
	{ text: 'quarter', start: 49.64, end: 50.02 },
	{ text: 'of', start: 50.02, end: 50.18 },
	{ text: '2020', start: 50.18, end: 50.70 },
	{ text: 'exploded,', start: 50.70, end: 51.78 },
	{ text: 'up', start: 52.08, end: 52.28 },
	{ text: '40', start: 52.28, end: 52.74 },
	{ text: '%', start: 52.74, end: 53.10 },
	{ text: 'to', start: 53.10, end: 53.44 },
	{ text: '$88', start: 53.44, end: 53.96 },
	{ text: '.9', start: 53.96, end: 54.60 },
	{ text: 'billion.', start: 54.60, end: 55.08 },
	{ text: 'The', start: 55.84, end: 56.36 },
	{ text: 'pandemic', start: 56.36, end: 56.88 },
	{ text: 'was', start: 56.88, end: 57.18 },
	{ text: 'a', start: 57.18, end: 57.30 },
	{ text: 'tragedy', start: 57.30, end: 57.74 },
	{ text: 'for', start: 57.74, end: 58.00 },
	{ text: 'the', start: 58.00, end: 58.12 },
	{ text: 'world,', start: 58.12, end: 58.42 },
	{ text: 'but', start: 58.66, end: 58.88 },
	{ text: 'for', start: 58.88, end: 59.06 },
	{ text: 'Amazon\'s', start: 59.06, end: 59.68 },
	{ text: 'business', start: 59.68, end: 59.94 },
	{ text: 'model,', start: 59.94, end: 60.32 },
	{ text: 'it', start: 60.52, end: 60.70 },
	{ text: 'was', start: 60.70, end: 60.84 },
	{ text: 'the', start: 60.84, end: 61.02 },
	{ text: 'ultimate', start: 61.02, end: 61.52 },
	{ text: 'validation.', start: 61.52, end: 62.22 },
	{ text: 'Every', start: 62.80, end: 63.20 },
	{ text: 'bet', start: 63.20, end: 63.46 },
	{ text: 'they', start: 63.46, end: 63.66 },
	{ text: 'had', start: 63.66, end: 63.82 },
	{ text: 'ever', start: 63.82, end: 64.18 },
	{ text: 'made', start: 64.18, end: 64.44 },
	{ text: 'on', start: 64.44, end: 64.60 },
	{ text: 'logistics,', start: 64.60, end: 65.10 },
	{ text: 'on', start: 65.42, end: 65.52 },
	{ text: 'infrastructure,', start: 65.52, end: 66.08 },
	{ text: 'on', start: 66.50, end: 66.62 },
	{ text: 'long', start: 66.62, end: 66.88 },
	{ text: '-term', start: 66.88, end: 67.12 },
	{ text: 'thinking,', start: 67.12, end: 67.58 },
	{ text: 'paid', start: 67.98, end: 68.12 },
	{ text: 'off', start: 68.12, end: 68.46 },
	{ text: 'in', start: 68.46, end: 68.68 },
	{ text: 'the', start: 68.68, end: 68.78 },
	{ text: 'moment', start: 68.78, end: 69.10 },
	{ text: 'the', start: 69.10, end: 69.32 },
	{ text: 'world', start: 69.32, end: 69.60 },
	{ text: 'needed', start: 69.60, end: 69.96 },
	{ text: 'it', start: 69.96, end: 70.14 },
	{ text: 'most.', start: 70.14, end: 70.40 },
];

// --- Helper Components ---

// Component for a single animated word
const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const startFrame = word.start * fps;
  const endFrame = word.end * fps;

  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 6, endFrame - 6, endFrame],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [startFrame, startFrame + 6],
    [10, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
  );

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translateY(${translateY}px)`,
        marginRight: '12px',
        fontSize: '60px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '0 0 15px rgba(255, 255, 255, 0.7)',
      }}
    >
      {word.text}
    </span>
  );
};

// Component for a parallax scene
interface ParallaxSceneProps {
  bgImage: string;
  midImage?: string;
  fgImage?: string;
  children?: React.ReactNode;
}
const ParallaxScene: React.FC<ParallaxSceneProps> = ({ bgImage, midImage, fgImage, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sceneProgress = frame / durationInFrames; // Scene progress from 0 to 1

  const bgScale = 1 + sceneProgress * 0.15;
  const bgTranslateX = -sceneProgress * 150;

  const midScale = 1 + sceneProgress * 0.1;
  const midTranslateX = -sceneProgress * 100;
  
  const fgScale = 1 + sceneProgress * 0.05;
  const fgTranslateX = -sceneProgress * 50;

  const imageStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  return (
    <AbsoluteFill>
      <img
        src={`assets/images/${bgImage}`}
        style={{
          ...imageStyle,
          transform: `scale(${bgScale}) translateX(${bgTranslateX}px)`,
        }}
      />
      {midImage && (
        <img
          src={`assets/images/${midImage}`}
          style={{
            ...imageStyle,
            transform: `scale(${midScale}) translateX(${midTranslateX}px)`,
          }}
        />
      )}
      {fgImage && (
        <img
          src={`assets/images/${fgImage}`}
          style={{
            ...imageStyle,
            transform: `scale(${fgScale}) translateX(${fgTranslateX}px)`,
          }}
        />
      )}
      {children}
    </AbsoluteFill>
  );
};

// Component for global visual effects
const EffectsOverlay: React.FC = () => {
    const frame = useCurrentFrame();
    const dustOpacity = 0.15;
    const dustTranslateY = - (frame * 0.5) % 1080;
    return(
        <AbsoluteFill>
            {/* Vignette */}
            <AbsoluteFill style={{boxShadow: 'inset 0 0 150px 20px rgba(0,0,0,0.8)'}} />
            
            {/* Dust Particles Overlay */}
            {/*
              dust_overlay.png: A tileable, transparent PNG with small white specks
              to simulate dust particles floating in the air.
            */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '200%', // Taller to allow for vertical movement
                backgroundImage: `url(assets/images/dust_overlay.png)`,
                backgroundRepeat: 'repeat',
                opacity: dustOpacity,
                transform: `translateY(${dustTranslateY}px)`,
            }} />
        </AbsoluteFill>
    )
}

// --- Main Video Component ---
export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Master camera movement for the entire video
  const globalScale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
  const globalTranslateX = interpolate(frame, [0, durationInFrames], [0, -100]);
  const globalTranslateY = interpolate(frame, [0, durationInFrames], [0, 50]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <div
        style={{
          transform: `scale(${globalScale}) translateX(${globalTranslateX}px) translateY(${globalTranslateY}px)`,
          width: '100%',
          height: '100%',
        }}
      >
        {/* Each Sequence represents a different sentence or thematic idea */}
        
        {/* 0.00s -> 5.26s: "Key lesson. Your system is only tested in a true crisis." */}
        <Sequence from={0} durationInFrames={158}>
          <ParallaxScene 
            // A dark, abstract image of a storm or turbulent waves, representing crisis.
            bgImage="crisis_background.jpg"
            // A semi-transparent overlay of complex, glowing digital schematics, representing a system.
            midImage="system_schematic.jpg"
            // A single, glowing gear under stress, appearing slightly cracked.
            fgImage="stressed_gear.jpg"
          />
        </Sequence>

        {/* 5.26s -> 9.98s: "Late 2019 rolled into 2020, and the world stopped." */}
        <Sequence from={158} durationInFrames={142}>
           <ParallaxScene 
            // A view of the earth from space with city lights.
            bgImage="earth_at_night.jpg"
            // A transparent overlay of a digital calendar flipping from 2019 to 2020, with motion blur.
            midImage="calendar_flip.jpg"
            // A subtle radial blur effect applied from the center, as if motion is ceasing.
            fgImage="motion_stop_effect.jpg"
          />
        </Sequence>

        {/* 9.98s -> 14.28s: "A global pandemic called COVID-19 shut down everything." */}
        <Sequence from={299} durationInFrames={130}>
           <ParallaxScene 
            // A dark, blurred image of a microscopic virus structure.
            bgImage="virus_abstract.jpg"
            // An image of a major city landmark (e.g., Times Square) completely deserted.
            midImage="empty_city.jpg"
            // A bold, red "CLOSED" sign overlay, slightly out of focus.
            fgImage="closed_sign.jpg"
          />
        </Sequence>

        {/* 14.28s -> 18.68s: "Stores closed, offices closed, people were locked in their homes." */}
        <Sequence from={428} durationInFrames={132}>
           <ParallaxScene 
            // A view from inside a home, looking out a rain-streaked window.
            bgImage="window_view.jpg"
            // An empty office building at night with dark windows.
            midImage="dark_office.jpg"
            // A close-up of a lock on a door.
            fgImage="door_lock.jpg"
          />
        </Sequence>
        
        {/* 18.68s -> 27.06s: "...the machine that Amazon had been building...became essential infrastructure." */}
        <Sequence from={560} durationInFrames={252}>
           <ParallaxScene 
            // A high-tech, futuristic blueprint background.
            bgImage="blueprint_background.jpg"
            // A wide shot of the interior of a massive, modern Amazon fulfillment center.
            midImage="amazon_warehouse.jpg"
            // A glowing network of lines connecting points on a map, symbolizing logistics.
            fgImage="logistics_network.jpg"
          />
        </Sequence>
        
        {/* 27.06s -> 35.84s: "The warehouses, the delivery trucks...put to the ultimate test." */}
        <Sequence from={812} durationInFrames={263}>
           <ParallaxScene 
            // A vast server farm with blinking lights (representing AWS).
            bgImage="server_farm.jpg"
            // A fleet of Amazon delivery trucks on a highway at dusk.
            midImage="delivery_trucks.jpg"
            // A motion-blurred image of a conveyor belt with packages moving at high speed.
            fgImage="conveyor_belt.jpg"
          />
        </Sequence>

        {/* 35.84s -> 40.48s: "The system strained...but it did not break." */}
        <Sequence from={1075} durationInFrames={139}>
           <ParallaxScene 
            // An industrial background with sparks flying, suggesting intense pressure.
            bgImage="industrial_pressure.jpg"
            // A massive, intricate machine operating at full capacity.
            midImage="machine_operating.jpg"
            // A central metal component glowing hot but remaining intact and strong.
            fgImage="strong_component.jpg"
          />
        </Sequence>

        {/* 40.48s -> 48.38s: "While other businesses collapsed, Amazon hired... 175,000 new workers" */}
        <Sequence from={1214} durationInFrames={237}>
           <ParallaxScene 
            // A background of crumbling, faded storefronts.
            bgImage="collapsed_businesses.jpg"
            // A brightly lit, modern Amazon facility under construction, symbolizing growth.
            midImage="amazon_construction.jpg"
            // A silhouette of a large crowd of people, representing the new workforce.
            fgImage="workforce_silhouette.jpg"
          />
        </Sequence>

        {/* 48.38s -> 55.84s: "Their revenue... exploded, up 40% to $88.9 billion." */}
        <Sequence from={1451} durationInFrames={224}>
           <ParallaxScene 
            // A dark digital grid background.
            bgImage="digital_grid.jpg"
            // A glowing, steep upward-trending financial chart line.
            midImage="revenue_chart.jpg"
            // Abstract numbers and dollar signs flying towards the camera.
            fgImage="flying_numbers.jpg"
          />
        </Sequence>

        {/* 55.84s -> 71.00s: "The pandemic was a tragedy... it was the ultimate validation... paid off" */}
        <Sequence from={1675}>
           <ParallaxScene 
            // A hopeful sunrise over a quiet, peaceful city.
            bgImage="city_sunrise.jpg"
            // A globe with glowing lines of connection, showing packages moving worldwide.
            midImage="global_connections.jpg"
            // A warm, inviting front porch with a person safely receiving a package.
            fgImage="package_delivery.jpg"
          />
        </Sequence>

      </div>
      
      <EffectsOverlay />

      {/* Text Layer */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 100px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            lineHeight: '1.4',
          }}
        >
          {transcript.map((word, i) => (
            <WordComponent key={i} word={word} />
          ))}
        </div>
      </AbsoluteFill>

      {/* Audio */}
      <Audio src={'BOOKS/Temp/TTS/Lesson_8.wav'} />
    </AbsoluteFill>
  );
};
```