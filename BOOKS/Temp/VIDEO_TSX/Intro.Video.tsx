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
} from 'remotion';
import { interpolate, spring } from 'remotion';
import React from 'react';

// Word-level animation component
const Word: React.FC<{
	text: string;
	start: number;
	end: number;
}> = ({ text, start, end }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const startFrame = Math.floor(start * fps);
	const endFrame = Math.floor(end * fps);
	const duration = endFrame - startFrame;

	// Fade in and slightly up animation for each word
	const opacity = interpolate(
		frame,
		[startFrame, startFrame + duration * 0.25],
		[0, 1],
		{
			extrapolateRight: 'clamp',
		}
	);

	const translateY = interpolate(
		frame,
		[startFrame, startFrame + duration * 0.25],
		[10, 0],
		{
			extrapolateRight: 'clamp',
		}
	);

	// Fade out the word after it's spoken
	const finalOpacity = interpolate(
		frame,
		[endFrame, endFrame + fps * 0.25],
		[1, 0],
		{
			extrapolateLeft: 'clamp',
		}
	);

	const wordStyle: React.CSSProperties = {
		display: 'inline-block',
		margin: '0 0.25em',
		opacity: Math.min(opacity, finalOpacity),
		transform: `translateY(${translateY}px)`,
		textShadow: '0 0 15px rgba(255, 255, 255, 0.7)',
	};

	return <span style={wordStyle}>{text}</span>;
};

// Text sequence container
const TextContainer: React.FC<{
	words: { start: number; end: number; text: string }[];
}> = ({ words }) => {
	const textStyle: React.CSSProperties = {
		fontFamily: 'Helvetica, Arial, sans-serif',
		fontSize: '72px',
		fontWeight: 'bold',
		color: '#FFFFFF',
		textAlign: 'center',
		position: 'absolute',
		width: '100%',
		bottom: '20%',
		padding: '0 5%',
		zIndex: 10,
	};

	return (
		<div style={textStyle}>
			{words.map((word, i) => (
				<Word key={i} text={word.text} start={word.start} end={word.end} />
			))}
		</div>
	);
};

// Parallax layer component
const ParallaxLayer: React.FC<{
	src: string;
	speed: number;
	scale: number;
	opacity?: number;
	transformOrigin?: string;
	panX?: number;
	panY?: number;
	rotation?: number;
}> = ({
	src,
	speed,
	scale,
	opacity = 1,
	transformOrigin = 'center center',
	panX = 0,
	panY = 0,
	rotation = 0,
}) => {
	const frame = useCurrentFrame();

	// Calculate parallax effect based on a subtle sine wave for smooth movement
	const movementX = Math.sin(frame / 100) * 10 * speed + panX;
	const movementY = Math.cos(frame / 120) * 5 * speed + panY;

	const layerStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		position: 'absolute',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		opacity,
		transformOrigin,
		transform: `scale(${scale}) translateX(${movementX}px) translateY(${movementY}px) rotate(${rotation}deg)`,
	};

	const imageStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	};

	return (
		<div style={layerStyle}>
			<Img src={staticFile(src)} style={imageStyle} />
		</div>
	);
};

// SCENE 1: "They tell you to follow the rules."
const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Dolly zoom effect: zoom in while pulling camera back
	const sceneProgress = frame / durationInFrames;
	const scale = interpolate(sceneProgress, [0, 1], [1.1, 1.25]);

	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	return (
		<AbsoluteFill style={{ opacity }}>
			{/* 
				Image: blueprint_background.jpg 
				Description: A detailed but slightly faded architectural blueprint. Should feel technical and rigid. Full-screen background.
			*/}
			<ParallaxLayer src="images/blueprint_background.jpg" speed={-2} scale={scale} />
			{/* 
				Image: rulebook.png
				Description: An old, heavy, leather-bound book, slightly open. Centered. Transparent background.
			*/}
			<ParallaxLayer src="images/rulebook.png" speed={1} scale={scale * 0.9} />
			{/* 
				Image: grid_lines.png
				Description: A semi-transparent overlay of white or light blue grid lines. Adds to the feeling of confinement.
			*/}
			<ParallaxLayer src="images/grid_lines.png" speed={3} scale={scale} opacity={0.3} />
		</AbsoluteFill>
	);
};

// SCENE 2: "They tell you to build a business that makes sense on a spreadsheet..."
const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1.2, 1.3]);
	const panX = interpolate(frame, [0, durationInFrames], [-50, 50]);
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	return (
		<AbsoluteFill style={{ opacity }}>
			{/* 
				Image: corporate_office_blur.jpg
				Description: A generic, modern office interior, heavily blurred and desaturated. Serves as an atmospheric backdrop.
			*/}
			<ParallaxLayer src="images/corporate_office_blur.jpg" speed={-1} scale={scale * 1.1} />
			{/* 
				Image: spreadsheet_glow.png
				Description: A stylized, floating user interface of a spreadsheet with glowing cells and charts. Transparent background.
			*/}
			<ParallaxLayer src="images/spreadsheet_glow.png" speed={2} scale={scale} panX={panX} />
		</AbsoluteFill>
	);
};

// SCENE 3: "They tell you to be profitable."
const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1.5, 1.6]);
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	return (
		<AbsoluteFill style={{ opacity }}>
			{/* 
				Image: dark_desk.jpg
				Description: A top-down view of a dark, polished wood desk texture.
			*/}
			<ParallaxLayer src="images/dark_desk.jpg" speed={-1} scale={1.2} />
			{/* 
				Image: gold_coins_scatter.png
				Description: A few realistic gold coins scattered on the surface. Transparent background with realistic shadows.
			*/}
			<ParallaxLayer src="images/gold_coins_scatter.png" speed={2} scale={scale} />
		</AbsoluteFill>
	);
};

// SCENE 4: "This is the advice that creates small, forgettable companies."
const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1.3, 1.1]); // Pull back
	const panX = interpolate(frame, [0, durationInFrames], [100, -100]); // Slow pan
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	return (
		<AbsoluteFill style={{ opacity }}>
			{/* 
				Image: foggy_sky.jpg
				Description: A bleak, gray, and overcast sky filled with dense fog.
			*/}
			<ParallaxLayer src="images/foggy_sky.jpg" speed={-1} scale={scale * 1.2} />
			{/* 
				Image: identical_buildings_row.png
				Description: A row of monotonous, gray, cubic office buildings fading into the distance. Transparent background.
			*/}
			<ParallaxLayer src="images/identical_buildings_row.png" speed={2} scale={scale} panX={panX} />
		</AbsoluteFill>
	);
};

// SCENE 5: "This is not the story of one of those companies."
const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	
	const scale = interpolate(frame, [0, durationInFrames], [1.8, 2.2]);
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);
	
	const glowSpring = spring({ frame, fps: 30, config: { damping: 200 } });
	const glowRadius = interpolate(glowSpring, [0, 1], [0, 30]);

	const saplingStyle: React.CSSProperties = {
		filter: `brightness(1.5) drop-shadow(0 0 ${glowRadius}px #4CAF50)`,
	};

	return (
		<AbsoluteFill style={{ opacity, backgroundColor: 'black' }}>
			{/* 
				Image: cracked_concrete.jpg
				Description: A dark, gritty texture of cracked concrete or asphalt.
			*/}
			<ParallaxLayer src="images/cracked_concrete.jpg" speed={-1} scale={1.2} opacity={0.4} />
			{/* 
				Image: glowing_sapling.png
				Description: A single, vibrant green sapling pushing through a crack, emitting a soft, ethereal light. Transparent background.
			*/}
			<AbsoluteFill style={saplingStyle}>
				<ParallaxLayer src="images/glowing_sapling.png" speed={2} scale={scale} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// SCENE 6: "This is the story of a system, a machine..."
const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1.5, 1.2]); // Pull back to reveal scale
	const rotation = interpolate(frame, [0, durationInFrames], [0, -15]);
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	return (
		<AbsoluteFill style={{ opacity }}>
			{/* 
				Image: dark_gears_background.jpg
				Description: A deep, dark background filled with massive, shadowy, slowly rotating gears.
			*/}
			<ParallaxLayer src="images/dark_gears_background.jpg" speed={-1} scale={scale * 1.2} rotation={frame / 20} />
			{/* 
				Image: glowing_gears_mid.png
				Description: Mid-ground layer with more defined gears that have glowing edges or circuits on them. Transparent background.
			*/}
			<ParallaxLayer src="images/glowing_gears_mid.png" speed={2} scale={scale} rotation={-frame / 10} />
			{/* 
				Image: gear_close_up.png
				Description: A large, detailed gear mechanism in the foreground, out of focus. Transparent background.
			*/}
			<ParallaxLayer src="images/gear_close_up.png" speed={5} scale={scale} rotation={frame / 5} opacity={0.5}/>
		</AbsoluteFill>
	);
};

// SCENE 7: "...a machine that ate the world."
const Scene7: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [2.0, 1.3]); // Dramatic pull back
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	return (
		<AbsoluteFill style={{ opacity }}>
			{/* 
				Image: starfield.jpg
				Description: A beautiful, high-resolution image of a starfield in deep space.
			*/}
			<ParallaxLayer src="images/starfield.jpg" speed={-0.5} scale={scale * 1.1} />
			{/* 
				Image: mechanical_earth.png
				Description: The planet Earth, but the continents are replaced with intricate, glowing machinery and circuits. Should look vast and powerful. Transparent background.
			*/}
			<ParallaxLayer src="images/mechanical_earth.png" speed={1} scale={scale} rotation={frame / 15} />
		</AbsoluteFill>
	);
};

const words = [
	{start: 0.0, end: 0.48, text: 'They'},
	{start: 0.48, end: 0.72, text: 'tell'},
	{start: 0.72, end: 0.96, text: 'you'},
	{start: 0.96, end: 1.14, text: 'to'},
	{start: 1.14, end: 1.54, text: 'follow'},
	{start: 1.54, end: 1.82, text: 'the'},
	{start: 1.82, end: 2.24, text: 'rules.'},
	{start: 2.54, end: 2.98, text: 'They'},
	{start: 2.98, end: 3.2, text: 'tell'},
	{start: 3.2, end: 3.42, text: 'you'},
	{start: 3.42, end: 3.56, text: 'to'},
	{start: 3.56, end: 3.88, text: 'build'},
	{start: 3.88, end: 4.04, text: 'a'},
	{start: 4.04, end: 4.38, text: 'business'},
	{start: 4.38, end: 4.66, text: 'that'},
	{start: 4.66, end: 4.88, text: 'makes'},
	{start: 4.88, end: 5.22, text: 'sense'},
	{start: 5.22, end: 5.46, text: 'on'},
	{start: 5.46, end: 5.58, text: 'a'},
	{start: 5.58, end: 6.0, text: 'spreadsheet'},
	{start: 6.0, end: 6.32, text: 'from'},
	{start: 6.32, end: 6.58, text: 'day'},
	{start: 6.58, end: 6.9, text: 'one.'},
	{start: 7.44, end: 7.66, text: 'They'},
	{start: 7.66, end: 7.9, text: 'tell'},
	{start: 7.9, end: 8.1, text: 'you'},
	{start: 8.1, end: 8.32, text: 'to'},
	{start: 8.32, end: 8.5, text: 'be'},
	{start: 8.5, end: 9.12, text: 'profitable.'},
	{start: 9.86, end: 10.18, text: 'This'},
	{start: 10.18, end: 10.44, text: 'is'},
	{start: 10.44, end: 10.6, text: 'the'},
	{start: 10.6, end: 10.9, text: 'advice'},
	{start: 10.9, end: 11.18, text: 'that'},
	{start: 11.18, end: 11.48, text: 'creates'},
	{start: 11.48, end: 12.08, text: 'small,'},
	{start: 12.28, end: 12.94, text: 'forgettable'},
	{start: 12.94, end: 13.36, text: 'companies.'},
	{start: 14.08, end: 14.42, text: 'This'},
	{start: 14.42, end: 14.66, text: 'is'},
	{start: 14.66, end: 15.0, text: 'not'},
	{start: 15.0, end: 15.18, text: 'the'},
	{start: 15.18, end: 15.5, text: 'story'},
	{start: 15.5, end: 15.72, text: 'of'},
	{start: 15.72, end: 15.88, text: 'one'},
	{start: 15.88, end: 16.0, text: 'of'},
	{start: 16.0, end: 16.24, text: 'those'},
	{start: 16.24, end: 16.7, text: 'companies.'},
	{start: 17.26, end: 17.62, text: 'This'},
	{start: 17.62, end: 17.86, text: 'is'},
	{start: 17.86, end: 18.02, text: 'the'},
	{start: 18.02, end: 18.36, text: 'story'},
	{start: 18.36, end: 18.58, text: 'of'},
	{start: 18.58, end: 18.66, text: 'a'},
	{start: 18.66, end: 19.16, text: 'system,'},
	{start: 19.7, end: 19.82, text: 'a'},
	{start: 19.82, end: 20.22, text: 'machine'},
	{start: 20.22, end: 20.6, text: 'built'},
	{start: 20.6, end: 20.86, text: 'on'},
	{start: 20.86, end: 20.96, text: 'a'},
	{start: 20.96, end: 21.44, text: 'completely'},
	{start: 21.44, end: 22.08, text: 'different'},
	{start: 22.08, end: 22.36, text: 'set'},
	{start: 22.36, end: 22.48, text: 'of'},
	{start: 22.48, end: 22.8, text: 'rules,'},
	{start: 23.32, end: 23.48, text: 'a'},
	{start: 23.48, end: 23.86, text: 'machine'},
	{start: 23.86, end: 24.34, text: 'that'},
	{start: 24.34, end: 24.7, text: 'ate'},
	{start: 24.7, end: 25.1, text: 'the'},
	{start: 25.1, end: 25.5, text: 'world.'},
];

export const RemotionVideo: React.FC = () => {
	const fps = 30;
	const videoDurationInSeconds = 26;
	const durationInFrames = videoDurationInSeconds * fps;

	const sentence1Words = words.slice(0, 7);
	const sentence2Words = words.slice(7, 22);
	const sentence3Words = words.slice(22, 28);
	const sentence4Words = words.slice(28, 37);
	const sentence5Words = words.slice(37, 47);
	const sentence6Words = words.slice(47, 63);
	const sentence7Words = words.slice(63);

	return (
		<Composition
			id="StorytellingVideo"
			component={Main}
			durationInFrames={durationInFrames}
			fps={fps}
			width={3840}
			height={2160}
			defaultProps={{ words }}
		/>
	);
};

const Main: React.FC = () => {
	const { fps } = useVideoConfig();

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Intro.wav')} />

			<Sequence from={0 * fps} durationInFrames={2.5 * fps}>
				<Scene1 />
				<TextContainer words={words.slice(0, 7)} />
			</Sequence>

			<Sequence from={2.5 * fps} durationInFrames={4.9 * fps}>
				<Scene2 />
				<TextContainer words={words.slice(7, 22)} />
			</Sequence>

			<Sequence from={7.4 * fps} durationInFrames={2 * fps}>
				<Scene3 />
				<TextContainer words={words.slice(22, 28)} />
			</Sequence>

			<Sequence from={9.8 * fps} durationInFrames={4 * fps}>
				<Scene4 />
				<TextContainer words={words.slice(28, 37)} />
			</Sequence>

			<Sequence from={14 * fps} durationInFrames={3 * fps}>
				<Scene5 />
				<TextContainer words={words.slice(37, 47)} />
			</Sequence>

			<Sequence from={17.2 * fps} durationInFrames={6 * fps}>
				<Scene6 />
				<TextContainer words={words.slice(47, 63)} />
			</Sequence>

			<Sequence from={23.2 * fps}>
				<Scene7 />
				<TextContainer words={words.slice(63)} />
			</Sequence>
		</AbsoluteFill>
	);
};
```