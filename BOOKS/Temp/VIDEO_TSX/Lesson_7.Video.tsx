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
} from 'remotion';
import React from 'react';

// Helper to convert time in seconds to frames
const timeToFrames = (seconds: number, fps: number): number =>
	Math.floor(seconds * fps);

interface WordProps {
	text: string;
	start: number; // in seconds
	end: number; // in seconds
}

const Word: React.FC<WordProps> = ({ text, start, end }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const startFrame = timeToFrames(start, fps);
	const endFrame = timeToFrames(end, fps);
	const fadeInDuration = 10;
	const fadeOutDuration = 10;

	const opacity = interpolate(
		frame,
		[
			startFrame,
			startFrame + fadeInDuration,
			endFrame - fadeOutDuration,
			endFrame,
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
				display: 'inline-block',
				marginLeft: '10px',
				marginRight: '10px',
				opacity,
				transform: `translateY(${(1 - opacity) * 10}px)`,
			}}
		>
			{text}
		</span>
	);
};

const TextContainer: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<p
				style={{
					fontFamily: 'Helvetica, Arial, sans-serif',
					fontSize: '90px',
					fontWeight: 'bold',
					color: 'white',
					textAlign: 'center',
					lineHeight: '1.3',
					textShadow: '0 0 20px rgba(0,0,0,0.8)',
					width: '80%',
				}}
			>
				{children}
			</p>
		</AbsoluteFill>
	);
};

const DustParticle: React.FC<{ seed: number }> = ({ seed }) => {
	const frame = useCurrentFrame();
	const { width, height, durationInFrames } = useVideoConfig();

	const random = (s: number) => {
		const x = Math.sin(s) * 10000;
		return x - Math.floor(x);
	};

	const startX = random(seed) * width;
	const startY = random(seed * 2) * height;
	const speed = random(seed * 3) * 0.5 + 0.2;
	const size = random(seed * 4) * 4 + 1;

	const life = frame / durationInFrames;
	const y = (startY + life * 100 * speed) % height;
	const x = (startX + Math.sin(life * Math.PI * 4 + seed) * 20) % width;
	const opacity = random(seed * 5) * 0.5;

	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: size,
				height: size,
				borderRadius: '50%',
				backgroundColor: 'rgba(255, 255, 255, 0.8)',
				opacity,
				filter: `blur(2px)`,
			}}
		/>
	);
};

const DustOverlay: React.FC<{ count?: number }> = ({ count = 50 }) => {
	const particles = Array.from({ length: count }, (_, i) => (
		<DustParticle key={i} seed={i} />
	));
	return <AbsoluteFill style={{ overflow: 'hidden' }}>{particles}</AbsoluteFill>;
};

export const RemotionVideo: React.FC = () => {
	const { fps, width, height } = useVideoConfig();
	const durationInSeconds = 80;
	const durationInFrames = durationInSeconds * fps;

	const transcript = [
		{ text: 'Key', start: 0.0, end: 0.44 },
		{ text: 'lesson,', start: 0.44, end: 0.84 },
		{ text: 'the', start: 1.28, end: 1.42 },
		{ text: 'price', start: 1.42, end: 1.8 },
		{ text: 'of', start: 1.8, end: 2.04 },
		{ text: 'innovation', start: 2.04, end: 2.58 },
		{ text: 'is', start: 2.58, end: 3.04 },
		{ text: 'expensive', start: 3.04, end: 3.68 },
		{ text: 'public', start: 3.68, end: 4.36 },
		{ text: 'failure.', start: 4.36, end: 4.84 },
		{ text: 'We', start: 5.53, end: 5.88 },
		{ text: 'need', start: 5.88, end: 6.24 },
		{ text: 'to', start: 6.24, end: 6.42 },
		{ text: 'talk', start: 6.42, end: 6.62 },
		{ text: 'about', start: 6.62, end: 6.84 },
		{ text: '2019,', start: 6.84, end: 7.46 },
		{ text: 'but', start: 8.0, end: 8.26 },
		{ text: 'to', start: 8.26, end: 8.48 },
		{ text: 'understand', start: 8.48, end: 9.02 },
		{ text: '2019,', start: 9.02, end: 9.74 },
		{ text: 'you', start: 10.12, end: 10.3 },
		{ text: 'have', start: 10.3, end: 10.52 },
		{ text: 'to', start: 10.52, end: 10.68 },
		{ text: 'understand', start: 10.68, end: 11.12 },
		{ text: 'the', start: 11.12, end: 11.3 },
		{ text: 'ghosts', start: 11.3, end: 11.62 },
		{ text: 'of', start: 11.62, end: 11.96 },
		{ text: 'failures', start: 11.96, end: 12.28 },
		{ text: 'passed.', start: 12.28, end: 12.68 },
		{ text: 'The', start: 13.34, end: 13.54 },
		{ text: 'biggest', start: 13.54, end: 13.88 },
		{ text: 'one', start: 13.88, end: 14.12 },
		{ text: 'was', start: 14.12, end: 14.34 },
		{ text: 'the', start: 14.34, end: 14.46 },
		{ text: 'fire', start: 14.46, end: 14.82 },
		{ text: 'phone', start: 14.82, end: 15.12 },
		{ text: 'from', start: 15.12, end: 15.3 },
		{ text: '2014.', start: 15.3, end: 15.98 },
		{ text: 'It', start: 16.64, end: 16.76 },
		{ text: 'was', start: 16.76, end: 16.9 },
		{ text: 'a', start: 16.9, end: 17.02 },
		{ text: 'complete', start: 17.02, end: 17.5 },
		{ text: 'disaster,', start: 17.5, end: 17.94 },
		{ text: 'a', start: 18.4, end: 18.5 },
		{ text: 'total', start: 18.5, end: 18.9 },
		{ text: 'flop.', start: 18.9, end: 19.26 },
		{ text: 'The', start: 19.76, end: 19.92 },
		{ text: 'company', start: 19.92, end: 20.24 },
		{ text: 'took', start: 20.24, end: 20.5 },
		{ text: 'a', start: 20.5, end: 20.72 },
		{ text: '$170', start: 20.72, end: 21.78 },
		{ text: 'million', start: 21.78, end: 22.38 },
		{ text: 'write', start: 22.38, end: 22.92 },
		{ text: 'down', start: 22.92, end: 23.2 },
		{ text: 'on', start: 23.2, end: 23.42 },
		{ text: 'Unsold', start: 23.42, end: 23.84 },
		{ text: 'Inventory.', start: 23.84, end: 24.44 },
		{ text: 'It', start: 24.68, end: 24.98 },
		{ text: 'was', start: 24.98, end: 25.1 },
		{ text: 'a', start: 25.1, end: 25.24 },
		{ text: 'public', start: 25.24, end: 25.66 },
		{ text: 'humiliation.', start: 25.66, end: 26.32 },
		{ text: 'They', start: 26.32, end: 27.18 },
		{ text: 'tried', start: 27.18, end: 27.42 },
		{ text: 'to', start: 27.42, end: 27.58 },
		{ text: 'compete', start: 27.58, end: 27.86 },
		{ text: 'with', start: 27.86, end: 28.14 },
		{ text: 'Apple', start: 28.14, end: 28.42 },
		{ text: 'and', start: 28.42, end: 28.62 },
		{ text: 'Google', start: 28.62, end: 28.9 },
		{ text: 'and', start: 28.9, end: 29.2 },
		{ text: 'they', start: 29.2, end: 29.32 },
		{ text: 'failed', start: 29.32, end: 29.7 },
		{ text: 'spectacularly.', start: 29.7, end: 30.78 },
		{ text: 'A', start: 31.14, end: 31.44 },
		{ text: 'normal', start: 31.44, end: 31.74 },
		{ text: 'company', start: 31.74, end: 32.18 },
		{ text: 'would', start: 32.18, end: 32.38 },
		{ text: 'fire', start: 32.38, end: 32.7 },
		{ text: 'the', start: 32.7, end: 32.92 },
		{ text: 'entire', start: 32.92, end: 33.26 },
		{ text: 'team.', start: 33.26, end: 33.76 },
		{ text: 'They', start: 34.12, end: 34.22 },
		{ text: 'would', start: 34.22, end: 34.34 },
		{ text: 'never', start: 34.34, end: 34.64 },
		{ text: 'mention', start: 34.64, end: 35.0 },
		{ text: 'the', start: 35.0, end: 35.12 },
		{ text: 'project', start: 35.12, end: 35.46 },
		{ text: 'again.', start: 35.46, end: 35.82 },
		{ text: 'They', start: 36.3, end: 36.4 },
		{ text: 'would', start: 36.4, end: 36.56 },
		{ text: 'conclude,', start: 36.56, end: 36.98 },
		{ text: 'we', start: 37.3, end: 37.42 },
		{ text: 'are', start: 37.42, end: 37.66 },
		{ text: 'not', start: 37.66, end: 37.94 },
		{ text: 'a', start: 37.94, end: 38.14 },
		{ text: 'hardware', start: 38.14, end: 38.38 },
		{ text: 'company.', start: 38.38, end: 38.86 },
		{ text: 'Amazon', start: 39.54, end: 39.84 },
		{ text: 'did', start: 39.84, end: 40.24 },
		{ text: 'not', start: 40.24, end: 40.52 },
		{ text: 'do', start: 40.52, end: 40.76 },
		{ text: 'that.', start: 40.76, end: 41.02 },
		{ text: 'Bezos', start: 41.58, end: 41.82 },
		{ text: 'said,', start: 41.82, end: 42.24 },
		{ text: 'if', start: 42.42, end: 42.5 },
		{ text: 'you', start: 42.5, end: 42.62 },
		{ text: 'are', start: 42.62, end: 42.72 },
		{ text: 'not', start: 42.72, end: 42.98 },
		{ text: 'failing,', start: 42.98, end: 43.38 },
		{ text: 'you', start: 43.7, end: 43.8 },
		{ text: 'are', start: 43.8, end: 43.9 },
		{ text: 'not', start: 43.9, end: 44.18 },
		{ text: 'innovating.', start: 44.18, end: 44.76 },
		{ text: 'The', start: 45.28, end: 45.46 },
		{ text: '$170', start: 45.46, end: 46.38 },
		{ text: 'million', start: 46.38, end: 46.92 },
		{ text: 'was', start: 46.92, end: 47.54 },
		{ text: 'the', start: 47.54, end: 47.72 },
		{ text: 'tuition', start: 47.72, end: 48.1 },
		{ text: 'fee.', start: 48.1, end: 48.46 },
		{ text: 'The', start: 49.08, end: 49.28 },
		{ text: 'lessons', start: 49.28, end: 49.58 },
		{ text: 'they', start: 49.58, end: 49.86 },
		{ text: 'learned', start: 49.86, end: 50.12 },
		{ text: 'from', start: 50.12, end: 50.32 },
		{ text: 'the', start: 50.32, end: 50.46 },
		{ text: 'fire', start: 50.46, end: 50.7 },
		{ text: "phone's", start: 50.7, end: 51.12 },
		{ text: 'failure,', start: 51.12, end: 51.4 },
		{ text: 'the', start: 51.7, end: 51.78 },
		{ text: 'engineers', start: 51.78, end: 52.1 },
		{ text: 'they', start: 52.1, end: 52.6 },
		{ text: 'trained,', start: 52.6, end: 52.98 },
		{ text: 'the', start: 53.14, end: 53.2 },
		{ text: 'supply', start: 53.2, end: 53.6 },
		{ text: 'chains', start: 53.6, end: 53.92 },
		{ text: 'they', start: 53.92, end: 54.14 },
		{ text: 'built', start: 54.14, end: 54.36 },
		{ text: 'were', start: 54.36, end: 54.64 },
		{ text: 'not', start: 54.64, end: 54.9 },
		{ text: 'thrown', start: 54.9, end: 55.16 },
		{ text: 'away.', start: 55.16, end: 55.46 },
		{ text: 'They', start: 55.46, end: 56.26 },
		{ text: 'were', start: 56.26, end: 56.42 },
		{ text: 'repurposed.', start: 56.42, end: 57.28 },
		{ text: 'That', start: 57.82, end: 57.96 },
		{ text: 'same', start: 57.96, end: 58.3 },
		{ text: 'team,', start: 58.3, end: 58.68 },
		{ text: 'that', start: 58.9, end: 59.04 },
		{ text: 'same', start: 59.04, end: 59.38 },
		{ text: 'knowledge', start: 59.38, end: 59.8 },
		{ text: 'went', start: 59.8, end: 60.22 },
		{ text: 'on', start: 60.22, end: 60.38 },
		{ text: 'to', start: 60.38, end: 60.52 },
		{ text: 'create', start: 60.52, end: 60.82 },
		{ text: 'the', start: 60.82, end: 61.02 },
		{ text: 'Amazon', start: 61.02, end: 61.34 },
		{ text: 'Echo', start: 61.34, end: 61.82 },
		{ text: 'and', start: 61.82, end: 62.08 },
		{ text: 'Alexa,', start: 62.08, end: 62.46 },
		{ text: 'a', start: 63.0, end: 63.18 },
		{ text: 'product', start: 63.18, end: 63.52 },
		{ text: 'that', start: 63.52, end: 63.76 },
		{ text: 'created', start: 63.76, end: 64.1 },
		{ text: 'an', start: 64.1, end: 64.34 },
		{ text: 'entirely', start: 64.34, end: 64.86 },
		{ text: 'new', start: 64.86, end: 65.32 },
		{ text: 'category', start: 65.32, end: 65.8 },
		{ text: 'of', start: 65.8, end: 66.04 },
		{ text: 'technology.', start: 66.04, end: 66.6 },
		{ text: 'By', start: 67.12, end: 67.36 },
		{ text: '2019,', start: 67.36, end: 68.04 },
		{ text: 'tens', start: 68.5, end: 68.8 },
		{ text: 'of', start: 68.8, end: 69.06 },
		{ text: 'millions', start: 69.06, end: 69.32 },
		{ text: 'of', start: 69.32, end: 69.58 },
		{ text: 'homes', start: 69.58, end: 69.86 },
		{ text: 'had', start: 69.86, end: 70.08 },
		{ text: 'an', start: 70.08, end: 70.26 },
		{ text: 'Echo', start: 70.26, end: 70.48 },
		{ text: 'device.', start: 70.48, end: 70.8 },
		{ text: 'The', start: 71.48, end: 71.62 },
		{ text: 'ashes', start: 71.62, end: 71.96 },
		{ text: 'of', start: 71.96, end: 72.18 },
		{ text: 'their', start: 72.18, end: 72.32 },
		{ text: 'biggest', start: 72.32, end: 72.66 },
		{ text: 'failure', start: 72.66, end: 73.08 },
		{ text: 'became', start: 73.08, end: 73.52 },
		{ text: 'the', start: 73.52, end: 73.72 },
		{ text: 'soil', start: 73.72, end: 74.1 },
		{ text: 'for', start: 74.1, end: 74.36 },
		{ text: 'one', start: 74.36, end: 74.52 },
		{ text: 'of', start: 74.52, end: 74.6 },
		{ text: 'their', start: 74.6, end: 74.74 },
		{ text: 'biggest', start: 74.74, end: 75.08 },
		{ text: 'successes.', start: 75.08, end: 75.68 },
		{ text: 'Failure', start: 76.54, end: 76.96 },
		{ text: 'is', start: 76.96, end: 77.16 },
		{ text: 'only', start: 77.16, end: 77.6 },
		{ text: 'failure', start: 77.6, end: 78.04 },
		{ text: 'if', start: 78.04, end: 78.32 },
		{ text: 'you', start: 78.32, end: 78.44 },
		{ text: 'learn', start: 78.44, end: 78.66 },
		{ text: 'nothing', start: 78.66, end: 79.1 },
		{ text: 'from', start: 79.1, end: 79.4 },
		{ text: 'it.', start: 79.4, end: 79.6 },
	];

	// Helper for creating word components
	const renderWords = (startTime: number, endTime: number) => {
		return transcript
			.filter((word) => word.start >= startTime && word.end <= endTime)
			.map((word, index) => (
				<Word key={index} text={word.text} start={word.start} end={word.end} />
			));
	};
	
	const Scene: React.FC<{
		from: number;
		durationInFrames: number;
		children: React.ReactNode;
	}> = ({ from, durationInFrames, children }) => {
		const frame = useCurrentFrame();
		const opacity = interpolate(
			frame,
			[
				from,
				from + fps / 2,
				from + durationInFrames - fps / 2,
				from + durationInFrames,
			],
			[0, 1, 1, 0],
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}
		);
		return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>
	};


	return (
		<Composition
			id="StorytellingVideo"
			component={Main}
			durationInFrames={durationInFrames}
			fps={fps}
			width={width}
			height={height}
			defaultProps={{
				renderWords,
				transcript,
			}}
		/>
	);
};

const Main: React.FC<{
	renderWords: (start: number, end: number) => React.ReactNode;
}> = ({ renderWords }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const vignetteStyle: React.CSSProperties = {
		boxShadow: 'inset 0 0 200px rgba(0,0,0,0.7)',
	};
	
	const imageStyle: React.CSSProperties = {
		position: 'absolute',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	};

	// Scene 1: 0 - 5.5s
	const scene1Start = 0;
	const scene1End = 5.5 * fps;
	const s1Progress = interpolate(frame, [scene1Start, scene1End], [0, 1], {extrapolateRight: 'clamp'});
	const s1CamZoom = interpolate(s1Progress, [0, 1], [1.2, 1]);
	const s1CamTranslateX = interpolate(s1Progress, [0, 1], [-50, 50]);
	const s1BgTranslateX = interpolate(s1Progress, [0, 1], [-100, 100]);
	const s1FgTranslateX = interpolate(s1Progress, [0, 1], [-20, 20]);
	
	// Scene 2: 5.5s - 8s
	const scene2Start = 5.5 * fps;
	const scene2End = 8 * fps;
	const s2Progress = interpolate(frame, [scene2Start, scene2End], [0, 1], {extrapolateRight: 'clamp'});
	const s2CamZoom = interpolate(s2Progress, [0, 1], [1.5, 1.1]);

	// Scene 3: 8s - 13s
	const scene3Start = 8 * fps;
	const scene3End = 13 * fps;
	const s3Progress = interpolate(frame, [scene3Start, scene3End], [0, 1], {extrapolateRight: 'clamp'});
	const s3CamZoom = interpolate(s3Progress, [0, 1], [1, 1.2]);
	const s3GhostOpacity = interpolate(s3Progress, [0.2, 0.8], [0, 0.3]);
	
	// Scene 4: 13s - 16s
	const scene4Start = 13 * fps;
	const scene4End = 16 * fps;
	const s4Progress = interpolate(frame, [scene4Start, scene4End], [0, 1], {extrapolateRight: 'clamp'});
	const s4CamRotate = interpolate(s4Progress, [0, 1], [-5, 5]);
	const s4CamZoom = interpolate(s4Progress, [0, 1], [1, 1.1]);

	// Scene 5: 16s - 19.5s
	const scene5Start = 16 * fps;
	const scene5End = 19.5 * fps;
	const s5Progress = interpolate(frame, [scene5Start, scene5End], [0, 1], {extrapolateRight: 'clamp'});
	const s5GlassOpacity = interpolate(s5Progress, [0.3, 0.5], [0, 1]);
	const s5Shake = Math.sin(s5Progress * Math.PI * 10) * (1-s5Progress) * 10;
	
	// Scene 6: 19.5s - 24.5s
	const scene6Start = 19.5 * fps;
	const scene6End = 24.5 * fps;
	const s6Progress = interpolate(frame, [scene6Start, scene6End], [0, 1], {extrapolateRight: 'clamp'});
	const s6PanX = interpolate(s6Progress, [0, 1], [-150, 150]);
	const s6CamZoom = interpolate(s6Progress, [0, 1], [1.3, 1]);

	// Scene 7: 24.5s - 31s
	const scene7Start = 24.5 * fps;
	const scene7End = 31 * fps;
	const s7Progress = interpolate(frame, [scene7Start, scene7End], [0, 1], {extrapolateRight: 'clamp'});
	const s7CamZoom = interpolate(s7Progress, [0, 1], [1, 1.4]);
	const s7SilhouetteY = interpolate(s7Progress, [0, 1], [0, -50]);
	
	// Scene 8: 31s - 39s
	const scene8Start = 31 * fps;
	const scene8End = 39 * fps;
	const s8Progress = interpolate(frame, [scene8Start, scene8End], [0, 1], {extrapolateRight: 'clamp'});
	const s8CamZoom = interpolate(s8Progress, [0, 1], [1, 1.1]);
	const s8StampOpacity = interpolate(frame, [timeToFrames(36.5, fps), timeToFrames(36.7, fps)], [0, 1]);
	const s8StampScale = interpolate(frame, [timeToFrames(36.5, fps), timeToFrames(36.8, fps)], [3, 1], {extrapolateRight: 'clamp'});

	// Scene 9: 39s - 45s
	const scene9Start = 39 * fps;
	const scene9End = 45 * fps;
	const s9Progress = interpolate(frame, [scene9Start, scene9End], [0, 1], {extrapolateRight: 'clamp'});
	const s9CamZoom = interpolate(s9Progress, [0, 1], [1.2, 1]);
	const s9LogoGlow = interpolate(s9Progress, [0.2, 0.5, 1], [0, 10, 5]);

	// Scene 10: 45s - 49s
	const scene10Start = 45 * fps;
	const scene10End = 49 * fps;
	const s10Progress = interpolate(frame, [scene10Start, scene10End], [0, 1], {extrapolateRight: 'clamp'});
	const s10CamPanY = interpolate(s10Progress, [0, 1], [-50, 50]);
	
	// Scene 11: 49s - 57.5s
	const scene11Start = 49 * fps;
	const scene11End = 57.5 * fps;
	const s11Progress = interpolate(frame, [scene11Start, scene11End], [0, 1], {extrapolateRight: 'clamp'});
	const s11ElementsX = interpolate(s11Progress, [0.2, 1], [-1920, 1920]);

	// Scene 12: 57.5s - 67s
	const scene12Start = 57.5 * fps;
	const scene12End = 67 * fps;
	const s12Progress = interpolate(frame, [scene12Start, scene12End], [0, 1], {extrapolateRight: 'clamp'});
	const s12CamZoom = interpolate(s12Progress, [0, 1], [2, 1]);
	const s12EchoGlow = interpolate(s12Progress, [0.3, 0.6, 1], [0, 15, 8]);
	
	// Scene 13: 67s - 71s
	const scene13Start = 67 * fps;
	const scene13End = 71 * fps;
	const s13Progress = interpolate(frame, [scene13Start, scene13End], [0, 1], {extrapolateRight: 'clamp'});
	const s13DotOpacity = interpolate(s13Progress, [0.2, 1], [0, 0.8]);

	// Scene 14: 71s - 76s
	const scene14Start = 71 * fps;
	const scene14End = 76 * fps;
	const s14Progress = interpolate(frame, [scene14Start, scene14End], [0, 1], {extrapolateRight: 'clamp'});
	const s14CamZoom = interpolate(s14Progress, [0, 1], [1.3, 1]);
	const s14SproutScale = interpolate(s14Progress, [0.3, 1], [0, 1]);
	const s14SproutOpacity = interpolate(s14Progress, [0.2, 0.4], [0, 1]);

	// Scene 15: 76s - 80s
	const scene15Start = 76 * fps;
	const scene15End = 80 * fps;
	const s15Progress = interpolate(frame, [scene15Start, scene15End], [0, 1], {extrapolateRight: 'clamp'});
	const s15CamZoom = interpolate(s15Progress, [0, 1], [1, 1.2]);


	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_7.wav')} />

			<Scene from={scene1Start} durationInFrames={scene1End - scene1Start}>
				<AbsoluteFill style={{ transform: `scale(${s1CamZoom}) translateX(${s1CamTranslateX}px)` }}>
					<Img src={staticFile('assets/images/workshop-blur.jpg')} style={{...imageStyle, transform: `translateX(${s1BgTranslateX}px)`}} />
					<Img src={staticFile('assets/images/blueprint-background.jpg')} style={{...imageStyle, opacity: 0.5, transform: `translateX(${s1FgTranslateX}px)`}} />
					<Img src={staticFile('assets/images/ornate-key.png')} style={{...imageStyle, objectFit: 'contain', height: '80%', marginTop: '10%'}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(0.0, 4.84)}</TextContainer>
			</Scene>
			
			<Scene from={scene2Start} durationInFrames={scene2End - scene2Start}>
				<AbsoluteFill style={{ transform: `scale(${s2CamZoom})` }}>
					<Img src={staticFile('assets/images/modern-office-blur.jpg')} style={imageStyle} />
					<Img src={staticFile('assets/images/digital-calendar-2019.png')} style={{...imageStyle, objectFit: 'contain'}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(5.53, 7.46)}</TextContainer>
			</Scene>

			<Scene from={scene3Start} durationInFrames={scene3End - scene3Start}>
				<AbsoluteFill style={{ transform: `scale(${s3CamZoom})` }}>
					<Img src={staticFile('assets/images/dusty-archive.jpg')} style={imageStyle} />
					<Img src={staticFile('assets/images/failed-inventions-montage.png')} style={{...imageStyle, opacity: s3GhostOpacity}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(8.0, 12.68)}</TextContainer>
			</Scene>

			<Scene from={scene4Start} durationInFrames={scene4End-scene4Start}>
				<AbsoluteFill style={{ transform: `scale(${s4CamZoom}) rotateZ(${s4CamRotate}deg)` }}>
					<Img src={staticFile('assets/images/dark-background.jpg')} style={imageStyle} />
					<Img src={staticFile('assets/images/fire-phone-isolated.png')} style={{...imageStyle, objectFit: 'contain'}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(13.34, 15.98)}</TextContainer>
			</Scene>

			<Scene from={scene5Start} durationInFrames={scene5End-scene5Start}>
				<AbsoluteFill style={{ transform: `translateX(${s5Shake}px)` }}>
					<Img src={staticFile('assets/images/negative-headlines-collage.jpg')} style={{...imageStyle, opacity: 0.4}} />
					<Img src={staticFile('assets/images/fire-phone-isolated.png')} style={{...imageStyle, objectFit: 'contain'}} />
					<Img src={staticFile('assets/images/cracked-glass-overlay.png')} style={{...imageStyle, opacity: s5GlassOpacity}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(16.64, 19.26)}</TextContainer>
			</Scene>

			<Scene from={scene6Start} durationInFrames={scene6End-scene6Start}>
				<AbsoluteFill style={{ transform: `scale(${s6CamZoom}) translateX(${s6PanX}px)` }}>
					<Img src={staticFile('assets/images/warehouse-boxes.jpg')} style={{...imageStyle, transform: 'scale(1.2)'}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(19.76, 24.44)}</TextContainer>
			</Scene>

			<Scene from={scene7Start} durationInFrames={scene7End-scene7Start}>
				<AbsoluteFill style={{ transform: `scale(${s7CamZoom})` }}>
					<Img src={staticFile('assets/images/dark-stage-background.jpg')} style={imageStyle} />
					<Img src={staticFile('assets/images/apple-google-logos.png')} style={{...imageStyle, objectFit: 'contain', opacity: 0.3, transform: 'scale(1.2)'}} />
					<Img src={staticFile('assets/images/silhouette-on-stage.png')} style={{...imageStyle, objectFit: 'contain', transform: `translateY(${s7SilhouetteY}px)`}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(24.68, 30.78)}</TextContainer>
			</Scene>
			
			<Scene from={scene8Start} durationInFrames={scene8End-scene8Start}>
				<AbsoluteFill style={{ transform: `scale(${s8CamZoom})` }}>
					<Img src={staticFile('assets/images/empty-boardroom.jpg')} style={imageStyle} />
					<Img src={staticFile('assets/images/red-stamp-failed.png')} style={{...imageStyle, objectFit: 'contain', opacity: s8StampOpacity, transform: `scale(${s8StampScale})`}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(31.14, 38.86)}</TextContainer>
			</Scene>
			
			<Scene from={scene9Start} durationInFrames={scene9End-scene9Start}>
				<AbsoluteFill style={{ transform: `scale(${s9CamZoom})` }}>
					<Img src={staticFile('assets/images/dark-to-light-gradient.jpg')} style={imageStyle} />
					<Img src={staticFile('assets/images/amazon-logo-glowing.png')} style={{...imageStyle, objectFit: 'contain', filter: `drop-shadow(0 0 ${s9LogoGlow}px #fff)`}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(39.54, 44.76)}</TextContainer>
			</Scene>

			<Scene from={scene10Start} durationInFrames={scene10End-scene10Start}>
				<AbsoluteFill style={{ transform: `translateY(${s10CamPanY}px)` }}>
					<Img src={staticFile('assets/images/grand-library.jpg')} style={imageStyle} />
				</AbsoluteFill>
				<TextContainer>{renderWords(45.28, 48.46)}</TextContainer>
			</Scene>
			
			<Scene from={scene11Start} durationInFrames={scene11End-scene11Start}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/dark-tech-background.jpg')} style={imageStyle} />
					<AbsoluteFill style={{transform: `translateX(${s11ElementsX}px)`}}>
						<Img src={staticFile('assets/images/engineers-working-collage.png')} style={{...imageStyle, objectFit: 'contain', opacity: 0.6}} />
					</AbsoluteFill>
				</AbsoluteFill>
				<TextContainer>{renderWords(49.08, 57.28)}</TextContainer>
			</Scene>
			
			<Scene from={scene12Start} durationInFrames={scene12End-scene12Start}>
				<AbsoluteFill style={{ transform: `scale(${s12CamZoom})` }}>
					<Img src={staticFile('assets/images/smart-home.jpg')} style={imageStyle} />
					<Img src={staticFile('assets/images/amazon-echo-glowing.png')} style={{...imageStyle, objectFit: 'contain', filter: `drop-shadow(0 0 ${s12EchoGlow}px #54b9ff)`}} />
				</AbsoluteFill>
				<TextContainer>{renderWords(57.82, 66.60)}</TextContainer>
			</Scene>

			<Scene from={scene13Start} durationInFrames={scene13End-scene13Start}>
				<AbsoluteFill>
					<Img src={staticFile('assets/images/world-map-dark.jpg')} style={imageStyle} />
					<AbsoluteFill style={{opacity: s13DotOpacity, mixBlendMode: 'screen'}}>
						{Array.from({length: 100}).map((_, i) => (
							<div key={i} style={{
								position: 'absolute',
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								width: '10px',
								height: '10px',
								borderRadius: '50%',
								backgroundColor: '#54b9ff',
								filter: `blur(2px)`
							}}/>
						))}
					</AbsoluteFill>
				</AbsoluteFill>
				<TextContainer>{renderWords(67.12, 70.80)}</TextContainer>
			</Scene>

			<Scene from={scene14Start} durationInFrames={scene14End-scene14Start}>
				<AbsoluteFill style={{ transform: `scale(${s14CamZoom})` }}>
					<Img src={staticFile('assets/images/dark-soil-background.jpg')} style={imageStyle} />
					<Img src={staticFile('assets/images/ashes.png')} style={{...imageStyle, objectFit: 'contain', height: '30%', top: '70%'}} />
					<Img src={staticFile('assets/images/glowing-sprout.png')} style={{...imageStyle, objectFit: 'contain', opacity: s14SproutOpacity, transform: `scale(${s14SproutScale})`, transformOrigin: 'bottom center' }} />
				</AbsoluteFill>
				<TextContainer>{renderWords(71.48, 75.68)}</TextContainer>
			</Scene>

			<Scene from={scene15Start} durationInFrames={scene15End-scene15Start}>
				<AbsoluteFill style={{ transform: `scale(${s15CamZoom})` }}>
					<Img src={staticFile('assets/images/inspirational-background.jpg')} style={imageStyle} />
				</AbsoluteFill>
				<TextContainer>{renderWords(76.54, 79.60)}</TextContainer>
			</Scene>

			{/* Global Overlays */}
			<AbsoluteFill style={vignetteStyle} />
			<DustOverlay count={100} />
		</AbsoluteFill>
	);
};
```