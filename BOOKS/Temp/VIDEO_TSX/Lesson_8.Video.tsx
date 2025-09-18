```tsx
import {
	AbsoluteFill,
	Img,
	Sequence,
	Audio,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
	Easing,
} from 'remotion';
import React from 'react';

const timeToFrames = (seconds: number, fps: number) => Math.round(seconds * fps);

type Word = {
	start: number;
	end: number;
	text: string;
};

const transcript: Word[] = [
	{start: 0.0, end: 0.42, text: 'Key'},
	{start: 0.42, end: 0.86, text: 'lesson.'},
	{start: 1.38, end: 1.56, text: 'Your'},
	{start: 1.56, end: 2.06, text: 'system'},
	{start: 2.06, end: 2.32, text: 'is'},
	{start: 2.32, end: 2.76, text: 'only'},
	{start: 2.76, end: 3.26, text: 'tested'},
	{start: 3.26, end: 3.52, text: 'in'},
	{start: 3.52, end: 3.62, text: 'a'},
	{start: 3.62, end: 3.9, text: 'true'},
	{start: 3.9, end: 4.42, text: 'crisis.'},
	{start: 5.26, end: 5.52, text: 'Late'},
	{start: 5.52, end: 6.26, text: '2019'},
	{start: 6.26, end: 6.78, text: 'rolled'},
	{start: 6.78, end: 7.12, text: 'into'},
	{start: 7.12, end: 7.72, text: '2020,'},
	{start: 7.92, end: 8.4, text: 'and'},
	{start: 8.4, end: 8.66, text: 'the'},
	{start: 8.66, end: 8.92, text: 'world'},
	{start: 8.92, end: 9.52, text: 'stopped.'},
	{start: 9.98, end: 10.14, text: 'A'},
	{start: 10.14, end: 10.52, text: 'global'},
	{start: 10.52, end: 11.12, text: 'pandemic'},
	{start: 11.12, end: 11.46, text: 'called'},
	{start: 11.46, end: 11.82, text: 'COVID'},
	{start: 11.82, end: 12.36, text: '-19'},
	{start: 12.36, end: 12.78, text: 'shut'},
	{start: 12.78, end: 13.04, text: 'down'},
	{start: 13.04, end: 13.76, text: 'everything.'},
	{start: 14.28, end: 14.68, text: 'Stores'},
	{start: 14.68, end: 15.02, text: 'closed,'},
	{start: 15.44, end: 15.82, text: 'offices'},
	{start: 15.82, end: 16.24, text: 'closed,'},
	{start: 16.58, end: 16.9, text: 'people'},
	{start: 16.9, end: 17.1, text: 'were'},
	{start: 17.1, end: 17.42, text: 'locked'},
	{start: 17.42, end: 17.66, text: 'in'},
	{start: 17.66, end: 17.82, text: 'their'},
	{start: 17.82, end: 18.16, text: 'homes.'},
	{start: 18.68, end: 18.8, text: 'And'},
	{start: 18.8, end: 19.28, text: 'suddenly,'},
	{start: 19.62, end: 19.7, text: 'the'},
	{start: 19.7, end: 20.1, text: 'machine'},
	{start: 20.1, end: 20.4, text: 'that'},
	{start: 20.4, end: 20.7, text: 'Amazon'},
	{start: 20.7, end: 21.04, text: 'had'},
	{start: 21.04, end: 21.2, text: 'been'},
	{start: 21.2, end: 21.54, text: 'building'},
	{start: 21.54, end: 21.78, text: 'for'},
	{start: 21.78, end: 22.38, text: '25'},
	{start: 22.38, end: 22.88, text: 'years'},
	{start: 22.88, end: 23.26, text: 'was'},
	{start: 23.26, end: 23.54, text: 'not'},
	{start: 23.54, end: 23.86, text: 'just'},
	{start: 23.86, end: 24.02, text: 'a'},
	{start: 24.02, end: 24.52, text: 'convenience.'},
	{start: 24.98, end: 25.12, text: 'It'},
	{start: 25.12, end: 25.48, text: 'became'},
	{start: 25.48, end: 26.26, text: 'essential'},
	{start: 26.26, end: 27.06, text: 'infrastructure.'},
	{start: 27.06, end: 27.7, text: 'The'},
	{start: 27.7, end: 28.28, text: 'warehouses,'},
	{start: 28.6, end: 28.64, text: 'the'},
	{start: 28.64, end: 28.94, text: 'delivery'},
	{start: 28.94, end: 29.38, text: 'trucks,'},
	{start: 29.7, end: 29.78, text: 'the'},
	{start: 29.78, end: 30.24, text: 'website,'},
	{start: 30.52, end: 30.6, text: 'the'},
	{start: 30.6, end: 30.9, text: 'cloud'},
	{start: 30.9, end: 31.34, text: 'servers,'},
	{start: 31.58, end: 31.92, text: 'powering'},
	{start: 31.92, end: 32.14, text: 'Netflix'},
	{start: 32.14, end: 32.58, text: 'and'},
	{start: 32.58, end: 32.82, text: 'Zoom,'},
	{start: 33.16, end: 33.36, text: 'it'},
	{start: 33.36, end: 33.48, text: 'was'},
	{start: 33.48, end: 33.84, text: 'all'},
	{start: 33.84, end: 34.12, text: 'put'},
	{start: 34.12, end: 34.38, text: 'to'},
	{start: 34.38, end: 34.5, text: 'the'},
	{start: 34.5, end: 34.94, text: 'ultimate'},
	{start: 34.94, end: 35.48, text: 'test.'},
	{start: 35.84, end: 36.08, text: 'The'},
	{start: 36.08, end: 36.5, text: 'system'},
	{start: 36.5, end: 37.14, text: 'strained,'},
	{start: 37.44, end: 37.74, text: 'delivery'},
	{start: 37.74, end: 38.04, text: 'time'},
	{start: 38.04, end: 38.44, text: 'slipped,'},
	{start: 38.8, end: 38.94, text: 'but'},
	{start: 8.94, end: 39.08, text: 'it'},
	{start: 39.08, end: 39.24, text: 'did'},
	{start: 39.24, end: 39.56, text: 'not'},
	{start: 39.56, end: 39.92, text: 'break.'},
	{start: 40.48, end: 40.7, text: 'While'},
	{start: 40.7, end: 41.0, text: 'other'},
	{start: 41.0, end: 41.5, text: 'businesses'},
	{start: 41.5, end: 42.02, text: 'collapsed,'},
	{start: 42.48, end: 42.72, text: 'Amazon'},
	{start: 42.72, end: 43.24, text: 'hired.'},
	{start: 43.62, end: 43.86, text: 'They'},
	{start: 43.86, end: 44.14, text: 'hired'},
	{start: 44.14, end: 45.14, text: '175'},
	{start: 45.14, end: 46.02, text: ',000'},
	{start: 46.02, end: 46.26, text: 'new'},
	{start: 46.26, end: 46.58, text: 'workers'},
	{start: 46.58, end: 46.84, text: 'in'},
	{start: 46.84, end: 47.12, text: 'just'},
	{start: 47.12, end: 47.36, text: 'a'},
	{start: 47.36, end: 47.48, text: 'few'},
	{start: 47.48, end: 47.82, text: 'months.'},
	{start: 48.38, end: 48.56, text: 'Their'},
	{start: 48.56, end: 48.98, text: 'revenue'},
	{start: 48.98, end: 49.22, text: 'for'},
	{start: 49.22, end: 49.32, text: 'the'},
	{start: 49.32, end: 49.64, text: 'second'},
	{start: 49.64, end: 50.02, text: 'quarter'},
	{start: 50.02, end: 50.18, text: 'of'},
	{start: 50.18, end: 50.7, text: '2020'},
	{start: 50.7, end: 51.78, text: 'exploded,'},
	{start: 52.08, end: 52.28, text: 'up'},
	{start: 52.28, end: 52.74, text: '40'},
	{start: 52.74, end: 53.1, text: '%'},
	{start: 53.1, end: 53.44, text: 'to'},
	{start: 53.44, end: 53.96, text: '$88'},
	{start: 53.96, end: 54.6, text: '.9'},
	{start: 54.6, end: 55.08, text: 'billion.'},
	{start: 55.84, end: 56.36, text: 'The'},
	{start: 56.36, end: 56.88, text: 'pandemic'},
	{start: 56.88, end: 57.18, text: 'was'},
	{start: 57.18, end: 57.3, text: 'a'},
	{start: 57.3, end: 57.74, text: 'tragedy'},
	{start: 57.74, end: 58.0, text: 'for'},
	{start: 58.0, end: 58.12, text: 'the'},
	{start: 58.12, end: 58.42, text: 'world,'},
	{start: 58.66, end: 58.88, text: 'but'},
	{start: 58.88, end: 59.06, text: 'for'},
	{start: 59.06, end: 59.68, text: "Amazon's"},
	{start: 59.68, end: 59.94, text: 'business'},
	{start: 59.94, end: 60.32, text: 'model,'},
	{start: 60.52, end: 60.7, text: 'it'},
	{start: 60.7, end: 60.84, text: 'was'},
	{start: 60.84, end: 61.02, text: 'the'},
	{start: 61.02, end: 61.52, text: 'ultimate'},
	{start: 61.52, end: 62.22, text: 'validation.'},
	{start: 62.8, end: 63.2, text: 'Every'},
	{start: 63.2, end: 63.46, text: 'bet'},
	{start: 63.46, end: 63.66, text: 'they'},
	{start: 63.66, end: 63.82, text: 'had'},
	{start: 63.82, end: 64.18, text: 'ever'},
	{start: 64.18, end: 64.44, text: 'made'},
	{start: 64.44, end: 64.6, text: 'on'},
	{start: 64.6, end: 65.1, text: 'logistics,'},
	{start: 65.42, end: 65.52, text: 'on'},
	{start: 65.52, end: 66.08, text: 'infrastructure,'},
	{start: 66.5, end: 66.62, text: 'on'},
	{start: 66.62, end: 66.88, text: 'long'},
	{start: 66.88, end: 67.12, text: '-term'},
	{start: 67.12, end: 67.58, text: 'thinking,'},
	{start: 67.98, end: 68.12, text: 'paid'},
	{start: 68.12, end: 68.46, text: 'off'},
	{start: 68.46, end: 68.68, text: 'in'},
	{start: 68.68, end: 68.78, text: 'the'},
	{start: 68.78, end: 69.1, text: 'moment'},
	{start: 69.1, end: 69.32, text: 'the'},
	{start: 69.32, end: 69.6, text: 'world'},
	{start: 69.6, end: 69.96, text: 'needed'},
	{start: 69.96, end: 70.14, text: 'it'},
	{start: 70.14, end: 70.4, text: 'most.'},
];

const WordComponent: React.FC<{word: Word}> = ({word}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const wordStartFrame = timeToFrames(word.start, fps);
	const wordEndFrame = timeToFrames(word.end, fps);

	const opacity = interpolate(
		frame,
		[wordStartFrame, wordStartFrame + 5, wordEndFrame, wordEndFrame + 5],
		[0, 1, 1, 0]
	);

	return (
		<span style={{opacity, display: 'inline-block', marginRight: '1.2rem'}}>
			{word.text}
		</span>
	);
};

const Subtitles: React.FC = () => {
	return (
		<div
			style={{
				fontSize: '7rem',
				fontWeight: 'bold',
				textAlign: 'center',
				color: 'white',
				textShadow: '0 0 20px rgba(0,0,0,0.7)',
				width: '80%',
			}}
		>
			{transcript.map((word, i) => (
				<WordComponent key={i} word={word} />
			))}
		</div>
	);
};

const DustOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 30], [0, 0.3]);
	const transform = `translateX(${frame * 0.1}px) translateY(${Math.sin(frame / 20) * 5}px)`;
	
	const style: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity,
		transform,
	};
	
	return <Img src={staticFile('assets/images/dust-overlay.png')} style={style} />;
};

// Scene Components
const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const zoom = interpolate(frame, [0, durationInFrames], [1, 1.2]);
	const bgParallax = interpolate(frame, [0, durationInFrames], [0, -50]);

	const backgroundStyle: React.CSSProperties = {
		width: '110%',
		height: '110%',
		transform: `scale(${zoom}) translateX(${bgParallax}px)`,
	};
	const foregroundStyle: React.CSSProperties = {
		width: '110%',
		height: '110%',
		transform: `scale(${zoom * 1.05})`,
		filter: 'drop-shadow(0 0 30px black)',
	};

	return (
		<>
			<Img src={staticFile('assets/images/stormy-sky.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/keyhole.png')} style={foregroundStyle} />
		</>
	);
};

const Scene2: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	
	const zoom = interpolate(frame, [0, durationInFrames], [1.5, 1], {easing: Easing.bezier(0.5, 0, 0.5, 1)});
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	const imageStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${zoom})`,
		opacity,
	};
	return <Img src={staticFile('assets/images/empty-street.jpg')} style={imageStyle} />;
};

const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const bgOpacity = interpolate(frame, [0, 30], [0, 1]);
	const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.1]);
	const virusScale = interpolate(frame, [0, durationInFrames], [0.5, 0.6]);
	const virusOpacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 0.7, 0.7, 0]);
	const virusRotate = interpolate(frame, [0, durationInFrames], [0, 360]);

	const backgroundStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: bgOpacity,
		transform: `scale(${bgScale})`,
	};

	const virusStyle: React.CSSProperties = {
		position: 'absolute',
		width: '40%',
		top: '30%',
		left: '30%',
		opacity: virusOpacity,
		transform: `scale(${virusScale}) rotate(${virusRotate}deg)`,
	};
	
	return (
		<>
			<Img src={staticFile('assets/images/world-map-pandemic.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/virus-particle.png')} style={virusStyle} />
		</>
	);
};

const Scene4: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	
	const timings = {
		stores: [timeToFrames(14.28, fps), timeToFrames(15.44, fps)],
		offices: [timeToFrames(15.44, fps), timeToFrames(16.58, fps)],
		homes: [timeToFrames(16.58, fps), timeToFrames(18.16, fps)],
	};
	const currentSeqFrame = frame + timeToFrames(14.28, fps);

	const createStyle = (start: number, end: number) => {
		const opacity = interpolate(currentSeqFrame, [start, start + 15, end - 15, end], [0, 1, 1, 0]);
		const scale = interpolate(currentSeqFrame, [start, end], [1, 1.05]);
		return {
			width: '100%',
			height: '100%',
			objectFit: 'cover' as const,
			position: 'absolute' as const,
			opacity,
			transform: `scale(${scale})`,
		};
	};
	
	const storeStyle = createStyle(timings.stores[0], timings.stores[1]);
	const officeStyle = createStyle(timings.offices[0], timings.offices[1]);
	const homeStyle = createStyle(timings.homes[0], timings.homes[1]);

	return (
		<>
			<Img src={staticFile('assets/images/closed-storefront.jpg')} style={storeStyle} />
			<Img src={staticFile('assets/images/empty-office.jpg')} style={officeStyle} />
			<Img src={staticFile('assets/images/window-view-home.jpg')} style={homeStyle} />
		</>
	);
};

const Scene5: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);
	const cityOpacity = interpolate(frame, [durationInFrames/2, durationInFrames*0.75], [0, 0.4]);

	const machineStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${scale})`,
		opacity,
	};
	const cityStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		opacity: cityOpacity,
		transform: `scale(${scale * 1.02})`,
	};

	return (
		<>
			<Img src={staticFile('assets/images/amazon-machine.jpg')} style={machineStyle} />
			<Img src={staticFile('assets/images/city-infrastructure.jpg')} style={cityStyle} />
		</>
	);
};

const Scene6: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const timings = {
		warehouse: [timeToFrames(27.06, fps), timeToFrames(29.70, fps)],
		trucks: [timeToFrames(28.60, fps), timeToFrames(30.52, fps)],
		servers: [timeToFrames(30.52, fps), timeToFrames(35.48, fps)],
	};
	const currentSeqFrame = frame + timeToFrames(27.06, fps);

	const createStyle = (start: number, end: number) => {
		const opacity = interpolate(currentSeqFrame, [start, start + 15, end - 15, end], [0, 1, 1, 0]);
		const pan = interpolate(currentSeqFrame, [start, end], [0, -50]);
		return {
			width: '120%',
			height: '100%',
			objectFit: 'cover' as const,
			position: 'absolute' as const,
			opacity,
			transform: `translateX(${pan}px)`,
		};
	};

	return (
		<>
			<Img src={staticFile('assets/images/amazon-warehouse.jpg')} style={createStyle(timings.warehouse[0], timings.warehouse[1])} />
			<Img src={staticFile('assets/images/amazon-truck-fleet.jpg')} style={createStyle(timings.trucks[0], timings.trucks[1])} />
			<Img src={staticFile('assets/images/data-center.jpg')} style={createStyle(timings.servers[0], timings.servers[1])} />
		</>
	);
};

const Scene7: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [1.1, 1.2]);
	const redGlowOpacity = interpolate(frame, [0, 30, durationInFrames/2, durationInFrames*0.7], [0, 0.5, 0.5, 0]);
	const shakeX = Math.sin(frame * 2) * interpolate(frame, [0, durationInFrames/2, durationInFrames*0.7], [0, 5, 0]);

	const machineStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${scale}) translateX(${shakeX}px)`,
	};
	const glowStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		boxShadow: 'inset 0 0 150px 50px rgba(255, 0, 0, 1)',
		opacity: redGlowOpacity,
	};
	
	return (
		<>
			<Img src={staticFile('assets/images/amazon-machine.jpg')} style={machineStyle} />
			<AbsoluteFill style={glowStyle} />
		</>
	);
};

const Scene8: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.2]);
	const bgOpacity = interpolate(frame, [0, durationInFrames*0.6], [1, 0.3]);
	const fgScale = interpolate(frame, [durationInFrames*0.4, durationInFrames], [0.8, 1.1]);
	const fgOpacity = interpolate(frame, [durationInFrames*0.4, durationInFrames*0.5, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);
	
	const backgroundStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${bgScale})`,
		opacity: bgOpacity,
		filter: 'blur(5px)',
	};
	const foregroundStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${fgScale})`,
		opacity: fgOpacity,
	};
	
	return (
		<>
			<Img src={staticFile('assets/images/collapsing-dominoes.jpg')} style={backgroundStyle} />
			<Img src={staticFile('assets/images/hiring-crowd.jpg')} style={foregroundStyle} />
		</>
	);
};

const Scene9: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	
	const scale = interpolate(frame, [0, durationInFrames], [1.2, 1]);
	const opacity = interpolate(frame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);

	const imageStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
		transform: `scale(${scale})`,
		opacity,
		filter: 'drop-shadow(0 0 40px #00ffcc)',
	};

	return <Img src={staticFile('assets/images/revenue-graph.png')} style={imageStyle} />;
};

const Scene10: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	const crossfade = interpolate(frame, [durationInFrames/2 - 30, durationInFrames/2 + 30], [0, 1]);

	const somberStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: 'scale(1.1)',
		opacity: 1 - crossfade,
	};

	const validationStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: 'scale(1.1)',
		opacity: crossfade,
	};
	
	return (
		<>
			<Img src={staticFile('assets/images/somber-world.jpg')} style={somberStyle} />
			<Img src={staticFile('assets/images/amazon-machine.jpg')} style={validationStyle} />
		</>
	);
};

const Scene11: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	
	const scale = interpolate(frame, [0, durationInFrames], [1, 1.25]);
	const opacity = interpolate(frame, [0, 30], [0, 1]);

	const imageStyle: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		transform: `scale(${scale})`,
		opacity,
	};
	const glowStyle: React.CSSProperties = {
		background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0) 60%)',
	};

	return (
		<>
			<Img src={staticFile('assets/images/amazon-globe.jpg')} style={imageStyle} />
			<AbsoluteFill style={glowStyle} />
		</>
	);
};


export const RemotionVideo: React.FC = () => {
	const {fps} = useVideoConfig();

	const sceneTimings = [
		{start: 0, end: 5.26},
		{start: 5.26, end: 9.98},
		{start: 9.98, end: 14.28},
		{start: 14.28, end: 18.68},
		{start: 18.68, end: 27.06},
		{start: 27.06, end: 35.84},
		{start: 35.84, end: 40.48},
		{start: 40.48, end: 48.38},
		{start: 48.38, end: 55.84},
		{start: 55.84, end: 62.8},
		{start: 62.8, end: 71}, // Extended slightly for fade out
	];

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_8.wav')} />

			<Sequence from={timeToFrames(sceneTimings[0].start, fps)} durationInFrames={timeToFrames(sceneTimings[0].end - sceneTimings[0].start, fps)}>
				<Scene1 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[1].start, fps)} durationInFrames={timeToFrames(sceneTimings[1].end - sceneTimings[1].start, fps)}>
				<Scene2 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[2].start, fps)} durationInFrames={timeToFrames(sceneTimings[2].end - sceneTimings[2].start, fps)}>
				<Scene3 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[3].start, fps)} durationInFrames={timeToFrames(sceneTimings[3].end - sceneTimings[3].start, fps)}>
				<Scene4 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[4].start, fps)} durationInFrames={timeToFrames(sceneTimings[4].end - sceneTimings[4].start, fps)}>
				<Scene5 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[5].start, fps)} durationInFrames={timeToFrames(sceneTimings[5].end - sceneTimings[5].start, fps)}>
				<Scene6 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[6].start, fps)} durationInFrames={timeToFrames(sceneTimings[6].end - sceneTimings[6].start, fps)}>
				<Scene7 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[7].start, fps)} durationInFrames={timeToFrames(sceneTimings[7].end - sceneTimings[7].start, fps)}>
				<Scene8 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[8].start, fps)} durationInFrames={timeToFrames(sceneTimings[8].end - sceneTimings[8].start, fps)}>
				<Scene9 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[9].start, fps)} durationInFrames={timeToFrames(sceneTimings[9].end - sceneTimings[9].start, fps)}>
				<Scene10 />
			</Sequence>
			<Sequence from={timeToFrames(sceneTimings[10].start, fps)} durationInFrames={timeToFrames(sceneTimings[10].end - sceneTimings[10].start, fps)}>
				<Scene11 />
			</Sequence>

			<AbsoluteFill>
				<DustOverlay />
			</AbsoluteFill>

			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<Subtitles />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```