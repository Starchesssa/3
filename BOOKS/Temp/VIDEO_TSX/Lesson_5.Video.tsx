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
import React from 'react';

// ---- Type Definitions ---- //

type Word = {
	text: string;
	start: number;
	end: number;
};

type Transcript = Word[];

// ---- Transcript Data ---- //

const transcript: Transcript = [
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
	{ text: "isn't", start: 11.88, end: 12.2 },
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

const secToFrames = (sec: number) => Math.round(sec * 30);

// ---- Helper Components ---- //

const Word: React.FC<{ word: Word }> = ({ word }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const startFrame = secToFrames(word.start);
	const endFrame = secToFrames(word.end);

	const opacity = interpolate(
		frame,
		[startFrame, startFrame + 5, endFrame, endFrame + 5],
		[0, 1, 1, 0]
	);

	return (
		<span
			style={{
				display: 'inline-block',
				marginRight: '15px',
				opacity,
				transform: `translateY(${interpolate(
					opacity,
					[0, 1],
					[10, 0]
				)}px)`,
			}}
		>
			{word.text}
		</span>
	);
};

const Subtitles: React.FC<{ transcript: Transcript; start: number; end: number }> = ({
	transcript,
	start,
	end,
}) => {
	const relevantWords = transcript.filter(
		(word) => word.start >= start && word.end <= end
	);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				padding: '0 10%',
			}}
		>
			<p
				style={{
					fontFamily: 'Helvetica, Arial, sans-serif',
					fontSize: '72px',
					fontWeight: 'bold',
					textAlign: 'center',
					color: 'white',
					textShadow: '0 0 15px rgba(0,0,0,0.8)',
					lineHeight: '1.4',
				}}
			>
				{relevantWords.map((word, i) => (
					<Word key={i} word={word} />
				))}
			</p>
		</AbsoluteFill>
	);
};

interface SceneProps {
	bg: string;
	mg?: string;
	fg?: string;
	children: React.ReactNode;
}

const ParallaxScene: React.FC<SceneProps> = ({ bg, mg, fg, children }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	const progress = frame / durationInFrames;

	// Background moves the least
	const bgScale = interpolate(progress, [0, 1], [1.1, 1.3]);
	const bgX = interpolate(progress, [0, 1], [-20, 20]);
	const bgY = interpolate(progress, [0, 1], [0, -10]);

	// Midground moves a bit more
	const mgScale = interpolate(progress, [0, 1], [1.15, 1.4]);
	const mgX = interpolate(progress, [0, 1], [30, -30]);
	const mgY = interpolate(progress, [0, 1], [-15, 15]);

	// Foreground moves the most
	const fgScale = interpolate(progress, [0, 1], [1.2, 1.5]);
	const fgX = interpolate(progress, [0, 1], [-50, 50]);
	const fgY = interpolate(progress, [0, 1], [20, -20]);

	const imageStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	};

	return (
		<AbsoluteFill>
			<Img
				src={staticFile(bg)}
				style={{
					...imageStyle,
					transform: `scale(${bgScale}) translateX(${bgX}px) translateY(${bgY}px)`,
				}}
			/>
			{mg && (
				<Img
					src={staticFile(mg)}
					style={{
						...imageStyle,
						transform: `scale(${mgScale}) translateX(${mgX}px) translateY(${mgY}px)`,
					}}
				/>
			)}
			{fg && (
				<Img
					src={staticFile(fg)}
					style={{
						...imageStyle,
						transform: `scale(${fgScale}) translateX(${fgX}px) translateY(${fgY}px)`,
					}}
				/>
			)}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
				}}
			/>
			{children}
		</AbsoluteFill>
	);
};

const DustOverlay = () => {
	const { width, height } = useVideoConfig();
	const frame = useCurrentFrame();
	const particles = React.useMemo(() => {
		return new Array(100).fill(true).map((_, i) => {
			const x = Math.random() * width;
			const y = Math.random() * height;
			const size = Math.random() * 3 + 1;
			const initialOpacity = Math.random() * 0.5 + 0.1;
			const speed = Math.random() * 2 + 1;
			const seed = Math.random() * 100;
			return { x, y, size, initialOpacity, speed, seed };
		});
	}, [width, height]);

	return (
		<AbsoluteFill style={{ pointerEvents: 'none' }}>
			{particles.map((p, i) => {
				const yPos = (p.y + frame * p.speed) % height;
				const opacity =
					p.initialOpacity *
					(0.5 + Math.abs(Math.sin(frame / 50 + p.seed)) * 0.5);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: p.x,
							top: yPos,
							width: p.size,
							height: p.size,
							backgroundColor: 'rgba(255, 255, 255, 0.8)',
							borderRadius: '50%',
							opacity,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

const FadedSequence: React.FC<{
	from: number;
	durationInFrames: number;
	children: React.ReactNode;
}> = ({ from, durationInFrames, children }) => {
	const frame = useCurrentFrame();
	const FADE_DURATION = 15; // 0.5 seconds

	const opacity = interpolate(
		frame,
		[
			from,
			from + FADE_DURATION,
			from + durationInFrames - FADE_DURATION,
			from + durationInFrames,
		],
		[0, 1, 1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	return (
		<Sequence from={from} durationInFrames={durationInFrames}>
			<div style={{ opacity }}>{children}</div>
		</Sequence>
	);
};

// ---- Main Video Component ---- //

export const RemotionVideo: React.FC = () => {
	const { durationInFrames, fps } = useVideoConfig();
	const frame = useCurrentFrame();

	const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_5.wav');
	
	// Cinematic camera movement
	const overallScale = interpolate(frame, [0, durationInFrames], [1, 1.15], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const overallPanX = interpolate(
		frame,
		[0, durationInFrames],
		[0, -50],
		{ easing: Easing.inOut(Easing.ease) }
	);

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<div
				style={{
					transform: `scale(${overallScale}) translateX(${overallPanX}px)`,
					width: '100%',
					height: '100%',
				}}
			>
				{/* Scene 1: Attack */}
				<FadedSequence from={0} durationInFrames={secToFrames(4.0)}>
					<ParallaxScene
						// A dark, high-contrast image of a chessboard.
						bg="images/chess-board-bg.jpg"
						// A single, powerful chess piece like a Queen or King.
						mg="images/chess-piece-mg.jpg"
						// Some out-of-focus pieces in the foreground to create depth.
						fg="images/chess-foreground-blur.jpg"
					>
						<Subtitles transcript={transcript} start={0.0} end={3.9} />
					</ParallaxScene>
				</FadedSequence>
				
				{/* Scene 2: 2008 Financial Collapse */}
				<FadedSequence from={secToFrames(3.9)} durationInFrames={secToFrames(5.1)}>
					<ParallaxScene
						// A chaotic, red stock market graph plunging downwards.
						bg="images/stock-market-crash-bg.jpg"
						// The facade of the New York Stock Exchange building, looking imposing.
						mg="images/nyse-building-mg.jpg"
						// Blurred figures of distressed traders or falling ticker symbols.
						fg="images/trader-blur-fg.jpg"
					>
						<Subtitles transcript={transcript} start={4.0} end={8.9} />
					</ParallaxScene>
				</FadedSequence>

				{/* Scene 3: Lehman Brothers Gone */}
				<FadedSequence from={secToFrames(8.9)} durationInFrames={secToFrames(4.5)}>
					<ParallaxScene
						// The iconic Lehman Brothers office building, looking dark and empty.
						bg="images/lehman-building-bg.jpg"
						// A crumpled newspaper with a headline about the bankruptcy.
						mg="images/bankruptcy-newspaper-mg.jpg"
						// Scattered office papers flying in the air, out of focus.
						fg="images/papers-flying-fg.jpg"
					>
						<Subtitles transcript={transcript} start={9.0} end={13.3} />
					</ParallaxScene>
				</FadedSequence>

				{/* Scene 4: Survival Mode */}
				<FadedSequence from={secToFrames(13.3)} durationInFrames={secToFrames(7.5)}>
					<ParallaxScene
						// A vast, dark, and empty office space at night.
						bg="images/empty-office-bg.jpg"
						// A single, lonely office chair.
						mg="images/lonely-chair-mg.jpg"
						// A locked vault or safe door, representing hoarding cash.
						fg="images/vault-door-fg.jpg"
					>
						<Subtitles transcript={transcript} start={13.4} end={20.8} />
					</ParallaxScene>
				</FadedSequence>
				
				{/* Scene 5: Amazon's Move / The Kindle */}
				<FadedSequence from={secToFrames(20.8)} durationInFrames={secToFrames(7.2)}>
					<ParallaxScene
						// Abstract, glowing digital blueprints or code.
						bg="images/digital-blueprint-bg.jpg"
						// A heroic, well-lit shot of the first Amazon Kindle device.
						mg="images/kindle-product-mg.jpg"
						// Floating, semi-transparent letters and words.
						fg="images/glowing-letters-fg.jpg"
					>
						<Subtitles transcript={transcript} start={20.9} end={27.9} />
					</ParallaxScene>
				</FadedSequence>
				
				{/* Scene 6: Old vs New */}
				<FadedSequence from={secToFrames(27.9)} durationInFrames={secToFrames(7.0)}>
					<ParallaxScene
						// The interior of a classic, grand library with old books.
						bg="images/old-library-bg.jpg"
						// A hand holding a glowing Kindle in the middle of the library.
						mg="images/hand-with-kindle-mg.jpg"
						// A close-up, out-of-focus shot of an old printing press gear.
						fg="images/printing-press-fg.jpg"
					>
						<Subtitles transcript={transcript} start={28.0} end={34.8} />
					</ParallaxScene>
				</FadedSequence>
				
				{/* Scene 7: Investing While Others Fight */}
				<FadedSequence from={secToFrames(34.8)} durationInFrames={secToFrames(9.2)}>
					<ParallaxScene
						// A chaotic collage of recession headlines.
						bg="images/recession-headlines-bg.jpg"
						// A clean image of a microprocessor or circuit board.
						mg="images/circuit-board-mg.jpg"
						// Piles of coins or hundred-dollar bills, slightly blurred.
						fg="images/money-stack-fg.jpg"
					>
						<Subtitles transcript={transcript} start={34.9} end={43.9} />
					</ParallaxScene>
				</FadedSequence>
				
				{/* Scene 8: Clearing Event */}
				<FadedSequence from={secToFrames(43.9)} durationInFrames={secToFrames(5.6)}>
					<ParallaxScene
						// A dramatic image of a powerful storm clearing to reveal sunlight.
						bg="images/storm-clearing-bg.jpg"
						// A single, strong, resilient tree that has weathered the storm.
						mg="images/resilient-tree-mg.jpg"
						// Blown leaves and debris in the foreground.
						fg="images/debris-fg.jpg"
					>
						<Subtitles transcript={transcript} start={44.0} end={49.4} />
					</ParallaxScene>
				</FadedSequence>
				
				{/* Scene 9: Looking at the Horizon */}
				<FadedSequence from={secToFrames(49.4)} durationInFrames={durationInFrames - secToFrames(49.4)}>
					<ParallaxScene
						// A beautiful, epic sunrise over a mountain range or city.
						bg="images/sunrise-horizon-bg.jpg"
						// A stylized, glowing Amazon logo.
						mg="images/amazon-logo-glow-mg.jpg"
						// A simple, elegant chart line showing exponential growth.
						fg="images/growth-chart-fg.jpg"
					>
						<Subtitles transcript={transcript} start={49.5} end={60.1} />
					</ParallaxScene>
				</FadedSequence>

				{/* Global Overlays */}
				<DustOverlay />
			</div>
			<Audio src={audioSrc} />
		</AbsoluteFill>
	);
};

// ---- Composition ---- //

export const StoryVideo: React.FC = () => {
	const videoDurationInSeconds = 62;
	const fps = 30;

	return (
		<Composition
			id="RemotionVideo"
			component={RemotionVideo}
			durationInFrames={videoDurationInSeconds * fps}
			fps={fps}
			width={1080}
			height={1920}
		/>
	);
};

```