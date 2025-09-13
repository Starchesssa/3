```tsx
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Img,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	Easing,
	staticFile,
} from 'remotion';

// --- Transcript Data ---
// Note: A minor correction was made to the timestamp for "failure" at 72.66s to ensure chronological order.
const transcript = [
	{start: 0.0, end: 0.44, text: 'Key'},
	{start: 0.44, end: 0.84, text: 'lesson,'},
	{start: 1.28, end: 1.42, text: 'the'},
	{start: 1.42, end: 1.8, text: 'price'},
	{start: 1.8, end: 2.04, text: 'of'},
	{start: 2.04, end: 2.58, text: 'innovation'},
	{start: 2.58, end: 3.04, text: 'is'},
	{start: 3.04, end: 3.68, text: 'expensive'},
	{start: 3.68, end: 4.36, text: 'public'},
	{start: 4.36, end: 4.84, text: 'failure.'},
	{start: 5.53, end: 5.88, text: 'We'},
	{start: 5.88, end: 6.24, text: 'need'},
	{start: 6.24, end: 6.42, text: 'to'},
	{start: 6.42, end: 6.62, text: 'talk'},
	{start: 6.62, end: 6.84, text: 'about'},
	{start: 6.84, end: 7.46, text: '2019,'},
	{start: 8.0, end: 8.26, text: 'but'},
	{start: 8.26, end: 8.48, text: 'to'},
	{start: 8.48, end: 9.02, text: 'understand'},
	{start: 9.02, end: 9.74, text: '2019,'},
	{start: 10.12, end: 10.3, text: 'you'},
	{start: 10.3, end: 10.52, text: 'have'},
	{start: 10.52, end: 10.68, text: 'to'},
	{start: 10.68, end: 11.12, text: 'understand'},
	{start: 11.12, end: 11.3, text: 'the'},
	{start: 11.3, end: 11.62, text: 'ghosts'},
	{start: 11.62, end: 11.96, text: 'of'},
	{start: 11.96, end: 12.28, text: 'failures'},
	{start: 12.28, end: 12.68, text: 'passed.'},
	{start: 13.34, end: 13.54, text: 'The'},
	{start: 13.54, end: 13.88, text: 'biggest'},
	{start: 13.88, end: 14.12, text: 'one'},
	{start: 14.12, end: 14.34, text: 'was'},
	{start: 14.34, end: 14.46, text: 'the'},
	{start: 14.46, end: 14.82, text: 'fire'},
	{start: 14.82, end: 15.12, text: 'phone'},
	{start: 15.12, end: 15.3, text: 'from'},
	{start: 15.3, end: 15.98, text: '2014.'},
	{start: 16.64, end: 16.76, text: 'It'},
	{start: 16.76, end: 16.9, text: 'was'},
	{start: 16.9, end: 17.02, text: 'a'},
	{start: 17.02, end: 17.5, text: 'complete'},
	{start: 17.5, end: 17.94, text: 'disaster,'},
	{start: 18.4, end: 18.5, text: 'a'},
	{start: 18.5, end: 18.9, text: 'total'},
	{start: 18.9, end: 19.26, text: 'flop.'},
	{start: 19.76, end: 19.92, text: 'The'},
	{start: 19.92, end: 20.24, text: 'company'},
	{start: 20.24, end: 20.5, text: 'took'},
	{start: 20.5, end: 20.72, text: 'a'},
	{start: 20.72, end: 21.78, text: '$170'},
	{start: 21.78, end: 22.38, text: 'million'},
	{start: 22.38, end: 22.92, text: 'write'},
	{start: 22.92, end: 23.2, text: 'down'},
	{start: 23.2, end: 23.42, text: 'on'},
	{start: 23.42, end: 23.84, text: 'Unsold'},
	{start: 23.84, end: 24.44, text: 'Inventory.'},
	{start: 24.68, end: 24.98, text: 'It'},
	{start: 24.98, end: 25.1, text: 'was'},
	{start: 25.1, end: 25.24, text: 'a'},
	{start: 25.24, end: 25.66, text: 'public'},
	{start: 25.66, end: 26.32, text: 'humiliation.'},
	{start: 26.32, end: 27.18, text: 'They'},
	{start: 27.18, end: 27.42, text: 'tried'},
	{start: 27.42, end: 27.58, text: 'to'},
	{start: 27.58, end: 27.86, text: 'compete'},
	{start: 27.86, end: 28.14, text: 'with'},
	{start: 28.14, end: 28.42, text: 'Apple'},
	{start: 28.42, end: 28.62, text: 'and'},
	{start: 28.62, end: 28.9, text: 'Google'},
	{start: 28.9, end: 29.2, text: 'and'},
	{start: 29.2, end: 29.32, text: 'they'},
	{start: 29.32, end: 29.7, text: 'failed'},
	{start: 29.7, end: 30.78, text: 'spectacularly.'},
	{start: 31.14, end: 31.44, text: 'A'},
	{start: 31.44, end: 31.74, text: 'normal'},
	{start: 31.74, end: 32.18, text: 'company'},
	{start: 32.18, end: 32.38, text: 'would'},
	{start: 32.38, end: 32.7, text: 'fire'},
	{start: 32.7, end: 32.92, text: 'the'},
	{start: 32.92, end: 33.26, text: 'entire'},
	{start: 33.26, end: 33.76, text: 'team.'},
	{start: 34.12, end: 34.22, text: 'They'},
	{start: 34.22, end: 34.34, text: 'would'},
	{start: 34.34, end: 34.64, text: 'never'},
	{start: 34.64, end: 35.0, text: 'mention'},
	{start: 35.0, end: 35.12, text: 'the'},
	{start: 35.12, end: 35.46, text: 'project'},
	{start: 35.46, end: 35.82, text: 'again.'},
	{start: 36.3, end: 36.4, text: 'They'},
	{start: 36.4, end: 36.56, text: 'would'},
	{start: 36.56, end: 36.98, text: 'conclude,'},
	{start: 37.3, end: 37.42, text: 'we'},
	{start: 37.42, end: 37.66, text: 'are'},
	{start: 37.66, end: 37.94, text: 'not'},
	{start: 37.94, end: 38.14, text: 'a'},
	{start: 38.14, end: 38.38, text: 'hardware'},
	{start: 38.38, end: 38.86, text: 'company.'},
	{start: 39.54, end: 39.84, text: 'Amazon'},
	{start: 39.84, end: 40.24, text: 'did'},
	{start: 40.24, end: 40.52, text: 'not'},
	{start: 40.52, end: 40.76, text: 'do'},
	{start: 40.76, end: 41.02, text: 'that.'},
	{start: 41.58, end: 41.82, text: 'Bezos'},
	{start: 41.82, end: 42.24, text: 'said,'},
	{start: 42.42, end: 42.5, text: 'if'},
	{start: 42.5, end: 42.62, text: 'you'},
	{start: 42.62, end: 42.72, text: 'are'},
	{start: 42.72, end: 42.98, text: 'not'},
	{start: 42.98, end: 43.38, text: 'failing,'},
	{start: 43.7, end: 43.8, text: 'you'},
	{start: 43.8, end: 43.9, text: 'are'},
	{start: 43.9, end: 44.18, text: 'not'},
	{start: 44.18, end: 44.76, text: 'innovating.'},
	{start: 45.28, end: 45.46, text: 'The'},
	{start: 45.46, end: 46.38, text: '$170'},
	{start: 46.38, end: 46.92, text: 'million'},
	{start: 46.92, end: 47.54, text: 'was'},
	{start: 47.54, end: 47.72, text: 'the'},
	{start: 47.72, end: 48.1, text: 'tuition'},
	{start: 48.1, end: 48.46, text: 'fee.'},
	{start: 49.08, end: 49.28, text: 'The'},
	{start: 49.28, end: 49.58, text: 'lessons'},
	{start: 49.58, end: 49.86, text: 'they'},
	{start: 49.86, end: 50.12, text: 'learned'},
	{start: 50.12, end: 50.32, text: 'from'},
	{start: 50.32, end: 50.46, text: 'the'},
	{start: 50.46, end: 50.7, text: 'fire'},
	{start: 50.7, end: 51.12, text: "phone's"},
	{start: 51.12, end: 51.4, text: 'failure,'},
	{start: 51.7, end: 51.78, text: 'the'},
	{start: 51.78, end: 52.1, text: 'engineers'},
	{start: 52.1, end: 52.6, text: 'they'},
	{start: 52.6, end: 52.98, text: 'trained,'},
	{start: 53.14, end: 53.2, text: 'the'},
	{start: 53.2, end: 53.6, text: 'supply'},
	{start: 53.6, end: 53.92, text: 'chains'},
	{start: 53.92, end: 54.14, text: 'they'},
	{start: 54.14, end: 54.36, text: 'built'},
	{start: 54.36, end: 54.64, text: 'were'},
	{start: 54.64, end: 54.9, text: 'not'},
	{start: 54.9, end: 55.16, text: 'thrown'},
	{start: 55.16, end: 55.46, text: 'away.'},
	{start: 55.46, end: 56.26, text: 'They'},
	{start: 56.26, end: 56.42, text: 'were'},
	{start: 56.42, end: 57.28, text: 'repurposed.'},
	{start: 57.82, end: 57.96, text: 'That'},
	{start: 57.96, end: 58.3, text: 'same'},
	{start: 58.3, end: 58.68, text: 'team,'},
	{start: 58.9, end: 59.04, text: 'that'},
	{start: 59.04, end: 59.38, text: 'same'},
	{start: 59.38, end: 59.8, text: 'knowledge'},
	{start: 59.8, end: 60.22, text: 'went'},
	{start: 60.22, end: 60.38, text: 'on'},
	{start: 60.38, end: 60.52, text: 'to'},
	{start: 60.52, end: 60.82, text: 'create'},
	{start: 60.82, end: 61.02, text: 'the'},
	{start: 61.02, end: 61.34, text: 'Amazon'},
	{start: 61.34, end: 61.82, text: 'Echo'},
	{start: 61.82, end: 62.08, text: 'and'},
	{start: 62.08, end: 62.46, text: 'Alexa,'},
	{start: 63.0, end: 63.18, text: 'a'},
	{start: 63.18, end: 63.52, text: 'product'},
	{start: 63.52, end: 63.76, text: 'that'},
	{start: 63.76, end: 64.1, text: 'created'},
	{start: 64.1, end: 64.34, text: 'an'},
	{start: 64.34, end: 64.86, text: 'entirely'},
	{start: 64.86, end: 65.32, text: 'new'},
	{start: 65.32, end: 65.8, text: 'category'},
	{start: 65.8, end: 66.04, text: 'of'},
	{start: 66.04, end: 66.6, text: 'technology.'},
	{start: 67.12, end: 67.36, text: 'By'},
	{start: 67.36, end: 68.04, text: '2019,'},
	{start: 68.5, end: 68.8, text: 'tens'},
	{start: 68.8, end: 69.06, text: 'of'},
	{start: 69.06, end: 69.32, text: 'millions'},
	{start: 69.32, end: 69.58, text: 'of'},
	{start: 69.58, end: 69.86, text: 'homes'},
	{start: 69.86, end: 70.08, text: 'had'},
	{start: 70.08, end: 70.26, text: 'an'},
	{start: 70.26, end: 70.48, text: 'Echo'},
	{start: 70.48, end: 70.8, text: 'device.'},
	{start: 71.48, end: 71.62, text: 'The'},
	{start: 71.62, end: 71.96, text: 'ashes'},
	{start: 71.96, end: 72.18, text: 'of'},
	{start: 72.18, end: 72.32, text: 'their'},
	{start: 72.32, end: 72.66, text: 'biggest'},
	{start: 72.66, end: 73.08, text: 'failure'},
	{start: 73.08, end: 73.52, text: 'became'},
	{start: 73.52, end: 73.72, text: 'the'},
	{start: 73.72, end: 74.1, text: 'soil'},
	{start: 74.1, end: 74.36, text: 'for'},
	{start: 74.36, end: 74.52, text: 'one'},
	{start: 74.52, end: 74.6, text: 'of'},
	{start: 74.6, end: 74.74, text: 'their'},
	{start: 74.74, end: 75.08, text: 'biggest'},
	{start: 75.08, end: 75.68, text: 'successes.'},
	{start: 76.54, end: 76.96, text: 'Failure'},
	{start: 76.96, end: 77.16, text: 'is'},
	{start: 77.16, end: 77.6, text: 'only'},
	{start: 77.6, end: 78.04, text: 'failure'},
	{start: 78.04, end: 78.32, text: 'if'},
	{start: 78.32, end: 78.44, text: 'you'},
	{start: 78.44, end: 78.66, text: 'learn'},
	{start: 78.66, end: 79.1, text: 'nothing'},
	{start: 79.1, end: 79.4, text: 'from'},
	{start: 79.4, end: 79.6, text: 'it.'},
];

// --- Word Component ---
const Word: React.FC<{
	text: string;
	start: number;
	end: number;
}> = ({text, start, end}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const startFrame = start * fps;
	const endFrame = end * fps;
	const FADE_DURATION = 5; // Fade in/out over 5 frames

	const opacity = interpolate(
		frame,
		[
			startFrame - FADE_DURATION,
			startFrame,
			endFrame,
			endFrame + FADE_DURATION,
		],
		[0, 1, 1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	return (
		<span
			style={{
				opacity,
				display: 'inline-block',
				marginRight: '1vw',
				marginLeft: '1vw',
				whiteSpace: 'pre',
			}}
		>
			{text}
		</span>
	);
};

// --- Main Video Component ---
export const RemotionVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	// Cinematic Camera Movement
	const progress = frame / durationInFrames;
	const cameraZoom = interpolate(progress, [0, 1], [1, 1.15], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const cameraPanX = interpolate(progress, [0, 1], [0, -80], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});
	const cameraPanY = interpolate(progress, [0, 1], [0, 30], {
		easing: Easing.bezier(0.5, 0, 0.5, 1),
	});

	// Parallax factors
	const bgFactor = 0.2;
	const mgFactor = 0.5;
	const fgFactor = 1.1;

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_7.wav')} />

			{/* Parallax and Camera Container */}
			<AbsoluteFill
				style={{
					transform: `scale(${cameraZoom}) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`,
				}}
			>
				{/* Background */}
				<Img
					src={staticFile('assets/images/background.jpg')}
					style={{
						position: 'absolute',
						width: '120%',
						height: '120%',
						top: '-10%',
						left: '-10%',
						objectFit: 'cover',
						opacity: 0.5,
						transform: `translateX(${cameraPanX * bgFactor}px) translateY(${
							cameraPanY * bgFactor
						}px)`,
					}}
				/>

				{/* Midground */}
				<Img
					src={staticFile('assets/images/midground.jpg')}
					style={{
						position: 'absolute',
						width: '130%',
						height: '130%',
						top: '-15%',
						left: '-15%',
						objectFit: 'cover',
						opacity: 0.3,
						mixBlendMode: 'screen',
						transform: `translateX(${cameraPanX * mgFactor}px) translateY(${
							cameraPanY * mgFactor
						}px)`,
					}}
				/>

				{/* Foreground */}
				<Img
					src={staticFile('assets/images/foreground.jpg')}
					style={{
						position: 'absolute',
						width: '140%',
						height: '140%',
						top: '-20%',
						left: '-20%',
						objectFit: 'contain',
						opacity: 0.2,
						mixBlendMode: 'lighten',
						transform: `translateX(${cameraPanX * fgFactor}px) translateY(${
							cameraPanY * fgFactor
						}px) rotate(${progress * 5}deg)`,
					}}
				/>
			</AbsoluteFill>

			{/* Artistic Overlays */}
			<AbsoluteFill>
				{/* Dust / Particles */}
				<Img
					src={staticFile('assets/images/dust-overlay.jpg')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						mixBlendMode: 'screen',
						opacity: interpolate(progress, [0, 1], [0.05, 0.15]),
						transform: `translateX(${progress * 100}px)`,
					}}
				/>
				{/* Vignette */}
				<div
					style={{
						width: '100%',
						height: '100%',
						background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.9) 100%)`,
					}}
				/>
			</AbsoluteFill>

			{/* Text Container */}
			<AbsoluteFill
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					padding: '10%',
				}}
			>
				<div
					style={{
						fontFamily: 'Helvetica, Arial, sans-serif',
						fontSize: '6.5vh',
						fontWeight: 'bold',
						color: '#fff',
						textAlign: 'center',
						lineHeight: '1.4',
						textShadow:
							'0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 200, 150, 0.3)',
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
					}}
				>
					{transcript.map((word, index) => (
						<Word
							key={`${word.text}-${index}`}
							text={word.text}
							start={word.start}
							end={word.end}
						/>
					))}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```