```tsx
import {
	AbsoluteFill,
	Audio,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	staticFile,
	Img,
	Easing,
} from 'remotion';
import React from 'react';

// --- Data Setup ---

const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_5.wav');

const transcript = [
	{text: 'Key', start: 0.0, end: 0.42},
	{text: 'lesson,', start: 0.42, end: 0.82},
	{text: 'while', start: 1.26, end: 1.46},
	{text: 'others', start: 1.46, end: 1.82},
	{text: 'retreat,', start: 1.82, end: 2.3},
	{text: 'you', start: 2.78, end: 2.9},
	{text: 'attack.', start: 2.9, end: 3.4},
	{text: 'The', start: 4.06, end: 4.34},
	{text: 'year', start: 4.34, end: 4.64},
	{text: 'is', start: 4.64, end: 4.86},
	{text: '2008.', start: 4.86, end: 5.66},
	{text: 'The', start: 6.16, end: 6.22},
	{text: 'global', start: 6.22, end: 6.54},
	{text: 'financial', start: 6.54, end: 6.98},
	{text: 'system', start: 6.98, end: 7.56},
	{text: 'is', start: 7.56, end: 7.78},
	{text: 'collapsing.', start: 7.78, end: 8.4},
	{text: 'Lehman', start: 9.02, end: 9.26},
	{text: 'Brothers', start: 9.26, end: 9.52},
	{text: 'is', start: 9.52, end: 9.82},
	{text: 'gone.', start: 9.82, end: 10.12},
	{text: 'The', start: 10.74, end: 10.84},
	{text: 'entire', start: 10.84, end: 11.32},
	{text: 'economy', start: 11.32, end: 11.88},
	{text: 'isn\'t', start: 11.88, end: 12.2},
	{text: 'a', start: 12.2, end: 12.26},
	{text: 'free', start: 12.26, end: 12.54},
	{text: 'fall.', start: 12.54, end: 12.76},
	{text: 'Businesses', start: 13.36, end: 13.86},
	{text: 'are', start: 13.86, end: 14.0},
	{text: 'laying', start: 14.0, end: 14.22},
	{text: 'people', start: 14.22, end: 14.56},
	{text: 'off.', start: 14.56, end: 14.84},
	{text: 'They', start: 15.2, end: 15.3},
	{text: 'are', start: 15.3, end: 15.4},
	{text: 'canceling', start: 15.4, end: 15.94},
	{text: 'projects.', start: 15.94, end: 16.36},
	{text: 'They', start: 16.76, end: 16.88},
	{text: 'are', start: 16.88, end: 17.0},
	{text: 'hoarding', start: 17.0, end: 17.52},
	{text: 'cash.', start: 17.52, end: 17.78},
	{text: 'Survival', start: 18.26, end: 18.82},
	{text: 'mode.', start: 18.82, end: 19.06},
	{text: 'What', start: 19.6, end: 19.84},
	{text: 'does', start: 19.84, end: 20.04},
	{text: 'Amazon', start: 20.04, end: 20.26},
	{text: 'do?', start: 20.26, end: 20.66},
	{text: 'They', start: 21.1, end: 21.24},
	{text: 'push', start: 21.24, end: 21.46},
	{text: 'forward', start: 21.46, end: 21.92},
	{text: 'with', start: 21.92, end: 22.12},
	{text: 'one', start: 22.12, end: 22.3},
	{text: 'of', start: 22.3, end: 22.4},
	{text: 'their', start: 22.4, end: 22.54},
	{text: 'strangest', start: 22.54, end: 23.22},
	{text: 'and', start: 23.22, end: 23.42},
	{text: 'most', start: 23.42, end: 23.7},
	{text: 'ambitious', start: 23.7, end: 24.16},
	{text: 'products', start: 24.16, end: 24.62},
	{text: 'yet.', start: 24.62, end: 24.96},
	{text: 'The', start: 25.4, end: 25.52},
	{text: 'Kindle,', start: 25.52, end: 26.0},
	{text: 'an', start: 26.32, end: 26.46},
	{text: 'electronic', start: 26.46, end: 26.92},
	{text: 'book', start: 26.92, end: 27.28},
	{text: 'reader.', start: 27.28, end: 27.6},
	{text: 'In', start: 27.94, end: 28.26},
	{text: 'the', start: 28.26, end: 28.38},
	{text: 'middle', start: 28.38, end: 28.68},
	{text: 'of', start: 28.68, end: 28.88},
	{text: 'a', start: 28.88, end: 28.98},
	{text: 'historic', start: 28.98, end: 29.5},
	{text: 'recession,', start: 29.5, end: 30.06},
	{text: 'they', start: 30.48, end: 30.58},
	{text: 'were', start: 30.58, end: 30.7},
	{text: 'trying', start: 30.7, end: 30.94},
	{text: 'to', start: 30.94, end: 31.1},
	{text: 'change', start: 31.1, end: 31.44},
	{text: 'how', start: 31.44, end: 31.64},
	{text: 'humanity', start: 31.64, end: 32.1},
	{text: 'had', start: 32.1, end: 32.48},
	{text: 'read', start: 32.48, end: 32.64},
	{text: 'books', start: 32.64, end: 32.96},
	{text: 'for', start: 32.96, end: 33.22},
	{text: 'over', start: 33.22, end: 33.5},
	{text: '500', start: 33.5, end: 34.12},
	{text: 'years.', start: 34.12, end: 34.62},
	{text: 'They', start: 34.94, end: 35.3},
	{text: 'were', start: 35.3, end: 35.42},
	{text: 'building', start: 35.42, end: 35.72},
	{text: 'new', start: 35.72, end: 35.94},
	{text: 'hardware.', start: 35.94, end: 36.34},
	{text: 'They', start: 36.78, end: 36.86},
	{text: 'were', start: 36.86, end: 36.98},
	{text: 'fighting', start: 36.98, end: 37.3},
	{text: 'with', start: 37.3, end: 37.54},
	{text: 'publishers.', start: 37.54, end: 37.98},
	{text: 'They', start: 38.46, end: 38.66},
	{text: 'were', start: 38.66, end: 38.8},
	{text: 'investing', start: 38.8, end: 39.28},
	{text: 'hundreds', start: 39.28, end: 39.78},
	{text: 'of', start: 39.78, end: 40.02},
	{text: 'millions', start: 40.02, end: 40.4},
	{text: 'of', start: 40.4, end: 40.66},
	{text: 'dollars', start: 40.66, end: 40.96},
	{text: 'while', start: 40.96, end: 41.3},
	{text: 'other', start: 41.3, end: 41.62},
	{text: 'companies', start: 41.62, end: 42.0},
	{text: 'were', start: 42.0, end: 42.2},
	{text: 'fighting', start: 42.2, end: 42.56},
	{text: 'for', start: 42.56, end: 42.78},
	{text: 'their', start: 42.78, end: 42.92},
	{text: 'lives.', start: 42.92, end: 43.38},
	{text: 'Recessions', start: 44.02, end: 44.56},
	{text: 'are', start: 44.56, end: 44.76},
	{text: 'a', start: 44.76, end: 44.86},
	{text: 'clearing', start: 44.86, end: 45.14},
	{text: 'event.', start: 45.14, end: 45.62},
	{text: 'The', start: 46.02, end: 46.08},
	{text: 'week', start: 46.08, end: 46.32},
	{text: 'get', start: 46.32, end: 46.62},
	{text: 'wiped', start: 46.62, end: 46.84},
	{text: 'out.', start: 46.84, end: 47.18},
	{text: 'The', start: 47.52, end: 47.62},
	{text: 'strong', start: 47.62, end: 47.98},
	{text: 'get', start: 47.98, end: 48.36},
	{text: 'stronger.', start: 48.36, end: 48.84},
	{text: 'Amazon', start: 49.46, end: 49.72},
	{text: 'used', start: 49.72, end: 50.18},
	{text: 'the', start: 50.18, end: 50.38},
	{text: '2008', start: 50.38, end: 50.98},
	{text: 'crisis', start: 50.98, end: 51.36},
	{text: 'to', start: 51.36, end: 51.72},
	{text: 'grab', start: 51.72, end: 52.0},
	{text: 'market', start: 52.0, end: 52.4},
	{text: 'share', start: 52.4, end: 52.66},
	{text: 'and', start: 52.66, end: 52.92},
	{text: 'create', start: 52.92, end: 53.22},
	{text: 'a', start: 53.22, end: 53.42},
	{text: 'brand', start: 53.42, end: 53.72},
	{text: 'new', start: 53.72, end: 54.0},
	{text: 'ecosystem', start: 54.0, end: 54.64},
	{text: 'around', start: 54.64, end: 55.04},
	{text: 'digital', start: 55.04, end: 55.42},
	{text: 'books.', start: 55.42, end: 55.88},
	{text: 'While', start: 56.29, end: 56.56},
	{text: 'everyone', start: 56.56, end: 57.04},
	{text: 'else', start: 57.04, end: 57.32},
	{text: 'was', start: 57.32, end: 57.48},
	{text: 'looking', start: 57.48, end: 57.76},
	{text: 'at', start: 57.76, end: 57.92},
	{text: 'their', start: 57.92, end: 58.06},
	{text: 'feet,', start: 58.06, end: 58.32},
	{text: 'they', start: 58.74, end: 58.84},
	{text: 'were', start: 58.84, end: 58.98},
	{text: 'looking', start: 58.98, end: 59.26},
	{text: 'at', start: 59.26, end: 59.5},
	{text: 'the', start: 59.5, end: 59.68},
	{text: 'horizon.', start: 59.68, end: 60.1},
];

const sentenceGroups = [
	[0, 6],
	[7, 17],
	[18, 21],
	[22, 28],
	[29, 41],
	[42, 43],
	[44, 60],
	[61, 68],
	[69, 83],
	[84, 93],
	[94, 107],
	[108, 119],
];

// --- Helper Components ---

const ParallaxScene: React.FC<{
	bgImage: string;
	mgImage?: string;
	fgImage?: string;
}> = ({bgImage, mgImage, fgImage}) => {
	const commonImgStyle: React.CSSProperties = {
		objectFit: 'cover',
		position: 'absolute',
		width: '100%',
		height: '100%',
		filter: 'blur(1px) brightness(0.8)',
	};

	return (
		<AbsoluteFill>
			<Img
				src={staticFile(`images/${bgImage}`)}
				style={{...commonImgStyle, transform: 'translateZ(-20px) scale(1.3)'}}
			/>
			{mgImage && (
				<Img
					src={staticFile(`images/${mgImage}`)}
					style={{...commonImgStyle, transform: 'translateZ(-10px) scale(1.15)'}}
				/>
			)}
			{fgImage && (
				<Img
					src={staticFile(`images/${fgImage}`)}
					style={{...commonImgStyle, transform: 'translateZ(-5px) scale(1.05)'}}
				/>
			)}
		</AbsoluteFill>
	);
};

const SubtitleLine: React.FC<{words: (typeof transcript)[0][]}> = ({
	words,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const textStyle: React.CSSProperties = {
		fontFamily: 'Helvetica, Arial, sans-serif',
		fontSize: '72px',
		fontWeight: 'bold',
		color: 'white',
		textAlign: 'center',
		lineHeight: '1.2',
		textShadow: '0 0 20px rgba(0,0,0,0.8)',
	};

	return (
		<p style={textStyle}>
			{words.map((word, i) => {
				const wordStartFrame = word.start * fps;
				const opacity = interpolate(
					frame,
					[wordStartFrame, wordStartFrame + 10],
					[0, 1],
					{extrapolateRight: 'clamp'}
				);

				return (
					<span
						key={i}
						style={{
							opacity,
							marginRight: '1rem',
							display: 'inline-block',
						}}
					>
						{word.text}
					</span>
				);
			})}
		</p>
	);
};

const Effects: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const dustOpacity = 0.07;
	const dustX = interpolate(frame, [0, durationInFrames], [0, -100]);
	const dustY = interpolate(frame, [0, durationInFrames], [0, -50]);

	return (
		<>
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile('images/dust_overlay.png')})`,
					backgroundSize: '300px 300px',
					backgroundRepeat: 'repeat',
					opacity: dustOpacity,
					transform: `translateX(${dustX}px) translateY(${dustY}px)`,
				}}
			/>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle, transparent 30%, black 100%)`,
					opacity: 0.8,
				}}
			/>
			<AbsoluteFill
				style={{
					boxShadow: `inset 0 0 200px rgba(0,0,0,0.7)`,
				}}
			/>
		</>
	);
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();

	// Define visual scenes mapped to the story beats
	const scenes = [
		{start: 0, end: 8, images: {bg: 'strategy_map.jpg'}},
		{
			start: 5,
			end: 19,
			images: {bg: 'stock_market_crash.jpg', fg: 'empty_office.jpg'},
		},
		{
			start: 18,
			end: 34,
			images: {bg: 'old_library.jpg', fg: 'kindle_device.jpg'},
		},
		{
			start: 33,
			end: 44,
			images: {bg: 'investment_graph.jpg', fg: 'closed_store.jpg'},
		},
		{
			start: 43,
			end: 56,
			images: {bg: 'forest_regrowth.jpg', fg: 'amazon_logo.jpg'},
		},
		{
			start: 55,
			end: 61,
			images: {bg: 'vast_horizon.jpg', fg: 'feet_on_ground.jpg'},
		},
	];

	// Cinematic Camera Movement
	const cameraZoom = interpolate(frame, [0, durationInFrames], [1.1, 1.4], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const cameraPanX = interpolate(frame, [0, durationInFrames], [-80, 80], {
		easing: Easing.sin,
	});
	const cameraPanY = interpolate(frame, [0, durationInFrames], [40, -40], {
		easing: Easing.cos,
	});

	const cameraContainerStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		transformStyle: 'preserve-3d',
		perspective: '150px',
		transform: `scale(${cameraZoom}) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`,
	};

	const subtitleContainerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '0 10%',
	};

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<Audio src={audioSrc} />

			<div style={cameraContainerStyle}>
				{scenes.map((scene, i) => {
					const startFrame = scene.start * fps;
					const endFrame = scene.end * fps;
					const sceneDuration = endFrame - startFrame;
					const fadeDuration = 1 * fps;

					const opacity = interpolate(
						frame,
						[
							startFrame,
							startFrame + fadeDuration,
							endFrame - fadeDuration,
							endFrame,
						],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
					);

					return (
						<Sequence key={i} from={startFrame} durationInFrames={sceneDuration}>
							<AbsoluteFill style={{opacity}}>
								<ParallaxScene {...scene.images} />
							</AbsoluteFill>
						</Sequence>
					);
				})}
			</div>

			<Effects />

			<AbsoluteFill>
				{sentenceGroups.map((group, i) => {
					const startIdx = group[0];
					const endIdx = group[1];
					const wordsInGroup = transcript.slice(startIdx, endIdx + 1);
					const startFrame = wordsInGroup[0].start * fps;
					const endFrame = wordsInGroup[wordsInGroup.length - 1].end * fps;
					const duration = endFrame - startFrame + 2 * fps; // Add buffer

					const opacity = interpolate(
						frame,
						[startFrame, startFrame + 15, endFrame + 30, endFrame + 45],
						[0, 1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
					);

					return (
						<Sequence key={i} from={startFrame} durationInFrames={duration}>
							<AbsoluteFill style={{...subtitleContainerStyle, opacity}}>
								<SubtitleLine words={wordsInGroup} />
							</AbsoluteFill>
						</Sequence>
					);
				})}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```