```typescript
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
import { interpolate, Easing, spring } from 'remotion';
import React, { useMemo } from 'react';

// --- Type Definitions ---
type Word = {
	text: string;
	start: number;
	end: number;
};

// --- Transcript Data ---
const transcript: Word[] = [
	{ text: 'Key', start: 0.0, end: 0.5 },
	{ text: 'lesson.', start: 0.5, end: 0.94 },
	{ text: 'Use', start: 1.5, end: 1.78 },
	{ text: 'your', start: 1.78, end: 2.0 },
	{ text: 'cash', start: 2.0, end: 2.28 },
	{ text: 'cow', start: 2.28, end: 2.56 },
	{ text: 'to', start: 2.56, end: 2.92 },
	{ text: 'invade', start: 2.92, end: 3.3 },
	{ text: 'new', start: 3.3, end: 3.72 },
	{ text: 'territories.', start: 3.72, end: 4.3 },
	{ text: 'It', start: 5.02, end: 5.22 },
	{ text: 'is', start: 5.22, end: 5.34 },
	{ text: 'now', start: 5.34, end: 5.54 },
	{ text: '2017.', start: 5.54, end: 6.36 },
	{ text: 'AWS', start: 7.18, end: 7.62 },
	{ text: 'is', start: 7.62, end: 8.14 },
	{ text: 'a', start: 8.14, end: 8.26 },
	{ text: 'monster.', start: 8.26, end: 8.82 },
	{ text: 'It', start: 9.38, end: 9.5 },
	{ text: 'is', start: 9.5, end: 9.58 },
	{ text: 'a', start: 9.58, end: 9.68 },
	{ text: 'money', start: 9.68, end: 10.08 },
	{ text: 'printing', start: 10.08, end: 10.56 },
	{ text: 'machine.', start: 10.56, end: 11.08 },
	{ text: 'In', start: 11.82, end: 11.88 },
	{ text: '2017', start: 11.88, end: 12.48 },
	{ text: 'alone,', start: 12.48, end: 12.96 },
	{ text: 'AWS', start: 13.52, end: 13.8 },
	{ text: 'would', start: 13.8, end: 14.28 },
	{ text: 'generate', start: 14.28, end: 14.62 },
	{ text: 'over', start: 14.62, end: 14.92 },
	{ text: '$17', start: 14.92, end: 15.64 },
	{ text: 'billion', start: 15.64, end: 16.36 },
	{ text: 'in', start: 16.36, end: 17.02 },
	{ text: 'revenue.', start: 17.02, end: 17.42 },
	{ text: 'And', start: 17.94, end: 18.12 },
	{ text: 'unlike', start: 18.12, end: 18.48 },
	{ text: 'the', start: 18.48, end: 18.7 },
	{ text: 'low', start: 18.7, end: 18.88 },
	{ text: 'margin', start: 18.88, end: 19.24 },
	{ text: 'retail', start: 19.24, end: 19.58 },
	{ text: 'business,', start: 19.58, end: 20.06 },
	{ text: 'AWS', start: 20.56, end: 20.84 },
	{ text: 'was', start: 20.84, end: 21.3 },
	{ text: 'incredibly', start: 21.3, end: 21.96 },
	{ text: 'profitable.', start: 21.96, end: 22.64 },
	{ text: 'It', start: 23.06, end: 23.32 },
	{ text: 'was', start: 23.32, end: 23.44 },
	{ text: 'a', start: 23.44, end: 23.58 },
	{ text: 'cash', start: 23.58, end: 23.94 },
	{ text: 'cow.', start: 23.94, end: 24.22 },
	{ text: 'So', start: 24.74, end: 25.1 },
	{ text: 'what', start: 25.1, end: 25.46 },
	{ text: 'do', start: 25.46, end: 25.56 },
	{ text: 'you', start: 25.56, end: 25.68 },
	{ text: 'do', start: 25.68, end: 25.88 },
	{ text: 'with', start: 25.88, end: 26.12 },
	{ text: 'all', start: 26.12, end: 26.22 },
	{ text: 'that', start: 26.22, end: 26.38 },
	{ text: 'cash?', start: 26.38, end: 26.7 },
	{ text: 'You', start: 27.18, end: 27.42 },
	{ text: 'could', start: 27.42, end: 27.58 },
	{ text: 'give', start: 27.58, end: 27.84 },
	{ text: 'it', start: 27.84, end: 27.96 },
	{ text: 'back', start: 27.96, end: 28.12 },
	{ text: 'to', start: 28.12, end: 28.3 },
	{ text: 'shareholders.', start: 28.3, end: 28.74 },
	{ text: 'You', start: 28.74, end: 29.46 },
	{ text: 'could', start: 29.46, end: 29.64 },
	{ text: 'play', start: 29.64, end: 29.94 },
	{ text: 'it', start: 29.94, end: 30.04 },
	{ text: 'safe,', start: 30.04, end: 30.36 },
	{ text: 'or', start: 30.76, end: 31.14 },
	{ text: 'you', start: 31.14, end: 31.42 },
	{ text: 'could', start: 31.42, end: 31.54 },
	{ text: 'use', start: 31.54, end: 31.8 },
	{ text: 'it', start: 31.8, end: 31.96 },
	{ text: 'as', start: 31.96, end: 32.1 },
	{ text: 'a', start: 32.1, end: 32.22 },
	{ text: 'war', start: 32.22, end: 32.48 },
	{ text: 'chest', start: 32.48, end: 32.92 },
	{ text: 'to', start: 32.92, end: 33.14 },
	{ text: 'attack', start: 33.14, end: 33.52 },
	{ text: 'a', start: 33.52, end: 33.68 },
	{ text: 'completely', start: 33.68, end: 34.16 },
	{ text: 'new', start: 34.16, end: 34.58 },
	{ text: 'industry.', start: 34.58, end: 35.08 },
	{ text: 'On', start: 35.68, end: 35.86 },
	{ text: 'June', start: 35.86, end: 36.06 },
	{ text: '16,', start: 36.06, end: 36.56 },
	{ text: '2017,', start: 36.64, end: 37.5 },
	{ text: 'Amazon', start: 37.9, end: 38.28 },
	{ text: 'announced', start: 38.28, end: 38.84 },
	{ text: 'it', start: 38.84, end: 39.0 },
	{ text: 'was', start: 39.0, end: 39.12 },
	{ text: 'buying', start: 39.12, end: 39.38 },
	{ text: 'whole', start: 39.38, end: 39.68 },
	{ text: 'foods', start: 39.68, end: 40.1 },
	{ text: 'for', start: 40.1, end: 40.34 },
	{ text: '$13.7', start: 40.34, end: 41.74 },
	{ text: 'billion.', start: 41.74, end: 42.3 },
	{ text: 'In', start: 43.12, end: 43.5 },
	{ text: 'cash,', start: 43.5, end: 43.8 },
	{ text: 'the', start: 44.42, end: 44.64 },
	{ text: 'world', start: 44.64, end: 44.88 },
	{ text: 'was', start: 44.88, end: 45.12 },
	{ text: 'stunned.', start: 45.12, end: 45.66 },
	{ text: 'The', start: 46.16, end: 46.26 },
	{ text: 'king', start: 46.26, end: 46.52 },
	{ text: 'of', start: 46.52, end: 46.74 },
	{ text: 'e-commerce', start: 46.74, end: 47.22 },
	{ text: 'was', start: 47.22, end: 47.58 },
	{ text: 'buying', start: 47.58, end: 47.86 },
	{ text: 'a', start: 47.86, end: 48.02 },
	{ text: 'brick', start: 48.02, end: 48.3 },
	{ text: 'and', start: 48.3, end: 48.5 },
	{ text: 'mortar', start: 48.5, end: 48.78 },
	{ text: 'grocery', start: 48.78, end: 49.2 },
	{ text: 'chain.', start: 49.2, end: 49.68 },
	{ text: 'On', start: 50.04, end: 50.42 },
	{ text: 'the', start: 50.42, end: 50.52 },
	{ text: 'day', start: 50.52, end: 50.7 },
	{ text: 'of', start: 50.7, end: 50.84 },
	{ text: 'the', start: 50.84, end: 50.96 },
	{ text: 'announcement,', start: 50.96, end: 51.38 },
	{ text: 'the', start: 51.8, end: 51.86 },
	{ text: 'stocks', start: 51.86, end: 52.12 },
	{ text: 'of', start: 52.12, end: 52.36 },
	{ text: 'competing', start: 52.36, end: 52.76 },
	{ text: 'grocery', start: 52.76, end: 53.16 },
	{ text: 'stores', start: 53.16, end: 53.62 },
	{ text: 'like', start: 53.62, end: 53.86 },
	{ text: 'Kroger', start: 53.86, end: 54.28 },
	{ text: 'and', start: 54.28, end: 54.5 },
	{ text: 'Costco', start: 54.5, end: 54.9 },
	{ text: 'plummeted.', start: 54.9, end: 55.76 },
	{ text: 'They', start: 56.08, end: 56.36 },
	{ text: 'lost', start: 56.36, end: 56.58 },
	{ text: 'more', start: 56.58, end: 56.96 },
	{ text: 'in', start: 56.96, end: 57.14 },
	{ text: 'market', start: 57.14, end: 57.44 },
	{ text: 'value', start: 57.44, end: 57.78 },
	{ text: 'that', start: 57.78, end: 57.96 },
	{ text: 'day', start: 57.96, end: 58.24 },
	{ text: 'than', start: 58.24, end: 58.6 },
	{ text: 'the', start: 58.6, end: 58.72 },
	{ text: '$13.7', start: 58.72, end: 59.8 },
	{ text: 'billion', start: 59.8, end: 60.3 },
	{ text: 'Amazon', start: 60.3, end: 61.14 },
	{ text: 'paid.', start: 61.14, end: 61.52 },
	{ text: 'Amazon', start: 62.1, end: 62.6 },
	{ text: 'was', start: 62.6, end: 62.84 },
	{ text: 'using', start: 62.84, end: 63.1 },
	{ text: 'the', start: 63.1, end: 63.3 },
	{ text: 'high-tech,', start: 63.3, end: 63.86 },
	{ text: 'high-profit', start: 64.26, end: 64.9 },
	{ text: 'engine', start: 64.9, end: 65.24 },
	{ text: 'of', start: 65.24, end: 65.44 },
	{ text: 'AWS', start: 65.44, end: 65.94 },
	{ text: 'to', start: 65.94, end: 66.48 },
	{ text: 'fund', start: 66.48, end: 66.72 },
	{ text: 'an', start: 66.72, end: 66.92 },
	{ text: 'invasion', start: 66.92, end: 67.44 },
	{ text: 'into', start: 67.44, end: 67.8 },
	{ text: 'the', start: 67.8, end: 67.96 },
	{ text: 'old-world', start: 67.96, end: 68.54 },
	{ text: 'business', start: 68.54, end: 68.96 },
	{ text: 'of', start: 68.96, end: 69.22 },
	{ text: 'selling', start: 69.22, end: 69.5 },
	{ text: 'milk', start: 69.5, end: 69.82 },
	{ text: 'and', start: 69.82, end: 70.1 },
	{ text: 'eggs.', start: 70.1, end: 70.48 },
	{ text: 'They', start: 70.84, end: 71.2 },
	{ text: 'were', start: 71.2, end: 71.36 },
	{ text: 'playing', start: 71.36, end: 71.68 },
	{ text: 'a', start: 71.68, end: 71.94 },
	{ text: 'different', start: 71.94, end: 72.36 },
	{ text: 'game.', start: 72.36, end: 72.72 },
];

const FPS = 30;
const DURATION_IN_SECONDS = 73;

// --- Helper Functions ---
const timeToFrames = (seconds: number) => Math.round(seconds * FPS);

// --- React Components ---

const WordComponent: React.FC<{ word: Word }> = ({ word }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const startFrame = timeToFrames(word.start);
	const endFrame = timeToFrames(word.end);
	const duration = endFrame - startFrame;

	// Animate opacity: fade in, stay, fade out
	const opacity = interpolate(
		frame,
		[startFrame, startFrame + duration * 0.2, endFrame - duration * 0.2, endFrame],
		[0, 1, 1, 0],
		{ extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
	);

	// Animate scale for a subtle pop effect
	const scale = spring({
		frame,
		from: 0.8,
		to: 1,
		fps,
		durationInFrames: 15,
		startAt: startFrame,
	});

	return (
		<span
			style={{
				display: 'inline-block',
				opacity,
				transform: `scale(${scale})`,
				marginRight: '12px',
			}}
		>
			{word.text}
		</span>
	);
};

const TextDisplay: React.FC<{ text: Word[] }> = ({ text }) => {
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
					fontFamily: 'Arial, sans-serif',
					fontSize: '72px',
					color: 'white',
					fontWeight: 'bold',
					textAlign: 'center',
					lineHeight: 1.3,
					textShadow: '0 0 20px rgba(0,0,0,0.8)',
				}}
			>
				{text.map((word, i) => (
					<WordComponent key={i} word={word} />
				))}
			</p>
		</AbsoluteFill>
	);
};

const ParallaxScene: React.FC<{
	background: string;
	midground?: string;
	foreground?: string;
	durationInFrames: number;
}> = ({ background, midground, foreground, durationInFrames }) => {
	const frame = useCurrentFrame();

	const bgScale = interpolate(frame, [0, durationInFrames], [1.1, 1.2]);
	const bgX = interpolate(frame, [0, durationInFrames], [0, -50]);
	const mgScale = interpolate(frame, [0, durationInFrames], [1.05, 1.12]);
	const mgX = interpolate(frame, [0, durationInFrames], [-20, 20]);
	const fgScale = interpolate(frame, [0, durationInFrames], [1, 1.05]);
	const fgX = interpolate(frame, [0, durationInFrames], [10, -30]);

	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<Img
					src={staticFile(background)}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						transform: `scale(${bgScale}) translateX(${bgX}px)`,
					}}
				/>
			</AbsoluteFill>
			{midground && (
				<AbsoluteFill>
					<Img
						src={staticFile(midground)}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							transform: `scale(${mgScale}) translateX(${mgX}px)`,
						}}
					/>
				</AbsoluteFill>
			)}
			{foreground && (
				<AbsoluteFill>
					<Img
						src={staticFile(foreground)}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'contain',
							transform: `scale(${fgScale}) translateX(${fgX}px)`,
						}}
					/>
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};


const ArtisticOverlay: React.FC = () => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 30], [0, 0.15], { extrapolateRight: 'clamp' });
    const x = Math.sin(frame / 20) * 10;
    const y = Math.cos(frame / 30) * 10;
  
    return (
      <AbsoluteFill style={{
          // Use a pre-made dust overlay image or CSS gradients for particles
          // For simplicity, a radial gradient is used here
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
          opacity: 0.5, // Vignette
      }}>
          <AbsoluteFill style={{
              // A subtle dust/particle effect
              backgroundImage: `url(${staticFile('assets/images/dust_overlay.png')})`, // A transparent PNG with white dust specs
              backgroundRepeat: 'repeat',
              opacity: opacity,
              transform: `translateX(${x}px) translateY(${y}px)`
          }}/>
      </AbsoluteFill>
    );
  };
  
// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
	const { durationInFrames } = useVideoConfig();
	const frame = useCurrentFrame();

	const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.15], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const cameraPanX = interpolate(frame, [0, durationInFrames], [0, -80]);

	const scenes = [
		{ from: 0, to: 4.3, bg: 'assets/images/rich_farmland.jpg', fg: 'assets/images/cash_cow.jpg' }, // A rich, green field. A stylized, healthy cow with a subtle dollar sign marking.
		{ from: 5.02, to: 6.36, bg: 'assets/images/digital_calendar.jpg' }, // A sleek, futuristic interface displaying "2017" prominently.
		{ from: 7.18, to: 11.08, bg: 'assets/images/dark_server_room.jpg', fg: 'assets/images/money_printer.jpg' }, // An ominous, vast server room. A stylized machine or server churning out glowing dollar bills.
		{ from: 11.82, to: 17.42, bg: 'assets/images/data_background.jpg', fg: 'assets/images/revenue_chart.jpg' }, // An abstract background of flowing data lines. A clean, bold bar chart showing exponential growth to $17B.
		{ from: 17.94, to: 24.22, bg: 'assets/images/office_background.jpg', fg: 'assets/images/margin_comparison.jpg' }, // A generic corporate background. A graphic comparing a thin sliver (retail) to a large block (AWS).
		{ from: 24.74, to: 35.08, bg: 'assets/images/vault_interior.jpg', fg: 'assets/images/war_chest.jpg' }, // The inside of a massive bank vault. An overflowing, ornate treasure chest labeled "AWS Profits".
		{ from: 35.68, to: 42.30, bg: 'assets/images/news_background.jpg', fg: 'assets/images/amazon_wholefoods_logos.jpg' }, // A busy, abstract newsroom backdrop. The Amazon and Whole Foods logos merging together.
		{ from: 43.12, to: 49.68, bg: 'assets/images/shocked_crowd.jpg', fg: 'assets/images/ecommerce_vs_store.jpg' }, // A blurred photo of many surprised faces. A graphic showing a digital shopping cart crashing into a physical storefront.
		{ from: 50.04, to: 55.76, bg: 'assets/images/stock_market_floor.jpg', fg: 'assets/images/plummeting_stock_chart.jpg' }, // A chaotic trading floor. A red stock chart line falling off a cliff, with competitor logos (Kroger, Costco) at the bottom.
		{ from: 56.08, to: 61.52, bg: 'assets/images/abstract_blue.jpg', fg: 'assets/images/balancing_scale.jpg' }, // A simple, clean background. A large balancing scale, with a small pile of gold ($13.7B) on one side and a much larger, heavier pile (Market Loss) on the other.
		{ from: 62.10, to: 72.72, bg: 'assets/images/gears_and_cogs.jpg', fg: 'assets/images/chessboard.jpg' }, // A background of intricate, moving gears. A chessboard in the foreground with a glowing piece making an unexpected, game-changing move.
	];

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<AbsoluteFill
				style={{
					transform: `scale(${cameraZoom}) translateX(${cameraPanX}px)`,
				}}
			>
				{scenes.map((scene, index) => {
					const startFrame = timeToFrames(scene.from);
					const endFrame = timeToFrames(scene.to);
					const duration = endFrame - startFrame;
					const sceneWords = transcript.filter(w => w.start >= scene.from && w.end <= scene.to);

					return (
						<Sequence key={index} from={startFrame} durationInFrames={duration}>
							<AbsoluteFill>
								<ParallaxScene
									background={scene.bg}
									midground={scene.mg}
									foreground={scene.fg}
									durationInFrames={duration}
								/>
								<TextDisplay text={sceneWords} />
							</AbsoluteFill>
						</Sequence>
					);
				})}
                <ArtisticOverlay />
			</AbsoluteFill>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_6.wav')} />
		</AbsoluteFill>
	);
};

// --- Composition Settings ---
export const MainComposition = () => (
	<Composition
		id="StorytellingVideo"
		component={RemotionVideo}
		durationInFrames={DURATION_IN_SECONDS * FPS}
		fps={FPS}
		width={1920}
		height={1080}
	/>
);
```