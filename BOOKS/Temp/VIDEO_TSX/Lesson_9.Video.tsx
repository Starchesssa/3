```tsx
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Img,
  staticFile,
} from 'remotion';
import React from 'react';

// --- Helper Components ---

// Component for a single word with fade-in/out animation
const Word: React.FC<{
  children: React.ReactNode;
  start: number;
  end: number;
}> = ({ children, start, end }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startTime = start * fps;
  const endTime = end * fps;

  const opacity = interpolate(
    frame,
    [startTime, startTime + 15, endTime - 15, endTime],
    [0, 1, 1, 0]
  );

  return (
    <span
      style={{
        display: 'inline-block',
        marginLeft: '10px',
        marginRight: '10px',
        opacity,
        transform: `translateY(${interpolate(
          opacity,
          [0, 1],
          [10, 0]
        )}px)`,
      }}
    >
      {children}
    </span>
  );
};

// Component for a full sentence, container for words
const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '72px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
        textShadow: '0 0 15px rgba(0,0,0,0.7)',
        position: 'absolute',
        width: '90%',
        left: '5%',
        bottom: '15%',
      }}
    >
      {children}
    </div>
  );
};

// Component for a parallax image layer
const ParallaxImage: React.FC<{
  src: string;
  speed: number;
  zoomAmount?: number;
  isBg?: boolean;
}> = ({ src, speed, zoomAmount = 1.1, isBg = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames;
  const translation = progress * speed * 100;
  const scale = interpolate(frame, [0, durationInFrames], [1, zoomAmount]);

  return (
    <Img
      src={staticFile(src)}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${scale}) translateX(${
          isBg ? 0 : translation
        }px)`,
      }}
    />
  );
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  const audioOffset = 0; // If audio needs trimming from the start
  const audioStart = audioOffset * fps;

  // Global camera-like movement for the entire video
  const globalScale = interpolate(frame, [0, durationInFrames], [1.2, 1]);
  const globalRotate = interpolate(frame, [0, durationInFrames], [-2, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      <div style={{ transform: `scale(${globalScale}) rotate(${globalRotate}deg)` }}>

      {/* --- SCENES --- */}
      
      {/* Scene 1: Growth is not a straight line */}
      <Sequence from={0} duration={4 * fps}>
        <AbsoluteFill style={{ opacity: interpolate(frame, [0, 1*fps, 3*fps, 4*fps], [0, 1, 1, 0])}}>
          {/* abstract-bg.jpg: A dark, textured background for a serious tone. */}
          <ParallaxImage src="images/abstract-bg.jpg" speed={-5} zoomAmount={1.2} isBg />
          {/* growth-line.png: A jagged, non-linear line to visually represent the main point. PNG for transparency. */}
          <ParallaxImage src="images/growth-line.png" speed={10} zoomAmount={1.1} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Arriving at 2022 */}
      <Sequence from={4 * fps} duration={3 * fps}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [4*fps, 5*fps, 6*fps, 7*fps], [0, 1, 1, 0])}}>
          {/* cityscape-dusk.jpg: A city background representing the world context of 2022. */}
          <ParallaxImage src="images/cityscape-dusk.jpg" speed={5} zoomAmount={1.3} isBg />
          {/* calendar-2022.png: A clear visual marker for the year. PNG for transparency over the background. */}
          <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Img src={staticFile('images/calendar-2022.png')} style={{ width: '50%', filter: 'drop-shadow(0 0 20px black)' }} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 3: Inflation & Tech Stock Punishment */}
      <Sequence from={10 * fps} duration={5.5 * fps}>
        <AbsoluteFill style={{ opacity: interpolate(frame, [10*fps, 11*fps, 14.5*fps, 15.5*fps], [0, 1, 1, 0])}}>
          {/* financial-data-bg.jpg: Conveys a financial theme. Kept as a background. */}
          <ParallaxImage src="images/financial-data-bg.jpg" speed={-2} zoomAmount={1.1} isBg />
          {/* inflation-graph.png: Visualizes "inflation is high". PNG for transparency. */}
          <ParallaxImage src="images/inflation-graph.png" speed={10} zoomAmount={1.2} />
          {/* tech-stock-chart.png: Visualizes the stock market punishing tech. PNG for transparency. */}
          <ParallaxImage src="images/tech-stock-chart.png" speed={-10} zoomAmount={1.25} />
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 4: Amazon Stock Drop */}
      <Sequence from={17 * fps} duration={6 * fps}>
         <AbsoluteFill style={{ opacity: interpolate(frame, [17*fps, 18*fps, 22*fps, 23*fps], [0, 1, 1, 0])}}>
          {/* overbuilt-warehouse.jpg: A wide, slightly intimidating shot of a massive warehouse to illustrate scale. */}
          <ParallaxImage src="images/overbuilt-warehouse.jpg" speed={-5} zoomAmount={1.3} isBg />
          {/* amazon-stock-drop-chart.png: The key visual for this segment, showing the 50% drop. PNG for transparency. */}
          <ParallaxImage src="images/amazon-stock-drop-chart.png" speed={8} zoomAmount={1.1} />
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 5: Overbuilt & Overhired */}
      <Sequence from={23 * fps} duration={7 * fps}>
        <AbsoluteFill style={{ opacity: interpolate(frame, [23*fps, 24*fps, 29*fps, 30*fps], [0, 1, 1, 0])}}>
          {/* empty-offices.jpg: A somber, evocative image for the topic of layoffs. */}
          <ParallaxImage src="images/empty-offices.jpg" speed={4} zoomAmount={1.2} isBg />
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 6: Missing the Point - The Machine */}
      <Sequence from={35 * fps} duration={9 * fps}>
        <AbsoluteFill style={{ opacity: interpolate(frame, [35*fps, 36*fps, 43*fps, 44*fps], [0, 1, 1, 0])}}>
          {/* media-headlines.png: A collage to represent media noise. PNG to overlay it. */}
          <ParallaxImage src="images/media-headlines.png" speed={-10} zoomAmount={1.3} />
          {/* glowing-machine.png: The core metaphor of the story - the underlying business. PNG for transparency. */}
          <AbsoluteFill style={{ opacity: interpolate(frame, [40*fps, 41*fps], [0, 1]) }}>
            <ParallaxImage src="images/glowing-machine.png" speed={5} zoomAmount={1.1} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 7: AWS the Real Engine */}
      <Sequence from={49 * fps} duration={9 * fps}>
        <AbsoluteFill style={{ opacity: interpolate(frame, [49*fps, 50*fps, 57*fps, 58*fps], [0, 1, 1, 0])}}>
          {/* aws-servers.jpg: A high-tech, cool-toned image representing AWS infrastructure. */}
          <ParallaxImage src="images/aws-servers.jpg" speed={-4} zoomAmount={1.4} isBg />
          {/* aws-growth-chart.png: A strong visual counterpoint to the earlier falling stock chart. PNG to overlay. */}
          <ParallaxImage src="images/aws-growth-chart.png" speed={12} zoomAmount={1.1} />
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 8: The Cash Cow */}
      <Sequence from={65 * fps} duration={5 * fps}>
        <AbsoluteFill style={{ opacity: interpolate(frame, [65*fps, 66*fps, 69*fps, 70*fps], [0, 1, 1, 0])}}>
          {/* storm-clouds.jpg: Represents the economic "storm" or downturn. */}
          <ParallaxImage src="images/storm-clouds.jpg" speed={-8} zoomAmount={1.2} isBg />
          {/* cash-cow.png: A literal, stylized representation of the "cash cow" concept. PNG for transparency. */}
          <ParallaxImage src="images/cash-cow.png" speed={5} zoomAmount={1.05} />
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 9: Resilience */}
      <Sequence from={72 * fps} duration={11 * fps}>
        <AbsoluteFill style={{ opacity: interpolate(frame, [72*fps, 73*fps, 82*fps, 83*fps], [0, 1, 1, 0])}}>
          {/* lighthouse.jpg: A powerful metaphor for resilience and surviving storms. */}
          <ParallaxImage src="images/lighthouse.jpg" speed={-3} zoomAmount={1.2} isBg />
        </AbsoluteFill>
      </Sequence>
      
      {/* Scene 10: The Last One Standing */}
      <Sequence from={87 * fps} duration={In-finity}>
        <AbsoluteFill style={{ opacity: interpolate(frame, [87*fps, 88*fps], [0, 1])}}>
          {/* sunrise-bg.jpg: Represents a new day, hope, and the storm passing. */}
          <ParallaxImage src="images/sunrise-bg.jpg" speed={-2} zoomAmount={1.3} isBg />
          {/* battlefield-ruins.png: Represents fallen competitors. PNG to overlay on the sunrise. */}
          <ParallaxImage src="images/battlefield-ruins.png" speed={4} zoomAmount={1.1} />
          {/* amazon-empire.png: A final shot of the "empire" standing strong. PNG for transparency. */}
          <AbsoluteFill style={{ opacity: interpolate(frame, [91*fps, 92*fps], [0, 1]) }}>
            <ParallaxImage src="images/amazon-empire.png" speed={0} zoomAmount={1.0} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
      
      </div>

      {/* --- AUDIO --- */}
      <Audio
        src={staticFile('BOOKS/Temp/TTS/Lesson_9.wav')}
        startFrom={Math.floor(audioStart)}
      />

      {/* --- TEXT SEQUENCES --- */}
      <AbsoluteFill>
        <Title>
          <Word start={0.00} end={0.52}>Key</Word>
          <Word start={0.52} end={0.96}>lesson,</Word>
          <Word start={1.42} end={1.76}>growth</Word>
          <Word start={1.76} end={2.16}>is</Word>
          <Word start={2.16} end={2.64}>never</Word>
          <Word start={2.64} end={2.90}>a</Word>
          <Word start={2.90} end={3.14}>straight</Word>
          <Word start={3.14} end={3.54}>line.</Word>
        </Title>
        <Title>
          <Word start={4.22} end={4.76}>Finally,</Word>
          <Word start={5.04} end={5.14}>we</Word>
          <Word start={5.14} end={5.42}>arrive</Word>
          <Word start={5.42} end={5.62}>at</Word>
          <Word start={5.62} end={6.26}>2022.</Word>
        </Title>
        <Title>
          <Word start={7.08} end={7.46}>The world</Word>
          <Word start={7.46} end={7.72}>is</Word>
          <Word start={7.72} end={8.26}>reopening,</Word>
          <Word start={8.72} end={9.10}>but there</Word>
          <Word start={9.10} end={9.30}>is</Word>
          <Word start={9.40} end={10.20}>a new reality.</Word>
        </Title>
        <Title>
          <Word start={10.82} end={11.38}>Inflation</Word>
          <Word start={11.38} end={11.62}>is</Word>
          <Word start={11.62} end={11.94}>high,</Word>
          <Word start={12.32} end={13.20}>the stock market</Word>
          <Word start={13.20} end={13.44}>is</Word>
          <Word start={13.44} end={14.62}>punishing tech companies.</Word>
        </Title>
        <Title>
          <Word start={15.24} end={16.20}>The pandemic boom</Word>
          <Word start={16.20} end={16.56}>is</Word>
          <Word start={16.56} end={16.94}>over.</Word>
        </Title>
        <Title>
          <Word start={17.60} end={18.48}>Amazon stock</Word>
          <Word start={18.48} end={19.96}>fell nearly 50%</Word>
          <Word start={19.96} end={20.96}>during 2022,</Word>
          <Word start={21.58} end={22.56}>a massive drop.</Word>
        </Title>
         <Title>
          <Word start={23.08} end={24.30}>They had overbuilt,</Word>
          <Word start={24.66} end={27.56}>they had hired too many people during the pandemic frenzy.</Word>
        </Title>
        <Title>
          <Word start={28.03} end={29.50}>Now they had to correct.</Word>
          <Word start={29.98} end={31.60}>The company announced layoffs,</Word>
          <Word start={31.90} end={35.00}>eventually totalling over 27,000 employees.</Word>
        </Title>
        <Title>
          <Word start={35.42} end={38.10}>The media wrote stories about Amazon's decline,</Word>
          <Word start={38.68} end={40.20}>but they were missing the point again.</Word>
        </Title>
        <Title>
          <Word start={40.84} end={42.50}>They were looking at the stock price,</Word>
          <Word start={42.74} end={43.56}>not the machine.</Word>
        </Title>
        <Title>
          <Word start={44.26} end={48.84}>Yes, the e-commerce business was slowing down from its impossible pandemic highs.</Word>
        </Title>
        <Title>
          <Word start={49.32} end={52.78}>But the real engine, AWS, was still growing.</Word>
        </Title>
        <Title>
          <Word start={53.42} end={57.54}>AWS generated $80 billion in revenue in 2022.</Word>
          <Word start={58.10} end={61.36}>Its operating income was $22.8 billion.</Word>
        </Title>
         <Title>
          <Word start={62.08} end={65.16}>The retail business actually lost money that year.</Word>
        </Title>
        <Title>
          <Word start={65.74} end={69.70}>The cash cow was keeping the entire empire afloat during the storm.</Word>
        </Title>
        <Title>
          <Word start={70.36} end={71.84}>This is the final lesson.</Word>
        </Title>
        <Title>
          <Word start={72.42} end={76.30}>The system is more resilient than any single year stock performance.</Word>
        </Title>
        <Title>
          <Word start={76.86} end={79.32}>You build a diversified machine</Word>
          <Word start={79.32} end={81.68}>so that when one part is weak, another is strong.</Word>
        </Title>
        <Title>
          <Word start={82.28} end={84.50}>It is not about avoiding downturns.</Word>
          <Word start={84.80} end={87.30}>It is about building a business that can survive them.</Word>
        </Title>
        <Title>
          <Word start={87.82} end={89.72}>And then, when the sun comes out again,</Word>
          <Word start={90.08} end={92.30}>you are the only one left on the battlefield.</Word>
        </Title>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```