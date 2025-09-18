```tsx
import {
	AbsoluteFill,
	Audio,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	Easing,
	Img,
	staticFile,
} from 'remotion';
import React from 'react';

const FPS = 30;

const videoStyles: React.CSSProperties = {
	fontFamily: 'Helvetica, Arial, sans-serif',
	fontSize: '72px',
	color: 'white',
	textAlign: 'center',
};

const textShadow = '0px 0px 20px rgba(0,0,0,0.7)';

const transcript = [
	{ start: 0.0, end: 0.46, text: 'Key' },
	{ start: 0.46, end: 0.88, text: 'lesson.' },
	{ start: 1.48, end: 2.08, text: 'Ignore' },
	{ start: 2.08, end: 2.42, text: 'short' },
	{ start: 2.42, end: 2.68, text: '-term' },
	{ start: 2.68, end: 3.2, text: 'reality' },
	{ start: 3.2, end: 3.66, text: 'for' },
	{ start: 3.66, end: 3.8, text: 'a' },
	{ start: 3.8, end: 4.12, text: 'long' },
	{ start: 4.12, end: 4.4, text: '-term' },
	{ start: 4.4, end: 4.84, text: 'vision.' },
	{ start: 5.76, end: 5.96, text: 'The' },
	{ start: 5.96, end: 6.28, text: 'year' },
	{ start: 6.28, end: 6.54, text: 'is' },
	{ start: 6.54, end: 7.22, text: '1999.' },
	{ start: 7.9, end: 8.2, text: 'The' },
	{ start: 8.2, end: 8.5, text: 'world' },
	{ start: 8.5, end: 8.78, text: 'is' },
	{ start: 8.78, end: 9.14, text: 'high' },
	{ start: 9.14, end: 9.4, text: 'on' },
	{ start: 9.4, end: 9.54, text: 'the' },
	{ start: 9.54, end: 9.72, text: 'dot' },
	{ start: 9.72, end: 10.0, text: '-com' },
	{ start: 10.0, end: 10.28, text: 'bubble.' },
	{ start: 10.8, end: 11.14, text: 'Everyone' },
	{ start: 11.14, end: 11.42, text: 'is' },
	{ start: 11.42, end: 11.48, text: 'a' },
	{ start: 11.48, end: 11.8, text: 'genius.' },
	{ start: 12.38, end: 12.84, text: 'Stocks' },
	{ start: 12.84, end: 13.16, text: 'only' },
	{ start: 13.16, end: 13.36, text: 'go' },
	{ start: 13.36, end: 13.66, text: 'up.' },
	{ start: 14.28, end: 14.68, text: 'Amazon' },
	{ start: 14.68, end: 15.04, text: 'is' },
	{ start: 15.04, end: 15.18, text: 'the' },
	{ start: 15.18, end: 15.6, text: 'poster' },
	{ start: 15.6, end: 16.0, text: 'child' },
	{ start: 16.0, end: 16.2, text: 'of' },
	{ start: 16.2, end: 16.4, text: 'this' },
	{ start: 16.4, end: 16.66, text: 'new' },
	{ start: 16.66, end: 17.0, text: 'internet' },
	{ start: 17.0, end: 17.56, text: 'economy.' },
	{ start: 18.02, end: 18.22, text: 'It' },
	{ start: 18.22, end: 18.42, text: 'sells' },
	{ start: 18.42, end: 18.68, text: 'books' },
	{ start: 18.68, end: 19.1, text: 'online.' },
	{ start: 19.78, end: 19.96, text: 'But' },
	{ start: 19.96, end: 20.22, text: 'Jeff' },
	{ start: 20.22, end: 20.64, text: 'Bezos' },
	{ start: 20.64, end: 21.0, text: 'is' },
	{ start: 21.0, end: 21.3, text: 'telling' },
	{ start: 21.3, end: 21.56, text: 'Wall' },
	{ start: 21.56, end: 21.82, text: 'Street' },
	{ start: 21.82, end: 22.3, text: 'something' },
	{ start: 22.3, end: 22.56, text: 'they' },
	{ start: 22.56, end: 22.74, text: 'do' },
	{ start: 22.74, end: 23.04, text: 'not' },
	{ start: 23.04, end: 23.28, text: 'want' },
	{ start: 23.28, end: 23.46, text: 'to' },
	{ start: 23.46, end: 23.66, text: 'hear.' },
	{ start: 24.16, end: 24.38, text: 'He' },
	{ start: 24.38, end: 24.52, text: 'is' },
	{ start: 24.52, end: 24.8, text: 'telling' },
	{ start: 24.8, end: 25.08, text: 'them' },
	{ start: 25.08, end: 25.42, text: 'he' },
	{ start: 25.42, end: 25.56, text: 'is' },
	{ start: 25.56, end: 25.76, text: 'going' },
	{ start: 25.76, end: 25.96, text: 'to' },
	{ start: 25.96, end: 26.3, text: 'lose' },
	{ start: 26.3, end: 26.68, text: 'money.' },
	{ start: 27.16, end: 27.32, text: 'He' },
	{ start: 27.32, end: 27.46, text: 'is' },
	{ start: 27.46, end: 27.72, text: 'telling' },
	{ start: 27.72, end: 27.94, text: 'them' },
	{ start: 27.94, end: 28.18, text: 'he' },
	{ start: 28.18, end: 28.32, text: 'is' },
	{ start: 28.32, end: 28.46, text: 'going' },
	{ start: 28.46, end: 28.64, text: 'to' },
	{ start: 28.64, end: 28.88, text: 'spend' },
	{ start: 28.88, end: 29.44, text: 'every' },
	{ start: 29.44, end: 29.76, text: 'dollar' },
	{ start: 29.76, end: 29.96, text: 'they' },
	{ start: 29.96, end: 30.16, text: 'give' },
	{ start: 30.16, end: 30.42, text: 'him' },
	{ start: 30.42, end: 30.94, text: 'and' },
	{ start: 30.94, end: 31.2, text: 'more.' },
	{ start: 31.86, end: 32.12, text: 'He' },
	{ start: 32.12, end: 32.28, text: 'is' },
	{ start: 32.28, end: 32.54, text: 'not' },
	{ start: 32.54, end: 32.92, text: 'building' },
	{ start: 32.92, end: 33.06, text: 'a' },
	{ start: 33.06, end: 33.36, text: 'bookstore.' },
	{ start: 33.86, end: 34.06, text: 'He' },
	{ start: 34.06, end: 34.18, text: 'is' },
	{ start: 34.18, end: 34.54, text: 'building' },
	{ start: 34.54, end: 34.96, text: 'the' },
	{ start: 34.96, end: 35.42, text: 'everything' },
	{ start: 35.42, end: 35.82, text: 'store.' },
	{ start: 36.5, end: 36.74, text: 'In' },
	{ start: 36.74, end: 36.9, text: 'his' },
	{ start: 36.9, end: 37.5, text: '1997' },
	{ start: 37.5, end: 38.16, text: 'letter' },
	{ start: 38.16, end: 38.4, text: 'to' },
	{ start: 38.4, end: 38.8, text: 'shareholders,' },
	{ start: 39.22, end: 39.44, text: 'he' },
	{ start: 39.44, end: 39.68, text: 'said' },
	{ start: 39.68, end: 40.12, text: 'it' },
	{ start: 40.12, end: 40.28, text: 'was' },
	{ start: 40.28, end: 40.64, text: 'all' },
	{ start: 40.64, end: 41.0, text: 'about' },
	{ start: 41.0, end: 41.22, text: 'the' },
	{ start: 41.22, end: 41.48, text: 'long' },
	{ start: 41.48, end: 41.72, text: '-term.' },
	{ start: 42.54, end: 42.74, text: 'In' },
	{ start: 42.74, end: 43.28, text: '1999,' },
	{ start: 43.98, end: 44.06, text: 'the' },
	{ start: 44.06, end: 44.36, text: 'market' },
	{ start: 44.36, end: 44.66, text: 'loved' },
	{ start: 44.66, end: 44.9, text: 'him' },
	{ start: 44.9, end: 45.12, text: 'for' },
	{ start: 45.12, end: 45.32, text: 'it.' },
	{ start: 45.8, end: 46.08, text: 'Amazon' },
	{ start: 46.08, end: 46.68, text: 'stocks' },
	{ start: 46.68, end: 47.22, text: 'soared' },
	{ start: 47.22, end: 47.4, text: 'to' },
	{ start: 47.4, end: 47.72, text: 'over' },
	{ start: 47.72, end: 48.4, text: '$100' },
	{ start: 48.4, end: 48.9, text: 'a' },
	{ start: 48.9, end: 49.18, text: 'share.' },
	{ start: 49.52, end: 49.86, text: 'But' },
	{ start: 49.86, end: 49.96, text: 'the' },
	{ start: 49.96, end: 50.32, text: 'company' },
	{ start: 50.32, end: 50.7, text: 'was' },
	{ start: 50.7, end: 51.02, text: 'not' },
	{ start: 51.02, end: 51.56, text: 'profitable.' },
	{ start: 51.96, end: 52.16, text: 'Not' },
	{ start: 52.16, end: 52.42, text: 'even' },
	{ start: 52.42, end: 52.72, text: 'close.' },
	{ start: 53.28, end: 53.6, text: 'It' },
	{ start: 53.6, end: 53.8, text: 'was' },
	{ start: 53.8, end: 54.04, text: 'a' },
	{ start: 54.04, end: 54.48, text: 'promise.' },
	{ start: 55.02, end: 55.14, text: 'A' },
	{ start: 55.14, end: 55.42, text: 'bet' },
	{ start: 55.42, end: 55.66, text: 'on' },
	{ start: 55.66, end: 55.78, text: 'a' },
	{ start: 55.78, end: 56.16, text: 'distant' },
	{ start: 56.16, end: 56.66, text: 'future.' },
	{ start: 57.3, end: 57.54, text: 'Most' },
	{ start: 57.54, end: 57.86, text: 'people' },
	{ start: 57.86, end: 58.14, text: 'saw' },
	{ start: 58.14, end: 58.3, text: 'a' },
	{ start: 58.3, end: 58.6, text: 'company' },
	{ start: 58.6, end: 59.06, text: 'selling' },
	{ start: 59.06, end: 59.38, text: 'books' },
	{ start: 59.38, end: 59.6, text: 'at' },
	{ start: 59.6, end: 59.7, text: 'a' },
	{ start: 59.7, end: 59.96, text: 'loss.' },
	{ start: 60.6, end: 60.96, text: 'Bezos' },
	{ start: 60.96, end: 61.38, text: 'saw' },
	{ start: 61.38, end: 61.56, text: 'a' },
	{ start: 61.56, end: 61.96, text: 'global' },
	{ start: 61.96, end: 62.5, text: 'logistics' },
	{ start: 62.5, end: 62.94, text: 'and' },
	{ start: 62.94, end: 63.28, text: 'data' },
	{ start: 63.28, end: 63.76, text: 'empire.' },
	{ start: 64.28, end: 64.52, text: 'The' },
	{ start: 64.52, end: 64.82, text: 'vision' },
	{ start: 64.82, end: 65.02, text: 'was' },
	{ start: 65.02, end: 65.34, text: 'so' },
	{ start: 65.34, end: 65.7, text: 'big,' },
	{ start: 5.96, end: 66.04, text: 'it' },
	{ start: 66.04, end: 66.32, text: 'looked' },
	{ start: 66.32, end: 66.64, text: 'like' },
	{ start: 66.64, end: 67.22, text: 'insanity.' },
];

const sentences = [
	'Key lesson.',
	'Ignore short-term reality for a long-term vision.',
	'The year is 1999.',
	'The world is high on the dot-com bubble.',
	'Everyone is a genius.',
	'Stocks only go up.',
	'Amazon is the poster child of this new internet economy.',
	'It sells books online.',
	'But Jeff Bezos is telling Wall Street something they do not want to hear.',
	'He is telling them he is going to lose money.',
	'He is telling them he is going to spend every dollar they give him and more.',
	'He is not building a bookstore.',
	'He is building the everything store.',
	'In his 1997 letter to shareholders, he said it was all about the long-term.',
	'In 1999, the market loved him for it.',
	'Amazon stocks soared to over $100 a share.',
	'But the company was not profitable.',
	'Not even close.',
	'It was a promise. A bet on a distant future.',
	'Most people saw a company selling books at a loss.',
	'Bezos saw a global logistics and data empire.',
	'The vision was so big, it looked like insanity.',
];

const Word: React.FC<{
	text: string;
	start: number;
	end: number;
}> = ({ text, start, end }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[start * FPS, (start + end) / 2 * FPS, end * FPS],
		[0.6, 1, 0.6],
		{ extrapolateRight: 'clamp' }
	);
	const color = interpolate(
		frame,
		[start * FPS, (start + end) / 2 * FPS, end * FPS],
		[0, 1, 0],
		{ extrapolateRight: 'clamp' }
	);
	const wordColor = `rgba(255, 255, ${Math.round(200 - color * 55)}, 1)`;

	const wordStyle = {
		display: 'inline-block',
		opacity,
		color: wordColor,
		textShadow: `0 0 ${10 + color * 20}px rgba(255, 255, 220, 0.7)`,
	};
	return <span style={wordStyle}>{text}&nbsp;</span>;
};

const TextSequence: React.FC<{
	sentence: string;
	start: number;
	end: number;
}> = ({ sentence, start, end }) => {
	const frame = useCurrentFrame();
	const sentenceWords = sentence.split(' ');
	let wordStartTime = start;
	let wordIndex = 0;

	const opacity = interpolate(
		frame,
		[start * FPS, start * FPS + 15, end * FPS - 15, end * FPS],
		[0, 1, 1, 0]
	);

	const textContainerStyle: React.CSSProperties = {
		width: '80%',
		margin: '0 auto',
		opacity,
		padding: '20px',
		backgroundColor: 'rgba(0,0,0,0.3)',
		borderRadius: '15px',
	};

	return (
		<AbsoluteFill
			style={{
				...videoStyles,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div style={textContainerStyle}>
				{transcript
					.filter((w) => w.start >= start && w.end <= end + 0.1)
					.map((word, i) => (
						<Word key={i} {...word} />
					))}
			</div>
		</AbsoluteFill>
	);
};

const SceneContainer: React.FC<{
	start: number;
	duration: number;
	children: React.ReactNode;
}> = ({ start, duration, children }) => {
	return (
		<Sequence from={start * FPS} durationInFrames={duration * FPS}>
			{children}
		</Sequence>
	);
};

const DustParticles: React.FC<{ count: number }> = ({ count }) => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill>
			{Array.from({ length: count }).map((_, i) => {
				const x = (Math.sin(i * 2 + frame / (10 + i * 2)) + 1) / 2 * 100;
				const y = (Math.cos(i * 3 + frame / (15 + i * 3)) + 1) / 2 * 100;
				const size = 1 + (i % 5);
				const opacity = Math.sin(frame / 20 + i) * 0.2 + 0.2;

				const style: React.CSSProperties = {
					position: 'absolute',
					left: `${x}%`,
					top: `${y}%`,
					width: `${size}px`,
					height: `${size}px`,
					backgroundColor: 'rgba(255, 255, 255, 0.8)',
					borderRadius: '50%',
					opacity,
				};

				return <div key={i} style={style} />;
			})}
		</AbsoluteFill>
	);
};

export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Scene 1: Key lesson
	const scene1Start = 0;
	const scene1End = 1.3;
	const scene1Duration = scene1End - scene1Start;
	const s1Progress = interpolate(
		frame,
		[scene1Start * FPS, scene1End * FPS],
		[0, 1],
		{ extrapolateRight: 'clamp' }
	);
	const s1KeyScale = interpolate(s1Progress, [0, 1], [1, 1.1]);
	const s1KeyGlow = interpolate(s1Progress, [0, 0.5, 1], [0, 15, 0]);

	// Scene 2: Ignore short-term reality...
	const scene2Start = 1.3;
	const scene2End = 5.5;
	const scene2Duration = scene2End - scene2Start;
	const s2Progress = interpolate(
		frame,
		[scene2Start * FPS, scene2End * FPS],
		[0, 1],
		{ extrapolateRight: 'clamp' }
	);
	const s2DollyZoomScale = interpolate(s2Progress, [0, 1], [1, 5], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const s2BgScale = interpolate(s2Progress, [0, 1], [1.2, 1], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const s2FgOpacity = interpolate(s2Progress, [0, 0.5, 1], [1, 1, 0]);

	// Scene 3: The year is 1999.
	const scene3Start = 5.5;
	const scene3End = 7.7;
	const scene3Duration = scene3End - scene3Start;
	const s3Progress = interpolate(
		frame,
		[scene3Start * FPS, scene3End * FPS],
		[0, 1],
		{ extrapolateRight: 'clamp' }
	);
	const s3ScanlineOpacity = 0.1 + Math.sin(frame / 2) * 0.05;
	const s3TextFlicker = 1 - Math.max(0, Math.sin(frame * 2) - 0.9) * 5;

	// And so on for each scene...
	
	const lastWordEnd = transcript[transcript.length - 1].end;

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_1.wav')} />

			{/* Scene 1: Key lesson. */}
			<SceneContainer start={scene1Start} duration={scene1Duration}>
				<AbsoluteFill>
					<Img
						src={staticFile('assets/images/dark-background.jpg')}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
					<Img
						src={staticFile('assets/images/ornate-key.png')}
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							width: '30%',
							transform: `translate(-50%, -50%) scale(${s1KeyScale})`,
							filter: `drop-shadow(0 0 ${s1KeyGlow}px #fff)`,
						}}
					/>
					<DustParticles count={50} />
				</AbsoluteFill>
				<TextSequence sentence={sentences[0]} start={0.0} end={0.88} />
			</SceneContainer>

			{/* Scene 2: Ignore short-term reality... */}
			<SceneContainer start={scene2Start} duration={scene2Duration}>
				<AbsoluteFill
					style={{ transform: `scale(${s2BgScale})` }}
				>
					<Img
						src={staticFile('assets/images/mountain-vision.jpg')}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				</AbsoluteFill>
				<AbsoluteFill
					style={{
						opacity: s2FgOpacity,
						transform: `scale(${s2DollyZoomScale})`,
					}}
				>
					<Img
						src={staticFile('assets/images/blurry-city.jpg')}
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[1]} start={1.48} end={4.84} />
			</SceneContainer>

			{/* Scene 3: The year is 1999. */}
			<SceneContainer start={scene3Start} duration={scene3Duration}>
				<AbsoluteFill>
					<Img
						src={staticFile('assets/images/90s-tech-background.jpg')}
						style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
					/>
					<Img
						src={staticFile('assets/images/crt-monitor-overlay.png')}
						style={{ width: '100%', height: '100%', opacity: 0.8 }}
					/>
					 <div style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
							backgroundSize: '1px 4px',
							opacity: s3ScanlineOpacity,
					 }}/>
				</AbsoluteFill>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: '"Courier New", monospace', fontSize: 200, color: '#0f0', textShadow: '0 0 20px #0f0', opacity: s3TextFlicker}}>
					1999
				</AbsoluteFill>
			</SceneContainer>

			{/* Other scenes... Each with unique visuals */}

			{/* Scene 4: Dot-com bubble */}
			<SceneContainer start={7.7} duration={3}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/stock-chart-background.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(1.1) translateY(${interpolate(frame, [7.7*FPS, 10.7*FPS], [0, -100])}px)`}} />
				</AbsoluteFill>
				<TextSequence sentence={sentences[3]} start={7.90} end={10.28} />
			</SceneContainer>

			{/* Scene 5: Everyone is a genius */}
			<SceneContainer start={10.7} duration={1.5}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/dark-office-background.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8}} />
					<Img src={staticFile('assets/images/crowd-silhouette.png')} style={{width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', bottom: 0, transform: `translateX(${interpolate(frame, [10.7*FPS, 12.2*FPS], [-50, 50])}px)`}} />
				</AbsoluteFill>
				<TextSequence sentence={sentences[4]} start={10.80} end={11.80} />
			</SceneContainer>

			{/* Scene 6: Stocks only go up */}
			<SceneContainer start={12.2} duration={2}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/graph-paper-background.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					<div style={{ position: 'absolute', left: '50%', top: '50%', width: 10, height: 400, background: 'linear-gradient(to top, red, orange)', transform: `translateY(${interpolate(frame, [12.2*FPS, 13*FPS], [400, -400], {easing: Easing.cubic(0,0,0,1)}) }px) rotate(20deg)`}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[5]} start={12.38} end={13.66} />
			</SceneContainer>
			
			{/* Scene 7: Amazon poster child */}
			<SceneContainer start={14.2} duration={3.5}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Img src={staticFile('assets/images/magazine-cover-template.jpg')} style={{ width: '70%', height: '90%', objectFit: 'cover', boxShadow: '0 0 50px rgba(0,0,0,0.5)', transform: `scale(${interpolate(frame, [14.2*FPS, 17.7*FPS], [1, 1.05])})` }} />
					<Img src={staticFile('assets/images/old-amazon-logo.png')} style={{position: 'absolute', width: '30%', top: '20%'}} />
				</AbsoluteFill>
				<TextSequence sentence={sentences[6]} start={14.28} end={17.56} />
			</SceneContainer>
			
			{/* Scene 8: It sells books online */}
			<SceneContainer start={17.7} duration={2}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Img src={staticFile('assets/images/vintage-browser.png')} style={{width: '80%', height: '80%', objectFit: 'contain'}} />
					<Img src={staticFile('assets/images/flying-book.png')} style={{width: '10%', position: 'absolute', left: '10%', top: '40%', transform: `translateX(${interpolate(frame, [18*FPS, 19*FPS], [0, 1500])}px) rotate(${interpolate(frame, [18*FPS, 19*FPS], [0, 360])}deg)`}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[7]} start={18.02} end={19.10} />
			</SceneContainer>

			{/* Scene 9: Bezos vs Wall Street */}
			<SceneContainer start={19.7} duration={4.5}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/wall-street-buildings.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(frame, [19.7*FPS, 24.2*FPS], [1.2, 1])})`}}/>
					<Img src={staticFile('assets/images/bezos-silhouette.png')} style={{width: '30%', position: 'absolute', bottom: 0, left: '35%'}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[8]} start={19.78} end={23.66} />
			</SceneContainer>
			
			{/* Scene 10 & 11: Lose money / Spend every dollar */}
			<SceneContainer start={24.1} duration={7.5}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/dark-smoky-background.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
					<Img src={staticFile('assets/images/dollar-bills.png')} style={{position: 'absolute', width: '20%', top: '40%', left: '40%', opacity: interpolate(frame, [25.5*FPS, 26.6*FPS], [1, 0]), filter: `blur(${interpolate(frame, [26*FPS, 26.6*FPS], [0, 20])}px)`}}/>
					<Img src={staticFile('assets/images/vortex.png')} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `rotate(${frame*2}deg) scale(${interpolate(frame, [27*FPS, 31*FPS], [0.5, 1.2])})`, opacity: interpolate(frame, [27*FPS, 28*FPS], [0, 1])}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[9]} start={24.16} end={26.68} />
				<TextSequence sentence={sentences[10]} start={27.16} end={31.20} />
			</SceneContainer>
			
			{/* Scene 12 & 13: Not a bookstore / The everything store */}
			<SceneContainer start={31.6} duration={4.5}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/quaint-bookstore.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: interpolate(frame, [33.5*FPS, 34*FPS], [1, 0]) }}/>
					<Img src={staticFile('assets/images/red-x.png')} style={{width: '50%', position: 'absolute', top: '25%', left: '25%', transform: `scale(${interpolate(frame, [33*FPS, 33.5*FPS], [0, 1])})`, opacity: interpolate(frame, [33.5*FPS, 34*FPS], [1, 0])}}/>
					<Img src={staticFile('assets/images/vast-warehouse.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: interpolate(frame, [33.8*FPS, 34.5*FPS], [0, 1]), transform: `scale(${interpolate(frame, [33.8*FPS, 36.1*FPS], [1.2, 1])})`}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[11]} start={31.86} end={33.36} />
				<TextSequence sentence={sentences[12]} start={33.86} end={35.82} />
			</SceneContainer>
			
			{/* Scene 14: Long-term letter */}
			<SceneContainer start={36.1} duration={6}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Img src={staticFile('assets/images/letter-paper-texture.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					<p style={{fontSize: 120, fontFamily: 'serif', color: 'black', opacity: 0.7}}>...all about the <strong style={{color: '#a16d3f'}}>long-term.</strong></p>
				</AbsoluteFill>
				<TextSequence sentence={sentences[13]} start={36.50} end={41.72} />
			</SceneContainer>
			
			{/* Scene 15 & 16: Market loved him / Stocks soared */}
			<SceneContainer start={42.1} duration={7.5}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/starry-sky-background.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
					<Img src={staticFile('assets/images/bull-market-graph.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: interpolate(frame, [45*FPS, 45.8*FPS], [1, 0])}}/>
					<Img src={staticFile('assets/images/amazon-rocket.png')} style={{width: '20%', position: 'absolute', left: '40%', bottom: 0, transform: `translateY(${interpolate(frame, [46*FPS, 49*FPS], [0, -2000])}px)`}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[14]} start={42.54} end={45.32} />
				<TextSequence sentence={sentences[15]} start={45.80} end={49.18} />
			</SceneContainer>
			
			{/* Scene 17 & 18: Not profitable */}
			<SceneContainer start={49.5} duration={3.7}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Img src={staticFile('assets/images/financial-document.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(frame, [52*FPS, 53.2*FPS], [1, 1.5])})`}}/>
					<Img src={staticFile('assets/images/red-circle.png')} style={{width: '40%', position: 'absolute', opacity: interpolate(frame, [52.2*FPS, 52.7*FPS], [0, 1]), transform: `scale(${interpolate(frame, [52.2*FPS, 52.7*FPS], [2, 1])})`}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[16]} start={49.52} end={51.56} />
				<TextSequence sentence={sentences[17]} start={51.96} end={52.72} />
			</SceneContainer>

			{/* Scene 19: Promise on a distant future */}
			<SceneContainer start={53.2} duration={4}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/future-city.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translateX(${interpolate(frame, [53.2*FPS, 57.2*FPS], [0, -50])}px) scale(1.1)`}}/>
					<Img src={staticFile('assets/images/chasm.png')} style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', bottom: 0, transform: `translateX(${interpolate(frame, [53.2*FPS, 57.2*FPS], [0, -100])}px)`}}/>
					<Img src={staticFile('assets/images/reaching-hand.png')} style={{width: '50%', position: 'absolute', left: 0, top: '25%', transform: `translateX(${interpolate(frame, [53.2*FPS, 57.2*FPS], [0, -150])}px)`}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[18]} start={53.28} end={56.66} />
			</SceneContainer>

			{/* Scene 20: Selling at a loss */}
			<SceneContainer start={57.2} duration={3.2}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<Img src={staticFile('assets/images/dark-background.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
					<Img src={staticFile('assets/images/balance-scale.png')} style={{width: '60%', transform: `rotate(${interpolate(frame, [58*FPS, 59.5*FPS], [0, -15], {easing: Easing.elastic(1)}) }deg)`}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[19]} start={57.30} end={59.96} />
			</SceneContainer>

			{/* Scene 21: Global empire */}
			<SceneContainer start={60.4} duration={3.8}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/world-map-glow.png')} style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${interpolate(frame, [60.4*FPS, 64.2*FPS], [1.5, 1])})`}}/>
					<Img src={staticFile('assets/images/data-network-overlay.png')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, mixBlendMode: 'lighten'}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[20]} start={60.60} end={63.76} />
			</SceneContainer>
			
			{/* Scene 22: Looked like insanity */}
			<SceneContainer start={64.2} duration={3.5}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/cosmic-nebula.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(frame, [64.2*FPS, 67.7*FPS], [1, 1.2])})`}}/>
					<Img src={staticFile('assets/images/human-silhouette.png')} style={{width: '15%', position: 'absolute', bottom: 0, left: '42.5%'}}/>
				</AbsoluteFill>
				<TextSequence sentence={sentences[21]} start={64.28} end={67.22} />
			</SceneContainer>

		</AbsoluteFill>
	);
};
```