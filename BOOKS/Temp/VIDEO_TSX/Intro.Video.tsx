```tsx
import {
	AbsoluteFill,
	Audio,
	Sequence,
	Img,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	spring,
	Easing,
} from 'remotion';
import React, { useMemo } from 'react';

// --- Data Structures --- //
type Word = {
	text: string;
	start: number;
	end: number;
};

const transcript: Word[] = [
	{ text: 'They', start: 0.0, end: 0.48 },
	{ text: 'tell', start: 0.48, end: 0.72 },
	{ text: 'you', start: 0.72, end: 0.96 },
	{ text: 'to', start: 0.96, end: 1.14 },
	{ text: 'follow', start: 1.14, end: 1.54 },
	{ text: 'the', start: 1.54, end: 1.82 },
	{ text: 'rules.', start: 1.82, end: 2.24 },
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
	{ text: 'They', start: 7.44, end: 7.66 },
	{ text: 'tell', start: 7.66, end: 7.9 },
	{ text: 'you', start: 7.9, end: 8.1 },
	{ text: 'to', start: 8.1, end: 8.32 },
	{ text: 'be', start: 8.32, end: 8.5 },
	{ text: 'profitable.', start: 8.5, end: 9.12 },
	{ text: 'This', start: 9.86, end: 10.18 },
	{ text: 'is', start: 10.18, end: 10.44 },
	{ text: 'the', start: 10.44, end: 10.6 },
	{ text: 'advice', start: 10.6, end: 10.9 },
	{ text: 'that', start: 10.9, end: 11.18 },
	{ text: 'creates', start: 11.18, end: 11.48 },
	{ text: 'small,', start: 11.48, end: 12.08 },
	{ text: 'forgettable', start: 12.28, end: 12.94 },
	{ text: 'companies.', start: 12.94, end: 13.36 },
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
	{ text: 'This', start: 17.26, end: 17.62 },
	{ text: 'is', start: 17.62, end: 17.86 },
	{ text: 'the', start: 17.86, end: 18.02 },
	{ text: 'story', start: 18.02, end: 18.36 },
	{ text: 'of', start: 18.36, end: 18.58 },
	{ text: 'a', start: 18.58, end: 18.66 },
	{ text: 'system,', start: 18.66, end: 19.16 },
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
	{ text: 'a', start: 23.32, end: 23.48 },
	{ text: 'machine', start: 23.48, end: 23.86 },
	{ text: 'that', start: 23.86, end: 24.34 },
	{ text: 'ate', start: 24.34, end: 24.7 },
	{ text: 'the', start: 24.7, end: 25.1 },
	{ text: 'world.', start: 25.1, end: 25.5 },
];

const sentences: Word[][] = [
	transcript.slice(0, 7),
	transcript.slice(7, 23),
	transcript.slice(23, 29),
	transcript.slice(29, 37),
	transcript.slice(37, 47),
	transcript.slice(47, 54),
	transcript.slice(54, 64),
	transcript.slice(64, 70),
];

// --- Sub-Components --- //

const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const startFrame = word.start * fps;
	const endFrame = word.end * fps;

	const isSpeaking = frame >= startFrame && frame <= endFrame;

	const opacity = isSpeaking ? 1 : 0.4;
	const textShadow = isSpeaking
		? '0 0 20px #fff, 0 0 30px #fff, 0 0 40px #00aeff'
		: 'none';
	const scale = isSpeaking ? 1.05 : 1;

	return (
		<span
			style={{
				display: 'inline-block',
				opacity,
				transform: `scale(${scale})`,
				transition: 'opacity 0.2s, transform 0.2s, text-shadow 0.2s',
				textShadow,
				marginRight: '0.2em',
			}}
		>
			{word.text}
		</span>
	);
};

const Sentence: React.FC<{ words: Word[] }> = ({ words }) => {
	const { fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const firstWord = words[0];
	const lastWord = words[words.length - 1];

	const startFrame = firstWord.start * fps - 15;
	const endFrame = lastWord.end * fps + 15;

	const opacity = interpolate(
		frame,
		[startFrame, startFrame + 15, endFrame - 15, endFrame],
		[0, 1, 1, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	const translateY = interpolate(
		frame,
		[startFrame, startFrame + 15],
		[20, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.ease) }
	);

	if (opacity === 0) {
		return null;
	}

	return (
		<div
			style={{
				textAlign: 'center',
				fontSize: '80px',
				fontWeight: 'bold',
				fontFamily: `Georgia, 'Times New Roman', Times, serif`,
				color: 'white',
				opacity,
				transform: `translateY(${translateY}px)`,
			}}
		>
			{words.map((word, i) => (
				<WordComponent key={`${word.text}-${i}`} word={word} />
			))}
		</div>
	);
};

// --- Main Video Component --- //

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Camera Animation
	const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.2], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const cameraPanX = interpolate(
		frame,
		[0, durationInFrames / 2, durationInFrames],
		[0, -50, 100],
		{ easing: Easing.bezier(0.5, 0, 0.5, 1) }
	);
	const cameraPanY = interpolate(
		frame,
		[0, durationInFrames / 2, durationInFrames],
		[0, 25, -50],
		{ easing: Easing.bezier(0.5, 0, 0.5, 1) }
	);

	const cameraTransform = `scale(${cameraZoom}) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`;

	// Parallax Layer Animations (move in opposition to camera for depth)
	const bgPanX = interpolate(frame, [0, durationInFrames], [0, 50]);
	const mgPanX = interpolate(frame, [0, durationInFrames], [0, 150]);
	const fgPanX = interpolate(frame, [0, durationInFrames], [0, 250]);

	// Artistic Effects Animation
	const dustOpacity = useMemo(() => {
		const noise = (t: number) => Math.sin(t * 2) * 0.1 + Math.cos(t * 5) * 0.05;
		return interpolate(
			frame,
			[0, durationInFrames],
			[0.2 + noise(0), 0.3 + noise(durationInFrames / 30)]
		);
	}, [frame, durationInFrames]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Intro.wav')} />

			{/* Scene Container with Camera Movement */}
			<AbsoluteFill style={{ transform: cameraTransform }}>
				
				{/* Background Layer */}
				<AbsoluteFill
					style={{
						transform: `translateX(${bgPanX}px) scale(1.3)`,
						opacity: 0.8,
					}}
				>
					<Img
						src={staticFile('assets/images/background.jpg')}
						style={{ objectFit: 'cover', width: '100%', height: '100%' }}
					/>
				</AbsoluteFill>

				{/* Midground Layer */}
				<AbsoluteFill
					style={{
						transform: `translateX(${mgPanX}px) scale(1.4)`,
						opacity: 0.6,
					}}
				>
					<Img
						src={staticFile('assets/images/midground.jpg')}
						style={{ objectFit: 'cover', width: '100%', height: '100%' }}
					/>
				</AbsoluteFill>

				{/* Foreground Layer */}
				<AbsoluteFill
					style={{
						transform: `translateX(${fgPanX}px) scale(1.5)`,
						opacity: 0.4,
					}}
				>
					<Img
						src={staticFile('assets/images/foreground.jpg')}
						style={{ objectFit: 'cover', width: '100%', height: '100%' }}
					/>
				</AbsoluteFill>

				{/* Dust / Light Particles Overlay */}
				<AbsoluteFill style={{ opacity: dustOpacity }}>
					<Img
						src={staticFile('assets/images/dust-overlay.png')}
						style={{
							objectFit: 'cover',
							width: '100%',
							height: '100%',
							mixBlendMode: 'screen',
						}}
					/>
				</AbsoluteFill>
			</AbsoluteFill>

			{/* Text Sequences */}
			<AbsoluteFill
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					padding: '0 100px',
				}}
			>
				{sentences.map((wordArray, i) => {
					const firstWord = wordArray[0];
					const lastWord = wordArray[wordArray.length - 1];
					const startSec = firstWord.start;
					const endSec = lastWord.end;
					const { fps } = useVideoConfig();

					return (
						<Sequence
							key={i}
							from={startSec * fps - 20}
							durationInFrames={(endSec - startSec) * fps + 40}
						>
							<Sentence words={wordArray} />
						</Sequence>
					);
				})}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```