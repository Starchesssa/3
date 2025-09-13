```tsx
import {
	AbsoluteFill,
	Audio,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	interpolate,
} from 'remotion';
import React, { useMemo } from 'react';

const sentences = [
    { start: 0.00, end: 1.66, words: [{ text: 'Key', start: 0.00 }, { text: 'lesson.', start: 0.44 }] },
    { start: 1.66, end: 5.38, words: [{ text: 'Profitability', start: 1.66 }, { text: 'is', start: 2.28 }, { text: 'a', start: 2.58 }, { text: 'weapon,', start: 2.68 }, { text: 'not', start: 3.40 }, { text: 'just', start: 3.64 }, { text: 'a', start: 3.92 }, { text: 'goal.', start: 4.08 }] },
    { start: 5.38, end: 7.38, words: [{ text: 'Now', start: 5.38 }, { text: 'is', start: 5.64 }, { text: '2003.', start: 5.90 }] },
    { start: 7.38, end: 9.90, words: [{ text: 'The', start: 7.38 }, { text: '.com', start: 7.46 }, { text: 'graveyard', start: 8.04 }, { text: 'is', start: 8.50 }, { text: 'full.', start: 8.90 }] },
    { start: 9.90, end: 12.92, words: [{ text: 'Amazon', start: 9.90 }, { text: 'is', start: 10.24 }, { text: 'still', start: 10.56 }, { text: 'standing,', start: 10.82 }, { text: 'but', start: 11.66 }, { text: 'it', start: 11.78 }, { text: 'is', start: 11.88 }, { text: 'wounded.', start: 12.06 }] },
    { start: 12.92, end: 14.96, words: [{ text: 'The', start: 12.92 }, { text: 'pressure', start: 13.08 }, { text: 'is', start: 13.50 }, { text: 'immense.', start: 13.80 }] },
    { start: 14.96, end: 17.28, words: [{ text: 'They', start: 14.96 }, { text: 'had', start: 15.16 }, { text: 'to', start: 15.46 }, { text: 'prove', start: 15.66 }, { text: 'the', start: 15.96 }, { text: 'model', start: 16.20 }, { text: 'worked.', start: 16.40 }] },
    { start: 17.28, end: 20.48, words: [{ text: 'They', start: 17.28 }, { text: 'had', start: 17.46 }, { text: 'to', start: 17.70 }, { text: 'show', start: 17.90 }, { text: 'they', start: 18.16 }, { text: 'could', start: 18.34 }, { text: 'actually', start: 18.50 }, { text: 'make', start: 19.00 }, { text: 'money.', start: 19.28 }] },
    { start: 20.48, end: 24.92, words: [{ text: 'And', start: 20.48 }, { text: 'the', start: 20.60 }, { text: 'fourth', start: 20.92 }, { text: 'quarter', start: 21.20 }, { text: 'of', start: 21.40 }, { text: '2001,', start: 21.76 }, { text: 'they', start: 22.46 }, { text: 'posted', start: 22.54 }, { text: 'their', start: 22.98 }, { text: 'first', start: 23.20 }, { text: 'ever', start: 23.68 }, { text: 'profit.', start: 24.00 }] },
    { start: 24.92, end: 30.48, words: [{ text: 'It', start: 24.92 }, { text: 'was', start: 25.16 }, { text: 'tiny,', start: 25.32 }, { text: 'just', start: 26.14 }, { text: '$5', start: 26.44 }, { text: 'million', start: 26.94 }, { text: 'on', start: 27.20 }, { text: 'over', start: 27.84 }, { text: '$1', start: 28.14 }, { text: 'billion', start: 28.60 }, { text: 'in', start: 28.90 }, { text: 'sales.', start: 29.40 }] },
    { start: 30.48, end: 33.82, words: [{ text: 'By', start: 30.48 }, { text: '2003,', start: 30.58 }, { text: 'they', start: 31.82 }, { text: 'were', start: 31.92 }, { text: 'consistently', start: 32.04 }, { text: 'profitable.', start: 32.70 }] },
    { start: 33.82, end: 36.56, words: [{ text: 'This', start: 33.82 }, { text: "wasn't", start: 34.22 }, { text: 'about', start: 34.58 }, { text: 'pleasing', start: 34.76 }, { text: 'Wall', start: 35.14 }, { text: 'Street', start: 35.42 }, { text: 'anymore.', start: 35.64 }] },
    { start: 36.56, end: 39.22, words: [{ text: 'It', start: 36.56 }, { text: 'was', start: 36.68 }, { text: 'about', start: 36.80 }, { text: 'generating', start: 37.06 }, { text: 'their', start: 37.88 }, { text: 'own', start: 38.22 }, { text: 'fuel.', start: 38.22 }] },
    { start: 39.22, end: 41.16, words: [{ text: 'Profit', start: 39.22 }, { text: "wasn't", start: 39.70 }, { text: 'the', start: 40.16 }, { text: 'end', start: 40.30 }, { text: 'goal.', start: 40.46 }] },
    { start: 41.16, end: 49.08, words: [{ text: 'Profit', start: 41.16 }, { text: 'was', start: 41.54 }, { text: 'the', start: 41.66 }, { text: 'cash', start: 41.86 }, { text: 'that', start: 42.16 }, { text: 'allowed', start: 42.46 }, { text: 'them', start: 42.72 }, { text: 'to', start: 43.02 }, { text: 'build', start: 43.20 }, { text: 'more,', start: 43.50 }, { text: 'to', start: 44.20 }, { text: 'experiment', start: 44.38 }, { text: 'more,', start: 44.88 }, { text: 'to', start: 45.54 }, { text: 'take', start: 45.70 }, { text: 'bigger', start: 45.96 }, { text: 'risks', start: 46.38 }, { text: 'without', start: 46.78 }, { text: 'asking', start: 47.18 }, { text: 'for', start: 47.68 }, { text: 'permission.', start: 47.86 }] },
    { start: 49.08, end: 54.00, words: [{ text: 'It', start: 49.08 }, { text: 'was', start: 49.24 }, { text: 'the', start: 49.40 }, { text: 'foundation', start: 49.98 }, { text: 'for', start: 50.26 }, { text: 'the', start: 50.42 }, { text: 'next', start: 50.82 }, { text: 'decade', start: 51.32 }, { text: 'of', start: 51.52 }, { text: 'war.', start: 51.78 }] }
];

const scenes = [
    { start: 0, duration: 9, layers: [{ src: 'assets/images/scene1-bg.jpg', speed: 0.2 }, { src: 'assets/images/scene1-mid.jpg', speed: 0.5 }, { src: 'assets/images/scene1-fg.jpg', speed: 1.0 }] },
    { start: 7, duration: 7, layers: [{ src: 'assets/images/scene2-bg.jpg', speed: 0.2 }, { src: 'assets/images/scene2-mid.jpg', speed: 0.4 }] },
    { start: 12, duration: 10, layers: [{ src: 'assets/images/scene3-bg.jpg', speed: 0.3 }, { src: 'assets/images/scene3-fg.jpg', speed: 0.8 }] },
    { start: 20, duration: 14, layers: [{ src: 'assets/images/scene4-bg.jpg', speed: 0.25 }, { src: 'assets/images/scene4-mid.jpg', speed: 0.6 }] },
    { start: 32, duration: 12, layers: [{ src: 'assets/images/scene5-bg.jpg', speed: 0.2 }, { src: 'assets/images/scene5-mid.jpg', speed: 0.5 }] },
    { start: 42, duration: 12, layers: [{ src: 'assets/images/scene6-bg.jpg', speed: 0.3 }, { src: 'assets/images/scene6-fg.jpg', speed: 0.9 }] },
];

const Word: React.FC<{ text: string; start: number; }> = ({ text, start }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const startFrame = start * fps;
    const opacity = interpolate(frame, [startFrame - 5, startFrame], [0, 1], { extrapolateRight: 'clamp' });
    return <span style={{ opacity, marginRight: '0.25em', display: 'inline-block' }}>{text}</span>;
};

const ParallaxLayer: React.FC<{ src: string; speed: number; cameraZoom: number; cameraPanX: number; cameraPanY: number; }> = ({ src, speed, cameraZoom, cameraPanX, cameraPanY }) => {
    return (
        <AbsoluteFill>
            <img
                src={staticFile(src)}
                style={{
                    width: '150%',
                    height: '150%',
                    position: 'absolute',
                    left: '-25%',
                    top: '-25%',
                    objectFit: 'cover',
                    transform: `scale(${cameraZoom}) translateX(${cameraPanX * speed}px) translateY(${cameraPanY * speed}px)`,
                }}
            />
        </AbsoluteFill>
    );
};

const DustParticles: React.FC<{ count: number }> = ({ count }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.5 + 1,
            opacity: Math.random() * 0.4 + 0.1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
        }));
    }, [count, width, height]);

    return (
        <AbsoluteFill>
            {particles.map((p) => {
                const xPos = (p.x + frame * p.speedX) % width;
                const yPos = (p.y + frame * p.speedY) % height;
                return (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            left: xPos,
                            top: yPos,
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            opacity: p.opacity,
                            filter: 'blur(1px)',
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

export const RemotionVideo: React.FC = () => {
	const { fps, durationInFrames } = useVideoConfig();
	const frame = useCurrentFrame();

	const cameraZoom = interpolate(frame, [0, durationInFrames], [1, 1.2]);
	const cameraPanX = interpolate(frame, [0, durationInFrames], [50, -150]);
	const cameraPanY = interpolate(frame, [0, durationInFrames], [-25, 75]);

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
			<Audio src={staticFile('BOOKS/Temp/TTS/Lesson_3.wav')} />

			{scenes.map((scene, index) => {
				const from = scene.start * fps;
				const duration = scene.duration * fps;
				const transitionDuration = 1 * fps;
				const opacity = interpolate(
					frame,
					[from, from + transitionDuration, from + duration - transitionDuration, from + duration],
					[0, 1, 1, 0],
					{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
				);
				return (
					<AbsoluteFill key={index} style={{ opacity }}>
						{scene.layers.map((layer, i) => (
							<ParallaxLayer
								key={i}
								src={layer.src}
								speed={layer.speed}
								cameraZoom={cameraZoom}
								cameraPanX={cameraPanX}
								cameraPanY={cameraPanY}
							/>
						))}
					</AbsoluteFill>
				);
			})}

            <DustParticles count={50} />

			<AbsoluteFill style={{
                background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)',
                boxShadow: 'inset 0 0 200px #000',
            }}/>

			{sentences.map((sentence, i) => (
				<Sequence from={sentence.start * fps} durationInFrames={(sentence.end - sentence.start) * fps} key={i}>
					<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
						<div
							style={{
								fontFamily: 'Helvetica, Arial, sans-serif',
								fontSize: '5.5rem',
								color: 'white',
								fontWeight: 'bold',
								textAlign: 'center',
								padding: '0 12%',
								textShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.5)',
                                lineHeight: 1.2,
							}}
						>
							{sentence.words.map((word, j) => (
								<Word key={j} text={word.text} start={word.start} />
							))}
						</div>
					</AbsoluteFill>
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
```