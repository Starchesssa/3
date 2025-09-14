```tsx
import {
	AbsoluteFill,
	Audio,
	Sequence,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import React from 'react';
import {Poppins} from 'remotion-google-fonts/Poppins';

// --- Data Structures ---

type WordDef = {
	text: string;
	start: number;
	end: number;
};

type SceneDef = {
	start: number;
	duration: number;
	background: string;
	midground: string;
	foreground: string;
	backgroundComment: string;
	midgroundComment: string;
	foregroundComment: string;
};

// --- Audio and Transcript Data ---

const audioSource = staticFile('BOOKS/Temp/TTS/Lesson_1.wav');

const transcript: WordDef[] = [
	{start: 0.0, end: 0.46, text: 'Key'},
	{start: 0.46, end: 0.88, text: 'lesson.'},
	{start: 1.48, end: 2.08, text: 'Ignore'},
	{start: 2.08, end: 2.42, text: 'short'},
	{start: 2.42, end: 2.68, text: '-term'},
	{start: 2.68, end: 3.2, text: 'reality'},
	{start: 3.2, end: 3.66, text: 'for'},
	{start: 3.66, end: 3.8, text: 'a'},
	{start: 3.8, end: 4.12, text: 'long'},
	{start: 4.12, end: 4.4, text: '-term'},
	{start: 4.4, end: 4.84, text: 'vision.'},
	{start: 5.76, end: 5.96, text: 'The'},
	{start: 5.96, end: 6.28, text: 'year'},
	{start: 6.28, end: 6.54, text: 'is'},
	{start: 6.54, end: 7.22, text: '1999.'},
	{start: 7.9, end: 8.2, text: 'The'},
	{start: 8.2, end: 8.5, text: 'world'},
	{start: 8.5, end: 8.78, text: 'is'},
	{start: 8.78, end: 9.14, text: 'high'},
	{start: 9.14, end: 9.4, text: 'on'},
	{start: 9.4, end: 9.54, text: 'the'},
	{start: 9.54, end: 9.72, text: 'dot'},
	{start: 9.72, end: 10.0, text: '-com'},
	{start: 10.0, end: 10.28, text: 'bubble.'},
	{start: 10.8, end: 11.14, text: 'Everyone'},
	{start: 11.14, end: 11.42, text: 'is'},
	{start: 11.42, end: 11.48, text: 'a'},
	{start: 11.48, end: 11.8, text: 'genius.'},
	{start: 12.38, end: 12.84, text: 'Stocks'},
	{start: 12.84, end: 13.16, text: 'only'},
	{start: 13.16, end: 13.36, text: 'go'},
	{start: 13.36, end: 13.66, text: 'up.'},
	{start: 14.28, end: 14.68, text: 'Amazon'},
	{start: 14.68, end: 15.04, text: 'is'},
	{start: 15.04, end: 15.18, text: 'the'},
	{start: 15.18, end: 15.6, text: 'poster'},
	{start: 15.6, end: 16.0, text: 'child'},
	{start: 16.0, end: 16.2, text: 'of'},
	{start: 16.2, end: 16.4, text: 'this'},
	{start: 16.4, end: 16.66, text: 'new'},
	{start: 16.66, end: 17.0, text: 'internet'},
	{start: 17.0, end: 17.56, text: 'economy.'},
	{start: 18.02, end: 18.22, text: 'It'},
	{start: 18.22, end: 18.42, text: 'sells'},
	{start: 18.42, end: 18.68, text: 'books'},
	{start: 18.68, end: 19.1, text: 'online.'},
	{start: 19.78, end: 19.96, text: 'But'},
	{start: 19.96, end: 20.22, text: 'Jeff'},
	{start: 20.22, end: 20.64, text: 'Bezos'},
	{start: 20.64, end: 21.0, text: 'is'},
	{start: 21.0, end: 21.3, text: 'telling'},
	{start: 21.3, end: 21.56, text: 'Wall'},
	{start: 21.56, end: 21.82, text: 'Street'},
	{start: 21.82, end: 22.3, text: 'something'},
	{start: 22.3, end: 22.56, text: 'they'},
	{start: 22.56, end: 22.74, text: 'do'},
	{start: 22.74, end: 23.04, text: 'not'},
	{start: 23.04, end: 23.28, text: 'want'},
	{start: 23.28, end: 23.46, text: 'to'},
	{start: 23.46, end: 23.66, text: 'hear.'},
	{start: 24.16, end: 24.38, text: 'He'},
	{start: 24.38, end: 24.52, text: 'is'},
	{start: 24.52, end: 24.8, text: 'telling'},
	{start: 24.8, end: 25.08, text: 'them'},
	{start: 25.08, end: 25.42, text: 'he'},
	{start: 25.42, end: 25.56, text: 'is'},
	{start: 25.56, end: 25.76, text: 'going'},
	{start: 25.76, end: 25.96, text: 'to'},
	{start: 25.96, end: 26.3, text: 'lose'},
	{start: 26.3, end: 26.68, text: 'money.'},
	{start: 27.16, end: 27.32, text: 'He'},
	{start: 27.32, end: 27.46, text: 'is'},
	{start: 27.46, end: 27.72, text: 'telling'},
	{start: 27.72, end: 27.94, text: 'them'},
	{start: 27.94, end: 28.18, text: 'he'},
	{start: 28.18, end: 28.32, text: 'is'},
	{start: 28.32, end: 28.46, text: 'going'},
	{start: 28.46, end: 28.64, text: 'to'},
	{start: 28.64, end: 28.88, text: 'spend'},
	{start: 28.88, end: 29.44, text: 'every'},
	{start: 29.44, end: 29.76, text: 'dollar'},
	{start: 29.76, end: 29.96, text: 'they'},
	{start: 29.96, end: 30.16, text: 'give'},
	{start: 30.16, end: 30.42, text: 'him'},
	{start: 30.42, end: 30.94, text: 'and'},
	{start: 30.94, end: 31.2, text: 'more.'},
	{start: 31.86, end: 32.12, text: 'He'},
	{start: 32.12, end: 32.28, text: 'is'},
	{start: 32.28, end: 32.54, text: 'not'},
	{start: 32.54, end: 32.92, text: 'building'},
	{start: 32.92, end: 33.06, text: 'a'},
	{start: 33.06, end: 33.36, text: 'bookstore.'},
	{start: 33.86, end: 34.06, text: 'He'},
	{start: 34.06, end: 34.18, text: 'is'},
	{start: 34.18, end: 34.54, text: 'building'},
	{start: 34.54, end: 34.96, text: 'the'},
	{start: 34.96, end: 35.42, text: 'everything'},
	{start: 35.42, end: 35.82, text: 'store.'},
	{start: 36.5, end: 36.74, text: 'In'},
	{start: 36.74, end: 36.9, text: 'his'},
	{start: 36.9, end: 37.5, text: '1997'},
	{start: 37.5, end: 38.16, text: 'letter'},
	{start: 38.16, end: 38.4, text: 'to'},
	{start: 38.4, end: 38.8, text: 'shareholders,'},
	{start: 39.22, end: 39.44, text: 'he'},
	{start: 39.44, end: 39.68, text: 'said'},
	{start: 39.68, end: 40.12, text: 'it'},
	{start: 40.12, end: 40.28, text: 'was'},
	{start: 40.28, end: 40.64, text: 'all'},
	{start: 40.64, end: 41.0, text: 'about'},
	{start: 41.0, end: 41.22, text: 'the'},
	{start: 41.22, end: 41.48, text: 'long'},
	{start: 41.48, end: 41.72, text: '-term.'},
	{start: 42.54, end: 42.74, text: 'In'},
	{start: 42.74, end: 43.28, text: '1999,'},
	{start: 43.98, end: 44.06, text: 'the'},
	{start: 44.06, end: 44.36, text: 'market'},
	{start: 44.36, end: 44.66, text: 'loved'},
	{start: 44.66, end: 44.9, text: 'him'},
	{start: 44.9, end: 45.12, text: 'for'},
	{start: 45.12, end: 45.32, text: 'it.'},
	{start: 45.8, end: 46.08, text: 'Amazon'},
	{start: 46.08, end: 46.68, text: 'stocks'},
	{start: 46.68, end: 47.22, text: 'soared'},
	{start: 47.22, end: 47.4, text: 'to'},
	{start: 47.4, end: 47.72, text: 'over'},
	{start: 47.72, end: 48.4, text: '$100'},
	{start: 48.4, end: 48.9, text: 'a'},
	{start: 48.9, end: 49.18, text: 'share.'},
	{start: 49.52, end: 49.86, text: 'But'},
	{start: 49.86, end: 49.96, text: 'the'},
	{start: 49.96, end: 50.32, text: 'company'},
	{start: 50.32, end: 50.7, text: 'was'},
	{start: 50.7, end: 51.02, text: 'not'},
	{start: 51.02, end: 51.56, text: 'profitable.'},
	{start: 51.96, end: 52.16, text: 'Not'},
	{start: 52.16, end: 52.42, text: 'even'},
	{start: 52.42, end: 52.72, text: 'close.'},
	{start: 53.28, end: 53.6, text: 'It'},
	{start: 53.6, end: 53.8, text: 'was'},
	{start: 53.8, end: 54.04, text: 'a'},
	{start: 54.04, end: 54.48, text: 'promise.'},
	{start: 55.02, end: 55.14, text: 'A'},
	{start: 55.14, end: 55.42, text: 'bet'},
	{start: 55.42, end: 55.66, text: 'on'},
	{start: 55.66, end: 55.78, text: 'a'},
	{start: 55.78, end: 56.16, text: 'distant'},
	{start: 56.16, end: 56.66, text: 'future.'},
	{start: 57.3, end: 57.54, text: 'Most'},
	{start: 57.54, end: 57.86, text: 'people'},
	{start: 57.86, end: 58.14, text: 'saw'},
	{start: 58.14, end: 58.3, text: 'a'},
	{start: 58.3, end: 58.6, text: 'company'},
	{start: 58.6, end: 59.06, text: 'selling'},
	{start: 59.06, end: 59.38, text: 'books'},
	{start: 59.38, end: 59.6, text: 'at'},
	{start: 59.6, end: 59.7, text: 'a'},
	{start: 59.7, end: 59.96, text: 'loss.'},
	{start: 60.6, end: 60.96, text: 'Bezos'},
	{start: 60.96, end: 61.38, text: 'saw'},
	{start: 61.38, end: 61.56, text: 'a'},
	{start: 61.56, end: 61.96, text: 'global'},
	{start: 61.96, end: 62.5, text: 'logistics'},
	{start: 62.5, end: 62.94, text: 'and'},
	{start: 2.94, end: 63.28, text: 'data'},
	{start: 63.28, end: 63.76, text: 'empire.'},
	{start: 64.28, end: 64.52, text: 'The'},
	{start: 64.52, end: 64.82, text: 'vision'},
	{start: 64.82, end: 65.02, text: 'was'},
	{start: 65.02, end: 65.34, text: 'so'},
	{start: 65.34, end: 65.7, text: 'big,'},
	{start: 65.96, end: 66.04, text: 'it'},
	{start: 66.04, end: 66.32, text: 'looked'},
	{start: 66.32, end: 66.64, text: 'like'},
	{start: 66.64, end: 67.22, text: 'insanity.'},
];

const sentences = [
	transcript.slice(0, 2), // "Key lesson."
	transcript.slice(2, 11), // "Ignore short-term reality for a long-term vision."
	transcript.slice(11, 15), // "The year is 1999."
	transcript.slice(15, 24), // "The world is high on the dot-com bubble."
	transcript.slice(24, 28), // "Everyone is a genius."
	transcript.slice(28, 32), // "Stocks only go up."
	transcript.slice(32, 42), // "Amazon is the poster child..."
	transcript.slice(42, 46), // "It sells books online."
	transcript.slice(46, 60), // "But Jeff Bezos is telling Wall Street..."
	transcript.slice(60, 69), // "He is telling them he is going to lose money."
	transcript.slice(69, 83), // "He is telling them he is going to spend..."
	transcript.slice(83, 89), // "He is not building a bookstore."
	transcript.slice(89, 95), // "He is building the everything store."
	transcript.slice(95, 101), // "In his 1997 letter to shareholders,"
	transcript.slice(101, 109), // "he said it was all about the long-term."
	transcript.slice(109, 117), // "In 1999, the market loved him for it."
	transcript.slice(117, 125), // "Amazon stocks soared to over $100 a share."
	transcript.slice(125, 131), // "But the company was not profitable."
	transcript.slice(131, 134), // "Not even close."
	transcript.slice(134, 138), // "It was a promise."
	transcript.slice(138, 144), // "A bet on a distant future."
	transcript.slice(144, 154), // "Most people saw a company selling books at a loss."
	transcript.slice(154, 161), // "Bezos saw a global logistics and data empire."
	transcript.slice(161, 169), // "The vision was so big, it looked like insanity."
];

// --- Visual Scene Definitions ---

const scenes: SceneDef[] = [
	{
		start: 0.0,
		duration: 5.7,
		background: 'assets/images/mountain-vista.jpg',
		midground: 'assets/images/foggy-path.png',
		foreground: 'assets/images/blurry-leaves.png',
		backgroundComment: 'A vast mountain range at dawn, symbolizing a grand, long-term vision.',
		midgroundComment: 'A path disappearing into mist, representing the uncertain short-term journey.',
		foregroundComment: 'Out-of-focus leaves to represent the immediate, ignorable reality.',
	},
	{
		start: 5.7,
		duration: 5.1,
		background: 'assets/images/90s-computer-grid.jpg',
		midground: 'assets/images/stock-ticker-blur.png',
		foreground: 'assets/images/champagne-bubbles.png',
		backgroundComment: 'A retro-futuristic digital grid, evoking the late 90s dot-com era.',
		midgroundComment: 'A blurry, glowing green stock ticker showing upward trends.',
		foregroundComment: 'A semi-transparent overlay of bubbles, signifying the celebratory, frothy market.',
	},
	{
		start: 10.8,
		duration: 7.2,
		background: 'assets/images/new-york-skyline-1999.jpg',
		midground: 'assets/images/old-amazon-logo.png',
		foreground: 'assets/images/glowing-network-lines.png',
		backgroundComment: 'A slightly dated photo of the NYC skyline, representing the financial world.',
		midgroundComment: 'The classic 1998-2000 Amazon logo, glowing, as the poster child of the era.',
		foregroundComment: 'An overlay of glowing network lines, symbolizing the new internet economy.',
	},
	{
		start: 18.0,
		duration: 6.1,
		background: 'assets/images/wall-street-building.jpg',
		midground: 'assets/images/bezos-silhouette.png',
		foreground: 'assets/images/book-shelf.png',
		backgroundComment: 'An imposing, classic Wall Street building facade.',
		midgroundComment: 'A silhouette of a figure (representing Bezos) facing the establishment.',
		foregroundComment: 'Slightly blurred shelves of books, signifying Amazon\'s simple public image at the time.',
	},
	{
		start: 24.1,
		duration: 12.4,
		background: 'assets/images/blueprints.jpg',
		midground: 'assets/images/warehouse-aisles.jpg',
		foreground: 'assets/images/various-products.png',
		backgroundComment: 'Faded, complex blueprints, representing a grand, hidden plan.',
		midgroundComment: 'Endless aisles of a massive fulfillment center, hinting at future scale.',
		foregroundComment: 'A transparent collage of diverse products, fading in to show the "everything store" concept.',
	},
	{
		start: 36.5,
		duration: 6.0,
		background: 'assets/images/parchment-texture.jpg',
		midground: 'assets/images/handwritten-text.png',
		foreground: 'assets/images/magnifying-glass.png',
		backgroundComment: 'The texture of old paper, evoking the feeling of a foundational letter.',
		midgroundComment: 'An overlay of elegant, handwritten text representing the shareholder letter.',
		foregroundComment: 'A magnifying glass focusing on the key area of text, emphasizing the message.',
	},
	{
		start: 42.5,
		duration: 10.7,
		background: 'assets/images/rising-stock-chart.jpg',
		midground: 'assets/images/empty-wallet.png',
		foreground: 'assets/images/falling-coins.png',
		backgroundComment: 'A dramatic, glowing green stock chart soaring upwards.',
		midgroundComment: 'An open, empty wallet, creating a stark contrast with the stock price to show no profitability.',
		foregroundComment: 'An overlay of falling coins, representing the immense cash burn.',
	},
	{
		start: 53.2,
		duration: 14.5,
		background: 'assets/images/galaxy.jpg',
		midground: 'assets/images/server-racks.png',
		foreground: 'assets/images/earth-with-glowing-lines.png',
		backgroundComment: 'A vast galaxy, representing the cosmic scale of Bezos\'s vision.',
		midgroundComment: 'Endless rows of glowing server racks, visualizing the "data empire" aspect.',
		foregroundComment: 'The Earth crisscrossed with glowing lines, symbolizing a "global logistics" network.',
	},
];

// --- Helper Components ---

const Word: React.FC<{word: WordDef;}> = ({word}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const startFrame = word.start * fps;

	const opacity = interpolate(
		frame,
		[startFrame, startFrame + 5],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	const textSpring = spring({
		frame: frame - startFrame,
		fps,
		config: {
			damping: 10,
			stiffness: 100,
		},
	});

	const translateY = interpolate(textSpring, [0, 1], [10, 0]);

	return (
		<span
			style={{
				display: 'inline-block',
				opacity,
				transform: `translateY(${translateY}px)`,
				marginRight: '12px',
			}}
		>
			{word.text}
		</span>
	);
};

const ParallaxScene: React.FC<{
	scene: SceneDef;
	cameraZoom: number;
	cameraX: number;
	cameraY: number;
}> = ({scene, cameraZoom, cameraX, cameraY}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const sceneStartFrame = scene.start * fps;
	const sceneDurationFrames = scene.duration * fps;

	// Smooth fade-in and fade-out for each scene to allow cross-fading
	const opacity = interpolate(
		frame,
		[
			sceneStartFrame,
			sceneStartFrame + fps, // Fade in over 1 second
			sceneStartFrame + sceneDurationFrames - fps, // Start fade out 1s before end
			sceneStartFrame + sceneDurationFrames,
		],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	// Function to apply parallax transformation to each layer
	const imageStyle = (
		layer: 'bg' | 'mg' | 'fg'
	): React.CSSProperties => {
		// Depth determines how much the layer moves with the camera pan.
		// Higher value = less movement = appears further away.
		const depth = {bg: 0.9, mg: 0.5, fg: 0.1};

		// Scale factor to prevent empty edges during camera movement.
		// Farther layers are scaled up more.
		const scaleFactor = {bg: 1.5, mg: 1.3, fg: 1.15};

		return {
			position: 'absolute',
			width: '100%',
			height: '100%',
			objectFit: 'cover',
			transform: `scale(${cameraZoom * scaleFactor[layer]}) translateX(${cameraX * depth[layer]}px) translateY(${cameraY * depth[layer]}px)`,
		};
	};

	return (
		<AbsoluteFill style={{opacity}}>
			{/* Each image is commented with its narrative purpose */}
			{/* {scene.backgroundComment} */}
			<img src={staticFile(scene.background)} style={imageStyle('bg')} />

			{/* {scene.midgroundComment} */}
			<img src={staticFile(scene.midground)} style={imageStyle('mg')} />

			{/* {scene.foregroundComment} */}
			<img src={staticFile(scene.foreground)} style={imageStyle('fg')} />
		</AbsoluteFill>
	);
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	const {durationInFrames, fps} = useVideoConfig();
	const frame = useCurrentFrame();

	// Global cinematic camera movement (slow zoom and pan)
	const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.25]);
	const cameraPanX = interpolate(frame, [0, durationInFrames], [-50, 50]);
	const cameraPanY = interpolate(
		frame,
		[0, durationInFrames / 3, (durationInFrames / 3) * 2, durationInFrames],
		[20, -20, 20, -10]
	);

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Poppins.Font />
			{/* Visuals Layer */}
			<AbsoluteFill style={{overflow: 'hidden'}}>
				{scenes.map((scene, index) => (
					<Sequence
						key={index}
						from={scene.start * fps}
						durationInFrames={scene.duration * fps}
					>
						<ParallaxScene
							scene={scene}
							cameraZoom={cameraZoom}
							cameraX={cameraPanX}
							cameraY={cameraPanY}
						/>
					</Sequence>
				))}
			</AbsoluteFill>

			{/* Artistic Overlays (Vignette and subtle dust) */}
			<AbsoluteFill
				style={{
					boxShadow: 'inset 0 0 120px rgba(0,0,0,0.8)',
				}}
			/>

			{/* Text Layer */}
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
						fontFamily: Poppins.name,
						fontSize: '72px',
						fontWeight: '600',
						color: 'white',
						textAlign: 'center',
						lineHeight: '1.2',
						textShadow: '0 0 20px rgba(0,0,0,0.8)',
					}}
				>
					{sentences.map((sentence, i) => {
						const sentenceStart = sentence[0].start;
						const sentenceEnd = sentence[sentence.length - 1].end;
						return (
							<Sequence
								key={i}
								from={sentenceStart * fps}
								durationInFrames={(sentenceEnd - sentenceStart + 1) * fps}
							>
								<p>
									{sentence.map((word) => (
										<Word key={word.text + word.start} word={word} />
									))}
								</p>
							</Sequence>
						);
					})}
				</div>
			</AbsoluteFill>

			<Audio src={audioSource} />
		</AbsoluteFill>
	);
};
```