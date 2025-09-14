```tsx
import {
	AbsoluteFill,
	Audio,
	Img,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	Easing,
} from 'remotion';
import React from 'react';

// --- Data --- //

const audioSrc = staticFile('BOOKS/Temp/TTS/Lesson_4.wav');

const transcript = [
	{start: 0.0, end: 0.42, text: 'Key'},
	{start: 0.42, end: 0.82, text: 'lesson,'},
	{start: 1.26, end: 1.54, text: 'turn'},
	{start: 1.54, end: 1.78, text: 'your'},
	{start: 1.78, end: 2.16, text: 'biggest'},
	{start: 2.16, end: 2.64, text: 'expense'},
	{start: 2.64, end: 3.2, text: 'into'},
	{start: 3.2, end: 3.4, text: 'your'},
	{start: 3.4, end: 3.8, text: 'biggest'},
	{start: 3.8, end: 4.48, text: 'product.'},
	{start: 4.84, end: 5.5, text: 'The'},
	{start: 5.5, end: 5.78, text: 'year'},
	{start: 5.78, end: 6.0, text: 'is'},
	{start: 6.0, end: 6.84, text: '2006.'},
	{start: 7.4, end: 7.74, text: 'Amazon'},
	{start: 7.74, end: 8.08, text: 'is'},
	{start: 8.08, end: 8.22, text: 'a'},
	{start: 8.22, end: 8.62, text: 'successful'},
	{start: 8.62, end: 9.22, text: 'online'},
	{start: 9.22, end: 9.76, text: 'retailer.'},
	{start: 10.2, end: 10.48, text: 'That'},
	{start: 10.48, end: 10.66, text: 'is'},
	{start: 10.66, end: 10.82, text: 'what'},
	{start: 10.82, end: 11.22, text: 'everyone'},
	{start: 11.22, end: 11.62, text: 'sees.'},
	{start: 12.24, end: 12.42, text: 'But'},
	{start: 12.42, end: 12.9, text: 'inside,'},
	{start: 13.34, end: 13.54, text: 'something'},
	{start: 13.54, end: 13.86, text: 'else'},
	{start: 13.86, end: 14.06, text: 'is'},
	{start: 14.06, end: 14.4, text: 'happening.'},
	{start: 15.0, end: 15.2, text: 'For'},
	{start: 15.2, end: 15.54, text: 'years,'},
	{start: 15.88, end: 15.94, text: 'the'},
	{start: 15.94, end: 16.46, text: "company's"},
	{start: 16.46, end: 16.76, text: 'biggest'},
	{start: 16.76, end: 17.18, text: 'headache'},
	{start: 17.18, end: 17.52, text: 'and'},
	{start: 17.52, end: 17.84, text: 'biggest'},
	{start: 17.84, end: 18.34, text: 'expense'},
	{start: 18.34, end: 18.78, text: 'was'},
	{start: 18.78, end: 18.96, text: 'its'},
	{start: 18.96, end: 19.28, text: 'own'},
	{start: 19.28, end: 19.74, text: 'computing'},
	{start: 19.74, end: 20.5, text: 'infrastructure.'},
	{start: 21.0, end: 21.2, text: 'The'},
	{start: 21.2, end: 21.58, text: 'servers,'},
	{start: 21.96, end: 22.06, text: 'the'},
	{start: 22.06, end: 22.56, text: 'databases,'},
	{start: 22.98, end: 23.22, text: 'the'},
	{start: 23.22, end: 23.56, text: 'network'},
	{start: 23.56, end: 23.86, text: 'to'},
	{start: 23.86, end: 24.04, text: 'run'},
	{start: 24.04, end: 24.2, text: 'the'},
	{start: 24.2, end: 24.64, text: 'massive'},
	{start: 24.64, end: 25.1, text: 'Amazon'},
	{start: 25.1, end: 25.58, text: '.com'},
	{start: 25.58, end: 26.06, text: 'website.'},
	{start: 26.06, end: 26.74, text: 'It'},
	{start: 26.74, end: 26.92, text: 'was'},
	{start: 26.92, end: 27.14, text: 'a'},
	{start: 27.14, end: 27.62, text: 'beast.'},
	{start: 28.04, end: 28.16, text: 'It'},
	{start: 28.16, end: 28.32, text: 'was'},
	{start: 28.32, end: 28.82, text: 'complex'},
	{start: 28.82, end: 29.26, text: 'and'},
	{start: 29.26, end: 29.9, text: 'incredibly'},
	{start: 29.9, end: 30.58, text: 'expensive.'},
	{start: 31.14, end: 31.34, text: 'A'},
	{start: 31.34, end: 31.62, text: 'normal'},
	{start: 31.62, end: 32.06, text: 'company'},
	{start: 32.06, end: 32.38, text: 'sees'},
	{start: 32.38, end: 32.56, text: 'a'},
	{start: 32.56, end: 32.76, text: 'cost'},
	{start: 32.76, end: 33.1, text: 'center.'},
	{start: 33.54, end: 33.72, text: 'They'},
	{start: 33.72, end: 33.96, text: 'try'},
	{start: 33.96, end: 34.1, text: 'to'},
	{start: 34.1, end: 34.24, text: 'make'},
	{start: 34.24, end: 34.4, text: 'it'},
	{start: 34.4, end: 34.54, text: 'a'},
	{start: 34.54, end: 34.78, text: 'little'},
	{start: 34.78, end: 35.14, text: 'cheaper,'},
	{start: 35.5, end: 35.56, text: 'a'},
	{start: 35.56, end: 35.8, text: 'little'},
	{start: 35.8, end: 36.0, text: 'more'},
	{start: 36.0, end: 36.4, text: 'efficient.'},
	{start: 37.06, end: 37.42, text: 'Amazon'},
	{start: 37.42, end: 37.78, text: 'saw'},
	{start: 37.78, end: 37.9, text: 'an'},
	{start: 37.9, end: 38.48, text: 'opportunity.'},
	{start: 39.02, end: 39.24, text: 'They'},
	{start: 39.24, end: 39.48, text: 'thought,'},
	{start: 39.8, end: 40.0, text: 'if'},
	{start: 40.0, end: 40.18, text: 'we'},
	{start: 40.18, end: 40.34, text: 'have'},
	{start: 40.34, end: 40.6, text: 'gotten'},
	{start: 40.6, end: 40.86, text: 'this'},
	{start: 40.86, end: 41.2, text: 'good'},
	{start: 41.2, end: 41.4, text: 'at'},
	{start: 41.4, end: 41.66, text: 'running'},
	{start: 41.66, end: 42.2, text: 'massive,'},
	{start: 42.48, end: 42.86, text: 'reliable'},
	{start: 42.86, end: 43.32, text: 'computer'},
	{start: 43.32, end: 43.8, text: 'systems'},
	{start: 43.8, end: 44.04, text: 'for'},
	{start: 44.04, end: 44.48, text: 'ourselves,'},
	{start: 45.06, end: 45.22, text: 'maybe'},
	{start: 45.22, end: 45.58, text: 'other'},
	{start: 45.58, end: 45.92, text: 'people'},
	{start: 45.92, end: 46.14, text: 'would'},
	{start: 46.14, end: 46.36, text: 'pay'},
	{start: 46.36, end: 46.5, text: 'to'},
	{start: 46.5, end: 46.76, text: 'use'},
	{start: 46.76, end: 47.02, text: 'it.'},
	{start: 47.42, end: 47.7, text: 'In'},
	{start: 47.7, end: 48.36, text: '2006,'},
	{start: 48.76, end: 48.84, text: 'they'},
	{start: 48.84, end: 49.12, text: 'launched'},
	{start: 49.12, end: 49.58, text: 'Amazon'},
	{start: 49.58, end: 49.94, text: 'Web'},
	{start: 49.94, end: 50.46, text: 'Services,'},
	{start: 50.78, end: 50.98, text: 'or'},
	{start: 50.98, end: 51.52, text: 'AWS.'},
	{start: 52.28, end: 52.54, text: 'They'},
	{start: 52.54, end: 52.92, text: 'started'},
	{start: 52.92, end: 53.28, text: 'renting'},
	{start: 53.28, end: 53.58, text: 'out'},
	{start: 53.58, end: 53.74, text: 'their'},
	{start: 53.74, end: 54.12, text: 'computer'},
	{start: 54.12, end: 54.46, text: 'power.'},
	{start: 54.46, end: 55.08, text: 'It'},
	{start: 55.08, end: 55.2, text: 'was'},
	{start: 55.2, end: 55.38, text: 'like'},
	{start: 55.38, end: 55.52, text: 'a'},
	{start: 55.52, end: 55.82, text: 'power'},
	{start: 55.82, end: 56.26, text: 'company,'},
	{start: 56.48, end: 56.64, text: 'but'},
	{start: 56.64, end: 56.84, text: 'for'},
	{start: 56.84, end: 57.28, text: 'computing.'},
	{start: 58.06, end: 58.2, text: 'At'},
	{start: 58.2, end: 58.58, text: 'first,'},
	{start: 58.86, end: 59.04, text: 'no'},
	{start: 59.04, end: 59.18, text: 'one'},
	{start: 59.18, end: 59.6, text: 'understood'},
	{start: 59.6, end: 59.88, text: 'it.'},
	{start: 60.2, end: 60.4, text: 'An'},
	{start: 60.4, end: 60.78, text: 'online'},
	{start: 60.78, end: 61.3, text: 'bookstore'},
	{start: 61.3, end: 61.66, text: 'was'},
	{start: 61.66, end: 61.84, text: 'now'},
	{start: 61.84, end: 62.18, text: 'selling'},
	{start: 62.18, end: 62.6, text: 'server'},
	{start: 62.6, end: 62.98, text: 'time.'},
	{start: 63.3, end: 63.42, text: 'It'},
	{start: 63.42, end: 63.6, text: 'made'},
	{start: 63.6, end: 63.98, text: 'no'},
	{start: 63.98, end: 64.42, text: 'sense.'},
	{start: 64.9, end: 65.1, text: 'But'},
	{start: 65.1, end: 65.26, text: 'it'},
	{start: 65.26, end: 65.4, text: 'was'},
	{start: 65.4, end: 65.58, text: 'the'},
	{start: 65.58, end: 65.96, text: 'start'},
	{start: 65.96, end: 66.18, text: 'of'},
	{start: 66.18, end: 66.3, text: 'the'},
	{start: 66.3, end: 66.64, text: 'cloud'},
	{start: 66.64, end: 67.16, text: 'computing'},
	{start: 67.16, end: 67.8, text: 'revolution.'},
	{start: 68.4, end: 68.5, text: 'A'},
	{start: 68.5, end: 68.94, text: 'multi'},
	{start: 68.94, end: 69.58, text: '-trillion'},
	{start: 69.58, end: 69.94, text: 'dollar'},
	{start: 69.94, end: 70.42, text: 'industry'},
	{start: 70.42, end: 70.7, text: 'was'},
	{start: 70.7, end: 71.0, text: 'born'},
	{start: 71.0, end: 71.26, text: 'from'},
	{start: 71.26, end: 71.46, text: 'what'},
	{start: 71.46, end: 71.76, text: 'used'},
	{start: 71.76, end: 71.96, text: 'to'},
	{start: 71.96, end: 72.04, text: 'be'},
	{start: 72.04, end: 72.2, text: 'a'},
	{start: 72.2, end: 72.44, text: 'line'},
	{start: 2.44, end: 72.76, text: 'item'},
	{start: 72.76, end: 72.94, text: 'in'},
	{start: 72.94, end: 73.12, text: 'their'},
	{start: 73.12, end: 73.44, text: 'expense'},
	{start: 73.44, end: 73.82, text: 'report.'},
];

// --- Components --- //

type WordProps = {
	text: string;
	start: number; // in seconds
	end: number; // in seconds
};

const Word: React.FC<WordProps> = ({text, start, end}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const startFrame = Math.floor(start * fps);
	const endFrame = Math.floor(end * fps);

	const opacity = interpolate(
		frame,
		[startFrame, startFrame + 5, endFrame, endFrame + 5],
		[0, 1, 1, 0]
	);

	return (
		<span style={{opacity, display: 'inline-block', marginLeft: '0.5em'}}>
			{text}
		</span>
	);
};

type ParallaxSceneProps = {
	children: React.ReactNode;
	bgImage: string; // e.g., "sky.jpg"
	midImage?: string; // e.g., "mountains.png"
	fgImage?: string; // e.g., "trees.png"
	zoomAmount: number;
	panX: number;
	panY: number;
	// Add comments for what the images should look like
	/**
	 * @bgImage A large, detailed background image.
	 * @midImage A semi-transparent or cutout image for the middle layer.
	 * @fgImage A detailed foreground image, often with transparent areas.
	 */
};

const ParallaxScene: React.FC<ParallaxSceneProps> = ({
	children,
	bgImage,
	midImage,
	fgImage,
	zoomAmount,
	panX,
	panY,
}) => {
	const baseStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	};

	return (
		<AbsoluteFill>
			{/* Background Layer */}
			<Img
				src={staticFile(`assets/images/${bgImage}`)}
				style={{
					...baseStyle,
					transform: `scale(${1 + zoomAmount * 0.1}) translateX(${
						panX * 0.2
					}px) translateY(${panY * 0.2}px)`,
				}}
			/>
			{/* Midground Layer */}
			{midImage && (
				<Img
					src={staticFile(`assets/images/${midImage}`)}
					style={{
						...baseStyle,
						transform: `scale(${1 + zoomAmount * 0.2}) translateX(${
							panX * 0.5
						}px) translateY(${panY * 0.5}px)`,
					}}
				/>
			)}
			{/* Foreground Layer */}
			{fgImage && (
				<Img
					src={staticFile(`assets/images/${fgImage}`)}
					style={{
						...baseStyle,
						transform: `scale(${1 + zoomAmount * 0.3}) translateX(${
							panX * 1
						}px) translateY(${panY * 1}px)`,
					}}
				/>
			)}
			<AbsoluteFill
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					textAlign: 'center',
				}}
			>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// --- Main Video Component --- //

export const RemotionVideo: React.FC = () => {
	const {fps, durationInFrames} = useVideoConfig();
	const frame = useCurrentFrame();

	// Cinematic Camera Movement
	const overallZoom = interpolate(frame, [0, durationInFrames], [1, 1.15], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const overallPanX = interpolate(
		frame,
		[0, durationInFrames / 2, durationInFrames],
		[20, -20, 20],
		{easing: Easing.sin()}
	);
	const overallPanY = interpolate(
		frame,
		[0, durationInFrames / 2, durationInFrames],
		[-10, 10, -10],
		{easing: Easing.sin()}
	);

	const textStyle: React.CSSProperties = {
		fontFamily: 'Helvetica, Arial, sans-serif',
		fontSize: '60px',
		fontWeight: 'bold',
		color: 'white',
		textShadow: '0 0 15px rgba(0,0,0,0.8)',
		padding: '0 5%',
	};

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Audio src={audioSrc} />

			<div
				style={{
					transform: `scale(${overallZoom}) translateX(${overallPanX}px) translateY(${overallPanY}px)`,
					width: '100%',
					height: '100%',
				}}
			>
				{/* Scene 1: The Core Idea */}
				<Sequence from={0} durationInFrames={Math.floor(4.8 * fps)}>
					<ParallaxScene
						bgImage="abstract-gears.jpg" // A dark, sophisticated background with slowly turning gears.
						midImage="glowing-keyhole.png" // A semi-transparent keyhole in the center, emitting a soft light.
						fgImage="dollar-to-product-stream.png" // A stream of dollar signs flowing in and product boxes flowing out.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>

				{/* Scene 2: Amazon in 2006 */}
				<Sequence from={Math.floor(4.5 * fps)} durationInFrames={Math.floor(5.5 * fps)}>
					<ParallaxScene
						bgImage="2006-amazon-homepage.jpg" // A slightly blurry screenshot of the Amazon.com homepage from 2006.
						midImage="warehouse-aisle.jpg" // A classic Amazon warehouse aisle, slightly out of focus.
						fgImage="vintage-crt-monitor.png" // The frame of an old CRT monitor, making it look like we're seeing through it.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>

				{/* Scene 3: Inside Story */}
				<Sequence from={Math.floor(9.9 * fps)} durationInFrames={Math.floor(5 * fps)}>
					<ParallaxScene
						bgImage="dark-server-room.jpg" // A wide shot of a vast, dark server room with blinking LEDs.
						fgImage="scrolling-code-overlay.png" // A transparent overlay of green, cascading code, like in The Matrix.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>

				{/* Scene 4: The Headache */}
				<Sequence from={Math.floor(14.7 * fps)} durationInFrames={Math.floor(6.2 * fps)}>
					<ParallaxScene
						bgImage="complex-server-diagram.jpg" // A messy, chaotic whiteboard diagram of a server architecture.
						midImage="throbbing-red-glow.png" // A soft, pulsing red glow in the center to signify a 'headache'.
						fgImage="tangled-wires.png" // A thick mess of tangled computer cables framing the shot.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>
				
				{/* Scene 5: The Components */}
				<Sequence from={Math.floor(20.7 * fps)} durationInFrames={Math.floor(5.7 * fps)}>
					<ParallaxScene
						bgImage="network-nodes-abstract.jpg" // An abstract background of glowing, interconnected nodes.
						midImage="database-stack-icon.png" // A clean, glowing icon of a database stack.
						fgImage="server-blade-closeup.png" // A close-up, high-detail shot of a server blade, angled from the side.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>

				{/* Scene 6: The Beast */}
				<Sequence from={Math.floor(26 * fps)} durationInFrames={Math.floor(5 * fps)}>
					<ParallaxScene
						bgImage="industrial-machine-dark.jpg" // The interior of a massive, complex industrial machine, dark and gritty.
						fgImage="beast-shadow-overlay.png" // A subtle, shadowy silhouette of a monstrous creature.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>
				
				{/* Scene 7: Cost vs. Opportunity */}
				<Sequence from={Math.floor(30.8 * fps)} durationInFrames={Math.floor(8 * fps)}>
					<ParallaxScene
						bgImage="office-whiteboard.jpg" // A typical office whiteboard background.
						midImage="red-cost-graph.png" // A simple graph in red showing high costs. This image should fade out as the 'opportunity' part is mentioned.
						fgImage="glowing-lightbulb-idea.png" // A bright, glowing lightbulb that fades in over the graph.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>

				{/* Scene 8: The "What If" Moment */}
				<Sequence from={Math.floor(38.7 * fps)} durationInFrames={Math.floor(8.7 * fps)}>
					<ParallaxScene
						bgImage="clean-blueprint.jpg" // A clean, blue blueprint background.
						midImage="central-hub-diagram.png" // A diagram showing a central hub (representing Amazon's infra) in the middle.
						fgImage="arrows-to-logos.png" // Arrows radiating outwards from the hub to various generic company logos.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>
				
				{/* Scene 9: AWS Launch */}
				<Sequence from={Math.floor(47.1 * fps)} durationInFrames={Math.floor(4.8 * fps)}>
					<ParallaxScene
						bgImage="sky-with-clouds.jpg" // A beautiful, epic shot of the sky and clouds at sunrise.
						fgImage="aws-logo-official.png" // The AWS logo, large and slowly fading into the center.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>

				{/* Scene 10: The Analogy */}
				<Sequence from={Math.floor(51.9 * fps)} durationInFrames={Math.floor(5.7 * fps)}>
					<ParallaxScene
						bgImage="power-lines-sunset.jpg" // Silhouettes of electrical power lines against a sunset.
						midImage="data-flow-abstract.png" // Abstract streams of data flowing like electricity.
						fgImage="power-plug-to-cloud.png" // A simple icon of a power plug connecting to a cloud icon.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>
				
				{/* Scene 11: Confusion */}
				<Sequence from={Math.floor(57.7 * fps)} durationInFrames={Math.floor(7 * fps)}>
					<ParallaxScene
						bgImage="blurry-crowd.jpg" // A background of a blurry, indistinct crowd of people.
						fgImage="floating-question-marks.png" // Semi-transparent question marks floating and fading in and out.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>
				
				{/* Scene 12: Revolution */}
				<Sequence from={Math.floor(64.5 * fps)} durationInFrames={Math.floor(3.7 * fps)}>
					<ParallaxScene
						bgImage="digital-water-surface.jpg" // A dark, digital water-like surface.
						fgImage="ripple-effect.png" // A massive, glowing ripple effect expanding from the center.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>
				
				{/* Scene 13: The Result */}
				<Sequence from={Math.floor(68 * fps)}>
					<ParallaxScene
						bgImage="futuristic-cityscape.jpg" // A bright, thriving futuristic city powered by data.
						fgImage="expense-report-overlay.png" // A semi-transparent overlay of an expense report, with one line item glowing and fading away.
						zoomAmount={overallZoom - 1}
						panX={overallPanX}
						panY={overallPanY}
					/>
				</Sequence>

			</div>

			{/* Text Layer */}
			<AbsoluteFill
				style={{
					...textStyle,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div>
					{transcript.map((word, i) => (
						<Word key={i} text={word.text} start={word.start} end={word.end} />
					))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```