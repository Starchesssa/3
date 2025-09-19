```tsx
import React from 'react';
import {
	AbsoluteFill,
	Composition,
	Img,
	Audio,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
} from 'remotion';

// NOTE: All asset paths are relative to the `/public` directory in your Remotion project.
// Place images in `/public/images/` and audio in `/public/BOOKS/Temp/TTS/`.

// Asset and timeline data
const bgs = ['abstract_gears_background.jpg','bright_sky.jpg','city-background.jpg','rainy-city.jpg','city_background.jpg','tech_city_background.jpg','sunrise-field.jpg','tech_cityscape.jpg','blueprint_bg.jpg','data_center_background.jpg','dark_clouds.jpg','winding-path.jpg','sky-background.jpg','empty_city_street_background.jpg','data-center-background.jpg','server-room.jpg','gears-background.png'];
const mgs = ['mountains-far.png','gears-midground.png','stock-chart-midground.png','single-tree.png','falling-chart.png','city-skyline-mid.png','modern_city.png','amazon_warehouse_midground.png','cloud_servers_midground.png','fortress.png','server-racks-midground.png','broken_gears.png','buildings_midground.png','forest-midground.png'];
const fgs = ['data_overlay_foreground.png','buildings-foreground.png','glowing-data.png','soundwaves_overlay.png','delivery_drone_foreground.png','digital_grid.png','cracked_glass_overlay.png','biohazard_symbol_overlay.png','amazon_box_foreground.png','sad-people.png','glowing_particles.png','data_stream.png','rain_overlay.png','phoenix_from_ashes.png','gears-foreground.png','resilient-plant.png','data_stream_foreground.png','aws-logo.png','tech-overlay-foreground.png'];
const words = [{t:"Key",s:0,e:0.42},{t:"lesson,",s:0.42,e:0.82},{t:"while",s:1.26,e:1.46},{t:"others",s:1.46,e:1.82},{t:"retreat,",s:1.82,e:2.3},{t:"you",s:2.78,e:2.9},{t:"attack.",s:2.9,e:3.4},{t:"The",s:4.06,e:4.34},{t:"year",s:4.34,e:4.64},{t:"is",s:4.64,e:4.86},{t:"2008.",s:4.86,e:5.66},{t:"The",s:6.16,e:6.22},{t:"global",s:6.22,e:6.54},{t:"financial",s:6.54,e:6.98},{t:"system",s:6.98,e:7.56},{t:"is",s:7.56,e:7.78},{t:"collapsing.",s:7.78,e:8.4},{t:"Lehman",s:9.02,e:9.26},{t:"Brothers",s:9.26,e:9.52},{t:"is",s:9.52,e:9.82},{t:"gone.",s:9.82,e:10.12},{t:"The",s:10.74,e:10.84},{t:"entire",s:10.84,e:11.32},{t:"economy",s:11.32,e:11.88},{t:"isn't",s:11.88,e:12.2},{t:"a",s:12.2,e:12.26},{t:"free",s:12.26,e:12.54},{t:"fall.",s:12.54,e:12.76},{t:"Businesses",s:13.36,e:13.86},{t:"are",s:13.86,e:14},{t:"laying",s:14,e:14.22},{t:"people",s:14.22,e:14.56},{t:"off.",s:14.56,e:14.84},{t:"They",s:15.2,e:15.3},{t:"are",s:15.3,e:15.4},{t:"canceling",s:15.4,e:15.94},{t:"projects.",s:15.94,e:16.36},{t:"They",s:16.76,e:16.88},{t:"are",s:16.88,e:17},{t:"hoarding",s:17,e:17.52},{t:"cash.",s:17.52,e:17.78},{t:"Survival",s:18.26,e:18.82},{t:"mode.",s:18.82,e:19.06},{t:"What",s:19.6,e:19.84},{t:"does",s:19.84,e:20.04},{t:"Amazon",s:20.04,e:20.26},{t:"do?",s:20.26,e:20.66},{t:"They",s:21.1,e:21.24},{t:"push",s:21.24,e:21.46},{t:"forward",s:21.46,e:21.92},{t:"with",s:21.92,e:22.12},{t:"one",s:22.12,e:22.3},{t:"of",s:22.3,e:22.4},{t:"their",s:22.4,e:22.54},{t:"strangest",s:22.54,e:23.22},{t:"and",s:23.22,e:23.42},{t:"most",s:23.42,e:23.7},{t:"ambitious",s:23.7,e:24.16},{t:"products",s:24.16,e:24.62},{t:"yet.",s:24.62,e:24.96},{t:"The",s:25.4,e:25.52},{t:"Kindle,",s:25.52,e:26},{t:"an",s:26.32,e:26.46},{t:"electronic",s:26.46,e:26.92},{t:"book",s:26.92,e:27.28},{t:"reader.",s:27.28,e:27.6},{t:"In",s:27.94,e:28.26},{t:"the",s:28.26,e:28.38},{t:"middle",s:28.38,e:28.68},{t:"of",s:28.68,e:28.88},{t:"a",s:28.88,e:28.98},{t:"historic",s:28.98,e:29.5},{t:"recession,",s:29.5,e:30.06},{t:"they",s:30.48,e:30.58},{t:"were",s:30.58,e:30.7},{t:"trying",s:30.7,e:30.94},{t:"to",s:30.94,e:31.1},{t:"change",s:31.1,e:31.44},{t:"how",s:31.44,e:31.64},{t:"humanity",s:31.64,e:32.1},{t:"had",s:32.1,e:32.48},{t:"read",s:32.48,e:32.64},{t:"books",s:32.64,e:32.96},{t:"for",s:32.96,e:33.22},{t:"over",s:33.22,e:33.5},{t:"500",s:33.5,e:34.12},{t:"years.",s:34.12,e:34.62},{t:"They",s:34.94,e:35.3},{t:"were",s:35.3,e:35.42},{t:"building",s:35.42,e:35.72},{t:"new",s:35.72,e:35.94},{t:"hardware.",s:35.94,e:36.34},{t:"They",s:36.78,e:36.86},{t:"were",s:36.86,e:36.98},{t:"fighting",s:36.98,e:37.3},{t:"with",s:37.3,e:37.54},{t:"publishers.",s:37.54,e:37.98},{t:"They",s:38.46,e:38.66},{t:"were",s:38.66,e:38.8},{t:"investing",s:38.8,e:39.28},{t:"hundreds",s:39.28,e:39.78},{t:"of",s:39.78,e:40.02},{t:"millions",s:40.02,e:40.4},{t:"of",s:40.4,e:40.66},{t:"dollars",s:40.66,e:40.96},{t:"while",s:40.96,e:41.3},{t:"other",s:41.3,e:41.62},{t:"companies",s:41.62,e:42},{t:"were",s:42,e:42.2},{t:"fighting",s:42.2,e:42.56},{t:"for",s:42.56,e:42.78},{t:"their",s:42.78,e:42.92},{t:"lives.",s:42.92,e:43.38},{t:"Recessions",s:44.02,e:44.56},{t:"are",s:44.56,e:44.76},{t:"a",s:44.76,e:44.86},{t:"clearing",s:44.86,e:45.14},{t:"event.",s:45.14,e:45.62},{t:"The",s:46.02,e:46.08},{t:"week",s:46.08,e:46.32},{t:"get",s:46.32,e:46.62},{t:"wiped",s:46.62,e:46.84},{t:"out.",s:46.84,e:47.18},{t:"The",s:47.52,e:47.62},{t:"strong",s:47.62,e:47.98},{t:"get",s:47.98,e:48.36},{t:"stronger.",s:48.36,e:48.84},{t:"Amazon",s:49.46,e:49.72},{t:"used",s:49.72,e:50.18},{t:"the",s:50.18,e:50.38},{t:"2008",s:50.38,e:50.98},{t:"crisis",s:50.98,e:51.36},{t:"to",s:51.36,e:51.72},{t:"grab",s:51.72,e:52},{t:"market",s:52,e:52.4},{t:"share",s:52.4,e:52.66},{t:"and",s:52.66,e:52.92},{t:"create",s:52.92,e:53.22},{t:"a",s:53.22,e:53.42},{t:"brand",s:53.42,e:53.72},{t:"new",s:53.72,e:54},{t:"ecosystem",s:54,e:54.64},{t:"around",s:54.64,e:55.04},{t:"digital",s:55.04,e:55.42},{t:"books.",s:55.42,e:55.88},{t:"While",s:56.29,e:56.56},{t:"everyone",s:56.56,e:57.04},{t:"else",s:57.04,e:57.32},{t:"was",s:57.32,e:57.48},{t:"looking",s:57.48,e:57.76},{t:"at",s:57.76,e:57.92},{t:"their",s:57.92,e:58.06},{t:"feet,",s:58.06,e:58.32},{t:"they",s:58.74,e:58.84},{t:"were",s:58.84,e:58.98},{t:"looking",s:58.98,e:59.26},{t:"at",s:59.26,e:59.5},{t:"the",s:59.5,e:59.68},{t:"horizon.",s:59.68,e:60.1}];

const VideoComponent: React.FC = () => {
	const {frame, fps, durationInFrames} = useVideoConfig();
	const progress = frame / durationInFrames;

	// Calculate all animated values before applying them in JSX
	const imageChangeInterval = fps * 4;
	const bgIndex = Math.floor(frame / imageChangeInterval) % bgs.length;
	const mgIndex = Math.floor(frame / imageChangeInterval) % mgs.length;
	const fgIndex = Math.floor(frame / imageChangeInterval) % fgs.length;

	const bgTranslate = interpolate(progress, [0, 1], [0, -400]);
	const mgTranslate = interpolate(progress, [0, 1], [0, -800]);
	const fgTranslate = interpolate(progress, [0, 1], [0, -1600]);

	const imageBaseStyle: React.CSSProperties = { position: 'absolute', width: '120%', height: '120%', objectFit: 'cover', left: '-10%', top: '-10%', };
	const bgStyle = {...imageBaseStyle, transform: `translateX(${bgTranslate}px) scale(1.1)`};
	const mgStyle = {...imageBaseStyle, transform: `translateX(${mgTranslate}px) scale(1.1)`};
	const fgStyle = {...imageBaseStyle, opacity: 0.4, transform: `translateX(${fgTranslate}px) scale(1.1)`};

	const textElements = words.map((word, i) => {
		const startFrame = word.s * fps;
		const endFrame = word.e * fps;
		const opacity = interpolate(frame, [startFrame - 5, startFrame, endFrame, endFrame + 5], [0, 1, 1, 0]);
		const scale = interpolate(frame, [startFrame - 5, startFrame], [0.8, 1], {extrapolateRight: 'clamp'});

		const wordStyle: React.CSSProperties = { display: 'inline-block', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 140, fontWeight: 'bold', color: 'white', textShadow: '0 0 30px black, 0 0 15px rgba(0,0,0,0.7)', opacity, transform: `scale(${scale})`};
		return <span key={i} style={wordStyle}>{word.t}&nbsp;</span>;
	});

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_5.wav')} />

			<Img style={bgStyle} src={staticFile(`images/${bgs[bgIndex]}`)} />
			<AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.4)'}} />
			<Img style={mgStyle} src={staticFile(`images/${mgs[mgIndex]}`)} />
			<Img style={fgStyle} src={staticFile(`images/${fgs[fgIndex]}`)} />

			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 20%'}}>
				<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
					{textElements}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const RemotionVideo: React.FC = () => {
	return (
		<Composition
			id="RemotionVideo"
			component={VideoComponent}
			durationInFrames={62 * 30}
			fps={30}
			width={3840}
			height={2160}
		/>
	);
};
```