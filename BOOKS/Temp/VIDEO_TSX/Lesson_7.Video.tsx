```tsx
import React from 'react';
import {
	AbsoluteFill,
	Sequence,
	Audio,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	Easing,
	Img,
	staticFile,
} from 'remotion';

// --- Asset Comments ---
// assets/images/blueprint_background.jpg: A dark, moody background with faint blueprint lines.
// assets/images/key.png: An ornate, glowing antique key with a transparent background.
// assets/images/failure_stamp.png: A red, grunge-style "FAILURE" stamp with a transparent background.
// assets/images/calendar_2019.png: A single calendar page for 2019, looking slightly worn, transparent background.
// assets/images/ghostly_phone.png: A semi-transparent, ghostly image of a generic failed smartphone.
// assets/images/fire_phone.png: A clear product shot of the Amazon Fire Phone on a transparent background.
// assets/images/tech_stage_background.jpg: A dark, empty tech conference stage with a single spotlight.
// assets/images/cracked_glass.png: A transparent overlay of shattered glass.
// assets/images/stock_chart_down.png: A red stock market graph plummeting downwards, transparent background.
// assets/images/newspaper_clipping.png: A generic newspaper clipping texture with a transparent background.
// assets/images/apple_logo_silhouette.png: A dark silhouette of the Apple logo, transparent background.
// assets/images/google_logo_silhouette.png: A dark silhouette of the Google logo, transparent background.
// assets/images/bezos_portrait.jpg: A determined-looking portrait of Jeff Bezos, preferably in black and white.
// assets/images/sunrise_background.jpg: A hopeful, beautiful sunrise over a landscape.
// assets/images/brain_connections.png: A stylized brain with glowing neural pathways, transparent background.
// assets/images/engineers_team.png: A diverse team of engineers collaborating, on a transparent background.
// assets/images/supply_chain_diagram.png: A complex, glowing supply chain flowchart, transparent background.
// assets/images/repurpose_symbol.png: A circular arrow/recycling symbol, glowing green, transparent background.
// assets/images/echo_blueprint.png: A technical blueprint drawing of an Amazon Echo device, transparent background.
// assets/images/amazon_echo.png: A clean product shot of a first-generation Amazon Echo, transparent background.
// assets/images/alexa_logo.png: The Amazon Alexa logo, transparent background.
// assets/images/smart_home_background.jpg: A modern, stylish living room with subtle smart home elements.
// assets/images/ashes.png: A small pile of grey ashes, transparent background.
// assets/images/sprout.png: A single green sprout emerging from the ground, transparent background.
// assets/images/success_tree.png: A large, flourishing, vibrant tree with a strong trunk, transparent background.
// assets/images/bright_sky_background.jpg: A clear, bright blue sky with a few fluffy clouds.
// assets/images/dust_overlay.png: A subtle, semi-transparent overlay of dust particles to add texture.

// --- Transcript Data ---
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
	{start: 2.18, end: 72.32, text: 'their'},
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

// --- Helper Components ---
const Word: React.FC<{
	text: string;
	start: number;
	end: number;
}> = ({text, start, end}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const startFrame = start * fps;
	const endFrame = end * fps;
	const duration = endFrame - startFrame;

	const opacity = interpolate(
		frame,
		[startFrame, startFrame + duration * 0.25, endFrame - duration * 0.25, endFrame],
		[0, 1, 1, 0]
	);
	const scale = interpolate(
		frame,
		[startFrame, startFrame + duration * 0.25],
		[0.9, 1],
		{extrapolateRight: 'clamp'}
	);
	const translateY = interpolate(
		frame,
		[startFrame, startFrame + duration * 0.25],
		[10, 0],
		{extrapolateRight: 'clamp'}
	);

	return (
		<span
			style={{
				display: 'inline-block',
				opacity,
				transform: `scale(${scale}) translateY(${translateY}px)`,
				margin: '0 0.2em',
			}}
		>
			{text}
		</span>
	);
};

const Subtitles: React.FC = () => {
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
					fontSize: '90px',
					lineHeight: 1.3,
					color: 'white',
					textAlign: 'center',
					textShadow: '0 0 20px rgba(0,0,0,0.7)',
				}}
			>
				{transcript.map((item, i) => (
					<Word key={i} {...item} />
				))}
			</p>
		</AbsoluteFill>
	);
};

// --- Main Video Component ---
export const RemotionVideo: React.FC = () => {
	const {fps, width, height} = useVideoConfig();
	const frame = useCurrentFrame();

	const audioDuration = 79.6;
	const videoDurationInFrames = Math.ceil(audioDuration * fps) + 30; // 1s buffer

	// --- Cinematic Camera Movement ---
	const cameraScale = interpolate(
		frame,
		[0, 150, 400, 700, 1100, 1500, 1800, 2100, videoDurationInFrames],
		[1, 1.05, 1, 1.1, 1.05, 1.15, 1.1, 1.2, 1.25],
		{easing: Easing.bezier(0.42, 0, 0.58, 1)}
	);
	const cameraX = interpolate(
		frame,
		[0, 500, 1000, 1500, 2000, videoDurationInFrames],
		[0, -50, 30, -20, 40, 0],
		{easing: Easing.sin}
	);
	const cameraY = interpolate(
		frame,
		[0, 600, 1200, 1800, videoDurationInFrames],
		[0, 20, -30, 10, 0],
		{easing: Easing.sin}
	);
	const cameraRotate = interpolate(frame, [0, videoDurationInFrames], [0, 2], {
		easing: Easing.sin,
	});

	const cameraTransform = [
		`scale(${cameraScale})`,
		`translateX(${cameraX}px)`,
		`translateY(${cameraY}px)`,
		`rotate(${cameraRotate}deg)`,
	].join(' ');

	// Generic function for parallax layers
	const parallax = (strength: number) => ({
		width: '120%',
		height: '120%',
		objectFit: 'cover' as const,
		transform: [
			`scale(${cameraScale * 1.1})`,
			`translateX(${cameraX * strength}px)`,
			`translateY(${cameraY * strength}px)`,
			`rotate(${cameraRotate}deg)`,
		].join(' '),
	});

	// --- Scene Timings ---
	const timings = {
		scene1: {start: 0, duration: 5},
		scene2: {start: 5, duration: 8},
		scene3: {start: 13, duration: 4},
		scene4: {start: 16, duration: 15},
		scene5: {start: 31, duration: 8.5},
		scene6: {start: 39.5, duration: 9.5},
		scene7: {start: 49, duration: 8.5},
		scene8: {start: 57.5, duration: 9.5},
		scene9: {start: 67, duration: 9},
		scene10: {start: 76, duration: 4},
	};

	const s = (scene: keyof typeof timings) => timings[scene];
	const toF = (sec: number) => sec * fps;
	const durF = (sec: number) => sec * fps;

	return (
		<AbsoluteFill style={{backgroundColor: '#111'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_7.wav')} />

			<AbsoluteFill style={{transform: cameraTransform, transformOrigin: 'center'}}>
				{/* Scene 1: The Price of Innovation */}
				<Sequence from={toF(s('scene1').start)} durationInFrames={durF(s('scene1').duration)}>
					<AbsoluteFill>
						<Img src={staticFile('assets/images/blueprint_background.jpg')} style={parallax(0.5)} />
						<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
							<Img
								src={staticFile('assets/images/key.png')}
								style={{
									width: '20%',
									opacity: interpolate(frame, [toF(0), toF(1)], [0, 1]),
									filter: 'drop-shadow(0 0 30px #fefae0)',
									transform: `translateY(${interpolate(frame, [toF(0), toF(5)],[0, -200])}px)`,
								}}
							/>
							<Img
								src={staticFile('assets/images/failure_stamp.png')}
								style={{
									position: 'absolute',
									width: '30%',
									opacity: interpolate(frame, [toF(4), toF(4.5)], [0, 0.8]),
									transform: `scale(${interpolate(frame, [toF(4), toF(4.2)], [2, 1], {easing: Easing.elastic(1)})}) rotate(-15deg)`,
								}}
							/>
						</AbsoluteFill>
					</AbsoluteFill>
				</Sequence>
				
				{/* Scene 2: Ghosts of Failures Passed */}
				<Sequence from={toF(s('scene2').start)} durationInFrames={durF(s('scene2').duration)}>
					<AbsoluteFill style={{ backgroundColor: '#000' }}>
						<Img src={staticFile('assets/images/calendar_2019.png')} style={{...parallax(1.2), opacity: interpolate(frame, [toF(6.5), toF(7.5)], [1, 0])}} />
						<Img src={staticFile('assets/images/ghostly_phone.png')} style={{...parallax(1.5), opacity: interpolate(frame, [toF(11), toF(12.5)], [0, 0.3])}}/>
					</AbsoluteFill>
				</Sequence>

				{/* Scene 3: The Fire Phone */}
				<Sequence from={toF(s('scene3').start)} durationInFrames={durF(s('scene3').duration)}>
					<AbsoluteFill>
						<Img src={staticFile('assets/images/tech_stage_background.jpg')} style={parallax(0.8)} />
						<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
							<Img src={staticFile('assets/images/fire_phone.png')} style={{width: '35%', opacity: interpolate(frame, [toF(14), toF(15)], [0, 1])}}/>
						</AbsoluteFill>
					</AbsoluteFill>
				</Sequence>
				
				{/* Scene 4: Disaster and Humiliation */}
				<Sequence from={toF(s('scene4').start)} durationInFrames={durF(s('scene4').duration)}>
					<AbsoluteFill style={{backgroundColor: '#300'}}>
						<Img src={staticFile('assets/images/fire_phone.png')} style={{ ...parallax(1), filter: 'saturate(0.2)', opacity: 0.5}} />
						<Img src={staticFile('assets/images/cracked_glass.png')} style={{...parallax(1.8), opacity: interpolate(frame, [toF(17), toF(18)], [0, 0.7])}}/>
						<Img src={staticFile('assets/images/stock_chart_down.png')} style={{ ...parallax(1.5), opacity: interpolate(frame, [toF(20), toF(22)], [0, 0.8])}}/>
						<Img src={staticFile('assets/images/newspaper_clipping.png')} style={{mixBlendMode: 'overlay', opacity: 0.3, ...parallax(2.2)}} />
					</AbsoluteFill>
				</Sequence>
				
				{/* Scene 5: Normal Company Reaction */}
				<Sequence from={toF(s('scene5').start)} durationInFrames={durF(s('scene5').duration)}>
					<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', backgroundColor: '#222'}}>
						<Img src={staticFile('assets/images/apple_logo_silhouette.png')} style={{position: 'absolute', top: '10%', left: '15%', width: '15%', opacity: interpolate(frame, [toF(27), toF(28)], [0, 0.6])}}/>
						<Img src={staticFile('assets/images/google_logo_silhouette.png')} style={{position: 'absolute', top: '15%', right: '10%', width: '25%', opacity: interpolate(frame, [toF(28), toF(29)], [0, 0.6])}}/>
					</AbsoluteFill>
				</Sequence>
				
				{/* Scene 6: The Amazon Difference */}
				<Sequence from={toF(s('scene6').start)} durationInFrames={durF(s('scene6').duration)}>
					<AbsoluteFill>
						<Img src={staticFile('assets/images/sunrise_background.jpg')} style={{...parallax(0.6), opacity: interpolate(frame, [toF(40), toF(42)], [0, 1])}} />
						<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
							<Img src={staticFile('assets/images/bezos_portrait.jpg')} style={{width: '25%', borderRadius: '50%', filter: 'grayscale(1)', opacity: interpolate(frame, [toF(41), toF(42)], [0, 0.7])}} />
						</AbsoluteFill>
					</AbsoluteFill>
				</Sequence>
				
				{/* Scene 7: Repurposed Knowledge */}
				<Sequence from={toF(s('scene7').start)} durationInFrames={durF(s('scene7').duration)}>
					<AbsoluteFill style={{backgroundColor: '#0c111c'}}>
						<Img src={staticFile('assets/images/brain_connections.png')} style={{...parallax(1.2), mixBlendMode: 'screen', opacity: interpolate(frame, [toF(49), toF(50)], [0, 0.5])}}/>
						<Img src={staticFile('assets/images/engineers_team.png')} style={{...parallax(1.5), opacity: interpolate(frame, [toF(51), toF(52)], [0, 0.6])}}/>
						<Img src={staticFile('assets/images/supply_chain_diagram.png')} style={{...parallax(1.8), mixBlendMode: 'screen', opacity: interpolate(frame, [toF(53), toF(54)], [0, 0.4])}}/>
						<Img src={staticFile('assets/images/repurpose_symbol.png')} style={{...parallax(2), filter: 'drop-shadow(0 0 20px #0f0)', opacity: interpolate(frame, [toF(56), toF(57)], [0, 0.8])}}/>
					</AbsoluteFill>
				</Sequence>

				{/* Scene 8: Creating the Echo */}
				<Sequence from={toF(s('scene8').start)} durationInFrames={durF(s('scene8').duration)}>
					<AbsoluteFill>
						<Img src={staticFile('assets/images/smart_home_background.jpg')} style={parallax(0.7)} />
						<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
							<Img src={staticFile('assets/images/echo_blueprint.png')} style={{width: '50%', position: 'absolute', opacity: interpolate(frame, [toF(59), toF(60.5)], [1, 0])}} />
							<Img src={staticFile('assets/images/amazon_echo.png')} style={{width: '40%', opacity: interpolate(frame, [toF(60.5), toF(61.5)], [0, 1])}}/>
							<Img src={staticFile('assets/images/alexa_logo.png')} style={{width: '15%', position: 'absolute', bottom: '15%', filter: 'drop-shadow(0 0 20px #0cf)', opacity: interpolate(frame, [toF(62), toF(63)], [0, 1])}}/>
						</AbsoluteFill>
					</AbsoluteFill>
				</Sequence>
				
				{/* Scene 9: Ashes to Success */}
				<Sequence from={toF(s('scene9').start)} durationInFrames={durF(s('scene9').duration)}>
					<AbsoluteFill style={{backgroundColor: '#d4e6f1'}}>
						<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center'}}>
							<Img src={staticFile('assets/images/ashes.png')} style={{width: '30%', opacity: interpolate(frame, [toF(71), toF(72)], [0, 1])}}/>
							<Img src={staticFile('assets/images/sprout.png')} style={{width: '20%', position: 'absolute', transform: `scale(${interpolate(frame, [toF(72.5), toF(73.5)], [0, 1])})`, opacity: interpolate(frame, [toF(75), toF(75.5)], [1, 0])}}/>
							<Img src={staticFile('assets/images/success_tree.png')} style={{width: '80%', position: 'absolute', opacity: interpolate(frame, [toF(74), toF(75.5)], [0, 1])}}/>
						</AbsoluteFill>
					</AbsoluteFill>
				</Sequence>
				
				{/* Scene 10: Final Lesson */}
				<Sequence from={toF(s('scene10').start)} durationInFrames={durF(s('scene10').duration) + 30}>
					<AbsoluteFill>
						<Img src={staticFile('assets/images/bright_sky_background.jpg')} style={parallax(0.5)} />
						<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
							<Img src={staticFile('assets/images/success_tree.png')} style={{...parallax(1.2), opacity: 0.8}}/>
							<Img src={staticFile('assets/images/key.png')} style={{width: '10%', position: 'absolute', filter: 'drop-shadow(0 0 15px gold)', opacity: interpolate(frame, [toF(78), toF(79.6)], [0, 1]), transform: 'translate(150px, -100px) rotate(30deg)'}}/>
						</AbsoluteFill>
					</AbsoluteFill>
				</Sequence>
			</AbsoluteFill>

			{/* --- Dust Overlay & Vignette --- */}
			<AbsoluteFill>
				<Img src={staticFile('assets/images/dust_overlay.png')} style={{opacity: 0.05, mixBlendMode: 'screen'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{boxShadow: 'inset 0 0 150px 50px rgba(0,0,0,0.5)'}} />

			<Subtitles />
		</AbsoluteFill>
	);
};
```