```tsx
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Sequence,
	Img,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	Easing,
} from 'remotion';

// --- Constants ---
const FPS = 30;
const DURATION_IN_SECONDS = 26;
const DURATION_IN_FRAMES = DURATION_IN_SECONDS * FPS;

// --- Helper Components ---

type WordProps = {
	text: string;
	start: number; // in frames
	end: number; // in frames
};

const Word: React.FC<WordProps> = ({ text, start, end }) => {
	const frame = useCurrentFrame();
	const FADE_IN_DURATION = 6;
	const FADE_OUT_DURATION = 6;

	// Calculate opacity
	const opacity = interpolate(
		frame,
		[
			start,
			start + FADE_IN_DURATION,
			end - FADE_OUT_DURATION,
			end,
		],
		[0, 1, 1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	// Calculate vertical movement
	const y = interpolate(
		frame,
		[start, start + FADE_IN_DURATION],
		[15, 0],
		{
			easing: Easing.out(Easing.ease),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	// Pre-calculated style
	const wordStyle: React.CSSProperties = {
		display: 'inline-block',
		opacity,
		transform: `translateY(${y}px)`,
		marginLeft: '0.5em',
		marginRight: '0.5em',
	};

	return <span style={wordStyle}>{text}</span>;
};

const DustOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Calculate movement
	const x = interpolate(frame, [0, durationInFrames], [0, -100]);
	const y = interpolate(frame, [0, durationInFrames], [0, -50]);
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	// Pre-calculated style
	const overlayStyle: React.CSSProperties = {
		width: '150%',
		height: '150%',
		opacity,
		transform: `translate(${x}px, ${y}px)`,
	};

	return (
		<AbsoluteFill>
			<Img
				src={staticFile('assets/images/dust-overlay.png')}
				style={overlayStyle}
			/>
		</AbsoluteFill>
	);
};

const Glow: React.FC<{ color: string; size: number; opacity: number }> = ({ color, size, opacity }) => {
	const glowStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
		opacity,
		transform: `scale(${size / 200})`,
	};

	return (
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
			<div style={glowStyle} />
		</AbsoluteFill>
	);
};

// --- Scene Components ---

const timeToFrame = (time: number) => time * FPS;

const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Calculations for animation
	const zoom = interpolate(frame, [0, durationInFrames], [1.2, 1]);
	const rulebookY = interpolate(frame, [0, durationInFrames], [-20, 20]);
	const bgX = interpolate(frame, [0, durationInFrames], [0, -100]);
	const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

	// Pre-calculated styles
	const containerStyle: React.CSSProperties = {
		transform: `scale(${zoom})`,
		opacity,
	};
	const bgStyle: React.CSSProperties = {
		width: '120%',
		height: '120%',
		top: '-10%',
		left: '-10%',
		objectFit: 'cover',
		transform: `translateX(${bgX}px)`,
	};
	const rulebookStyle: React.CSSProperties = {
		width: '40%',
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: `translate(-50%, -50%) translateY(${rulebookY}px)`,
		filter: 'blur(3px) brightness(0.8)',
		opacity: 0.5,
	};
	const textContainerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		color: 'white',
		fontSize: '120px',
		fontFamily: 'Arial, sans-serif',
		fontWeight: 'bold',
		textAlign: 'center',
	};

	const words = [
		{ text: 'They', start: timeToFrame(0.00), end: timeToFrame(0.48) },
		{ text: 'tell', start: timeToFrame(0.48), end: timeToFrame(0.72) },
		{ text: 'you', start: timeToFrame(0.72), end: timeToFrame(0.96) },
		{ text: 'to', start: timeToFrame(0.96), end: timeToFrame(1.14) },
		{ text: 'follow', start: timeToFrame(1.14), end: timeToFrame(1.54) },
		{ text: 'the', start: timeToFrame(1.54), end: timeToFrame(1.82) },
		{ text: 'rules.', start: timeToFrame(1.82), end: timeToFrame(2.24) },
	];

	return (
		<AbsoluteFill style={containerStyle}>
			<Img src={staticFile('assets/images/grid-background.jpg')} style={bgStyle} />
			<Img src={staticFile('assets/images/rulebook.png')} style={rulebookStyle} />
			<AbsoluteFill style={textContainerStyle}>
				<div>
					{words.map((w, i) => (
						<Word key={i} {...w} />
					))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Calculations
	const panX = interpolate(frame, [0, durationInFrames], [150, -150]);
	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.15]);
	const sheetParallaxX = interpolate(frame, [0, durationInFrames], [-20, 20]);
	const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

	// Styles
	const containerStyle: React.CSSProperties = {
		transform: `translateX(${panX}px) scale(${zoom})`,
		opacity,
	};
	const bgStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		filter: 'blur(5px)',
	};
	const sheetStyle: React.CSSProperties = {
		position: 'absolute',
		width: '80%',
		top: '50%',
		left: '50%',
		transform: `translate(-50%, -50%) translateX(${sheetParallaxX}px)`,
		opacity: 0.9,
	};
	const textContainerStyle: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		color: 'white',
		fontSize: '100px',
		fontFamily: 'Helvetica, sans-serif',
		fontWeight: 'bold',
		textAlign: 'center',
		textShadow: '0 0 10px black',
	};

	const wordsLine1 = [
		{ text: 'They', start: timeToFrame(2.54), end: timeToFrame(2.98) },
		{ text: 'tell', start: timeToFrame(2.98), end: timeToFrame(3.20) },
		{ text: 'you', start: timeToFrame(3.20), end: timeToFrame(3.42) },
		{ text: 'to', start: timeToFrame(3.42), end: timeToFrame(3.56) },
		{ text: 'build', start: timeToFrame(3.56), end: timeToFrame(3.88) },
		{ text: 'a', start: timeToFrame(3.88), end: timeToFrame(4.04) },
		{ text: 'business', start: timeToFrame(4.04), end: timeToFrame(4.38) },
	];
	const wordsLine2 = [
		{ text: 'that', start: timeToFrame(4.38), end: timeToFrame(4.66) },
		{ text: 'makes', start: timeToFrame(4.66), end: timeToFrame(4.88) },
		{ text: 'sense', start: timeToFrame(4.88), end: timeToFrame(5.22) },
		{ text: 'on', start: timeToFrame(5.22), end: timeToFrame(5.46) },
		{ text: 'a', start: timeToFrame(5.46), end: timeToFrame(5.58) },
		{ text: 'spreadsheet', start: timeToFrame(5.58), end: timeToFrame(6.00) },
	];
	const wordsLine3 = [
		{ text: 'from', start: timeToFrame(6.00), end: timeToFrame(6.32) },
		{ text: 'day', start: timeToFrame(6.32), end: timeToFrame(6.58) },
		{ text: 'one.', start: timeToFrame(6.58), end: timeToFrame(6.90) },
	];

	return (
		<AbsoluteFill style={containerStyle}>
			<Img src={staticFile('assets/images/office-background.jpg')} style={bgStyle} />
			<Img src={staticFile('assets/images/spreadsheet.png')} style={sheetStyle} />
			<AbsoluteFill style={textContainerStyle}>
				<div>{wordsLine1.map((w, i) => <Word key={i} {...w} />)}</div>
				<div>{wordsLine2.map((w, i) => <Word key={i} {...w} />)}</div>
				<div>{wordsLine3.map((w, i) => <Word key={i} {...w} />)}</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Calculations
	const dollyZoom = interpolate(frame, [0, durationInFrames], [2, 1]);
	const signScale = interpolate(frame, [0, durationInFrames], [0.5, 1]);
	const glowOpacity = interpolate(frame, [0, durationInFrames], [0.2, 0.6], { easing: Easing.sin });
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	// Styles
	const containerStyle: React.CSSProperties = { transform: `scale(${dollyZoom})`, opacity };
	const bgStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
	const signStyle: React.CSSProperties = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		width: '20%',
		transform: `translate(-50%, -50%) scale(${signScale})`,
	};
	const textContainerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		color: '#FFD700',
		fontSize: '150px',
		fontFamily: 'Georgia, serif',
		fontWeight: 'bold',
		textShadow: '0 0 20px black',
	};

	const words = [
		{ text: 'They', start: timeToFrame(7.44), end: timeToFrame(7.66) },
		{ text: 'tell', start: timeToFrame(7.66), end: timeToFrame(7.90) },
		{ text: 'you', start: timeToFrame(7.90), end: timeToFrame(8.10) },
		{ text: 'to', start: timeToFrame(8.10), end: timeToFrame(8.32) },
		{ text: 'be', start: timeToFrame(8.32), end: timeToFrame(8.50) },
		{ text: 'profitable.', start: timeToFrame(8.50), end: timeToFrame(9.12) },
	];

	return (
		<AbsoluteFill style={containerStyle}>
			<Img src={staticFile('assets/images/vault-background.jpg')} style={bgStyle} />
			<Glow color="#FFD700" size={800} opacity={glowOpacity} />
			<Img src={staticFile('assets/images/dollar-sign.png')} style={signStyle} />
			<AbsoluteFill style={textContainerStyle}>
				<div>
					{words.map((w, i) => (
						<Word key={i} {...w} />
					))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Calculations
	const panY = interpolate(frame, [0, durationInFrames], [-50, 50]);
	const zoom = interpolate(frame, [0, durationInFrames], [1.2, 1]);
	const textFadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0]);
	const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

	// Styles
	const containerStyle: React.CSSProperties = { transform: `translateY(${panY}px) scale(${zoom})`, opacity };
	const bgStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		filter: 'saturate(0.2) brightness(0.7)',
	};
	const textContainerStyle: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		color: '#cccccc',
		fontSize: '110px',
		fontFamily: 'sans-serif',
		fontWeight: 300,
		textAlign: 'center',
		opacity: textFadeOut,
	};

	const wordsLine1 = [
		{ text: 'This', start: timeToFrame(9.86), end: timeToFrame(10.18) },
		{ text: 'is', start: timeToFrame(10.18), end: timeToFrame(10.44) },
		{ text: 'the', start: timeToFrame(10.44), end: timeToFrame(10.60) },
		{ text: 'advice', start: timeToFrame(10.60), end: timeToFrame(10.90) },
		{ text: 'that', start: timeToFrame(10.90), end: timeToFrame(11.18) },
		{ text: 'creates', start: timeToFrame(11.18), end: timeToFrame(11.48) },
	];
	const wordsLine2 = [
		{ text: 'small,', start: timeToFrame(11.48), end: timeToFrame(12.08) },
		{ text: 'forgettable', start: timeToFrame(12.28), end: timeToFrame(12.94) },
		{ text: 'companies.', start: timeToFrame(12.94), end: timeToFrame(13.36) },
	];

	return (
		<AbsoluteFill style={containerStyle}>
			<Img src={staticFile('assets/images/gray-cityscape.jpg')} style={bgStyle} />
			<DustOverlay />
			<AbsoluteFill style={textContainerStyle}>
				<div>{wordsLine1.map((w, i) => <Word key={i} {...w} />)}</div>
				<div>{wordsLine2.map((w, i) => <Word key={i} {...w} />)}</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Calculations
	const crackScale = interpolate(frame, [10, durationInFrames], [0, 1.5], { easing: Easing.ease });
	const crackOpacity = interpolate(frame, [10, 30], [0, 1]);
	const glowOpacity = interpolate(frame, [20, durationInFrames], [0, 0.4], { easing: Easing.sin });
	const opacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0]);

	// Styles
	const containerStyle: React.CSSProperties = { backgroundColor: 'black', opacity };
	const crackStyle: React.CSSProperties = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		width: '80%',
		transform: `translate(-50%, -50%) scale(${crackScale})`,
		opacity: crackOpacity,
	};
	const textContainerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		color: 'white',
		fontSize: '90px',
		fontFamily: 'serif',
		textAlign: 'center',
	};

	const words = [
		{ text: 'This', start: timeToFrame(14.08), end: timeToFrame(14.42) },
		{ text: 'is', start: timeToFrame(14.42), end: timeToFrame(14.66) },
		{ text: 'not', start: timeToFrame(14.66), end: timeToFrame(15.00) },
		{ text: 'the', start: timeToFrame(15.00), end: timeToFrame(15.18) },
		{ text: 'story', start: timeToFrame(15.18), end: timeToFrame(15.50) },
		{ text: 'of', start: timeToFrame(15.50), end: timeToFrame(15.72) },
		{ text: 'one', start: timeToFrame(15.72), end: timeToFrame(15.88) },
		{ text: 'of', start: timeToFrame(15.88), end: timeToFrame(16.00) },
		{ text: 'those', start: timeToFrame(16.00), end: timeToFrame(16.24) },
		{ text: 'companies.', start: timeToFrame(16.24), end: timeToFrame(16.70) },
	];

	return (
		<AbsoluteFill style={containerStyle}>
			<Glow color="#4169E1" size={1200} opacity={glowOpacity} />
			<Img src={staticFile('assets/images/light-crack.png')} style={crackStyle} />
			<AbsoluteFill style={textContainerStyle}>
				<div>
					{words.map((w, i) => (
						<Word key={i} {...w} />
					))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Calculations
	const zoom = interpolate(frame, [0, durationInFrames], [1.5, 1]);
	const rotation = interpolate(frame, [0, durationInFrames], [0, 10]);
	const bgParallax = interpolate(frame, [0, durationInFrames], [0, -50]);
	const midParallax = interpolate(frame, [0, durationInFrames], [0, -100]);
	const foreParallax = interpolate(frame, [0, durationInFrames], [0, -150]);
	const opacity = interpolate(frame, [0, 20, durationInFrames - 20, durationInFrames], [0, 1, 1, 0]);

	// Styles
	const containerStyle: React.CSSProperties = {
		transform: `scale(${zoom}) rotate(${rotation}deg)`,
		opacity,
	};
	const layerStyle: React.CSSProperties = {
		position: 'absolute',
		width: '130%',
		height: '130%',
		top: '-15%',
		left: '-15%',
	};
	const bgStyle: React.CSSProperties = { ...layerStyle, transform: `translateX(${bgParallax}px)` };
	const midStyle: React.CSSProperties = { ...layerStyle, transform: `translateX(${midParallax}px)` };
	const foreStyle: React.CSSProperties = { ...layerStyle, transform: `translateX(${foreParallax}px)` };
	const textContainerStyle: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		color: '#00FFFF',
		fontSize: '90px',
		fontFamily: 'monospace',
		textAlign: 'center',
		textShadow: '0 0 15px #00FFFF',
	};

	const wordsLine1 = [
		{ text: 'This', start: timeToFrame(17.26), end: timeToFrame(17.62) },
		{ text: 'is', start: timeToFrame(17.62), end: timeToFrame(17.86) },
		{ text: 'the', start: timeToFrame(17.86), end: timeToFrame(18.02) },
		{ text: 'story', start: timeToFrame(18.02), end: timeToFrame(18.36) },
		{ text: 'of', start: timeToFrame(18.36), end: timeToFrame(18.58) },
		{ text: 'a', start: timeToFrame(18.58), end: timeToFrame(18.66) },
		{ text: 'system,', start: timeToFrame(18.66), end: timeToFrame(19.16) },
	];
	const wordsLine2 = [
		{ text: 'a', start: timeToFrame(19.70), end: timeToFrame(19.82) },
		{ text: 'machine', start: timeToFrame(19.82), end: timeToFrame(20.22) },
		{ text: 'built', start: timeToFrame(20.22), end: timeToFrame(20.60) },
		{ text: 'on', start: timeToFrame(20.60), end: timeToFrame(20.86) },
		{ text: 'a', start: timeToFrame(20.86), end: timeToFrame(20.96) },
		{ text: 'completely', start: timeToFrame(20.96), end: timeToFrame(21.44) },
	];
	const wordsLine3 = [
		{ text: 'different', start: timeToFrame(21.44), end: timeToFrame(22.08) },
		{ text: 'set', start: timeToFrame(22.08), end: timeToFrame(22.36) },
		{ text: 'of', start: timeToFrame(22.36), end: timeToFrame(22.48) },
		{ text: 'rules,', start: timeToFrame(22.48), end: timeToFrame(22.80) },
	];

	return (
		<AbsoluteFill style={containerStyle}>
			<Img src={staticFile('assets/images/circuitry-background.jpg')} style={bgStyle} />
			<Img src={staticFile('assets/images/gears-midground.png')} style={midStyle} />
			<Img src={staticFile('assets/images/gears-foreground.png')} style={foreStyle} />
			<AbsoluteFill style={textContainerStyle}>
				<div>{wordsLine1.map((w, i) => <Word key={i} {...w} />)}</div>
				<div>{wordsLine2.map((w, i) => <Word key={i} {...w} />)}</div>
				<div>{wordsLine3.map((w, i) => <Word key={i} {...w} />)}</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Scene7: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Calculations
	const dollyZoom = interpolate(frame, [0, durationInFrames], [2, 1]);
	const earthRotation = interpolate(frame, [0, durationInFrames], [0, -20]);
	const machineOpacity = interpolate(frame, [10, durationInFrames], [0, 0.6]);
	const opacity = interpolate(frame, [0, 20], [0, 1]);

	// Styles
	const containerStyle: React.CSSProperties = { transform: `scale(${dollyZoom})`, opacity };
	const bgStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
	const earthStyle: React.CSSProperties = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		width: '70%',
		transform: `translate(-50%, -50%) rotate(${earthRotation}deg)`,
	};
	const overlayStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		opacity: machineOpacity,
		mixBlendMode: 'hard-light',
	};
	const textContainerStyle: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		color: '#FF4500',
		fontSize: '130px',
		fontFamily: 'Impact, sans-serif',
		textAlign: 'center',
		textShadow: '0 0 10px black',
	};

	const words = [
		{ text: 'a', start: timeToFrame(23.32), end: timeToFrame(23.48) },
		{ text: 'machine', start: timeToFrame(23.48), end: timeToFrame(23.86) },
		{ text: 'that', start: timeToFrame(23.86), end: timeToFrame(24.34) },
		{ text: 'ate', start: timeToFrame(24.34), end: timeToFrame(24.70) },
		{ text: 'the', start: timeToFrame(24.70), end: timeToFrame(25.10) },
		{ text: 'world.', start: timeToFrame(25.10), end: timeToFrame(25.50) },
	];

	return (
		<AbsoluteFill style={containerStyle}>
			<Img src={staticFile('assets/images/space-background.jpg')} style={bgStyle} />
			<Img src={staticFile('assets/images/earth.png')} style={earthStyle} />
			<AbsoluteFill>
				<Img src={staticFile('assets/images/machine-overlay.png')} style={overlayStyle} />
			</AbsoluteFill>
			<AbsoluteFill style={textContainerStyle}>
				<div>
					{words.map((w, i) => (
						<Word key={i} {...w} />
					))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Intro.wav')} />

			<Sequence from={0} durationInFrames={timeToFrame(2.54)}>
				<Scene1 />
			</Sequence>

			<Sequence from={timeToFrame(2.54)} durationInFrames={timeToFrame(7.44 - 2.54)}>
				<Scene2 />
			</Sequence>

			<Sequence from={timeToFrame(7.44)} durationInFrames={timeToFrame(9.86 - 7.44)}>
				<Scene3 />
			</Sequence>

			<Sequence from={timeToFrame(9.86)} durationInFrames={timeToFrame(14.08 - 9.86)}>
				<Scene4 />
			</Sequence>

			<Sequence from={timeToFrame(14.08)} durationInFrames={timeToFrame(17.26 - 14.08)}>
				<Scene5 />
			</Sequence>

			<Sequence from={timeToFrame(17.26)} durationInFrames={timeToFrame(23.32 - 17.26)}>
				<Scene6 />
			</Sequence>

			<Sequence from={timeToFrame(23.32)} durationInFrames={DURATION_IN_FRAMES - timeToFrame(23.32)}>
				<Scene7 />
			</Sequence>
		</AbsoluteFill>
	);
};
```