```tsx
import React from 'react';
import {
	AbsoluteFill,
	Img,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	Audio,
} from 'remotion';
import { interpolate, Easing } from 'remotion';
import { random } from '@remotion/random';

// --- Helper Components ---

type FadingTextProps = {
	children: React.ReactNode;
	style: React.CSSProperties;
	durationInFrames: number;
};

const FadingText: React.FC<FadingTextProps> = ({
	children,
	style,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const FADE_DURATION = 20; // Fade in/out over 20 frames

	const opacity = interpolate(
		frame,
		[0, FADE_DURATION, durationInFrames - FADE_DURATION, durationInFrames],
		[0, 1, 1, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);

	return <div style={{ ...style, opacity }}>{children}</div>;
};

const Dust: React.FC<{ count?: number }> = ({ count = 50 }) => {
	const { width, height } = useVideoConfig();
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			{Array.from({ length: count }).map((_, i) => {
				const seed = `particle-${i}`;
				const x = random(seed + 'x') * width;
				const yStart = random(seed + 'y') * height;
				const size = random(seed + 'size') * 3 + 1;
				const speed = random(seed + 'speed') * 0.5 + 0.2;
				const initialOpacity = random(seed + 'opacity') * 0.4 + 0.1;

				const y = (yStart - frame * speed) % height;

				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y < 0 ? y + height : y,
							width: size,
							height: size,
							backgroundColor: 'rgba(255, 255, 255, 0.8)',
							borderRadius: '50%',
							opacity: initialOpacity,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames, fps } = useVideoConfig();

	const secToFrame = (sec: number) => Math.round(sec * fps);

	// --- Cinematic Camera Animation ---
	const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.15], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const cameraPanX = interpolate(frame, [0, durationInFrames], [-50, 50], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const cameraPanY = interpolate(frame, [0, durationInFrames], [20, -20], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});

	const cameraTransform = `scale(${cameraZoom}) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`;

	// --- Text Sequences Data ---
	const textSequences = [
		{ start: 0.0, end: 1.26, text: 'Key lesson,' },
		{ start: 1.26, end: 4.84, text: 'turn your biggest expense<br/>into your biggest product.' },
		{ start: 4.84, end: 7.4, text: 'The year is 2006.' },
		{ start: 7.4, end: 10.2, text: 'Amazon is a successful<br/>online retailer.' },
		{ start: 10.2, end: 12.24, text: 'That is what everyone sees.' },
		{ start: 12.24, end: 15.0, text: 'But inside, something else<br/>is happening.' },
		{ start: 15.0, end: 21.0, text: "For years, the company's biggest headache<br/>and biggest expense was its own<br/>computing infrastructure." },
		{ start: 21.0, end: 26.06, text: 'The servers, the databases, the network<br/>to run the massive Amazon.com website.' },
		{ start: 26.74, end: 28.04, text: 'It was a beast.' },
		{ start: 28.04, end: 31.14, text: 'It was complex and<br/>incredibly expensive.' },
		{ start: 31.14, end: 33.54, text: 'A normal company sees<br/>a cost center.' },
		{ start: 33.54, end: 37.06, text: 'They try to make it a little cheaper,<br/>a little more efficient.' },
		{ start: 37.06, end: 39.02, text: 'Amazon saw an opportunity.' },
		{ start: 39.02, end: 45.06, text: 'They thought, "if we have gotten this good<br/>at running massive, reliable computer systems<br/>for ourselves,"' },
		{ start: 45.06, end: 47.42, text: 'maybe other people would pay<br/>to use it.' },
		{ start: 47.42, end: 52.28, text: 'In 2006, they launched<br/>Amazon Web Services, or AWS.' },
		{ start: 52.28, end: 54.46, text: 'They started renting out<br/>their computer power.' },
		{ start: 54.46, end: 58.06, text: 'It was like a power company,<br/>but for computing.' },
		{ start: 58.06, end: 60.2, text: 'At first, no one understood it.' },
		{ start: 60.2, end: 63.3, text: 'An online bookstore was now<br/>selling server time.' },
		{ start: 63.3, end: 64.9, text: 'It made no sense.' },
		{ start: 64.9, end: 68.4, text: 'But it was the start of the<br/>cloud computing revolution.' },
		{ start: 68.4, end: 74.5, text: 'A multi-trillion dollar industry was born<br/>from what used to be a line item<br/>in their expense report.' },
	];

	const textStyle: React.CSSProperties = {
		fontFamily: 'Helvetica, Arial, sans-serif',
		fontSize: 72,
		fontWeight: 'bold',
		color: 'white',
		textAlign: 'center',
		textShadow: '0 0 20px rgba(255, 255, 255, 0.7)',
		lineHeight: 1.2,
		padding: '0 40px',
	};

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_4.wav')} />

			{/* Parallax Scene */}
			<AbsoluteFill style={{ transform: cameraTransform }}>
				<AbsoluteFill style={{ transform: `translateX(${cameraPanX * 0.2}px) translateY(${cameraPanY * 0.2}px) scale(1.5)` }}>
					<Img src={staticFile('assets/images/data-center-bg.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'blur(5px)' }} />
				</AbsoluteFill>
				<AbsoluteFill style={{ transform: `translateX(${cameraPanX * 0.5}px) translateY(${cameraPanY * 0.5}px) scale(1.3)` }}>
					<Img src={staticFile('assets/images/server-racks-mid.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
				</AbsoluteFill>
				<AbsoluteFill style={{ transform: `translateX(${cameraPanX * 1.1}px) translateY(${cameraPanY * 1.1}px) scale(1.1)` }}>
					<Img src={staticFile('assets/images/digital-overlay-fg.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2, mixBlendMode: 'screen' }} />
				</AbsoluteFill>
			</AbsoluteFill>

			{/* Artistic Overlays */}
			<Dust count={70} />
			<AbsoluteFill style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)' }} />

			{/* Text Sequences */}
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
				{textSequences.map((seq, index) => {
					const from = secToFrame(seq.start);
					const duration = secToFrame(seq.end) - from;
					return (
						<Sequence key={index} from={from} durationInFrames={duration}>
							<FadingText durationInFrames={duration} style={textStyle}>
								<div dangerouslySetInnerHTML={{ __html: seq.text }} />
							</FadingText>
						</Sequence>
					);
				})}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```