```tsx
import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

// --- Data: Transcript and Configuration ---

const transcript = [
	{ text: 'Key', start: 0.0, end: 0.42 },
	{ text: 'lesson,', start: 0.42, end: 0.82 },
	{ text: 'while', start: 1.26, end: 1.46 },
	{ text: 'others', start: 1.46, end: 1.82 },
	{ text: 'retreat,', start: 1.82, end: 2.3 },
	{ text: 'you', start: 2.78, end: 2.9 },
	{ text: 'attack.', start: 2.9, end: 3.4 },
	{ text: 'The', start: 4.06, end: 4.34 },
	{ text: 'year', start: 4.34, end: 4.64 },
	{ text: 'is', start: 4.64, end: 4.86 },
	{ text: '2008.', start: 4.86, end: 5.66 },
	{ text: 'The', start: 6.16, end: 6.22 },
	{ text: 'global', start: 6.22, end: 6.54 },
	{ text: 'financial', start: 6.54, end: 6.98 },
	{ text: 'system', start: 6.98, end: 7.56 },
	{ text: 'is', start: 7.56, end: 7.78 },
	{ text: 'collapsing.', start: 7.78, end: 8.4 },
	{ text: 'Lehman', start: 9.02, end: 9.26 },
	{ text: 'Brothers', start: 9.26, end: 9.52 },
	{ text: 'is', start: 9.52, end: 9.82 },
	{ text: 'gone.', start: 9.82, end: 10.12 },
	{ text: 'The', start: 10.74, end: 10.84 },
	{ text: 'entire', start: 10.84, end: 11.32 },
	{ text: 'economy', start: 11.32, end: 11.88 },
	{ text: 'isn\'t', start: 11.88, end: 12.2 },
	{ text: 'a', start: 12.2, end: 12.26 },
	{ text: 'free', start: 12.26, end: 12.54 },
	{ text: 'fall.', start: 12.54, end: 12.76 },
	{ text: 'Businesses', start: 13.36, end: 13.86 },
	{ text: 'are', start: 13.86, end: 14.0 },
	{ text: 'laying', start: 14.0, end: 14.22 },
	{ text: 'people', start: 14.22, end: 14.56 },
	{ text: 'off.', start: 14.56, end: 14.84 },
	{ text: 'They', start: 15.2, end: 15.3 },
	{ text: 'are', start: 15.3, end: 15.4 },
	{ text: 'canceling', start: 15.4, end: 15.94 },
	{ text: 'projects.', start: 15.94, end: 16.36 },
	{ text: 'They', start: 16.76, end: 16.88 },
	{ text: 'are', start: 16.88, end: 17.0 },
	{ text: 'hoarding', start: 17.0, end: 17.52 },
	{ text: 'cash.', start: 17.52, end: 17.78 },
	{ text: 'Survival', start: 18.26, end: 18.82 },
	{ text: 'mode.', start: 18.82, end: 19.06 },
	{ text: 'What', start: 19.6, end: 19.84 },
	{ text: 'does', start: 19.84, end: 20.04 },
	{ text: 'Amazon', start: 20.04, end: 20.26 },
	{ text: 'do?', start: 20.26, end: 20.66 },
	{ text: 'They', start: 21.1, end: 21.24 },
	{ text: 'push', start: 21.24, end: 21.46 },
	{ text: 'forward', start: 21.46, end: 21.92 },
	{ text: 'with', start: 21.92, end: 22.12 },
	{ text: 'one', start: 22.12, end: 22.3 },
	{ text: 'of', start: 22.3, end: 22.4 },
	{ text: 'their', start: 22.4, end: 22.54 },
	{ text: 'strangest', start: 22.54, end: 23.22 },
	{ text: 'and', start: 23.22, end: 23.42 },
	{ text: 'most', start: 23.42, end: 23.7 },
	{ text: 'ambitious', start: 23.7, end: 24.16 },
	{ text: 'products', start: 24.16, end: 24.62 },
	{ text: 'yet.', start: 24.62, end: 24.96 },
	{ text: 'The', start: 25.4, end: 25.52 },
	{ text: 'Kindle,', start: 25.52, end: 26.0 },
	{ text: 'an', start: 26.32, end: 26.46 },
	{ text: 'electronic', start: 26.46, end: 26.92 },
	{ text: 'book', start: 26.92, end: 27.28 },
	{ text: 'reader.', start: 27.28, end: 27.6 },
	{ text: 'In', start: 27.94, end: 28.26 },
	{ text: 'the', start: 28.26, end: 28.38 },
	{ text: 'middle', start: 28.38, end: 28.68 },
	{ text: 'of', start: 28.68, end: 28.88 },
	{ text: 'a', start: 28.88, end: 28.98 },
	{ text: 'historic', start: 28.98, end: 29.5 },
	{ text: 'recession,', start: 29.5, end: 30.06 },
	{ text: 'they', start: 30.48, end: 30.58 },
	{ text: 'were', start: 30.58, end: 30.7 },
	{ text: 'trying', start: 30.7, end: 30.94 },
	{ text: 'to', start: 30.94, end: 31.1 },
	{ text: 'change', start: 31.1, end: 31.44 },
	{ text: 'how', start: 31.44, end: 31.64 },
	{ text: 'humanity', start: 31.64, end: 32.1 },
	{ text: 'had', start: 32.1, end: 32.48 },
	{ text: 'read', start: 32.48, end: 32.64 },
	{ text: 'books', start: 32.64, end: 32.96 },
	{ text: 'for', start: 32.96, end: 33.22 },
	{ text: 'over', start: 33.22, end: 33.5 },
	{ text: '500', start: 33.5, end: 34.12 },
	{ text: 'years.', start: 34.12, end: 34.62 },
	{ text: 'They', start: 34.94, end: 35.3 },
	{ text: 'were', start: 35.3, end: 35.42 },
	{ text: 'building', start: 35.42, end: 35.72 },
	{ text: 'new', start: 35.72, end: 35.94 },
	{ text: 'hardware.', start: 35.94, end: 36.34 },
	{ text: 'They', start: 36.78, end: 36.86 },
	{ text: 'were', start: 36.86, end: 36.98 },
	{ text: 'fighting', start: 36.98, end: 37.3 },
	{ text: 'with', start: 37.3, end: 37.54 },
	{ text: 'publishers.', start: 37.54, end: 37.98 },
	{ text: 'They', start: 38.46, end: 38.66 },
	{ text: 'were', start: 38.66, end: 38.8 },
	{ text: 'investing', start: 38.8, end: 39.28 },
	{ text: 'hundreds', start: 39.28, end: 39.78 },
	{ text: 'of', start: 39.78, end: 40.02 },
	{ text: 'millions', start: 40.02, end: 40.4 },
	{ text: 'of', start: 40.4, end: 40.66 },
	{ text: 'dollars', start: 40.66, end: 40.96 },
	{ text: 'while', start: 40.96, end: 41.3 },
	{ text: 'other', start: 41.3, end: 41.62 },
	{ text: 'companies', start: 41.62, end: 42.0 },
	{ text: 'were', start: 42.0, end: 42.2 },
	{ text: 'fighting', start: 42.2, end: 42.56 },
	{ text: 'for', start: 42.56, end: 42.78 },
	{ text: 'their', start: 42.78, end: 42.92 },
	{ text: 'lives.', start: 42.92, end: 43.38 },
	{ text: 'Recessions', start: 44.02, end: 44.56 },
	{ text: 'are', start: 44.56, end: 44.76 },
	{ text: 'a', start: 44.76, end: 44.86 },
	{ text: 'clearing', start: 44.86, end: 45.14 },
	{ text: 'event.', start: 45.14, end: 45.62 },
	{ text: 'The', start: 46.02, end: 46.08 },
	{ text: 'week', start: 46.08, end: 46.32 },
	{ text: 'get', start: 46.32, end: 46.62 },
	{ text: 'wiped', start: 46.62, end: 46.84 },
	{ text: 'out.', start: 46.84, end: 47.18 },
	{ text: 'The', start: 47.52, end: 47.62 },
	{ text: 'strong', start: 47.62, end: 47.98 },
	{ text: 'get', start: 47.98, end: 48.36 },
	{ text: 'stronger.', start: 48.36, end: 48.84 },
	{ text: 'Amazon', start: 49.46, end: 49.72 },
	{ text: 'used', start: 49.72, end: 50.18 },
	{ text: 'the', start: 50.18, end: 50.38 },
	{ text: '2008', start: 50.38, end: 50.98 },
	{ text: 'crisis', start: 50.98, end: 51.36 },
	{ text: 'to', start: 51.36, end: 51.72 },
	{ text: 'grab', start: 51.72, end: 52.0 },
	{ text: 'market', start: 52.0, end: 52.4 },
	{ text: 'share', start: 52.4, end: 52.66 },
	{ text: 'and', start: 52.66, end: 52.92 },
	{ text: 'create', start: 52.92, end: 53.22 },
	{ text: 'a', start: 53.22, end: 53.42 },
	{ text: 'brand', start: 53.42, end: 53.72 },
	{ text: 'new', start: 53.72, end: 54.0 },
	{ text: 'ecosystem', start: 54.0, end: 54.64 },
	{ text: 'around', start: 54.64, end: 55.04 },
	{ text: 'digital', start: 55.04, end: 55.42 },
	{ text: 'books.', start: 55.42, end: 55.88 },
	{ text: 'While', start: 56.29, end: 56.56 },
	{ text: 'everyone', start: 56.56, end: 57.04 },
	{ text: 'else', start: 57.04, end: 57.32 },
	{ text: 'was', start: 57.32, end: 57.48 },
	{ text: 'looking', start: 57.48, end: 57.76 },
	{ text: 'at', start: 57.76, end: 57.92 },
	{ text: 'their', start: 57.92, end: 58.06 },
	{ text: 'feet,', start: 58.06, end: 58.32 },
	{ text: 'they', start: 58.74, end: 58.84 },
	{ text: 'were', start: 58.84, end: 58.98 },
	{ text: 'looking', start: 58.98, end: 59.26 },
	{ text: 'at', start: 59.26, end: 59.5 },
	{ text: 'the', start: 59.5, end: 59.68 },
	{ text: 'horizon.', start: 59.68, end: 60.1 },
];

const VIDEO_FPS = 30;
const VIDEO_DURATION_SEC = 61;
const VIDEO_DURATION_FRAMES = VIDEO_DURATION_SEC * VIDEO_FPS;

const secToFrames = (sec: number) => sec * VIDEO_FPS;

// --- Helper Components ---

// Word Component: Animates a single word
const Word: React.FC<{ text: string; start: number; end: number }> = ({
  text,
  start,
  end,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [secToFrames(start), secToFrames(start) + 5, secToFrames(end) - 5, secToFrames(end)],
    [0, 1, 1, 0]
  );

  return (
    <span style={{ opacity, marginRight: '1vw' }}>
      {text}
    </span>
  );
};

// Subtitles Component: Renders all words
const Subtitles: React.FC = () => {
  return (
    <AbsoluteFill style={{ bottom: '10%', justifyContent: 'center', alignItems: 'center' }}>
      <p style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '5vw',
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        textShadow: '0 0 15px rgba(0,0,0,0.7)',
        lineHeight: '1.2',
        padding: '0 5%',
      }}>
        {transcript.map((word, i) => (
          <Word key={i} text={word.text} start={word.start} end={word.end} />
        ))}
      </p>
    </AbsoluteFill>
  );
};

// --- Scene Components ---

// Scene 1: Intro - Attack vs Retreat (0 - 4s)
const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Camera: Slow push-in
	const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);
	// Parallax: Advancing figure moves faster
	const advanceTranslateY = interpolate(frame, [0, durationInFrames], [0, -50]);
	const retreatTranslateY = interpolate(frame, [0, durationInFrames], [0, 50]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	const containerStyle: React.CSSProperties = {
		transform: `scale(${cameraZoom})`,
		opacity,
	};
	const retreatingStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: 0.4,
		transform: `translateY(${retreatTranslateY}px)`,
	};
	const advancingStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `translateY(${advanceTranslateY}px)`,
		filter: 'brightness(1.2)',
	};

	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene1-bg-dark.jpg - A dark, moody, textured background */}
			<Img src={staticFile('images/scene1-bg-dark.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			{/* Image name: scene1-retreating.png - Semi-transparent figures moving away */}
			<Img src={staticFile('images/scene1-retreating.png')} style={retreatingStyle} />
			{/* Image name: scene1-advancing.png - A single focused chess piece moving forward */}
			<Img src={staticFile('images/scene1-advancing.png')} style={advancingStyle} />
		</AbsoluteFill>
	);
};

// Scene 2: 2008 Crisis (4s - 9s)
const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Dolly Zoom effect
	const scale = interpolate(frame, [0, durationInFrames], [1, 1.3]);
	const translateY = interpolate(frame, [0, durationInFrames], [0, -100]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);
	
	const containerStyle: React.CSSProperties = {
		transform: `translateY(${translateY}px) scale(${scale})`,
		opacity,
	};
	const graphOpacity = interpolate(frame, [15, 45], [0, 0.7], { extrapolateRight: 'clamp' });
	const graphStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: graphOpacity,
		mixBlendMode: 'screen',
	};

	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene2-wall-street.jpg - Dramatic, desaturated photo of a financial district building */}
			<Img src={staticFile('images/scene2-wall-street.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			{/* Image name: scene2-graph-overlay.png - A red, glowing, falling stock chart */}
			<Img src={staticFile('images/scene2-graph-overlay.png')} style={graphStyle} />
		</AbsoluteFill>
	);
};

// Scene 3: The Aftermath (9s - 13s)
const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Camera: Slow pan and rotate for disorientation
	const translateX = interpolate(frame, [0, durationInFrames], [-50, 50]);
	const rotate = interpolate(frame, [0, durationInFrames], [-2, 2]);
	const scale = interpolate(frame, [0, durationInFrames], [1.1, 1.2]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	const containerStyle: React.CSSProperties = {
		transform: `translateX(${translateX}px) rotate(${rotate}deg) scale(${scale})`,
		opacity,
	};
	const paperTranslateX = interpolate(frame, [0, durationInFrames], [-200, 200]);
	const paperRotate = interpolate(frame, [0, durationInFrames], [-20, 20]);
	const paperStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `translateX(${paperTranslateX}px) rotate(${paperRotate}deg)`,
		opacity: 0.5,
	};

	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene3-empty-office.jpg - Bleak, empty office interior */}
			<Img src={staticFile('images/scene3-empty-office.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			{/* Image name: scene3-flying-papers.png - Scattered papers with transparency */}
			<Img src={staticFile('images/scene3-flying-papers.png')} style={paperStyle} />
		</AbsoluteFill>
	);
};

// Scene 4: Survival Mode (13s - 19.5s)
const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	
	const scale = interpolate(frame, [0, durationInFrames], [1, 1.2]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	const blueprintOpacity = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' });
	const blueprintTranslateY = interpolate(frame, [0, durationInFrames], [50, -50]);

	const containerStyle: React.CSSProperties = { transform: `scale(${scale})`, opacity };
	const blueprintStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		position: 'absolute',
		opacity: blueprintOpacity,
		transform: `translateY(${blueprintTranslateY}px) scale(0.8)`,
	};
	
	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene4-bank-vault.jpg - A heavy, imposing bank vault door */}
			<Img src={staticFile('images/scene4-bank-vault.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.5)' }} />
			{/* Image name: scene4-blueprints.png - Blueprints with "CANCELLED" stamp */}
			<Img src={staticFile('images/scene4-blueprints.png')} style={blueprintStyle} />
		</AbsoluteFill>
	);
};

// Scene 5: Amazon's Move (19.5s - 28s)
const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1.3, 1]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);
	
	// Reveal effect
	const lightRayOpacity = interpolate(frame, [0, durationInFrames / 2], [0, 0.5], { extrapolateRight: 'clamp', easing: Easing.ease });
	const blueprintOpacity = interpolate(frame, [15, 60], [0, 1], { extrapolateRight: 'clamp' });
	const blueprintScale = interpolate(frame, [15, durationInFrames], [0.8, 1]);

	const containerStyle: React.CSSProperties = { transform: `scale(${scale})`, opacity };
	const lightRayStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', opacity: lightRayOpacity, mixBlendMode: 'screen' };
	const blueprintStyle: React.CSSProperties = { 
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		opacity: blueprintOpacity,
		transform: `scale(${blueprintScale})`,
		filter: 'drop-shadow(0 0 20px #aed6f1)', // Subtle glow
	};

	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene5-workshop.jpg - Dark workshop background suggesting innovation */}
			<Img src={staticFile('images/scene5-workshop.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			{/* Image name: scene5-light-rays.png - Light rays for reveal effect */}
			<Img src={staticFile('images/scene5-light-rays.png')} style={lightRayStyle} />
			{/* Image name: scene5-kindle-blueprint.png - Glowing schematic of the Kindle */}
			<Img src={staticFile('images/scene5-kindle-blueprint.png')} style={blueprintStyle} />
		</AbsoluteFill>
	);
};

// Scene 6: Changing History (28s - 35s)
const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1, 1.1]);
	const translateX = interpolate(frame, [0, durationInFrames], [-20, 20]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	const kindleOpacity = interpolate(frame, [durationInFrames * 0.2, durationInFrames * 0.5], [0, 1], { extrapolateRight: 'clamp' });
	const kindleTranslateX = interpolate(frame, [0, durationInFrames], [100, -100]);
	
	const containerStyle: React.CSSProperties = { transform: `scale(${scale}) translateX(${translateX}px)`, opacity };
	const kindleStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		position: 'absolute',
		transform: `translateX(${kindleTranslateX}px) scale(0.6)`,
		opacity: kindleOpacity,
	};
	
	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene6-old-library.jpg - A grand, classic library */}
			<Img src={staticFile('images/scene6-old-library.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />
			{/* Image name: scene6-kindle-in-hand.png - A clean shot of a hand holding a Kindle */}
			<Img src={staticFile('images/scene6-kindle-in-hand.png')} style={kindleStyle} />
		</AbsoluteFill>
	);
};


// Scene 7: Investment & Risk (35s - 44s)
const Scene7: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1.2, 1]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	const boatTranslateX = interpolate(frame, [0, durationInFrames], [-20, 20]);
	const boatTranslateY = interpolate(frame, [0, durationInFrames / 2, durationInFrames], [0, -10, 0], { easing: Easing.sin });
	const circuitryOpacity = interpolate(frame, [30, 90], [0, 0.4]);

	const containerStyle: React.CSSProperties = { transform: `scale(${scale})`, opacity };
	const boatStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		transform: `translateX(${boatTranslateX}px) translateY(${boatTranslateY}px) scale(0.5)`,
		opacity: 0.9,
	};
	const circuitryStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		mixBlendMode: 'screen',
		opacity: circuitryOpacity,
	};

	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene7-stormy-sea.jpg - Background of a rough sea under dark clouds */}
			<Img src={staticFile('images/scene7-stormy-sea.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			{/* Image name: scene7-struggling-boat.png - A small boat being tossed by waves */}
			<Img src={staticFile('images/scene7-struggling-boat.png')} style={boatStyle} />
			{/* Image name: scene7-circuitry.png - Intricate, glowing pattern of circuit board traces */}
			<Img src={staticFile('images/scene7-circuitry.png')} style={circuitryStyle} />
		</AbsoluteFill>
	);
};

// Scene 8: Creative Destruction (44s - 49s)
const Scene8: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	
	const zoom = interpolate(frame, [0, durationInFrames], [1.3, 1]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	const saplingOpacity = interpolate(frame, [durationInFrames * 0.3, durationInFrames * 0.7], [0, 1]);
	const saplingScale = interpolate(frame, [0, durationInFrames], [0.8, 1]);

	const containerStyle: React.CSSProperties = { opacity };
	const backgroundStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${zoom})`,
	};
	const saplingStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		opacity: saplingOpacity,
		transform: `scale(${saplingScale})`,
		filter: 'drop-shadow(0 0 15px #90ee90)', // Green glow
	};

	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene8-burnt-forest.jpg - Landscape of a forest after a fire */}
			<Img src={staticFile('images/scene8-burnt-forest.jpg')} style={backgroundStyle} />
			{/* Image name: scene8-sapling.png - A single, bright green sapling */}
			<Img src={staticFile('images/scene8-sapling.png')} style={saplingStyle} />
		</AbsoluteFill>
	);
};

// Scene 9: Market Domination (49s - 56s)
const Scene9: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Pull back camera effect
	const scale = interpolate(frame, [0, durationInFrames], [1.5, 1]);
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);
	
	const nodesOpacity = interpolate(frame, [30, durationInFrames], [0, 0.8]);
	const nodesScale = interpolate(frame, [30, durationInFrames], [0.5, 1]);

	const containerStyle: React.CSSProperties = { transform: `scale(${scale})`, opacity };
	const kindleIconStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		transform: 'scale(0.2)',
	};
	const nodesStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: nodesOpacity,
		transform: `scale(${nodesScale})`,
	};

	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene9-network-bg.jpg - Abstract tech background with glowing nodes */}
			<Img src={staticFile('images/scene9-network-bg.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			{/* Image name: scene9-ecosystem-nodes.png - Icons connected by lines */}
			<Img src={staticFile('images/scene9-ecosystem-nodes.png')} style={nodesStyle} />
			{/* Image name: scene9-kindle-icon.png - Central Kindle icon */}
			<Img src={staticFile('images/scene9-kindle-icon.png')} style={kindleIconStyle} />
		</AbsoluteFill>
	);
};


// Scene 10: The Horizon (56s - 61s)
const Scene10: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Camera tilt up reveal
	const translateY = interpolate(frame, [0, durationInFrames], [200, -100], { easing: Easing.bezier(0.5, 0, 0.5, 1) });
	const scale = interpolate(frame, [0, durationInFrames], [1.2, 1]);
	const opacity = interpolate(frame, [0, 15], [0, 1]);

	const crackedEarthOpacity = interpolate(frame, [0, durationInFrames / 2], [0.8, 0], { easing: Easing.ease });

	const containerStyle: React.CSSProperties = {
		transform: `translateY(${translateY}px) scale(${scale})`,
		opacity,
	};
	const earthStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		position: 'absolute',
		bottom: '-30%', // Position it at the bottom
		opacity: crackedEarthOpacity,
	};
	
	return (
		<AbsoluteFill style={containerStyle}>
			{/* Image name: scene10-sunrise-horizon.jpg - Stunning, wide-shot of a sunrise */}
			<Img src={staticFile('images/scene10-sunrise-horizon.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			{/* Image name: scene10-cracked-earth.png - Foreground layer of dry, cracked ground */}
			<Img src={staticFile('images/scene10-cracked-earth.png')} style={earthStyle} />
		</AbsoluteFill>
	);
};


// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="StorytellingVideo"
        component={Main}
        durationInFrames={VIDEO_DURATION_FRAMES}
        fps={VIDEO_FPS}
        width={3840}
        height={2160}
      />
    </>
  );
};

const Main: React.FC = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_5.wav')} />
			
			<Sequence from={0} durationInFrames={secToFrames(4)}>
				<Scene1 />
			</Sequence>
			<Sequence from={secToFrames(4)} durationInFrames={secToFrames(5)}>
				<Scene2 />
			</Sequence>
			<Sequence from={secToFrames(9)} durationInFrames={secToFrames(4)}>
				<Scene3 />
			</Sequence>
			<Sequence from={secToFrames(13)} durationInFrames={secToFrames(6.5)}>
				<Scene4 />
			</Sequence>
			<Sequence from={secToFrames(19.5)} durationInFrames={secToFrames(8.5)}>
				<Scene5 />
			</Sequence>
			<Sequence from={secToFrames(28)} durationInFrames={secToFrames(7)}>
				<Scene6 />
			</Sequence>
			<Sequence from={secToFrames(35)} durationInFrames={secToFrames(9)}>
				<Scene7 />
			</Sequence>
			<Sequence from={secToFrames(44)} durationInFrames={secToFrames(5)}>
				<Scene8 />
			</Sequence>
			<Sequence from={secToFrames(49)} durationInFrames={secToFrames(7)}>
				<Scene9 />
			</Sequence>
			<Sequence from={secToFrames(56)} durationInFrames={secToFrames(5)}>
				<Scene10 />
			</Sequence>

			<Subtitles />
		</AbsoluteFill>
	);
};
```