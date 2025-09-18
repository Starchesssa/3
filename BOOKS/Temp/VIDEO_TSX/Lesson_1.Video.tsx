```tsx
import {
	AbsoluteFill,
	Audio,
	Composition,
	Img,
	Sequence,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	Easing,
} from 'remotion';
import React from 'react';

// Define the structure for a word with timing
interface Word {
	text: string;
	start: number; // in frames
	end: number; // in frames
}

const fps = 30;

// Helper to convert time string (ss.ms) to frames
const toFrames = (time: number) => Math.floor(time * fps);

// Full transcript with frame timings
const transcript: Word[] = [
	{ text: 'Key', start: toFrames(0.0), end: toFrames(0.46) },
	{ text: 'lesson.', start: toFrames(0.46), end: toFrames(0.88) },
	{ text: 'Ignore', start: toFrames(1.48), end: toFrames(2.08) },
	{ text: 'short-term', start: toFrames(2.08), end: toFrames(2.68) },
	{ text: 'reality', start: toFrames(2.68), end: toFrames(3.2) },
	{ text: 'for', start: toFrames(3.2), end: toFrames(3.66) },
	{ text: 'a', start: toFrames(3.66), end: toFrames(3.8) },
	{ text: 'long-term', start: toFrames(3.8), end: toFrames(4.4) },
	{ text: 'vision.', start: toFrames(4.4), end: toFrames(4.84) },
	{ text: 'The', start: toFrames(5.76), end: toFrames(5.96) },
	{ text: 'year', start: toFrames(5.96), end: toFrames(6.28) },
	{ text: 'is', start: toFrames(6.28), end: toFrames(6.54) },
	{ text: '1999.', start: toFrames(6.54), end: toFrames(7.22) },
	{ text: 'The', start: toFrames(7.9), end: toFrames(8.2) },
	{ text: 'world', start: toFrames(8.2), end: toFrames(8.5) },
	{ text: 'is', start: toFrames(8.5), end: toFrames(8.78) },
	{ text: 'high', start: toFrames(8.78), end: toFrames(9.14) },
	{ text: 'on', start: toFrames(9.14), end: toFrames(9.4) },
	{ text: 'the', start: toFrames(9.4), end: toFrames(9.54) },
	{ text: 'dot-com', start: toFrames(9.54), end: toFrames(10.0) },
	{ text: 'bubble.', start: toFrames(10.0), end: toFrames(10.28) },
	{ text: 'Everyone', start: toFrames(10.8), end: toFrames(11.14) },
	{ text: 'is', start: toFrames(11.14), end: toFrames(11.42) },
	{ text: 'a', start: toFrames(11.42), end: toFrames(11.48) },
	{ text: 'genius.', start: toFrames(11.48), end: toFrames(11.8) },
	{ text: 'Stocks', start: toFrames(12.38), end: toFrames(12.84) },
	{ text: 'only', start: toFrames(12.84), end: toFrames(13.16) },
	{ text: 'go', start: toFrames(13.16), end: toFrames(13.36) },
	{ text: 'up.', start: toFrames(13.36), end: toFrames(13.66) },
	{ text: 'Amazon', start: toFrames(14.28), end: toFrames(14.68) },
	{ text: 'is', start: toFrames(14.68), end: toFrames(15.04) },
	{ text: 'the', start: toFrames(15.04), end: toFrames(15.18) },
	{ text: 'poster', start: toFrames(15.18), end: toFrames(15.6) },
	{ text: 'child', start: toFrames(15.6), end: toFrames(16.0) },
	{ text: 'of', start: toFrames(16.0), end: toFrames(16.2) },
	{ text: 'this', start: toFrames(16.2), end: toFrames(16.4) },
	{ text: 'new', start: toFrames(16.4), end: toFrames(16.66) },
	{ text: 'internet', start: toFrames(16.66), end: toFrames(17.0) },
	{ text: 'economy.', start: toFrames(17.0), end: toFrames(17.56) },
	{ text: 'It', start: toFrames(18.02), end: toFrames(18.22) },
	{ text: 'sells', start: toFrames(18.22), end: toFrames(18.42) },
	{ text: 'books', start: toFrames(18.42), end: toFrames(18.68) },
	{ text: 'online.', start: toFrames(18.68), end: toFrames(19.1) },
	{ text: 'But', start: toFrames(19.78), end: toFrames(19.96) },
	{ text: 'Jeff', start: toFrames(19.96), end: toFrames(20.22) },
	{ text: 'Bezos', start: toFrames(20.22), end: toFrames(20.64) },
	{ text: 'is', start: toFrames(20.64), end: toFrames(21.0) },
	{ text: 'telling', start: toFrames(21.0), end: toFrames(21.3) },
	{ text: 'Wall', start: toFrames(21.3), end: toFrames(21.56) },
	{ text: 'Street', start: toFrames(21.56), end: toFrames(21.82) },
	{ text: 'something', start: toFrames(21.82), end: toFrames(22.3) },
	{ text: 'they', start: toFrames(22.3), end: toFrames(22.56) },
	{ text: 'do', start: toFrames(22.56), end: toFrames(22.74) },
	{ text: 'not', start: toFrames(22.74), end: toFrames(23.04) },
	{ text: 'want', start: toFrames(23.04), end: toFrames(23.28) },
	{ text: 'to', start: toFrames(23.28), end: toFrames(23.46) },
	{ text: 'hear.', start: toFrames(23.46), end: toFrames(23.66) },
	{ text: 'He', start: toFrames(24.16), end: toFrames(24.38) },
	{ text: 'is', start: toFrames(24.38), end: toFrames(24.52) },
	{ text: 'telling', start: toFrames(24.52), end: toFrames(24.8) },
	{ text: 'them', start: toFrames(24.8), end: toFrames(25.08) },
	{ text: 'he', start: toFrames(25.08), end: toFrames(25.42) },
	{ text: 'is', start: toFrames(25.42), end: toFrames(25.56) },
	{ text: 'going', start: toFrames(25.56), end: toFrames(25.76) },
	{ text: 'to', start: toFrames(25.76), end: toFrames(25.96) },
	{ text: 'lose', start: toFrames(25.96), end: toFrames(26.3) },
	{ text: 'money.', start: toFrames(26.3), end: toFrames(26.68) },
	{ text: 'He', start: toFrames(27.16), end: toFrames(27.32) },
	{ text: 'is', start: toFrames(27.32), end: toFrames(27.46) },
	{ text: 'telling', start: toFrames(27.46), end: toFrames(27.72) },
	{ text: 'them', start: toFrames(27.72), end: toFrames(27.94) },
	{ text: 'he', start: toFrames(27.94), end: toFrames(28.18) },
	{ text: 'is', start: toFrames(28.18), end: toFrames(28.32) },
	{ text: 'going', start: toFrames(28.32), end: toFrames(28.46) },
	{ text: 'to', start: toFrames(28.46), end: toFrames(28.64) },
	{ text: 'spend', start: toFrames(28.64), end: toFrames(28.88) },
	{ text: 'every', start: toFrames(28.88), end: toFrames(29.44) },
	{ text: 'dollar', start: toFrames(29.44), end: toFrames(29.76) },
	{ text: 'they', start: toFrames(29.76), end: toFrames(29.96) },
	{ text: 'give', start: toFrames(29.96), end: toFrames(30.16) },
	{ text: 'him', start: toFrames(30.16), end: toFrames(30.42) },
	{ text: 'and', start: toFrames(30.42), end: toFrames(30.94) },
	{ text: 'more.', start: toFrames(30.94), end: toFrames(31.2) },
	{ text: 'He', start: toFrames(31.86), end: toFrames(32.12) },
	{ text: 'is', start: toFrames(32.12), end: toFrames(32.28) },
	{ text: 'not', start: toFrames(32.28), end: toFrames(32.54) },
	{ text: 'building', start: toFrames(32.54), end: toFrames(32.92) },
	{ text: 'a', start: toFrames(32.92), end: toFrames(33.06) },
	{ text: 'bookstore.', start: toFrames(33.06), end: toFrames(33.36) },
	{ text: 'He', start: toFrames(33.86), end: toFrames(34.06) },
	{ text: 'is', start: toFrames(34.06), end: toFrames(34.18) },
	{ text: 'building', start: toFrames(34.18), end: toFrames(34.54) },
	{ text: 'the', start: toFrames(34.54), end: toFrames(34.96) },
	{ text: 'everything', start: toFrames(34.96), end: toFrames(35.42) },
	{ text: 'store.', start: toFrames(35.42), end: toFrames(35.82) },
	{ text: 'In', start: toFrames(36.5), end: toFrames(36.74) },
	{ text: 'his', start: toFrames(36.74), end: toFrames(36.9) },
	{ text: '1997', start: toFrames(36.9), end: toFrames(37.5) },
	{ text: 'letter', start: toFrames(37.5), end: toFrames(38.16) },
	{ text: 'to', start: toFrames(38.16), end: toFrames(38.4) },
	{ text: 'shareholders,', start: toFrames(38.4), end: toFrames(38.8) },
	{ text: 'he', start: toFrames(39.22), end: toFrames(39.44) },
	{ text: 'said', start: toFrames(39.44), end: toFrames(39.68) },
	{ text: 'it', start: toFrames(39.68), end: toFrames(40.12) },
	{ text: 'was', start: toFrames(40.12), end: toFrames(40.28) },
	{ text: 'all', start: toFrames(40.28), end: toFrames(40.64) },
	{ text: 'about', start: toFrames(40.64), end: toFrames(41.0) },
	{ text: 'the', start: toFrames(41.0), end: toFrames(41.22) },
	{ text: 'long-term.', start: toFrames(41.22), end: toFrames(41.72) },
	{ text: 'In', start: toFrames(42.54), end: toFrames(42.74) },
	{ text: '1999,', start: toFrames(42.74), end: toFrames(43.28) },
	{ text: 'the', start: toFrames(43.98), end: toFrames(44.06) },
	{ text: 'market', start: toFrames(44.06), end: toFrames(44.36) },
	{ text: 'loved', start: toFrames(44.36), end: toFrames(44.66) },
	{ text: 'him', start: toFrames(44.66), end: toFrames(44.9) },
	{ text: 'for', start: toFrames(44.9), end: toFrames(45.12) },
	{ text: 'it.', start: toFrames(45.12), end: toFrames(45.32) },
	{ text: 'Amazon', start: toFrames(45.8), end: toFrames(46.08) },
	{ text: 'stocks', start: toFrames(46.08), end: toFrames(46.68) },
	{ text: 'soared', start: toFrames(46.68), end: toFrames(47.22) },
	{ text: 'to', start: toFrames(47.22), end: toFrames(47.4) },
	{ text: 'over', start: toFrames(47.4), end: toFrames(47.72) },
	{ text: '$100', start: toFrames(47.72), end: toFrames(48.4) },
	{ text: 'a', start: toFrames(48.4), end: toFrames(48.9) },
	{ text: 'share.', start: toFrames(48.9), end: toFrames(49.18) },
	{ text: 'But', start: toFrames(49.52), end: toFrames(49.86) },
	{ text: 'the', start: toFrames(49.86), end: toFrames(49.96) },
	{ text: 'company', start: toFrames(49.96), end: toFrames(50.32) },
	{ text: 'was', start: toFrames(50.32), end: toFrames(50.7) },
	{ text: 'not', start: toFrames(50.7), end: toFrames(51.02) },
	{ text: 'profitable.', start: toFrames(51.02), end: toFrames(51.56) },
	{ text: 'Not', start: toFrames(51.96), end: toFrames(52.16) },
	{ text: 'even', start: toFrames(52.16), end: toFrames(52.42) },
	{ text: 'close.', start: toFrames(52.42), end: toFrames(52.72) },
	{ text: 'It', start: toFrames(53.28), end: toFrames(53.6) },
	{ text: 'was', start: toFrames(53.6), end: toFrames(53.8) },
	{ text: 'a', start: toFrames(53.8), end: toFrames(54.04) },
	{ text: 'promise.', start: toFrames(54.04), end: toFrames(54.48) },
	{ text: 'A', start: toFrames(55.02), end: toFrames(55.14) },
	{ text: 'bet', start: toFrames(55.14), end: toFrames(55.42) },
	{ text: 'on', start: toFrames(55.42), end: toFrames(55.66) },
	{ text: 'a', start: toFrames(55.66), end: toFrames(55.78) },
	{ text: 'distant', start: toFrames(55.78), end: toFrames(56.16) },
	{ text: 'future.', start: toFrames(56.16), end: toFrames(56.66) },
	{ text: 'Most', start: toFrames(57.3), end: toFrames(57.54) },
	{ text: 'people', start: toFrames(57.54), end: toFrames(57.86) },
	{ text: 'saw', start: toFrames(57.86), end: toFrames(58.14) },
	{ text: 'a', start: toFrames(58.14), end: toFrames(58.3) },
	{ text: 'company', start: toFrames(58.3), end: toFrames(58.6) },
	{ text: 'selling', start: toFrames(58.6), end: toFrames(59.06) },
	{ text: 'books', start: toFrames(59.06), end: toFrames(59.38) },
	{ text: 'at', start: toFrames(59.38), end: toFrames(59.6) },
	{ text: 'a', start: toFrames(59.6), end: toFrames(59.7) },
	{ text: 'loss.', start: toFrames(59.7), end: toFrames(59.96) },
	{ text: 'Bezos', start: toFrames(60.6), end: toFrames(60.96) },
	{ text: 'saw', start: toFrames(60.96), end: toFrames(61.38) },
	{ text: 'a', start: toFrames(61.38), end: toFrames(61.56) },
	{ text: 'global', start: toFrames(61.56), end: toFrames(61.96) },
	{ text: 'logistics', start: toFrames(61.96), end: toFrames(62.5) },
	{ text: 'and', start: toFrames(62.5), end: toFrames(62.94) },
	{ text: 'data', start: toFrames(62.94), end: toFrames(63.28) },
	{ text: 'empire.', start: toFrames(63.28), end: toFrames(63.76) },
	{ text: 'The', start: toFrames(64.28), end: toFrames(64.52) },
	{ text: 'vision', start: toFrames(64.52), end: toFrames(64.82) },
	{ text: 'was', start: toFrames(64.82), end: toFrames(65.02) },
	{ text: 'so', start: toFrames(65.02), end: toFrames(65.34) },
	{ text: 'big,', start: toFrames(65.34), end: toFrames(65.7) },
	{ text: 'it', start: toFrames(65.96), end: toFrames(66.04) },
	{ text: 'looked', start: toFrames(66.04), end: toFrames(66.32) },
	{ text: 'like', start: toFrames(66.32), end: toFrames(66.64) },
	{ text: 'insanity.', start: toFrames(66.64), end: toFrames(67.22) },
];

const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[word.start, word.start + 5, word.end - 5, word.end],
		[0, 1, 1, 0]
	);

	const wordStyle: React.CSSProperties = {
		display: 'inline-block',
		opacity,
		marginLeft: '10px',
	};

	return <span style={wordStyle}>{word.text}</span>;
};

const Subtitles: React.FC = () => {
	const textStyle: React.CSSProperties = {
		fontFamily: 'Arial, sans-serif',
		fontSize: 80,
		fontWeight: 'bold',
		color: 'white',
		textAlign: 'center',
		position: 'absolute',
		bottom: '15%',
		width: '100%',
		padding: '0 5%',
		textShadow: '0 0 15px rgba(0,0,0,0.7)',
	};

	return (
		<div style={textStyle}>
			{transcript.map((word, i) => (
				<WordComponent key={i} word={word} />
			))}
		</div>
	);
};

// General artistic overlays
const Effects: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Slow, subtle dust particle movement
	const dustX = Math.sin(frame / 100) * 50;
	const dustY = Math.cos(frame / 120) * 50;
	const dustOpacity = interpolate(
		Math.sin(frame / 50),
		[-1, 1],
		[0.05, 0.15]
	);

	const dustOverlayStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		opacity: dustOpacity,
		transform: `translate(${dustX}px, ${dustY}px)`,
	};

	// Vignette effect
	const vignetteStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		boxShadow: 'inset 0 0 200px rgba(0,0,0,0.5)',
	};

	return (
		<>
			{/* 
				assets/images/dust-overlay.png: A large, sparse texture of white specks on a transparent background to simulate floating dust.
			*/}
			<Img
				src={staticFile('assets/images/dust-overlay.png')}
				style={dustOverlayStyle}
			/>
			<div style={vignetteStyle} />
		</>
	);
};

// --- SCENES ---

const Scene1: React.FC = () => {
	// 0 - 5.5s (Frames 0-165)
	const frame = useCurrentFrame();
	const duration = toFrames(5.5);

	const progress = interpolate(frame, [0, duration], [0, 1], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
		extrapolateRight: 'clamp',
	});

	// Parallax values
	const bgScale = interpolate(progress, [0, 1], [1.2, 1]);
	const mgScale = interpolate(progress, [0, 1], [1.1, 1]);
	const fgScale = interpolate(progress, [0, 1], [1, 1.2]);
	const fgOpacity = interpolate(progress, [0, 1], [0, 1]);

	// Style objects
	const bgStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${bgScale})`,
	};
	const mgStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${mgScale})`,
		opacity: 0.7,
	};
	const fgStyle: React.CSSProperties = {
		position: 'absolute',
		bottom: '-10%',
		left: '-5%',
		height: '80%',
		transform: `scale(${fgScale})`,
		opacity: fgOpacity,
		filter: 'drop-shadow(0 0 30px rgba(255, 220, 150, 0.5))',
	};

	return (
		<AbsoluteFill>
			{/*
				assets/images/distant-vision.jpg: A beautiful, slightly abstract background of a glowing horizon or futuristic landscape.
			*/}
			<Img
				src={staticFile('assets/images/distant-vision.jpg')}
				style={bgStyle}
			/>
			{/*
				assets/images/reality-texture.png: A semi-transparent overlay with a gritty, concrete-like texture, representing "reality".
			*/}
			<Img
				src={staticFile('assets/images/reality-texture.png')}
				style={mgStyle}
			/>
			{/*
				assets/images/key.png: An ornate, antique key with a transparent background.
			*/}
			<Img src={staticFile('assets/images/key.png')} style={fgStyle} />
		</AbsoluteFill>
	);
};

const Scene2: React.FC = () => {
	// 5.5s - 18s (Frames 165-540)
	const frame = useCurrentFrame();
	const duration = 540 - 165;

	const progress = interpolate(frame, [0, duration], [0, 1], {
		easing: Easing.linear,
		extrapolateRight: 'clamp',
	});

	// Parallax values
	const bgScale = interpolate(progress, [0, 1], [1, 1.1]);
	const bgX = interpolate(progress, [0, 1], [0, -100]);
	const tickerY = interpolate(progress, [0, 1], [100, -100]);
	const logoScale = interpolate(progress, [0.5, 1], [0, 1], {
		extrapolateLeft: 'clamp',
	});

	// Style objects
	const bgStyle: React.CSSProperties = {
		width: '110%', // Wider for panning
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${bgScale}) translateX(${bgX}px)`,
	};
	const tickerStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '20%',
		top: 0,
		opacity: 0.4,
		transform: `translateY(${tickerY}%)`,
	};
	const logoStyle: React.CSSProperties = {
		position: 'absolute',
		height: '25%',
		top: '37.5%',
		left: '37.5%',
		transform: `scale(${logoScale})`,
		filter: 'drop-shadow(0 0 20px black)',
	};

	return (
		<AbsoluteFill>
			{/*
				assets/images/1999-background.jpg: A collage of 90s tech, CRT monitors, early web pages, with a blue/green digital glow.
			*/}
			<Img
				src={staticFile('assets/images/1999-background.jpg')}
				style={bgStyle}
			/>
			{/*
				assets/images/stock-ticker-overlay.png: A repeating green stock ticker text on a transparent background.
			*/}
			<Img
				src={staticFile('assets/images/stock-ticker-overlay.png')}
				style={tickerStyle}
			/>
			{/*
				assets/images/vintage-amazon-logo.png: The classic Amazon logo from the 90s on a transparent background.
			*/}
			<Img
				src={staticFile('assets/images/vintage-amazon-logo.png')}
				style={logoStyle}
			/>
		</AbsoluteFill>
	);
};

const Scene3: React.FC = () => {
	// 18s - 32s (Frames 540-960)
	const frame = useCurrentFrame();
	const duration = 960 - 540;

	// Dolly zoom effect
	const progress = interpolate(frame, [0, duration], [0, 1], {
		easing: Easing.inOut(Easing.ease),
	});
	const bezosScale = interpolate(progress, [0, 1], [1, 1.15]);
	const bgScale = interpolate(progress, [0, 1], [1, 1.3]);
	const bezosX = interpolate(progress, [0, 1], [-50, 0]);

	const bgStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${bgScale})`,
		filter: 'blur(5px) grayscale(0.5)',
	};
	const bezosStyle: React.CSSProperties = {
		position: 'absolute',
		height: '110%',
		bottom: 0,
		left: 0,
		transform: `scale(${bezosScale}) translateX(${bezosX}%)`,
	};

	return (
		<AbsoluteFill>
			{/*
				assets/images/wall-street-crowd.jpg: A bustling, slightly chaotic image of the NYSE trading floor.
			*/}
			<Img
				src={staticFile('assets/images/wall-street-crowd.jpg')}
				style={bgStyle}
			/>
			{/*
				assets/images/young-bezos.png: A high-quality cutout photo of Jeff Bezos from the late 90s, with a transparent background.
			*/}
			<Img
				src={staticFile('assets/images/young-bezos.png')}
				style={bezosStyle}
			/>
		</AbsoluteFill>
	);
};

const Scene4: React.FC = () => {
	// 32s - 42s (Frames 960-1260)
	const frame = useCurrentFrame();
	const duration = 1260 - 960;
	const progress = interpolate(frame, [0, duration], [0, 1]);

	const bookstoreOpacity = interpolate(progress, [0, 0.5], [1, 0], {
		extrapolateRight: 'clamp',
	});
	const everythingOpacity = interpolate(progress, [0.4, 0.9], [0, 1], {
		extrapolateLeft: 'clamp',
	});
	const bgScale = interpolate(progress, [0.4, 1], [1, 1.1]);
	const blueprintX = interpolate(progress, [0.4, 1], [-100, 0]);

	const bookstoreStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: bookstoreOpacity,
	};
	const everythingStoreStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: everythingOpacity,
		transform: `scale(${bgScale})`,
	};
	const blueprintStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		opacity: everythingOpacity * 0.5,
		transform: `translateX(${blueprintX}%)`,
	};

	return (
		<AbsoluteFill>
			{/*
				assets/images/bookstore-front.jpg: A quaint, cozy image of a small, local bookstore.
			*/}
			<Img
				src={staticFile('assets/images/bookstore-front.jpg')}
				style={bookstoreStyle}
			/>
			{/*
				assets/images/everything-store-concept.jpg: A vast, futuristic image of a logistics network - warehouses, trucks, drones.
			*/}
			<Img
				src={staticFile('assets/images/everything-store-concept.jpg')}
				style={everythingStoreStyle}
			/>
			{/*
				assets/images/blueprint-overlay.png: A semi-transparent blue overlay with technical drawings, lines, and grids.
			*/}
			<Img
				src={staticFile('assets/images/blueprint-overlay.png')}
				style={blueprintStyle}
			/>
		</AbsoluteFill>
	);
};

const Scene5: React.FC = () => {
	// 42s - 53s (Frames 1260-1590)
	const frame = useCurrentFrame();
	const duration = 1590 - 1260;
	const progress = interpolate(frame, [0, duration], [0, 1]);

	const chartScale = interpolate(progress, [0, 1], [1, 1.1]);
	const chartY = interpolate(progress, [0, 1], [0, -100]);
	const lossOpacity = interpolate(progress, [0.5, 1], [0, 1], {
		extrapolateLeft: 'clamp',
	});
	const lossY = interpolate(progress, [0.5, 1], [50, 0]);

	const bgStyle: React.CSSProperties = {
		backgroundColor: '#111',
	};
	const chartStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: 'auto',
		top: 0,
		transform: `scale(${chartScale}) translateY(${chartY}px)`,
	};
	const lossStyle: React.CSSProperties = {
		position: 'absolute',
		width: '60%',
		bottom: '10%',
		left: '20%',
		opacity: lossOpacity,
		transform: `translateY(${lossY}px)`,
		filter: 'drop-shadow(0 0 20px red)',
	};

	return (
		<AbsoluteFill style={bgStyle}>
			{/*
				assets/images/amazon-stock-1999.png: A stylized graph showing a stock price soaring upwards, with a green glow. Transparent BG.
			*/}
			<Img
				src={staticFile('assets/images/amazon-stock-1999.png')}
				style={chartStyle}
			/>
			{/*
				assets/images/balance-sheet-loss.png: A stylized financial document with red, negative numbers highlighted. Transparent BG.
			*/}
			<Img
				src={staticFile('assets/images/balance-sheet-loss.png')}
				style={lossStyle}
			/>
		</AbsoluteFill>
	);
};

const Scene6: React.FC = () => {
	// 53s - 60s (Frames 1590-1800)
	const frame = useCurrentFrame();
	const duration = 1800 - 1590;
	const progress = interpolate(frame, [0, duration], [0, 1], {
		easing: Easing.inOut(Easing.quad),
	});

	// Pull back reveal
	const bgScale = interpolate(progress, [0, 1], [1.5, 1]);
	const fgScale = interpolate(progress, [0, 1], [1.8, 1]);
	const fgOpacity = interpolate(progress, [0, 1], [0, 1]);
	const glowOpacity = interpolate(Math.sin(frame / 20), [-1, 1], [0.3, 0.7]);

	const bgStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${bgScale})`,
	};
	const glowStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		transform: 'scale(3)',
		opacity: glowOpacity,
	};
	const fgStyle: React.CSSProperties = {
		position: 'absolute',
		height: '50%',
		left: '25%',
		top: '25%',
		transform: `scale(${fgScale})`,
		opacity: fgOpacity,
	};

	return (
		<AbsoluteFill>
			{/*
				assets/images/barren-land.jpg: A wide, epic shot of a dry, empty landscape at dawn or dusk.
			*/}
			<Img
				src={staticFile('assets/images/barren-land.jpg')}
				style={bgStyle}
			/>
			{/*
				assets/images/glowing-tree-silhouette.png: A faint, ethereal silhouette of a massive, glowing tree. Transparent BG.
			*/}
			<Img
				src={staticFile('assets/images/glowing-tree-silhouette.png')}
				style={glowStyle}
			/>
			{/*
				assets/images/seed-in-hand.png: A close-up of a single seed resting in an open palm. Transparent BG.
			*/}
			<Img
				src={staticFile('assets/images/seed-in-hand.png')}
				style={fgStyle}
			/>
		</AbsoluteFill>
	);
};

const Scene7: React.FC = () => {
	// 60s - 68s (Frames 1800-2040)
	const frame = useCurrentFrame();
	const duration = 2040 - 1800;
	const progress = interpolate(frame, [0, duration], [0, 1]);

	// Epic zoom out and rotate
	const bgScale = interpolate(progress, [0, 1], [1, 1.5]);
	const bgRotate = interpolate(progress, [0, 1], [0, -10]);
	const overlayOpacity = interpolate(progress, [0, 1], [0.5, 0]);
	const streamsOpacity = interpolate(progress, [0.2, 1], [0, 0.6]);

	const bgStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${bgScale}) rotate(${bgRotate}deg)`,
	};
	const overlayStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: overlayOpacity,
	};
	const streamsStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: streamsOpacity,
	};

	return (
		<AbsoluteFill>
			{/*
				assets/images/global-network.jpg: A stunning, high-tech visualization of Earth at night with glowing connection lines.
			*/}
			<Img
				src={staticFile('assets/images/global-network.jpg')}
				style={bgStyle}
			/>
			{/*
				assets/images/insanity-scribbles.png: A chaotic, semi-transparent overlay of frantic scribbles and equations.
			*/}
			<Img
				src={staticFile('assets/images/insanity-scribbles.png')}
				style={overlayStyle}
			/>
			{/*
				assets/images/data-streams-overlay.png: A futuristic overlay of glowing blue and white data streams flowing across the screen.
			*/}
			<Img
				src={staticFile('assets/images/data-streams-overlay.png')}
				style={streamsStyle}
			/>
		</AbsoluteFill>
	);
};

// --- Main Component ---
export const RemotionVideo: React.FC = () => {
	const durationInFrames = 68 * fps;

	return (
		<>
			<Composition
				id="StorytellingVideo"
				component={Main}
				durationInFrames={durationInFrames}
				fps={fps}
				width={3840}
				height={2160}
			/>
		</>
	);
};

const Main: React.FC = () => {
	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_1.wav')} />

			<Sequence from={0} durationInFrames={toFrames(5.5)}>
				<Scene1 />
			</Sequence>
			<Sequence from={toFrames(5.5)} durationInFrames={toFrames(18 - 5.5)}>
				<Scene2 />
			</Sequence>
			<Sequence from={toFrames(18)} durationInFrames={toFrames(32 - 18)}>
				<Scene3 />
			</Sequence>
			<Sequence from={toFrames(32)} durationInFrames={toFrames(42 - 32)}>
				<Scene4 />
			</Sequence>
			<Sequence from={toFrames(42)} durationInFrames={toFrames(53 - 42)}>
				<Scene5 />
			</Sequence>
			<Sequence from={toFrames(53)} durationInFrames={toFrames(60 - 53)}>
				<Scene6 />
			</Sequence>
			<Sequence from={toFrames(60)}>
				<Scene7 />
			</Sequence>

			<Effects />
			<Subtitles />
		</AbsoluteFill>
	);
};
```