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
import { interpolate, spring, Easing } from 'remotion';
import React from 'react';

// --- Data Structure for Transcript and Scenes ---
const fps = 30;

// Helper to convert time (seconds) to frames
const toF = (seconds: number) => Math.floor(seconds * fps);

const wordData = [
	// Sentence 1
	{ text: 'They', start: 0.0, end: 0.48 },
	{ text: 'tell', start: 0.48, end: 0.72 },
	{ text: 'you', start: 0.72, end: 0.96 },
	{ text: 'to', start: 0.96, end: 1.14 },
	{ text: 'follow', start: 1.14, end: 1.54 },
	{ text: 'the', start: 1.54, end: 1.82 },
	{ text: 'rules.', start: 1.82, end: 2.24 },
	// Sentence 2
	{ text: 'They', start: 2.54, end: 2.98 },
	{ text: 'tell', start: 2.98, end: 3.2 },
	{ text: 'you', start: 3.2, end: 3.42 },
	{ text: 'to', start: 3.42, end: 3.56 },
	{ text: 'build', start: 3.56, end: 3.88 },
	{ text: 'a', start: 3.88, end: 4.04 },
	{ text: 'business', start: 4.04, end: 4.38 },
	{ text: 'that', start: 4.38, end: 4.66 },
	{ text: 'makes', start: 4.66, end: 4.88 },
	{ text: 'sense', start: 4.88, end: 5.22 },
	{ text: 'on', start: 5.22, end: 5.46 },
	{ text: 'a', start: 5.46, end: 5.58 },
	{ text: 'spreadsheet', start: 5.58, end: 6.0 },
	{ text: 'from', start: 6.0, end: 6.32 },
	{ text: 'day', start: 6.32, end: 6.58 },
	{ text: 'one.', start: 6.58, end: 6.9 },
	// Sentence 3
	{ text: 'They', start: 7.44, end: 7.66 },
	{ text: 'tell', start: 7.66, end: 7.9 },
	{ text: 'you', start: 7.9, end: 8.1 },
	{ text: 'to', start: 8.1, end: 8.32 },
	{ text: 'be', start: 8.32, end: 8.5 },
	{ text: 'profitable.', start: 8.5, end: 9.12 },
	// Sentence 4
	{ text: 'This', start: 9.86, end: 10.18 },
	{ text: 'is', start: 10.18, end: 10.44 },
	{ text: 'the', start: 10.44, end: 10.6 },
	{ text: 'advice', start: 10.6, end: 10.9 },
	{ text: 'that', start: 10.9, end: 11.18 },
	{ text: 'creates', start: 11.18, end: 11.48 },
	{ text: 'small,', start: 11.48, end: 12.08 },
	{ text: 'forgettable', start: 12.28, end: 12.94 },
	{ text: 'companies.', start: 12.94, end: 13.36 },
	// Sentence 5
	{ text: 'This', start: 14.08, end: 14.42 },
	{ text: 'is', start: 14.42, end: 14.66 },
	{ text: 'not', start: 14.66, end: 15.0 },
	{ text: 'the', start: 15.0, end: 15.18 },
	{ text: 'story', start: 15.18, end: 15.5 },
	{ text: 'of', start: 15.5, end: 15.72 },
	{ text: 'one', start: 15.72, end: 15.88 },
	{ text: 'of', start: 15.88, end: 16.0 },
	{ text: 'those', start: 16.0, end: 16.24 },
	{ text: 'companies.', start: 16.24, end: 16.7 },
	// Sentence 6
	{ text: 'This', start: 17.26, end: 17.62 },
	{ text: 'is', start: 17.62, end: 17.86 },
	{ text: 'the', start: 17.86, end: 18.02 },
	{ text: 'story', start: 18.02, end: 18.36 },
	{ text: 'of', start: 18.36, end: 18.58 },
	{ text: 'a', start: 18.58, end: 18.66 },
	{ text: 'system,', start: 18.66, end: 19.16 },
	// Sentence 7 (split for visual pacing)
	{ text: 'a', start: 19.7, end: 19.82 },
	{ text: 'machine', start: 19.82, end: 20.22 },
	{ text: 'built', start: 20.22, end: 20.6 },
	{ text: 'on', start: 20.6, end: 20.86 },
	{ text: 'a', start: 20.86, end: 20.96 },
	{ text: 'completely', start: 20.96, end: 21.44 },
	{ text: 'different', start: 21.44, end: 22.08 },
	{ text: 'set', start: 22.08, end: 22.36 },
	{ text: 'of', start: 22.36, end: 22.48 },
	{ text: 'rules,', start: 22.48, end: 22.8 },
	// Sentence 8
	{ text: 'a', start: 23.32, end: 23.48 },
	{ text: 'machine', start: 23.48, end: 23.86 },
	{ text: 'that', start: 23.86, end: 24.34 },
	{ text: 'ate', start: 24.34, end: 24.7 },
	{ text: 'the', start: 24.7, end: 25.1 },
	{ text: 'world.', start: 25.1, end: 25.5 },
];

const scenes = [
	{
		start: 0,
		end: 2.5,
		images: {
			// A sterile, repeating grid pattern, suggesting conformity.
			background: staticFile('assets/images/grid-pattern.jpg'),
			// An old, leather-bound rulebook, slightly out of focus.
			midground: staticFile('assets/images/rulebook.jpg'),
			// A gavel or a pointing finger, symbolizing authority.
			foreground: staticFile('assets/images/gavel.jpg'),
		},
		text: 'They tell you to follow the rules.',
	},
	{
		start: 2.5,
		end: 7.2,
		images: {
			// Cold, blue-tinted office interior with cubicles.
			background: staticFile('assets/images/office-cubicles.jpg'),
			// A glowing spreadsheet with charts and numbers.
			midground: staticFile('assets/images/spreadsheet-glow.jpg'),
			// A generic, gray business building.
			foreground: staticFile('assets/images/business-building.jpg'),
		},
		text: 'They tell you to build a business that makes sense on a spreadsheet from day one.',
	},
	{
		start: 7.2,
		end: 9.5,
		images: {
			// A dark background with glowing stock market tickers.
			background: staticFile('assets/images/stock-tickers.jpg'),
			// A pile of gold coins, crisp and clear.
			midground: staticFile('assets/images/gold-coins.jpg'),
			// A green upward-trending arrow graph.
			foreground: staticFile('assets/images/green-arrow.jpg'),
		},
		text: 'They tell you to be profitable.',
	},
	{
		start: 9.5,
		end: 13.8,
		images: {
			// A desolate, foggy landscape with muted colors.
			background: staticFile('assets/images/foggy-landscape.jpg'),
			// A row of identical, small, gray houses.
			midground: staticFile('assets/images/gray-houses.jpg'),
			// A single, wilting flower in the foreground.
			foreground: staticFile('assets/images/wilting-flower.jpg'),
		},
		text: 'This is the advice that creates small, forgettable companies.',
	},
	{
		start: 13.8,
		end: 17.0,
		images: {
			// A dark, starry night sky, hinting at something vast.
			background: staticFile('assets/images/night-sky.jpg'),
			// A cracked and broken version of the 'rulebook.jpg' from the first scene.
			midground: staticFile('assets/images/broken-rulebook.jpg'),
			// A spark of light or a single glowing ember.
			foreground: staticFile('assets/images/spark.jpg'),
		},
		text: 'This is not the story of one of those companies.',
	},
	{
		start: 17.0,
		end: 23.0,
		images: {
			// Abstract network of interconnected nodes and lines, glowing blue.
			background: staticFile('assets/images/network-nodes.jpg'),
			// Intricate, powerful-looking machinery with gears and pistons.
			midground: staticFile('assets/images/intricate-gears.jpg'),
			// A blueprint schematic, being drawn into existence.
			foreground: staticFile('assets/images/blueprint.jpg'),
		},
		text: 'This is the story of a system, a machine built on a completely different set of rules,',
	},
	{
		start: 23.0,
		end: 26.0,
		images: {
			// A satellite view of Earth at night with city lights.
			background: staticFile('assets/images/earth-at-night.jpg'),
			// The same machine from the previous scene, now larger and more menacing.
			midground: staticFile('assets/images/giant-machine.jpg'),
			// A shadow or silhouette of a giant entity looming over the planet.
			foreground: staticFile('assets/images/looming-shadow.jpg'),
		},
		text: 'a machine that ate the world.',
	},
];

// --- Sub-Components ---

const Word: React.FC<{ text: string; start: number; end: number }> = ({
	text,
	start,
	end,
}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[toF(start), toF(start) + 5, toF(end) - 5, toF(end)],
		[0, 1, 1, 0]
	);

	return (
		<span
			style={{
				display: 'inline-block',
				opacity,
				marginLeft: '0.5em',
				marginRight: '0.5em',
			}}
		>
			{text}
		</span>
	);
};

const Scene: React.FC<{
	sceneData: typeof scenes[0];
}> = ({ sceneData }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const { images, start, end, text } = sceneData;

	const sceneStartFrame = toF(start);
	const sceneEndFrame = toF(end);
	const sceneDuration = sceneEndFrame - sceneStartFrame;

	// Scene-specific animation progress (0 to 1)
	const progress = interpolate(
		frame,
		[sceneStartFrame, sceneEndFrame],
		[0, 1],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	// Cross-fade transition for the entire scene
	const sceneOpacity = interpolate(
		frame,
		[sceneStartFrame, sceneStartFrame + 30, sceneEndFrame - 30, sceneEndFrame],
		[0, 1, 1, 0]
	);

	// Parallax animations for layers
	const bgTranslateX = interpolate(progress, [0, 1], [0, -50]);
	const mgTranslateX = interpolate(progress, [0, 1], [20, -100]);
	const fgTranslateX = interpolate(progress, [0, 1], [40, -200]);

	const bgScale = 1.2;
	const mgScale = 1.3;
	const fgScale = 1.5;

	return (
		<AbsoluteFill style={{ opacity: sceneOpacity }}>
			{/* Background Layer */}
			<Img
				src={images.background}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${bgScale}) translateX(${bgTranslateX}px)`,
					zIndex: 1,
				}}
			/>
			{/* Midground Layer */}
			<Img
				src={images.midground}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${mgScale}) translateX(${mgTranslateX}px)`,
					zIndex: 2,
				}}
			/>
			{/* Foreground Layer */}
			<Img
				src={images.foreground}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${fgScale}) translateX(${fgTranslateX}px)`,
					zIndex: 3,
				}}
			/>
			{/* Text Layer */}
			<AbsoluteFill
				style={{
					zIndex: 4,
					justifyContent: 'center',
					alignItems: 'center',
					textAlign: 'center',
					padding: '0 10%',
					backgroundColor: 'rgba(0,0,0,0.3)', // Slight dark overlay for text readability
				}}
			>
				<h1
					style={{
						fontFamily: 'Helvetica, Arial, sans-serif',
						fontSize: 80,
						fontWeight: 'bold',
						color: 'white',
						textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 0 0 30px #f09010', // Glow effect
					}}
				>
					{wordData
						.filter((w) => w.start >= start && w.end <= end)
						.map((word, i) => (
							<Word key={i} {...word} />
						))}
				</h1>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Cinematic Camera Movement (slow zoom and pan)
	const globalScale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
	const globalTranslateX = interpolate(
		frame,
		[0, durationInFrames],
		[0, 50]
	);
	const globalTranslateY = interpolate(
		frame,
		[0, durationInFrames],
		[0, -30]
	);

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<AbsoluteFill
				style={{
					transform: `scale(${globalScale}) translateX(${globalTranslateX}px) translateY(${globalTranslateY}px)`,
				}}
			>
				{scenes.map((scene, index) => (
					<Sequence
						key={index}
						from={toF(scene.start)}
						durationInFrames={toF(scene.end - scene.start)}
					>
						<Scene sceneData={scene} />
					</Sequence>
				))}
			</AbsoluteFill>

			{/* Vignette Overlay for cinematic feel */}
			<AbsoluteFill
				style={{
					boxShadow: 'inset 0 0 150px 50px rgba(0,0,0,0.7)',
					zIndex: 10,
				}}
			/>

			<Audio src={staticFile('BOOKS/Temp/TTS/Intro.wav')} />
		</AbsoluteFill>
	);
};
```