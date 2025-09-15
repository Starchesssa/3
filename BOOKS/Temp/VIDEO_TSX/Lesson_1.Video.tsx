```tsx
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
} from 'remotion';
import { interpolate, Easing } from 'remotion';
import React from 'react';

// --- Helper Components ---

// Word component for synchronized text animation
const Word: React.FC<{
  children: React.ReactNode;
  start: number;
  duration: number;
}> = ({ children, start, duration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 5], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const blur = interpolate(frame, [start, start + 5], [10, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        filter: `blur(${blur}px)`,
        marginRight: '0.25em',
        textShadow: '0 0 15px rgba(0,0,0,0.7)',
      }}
    >
      {children}
    </span>
  );
};

// Sentence component to wrap a group of words
const Sentence: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <p
      className={className}
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '80px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
        lineHeight: 1.2,
      }}
    >
      {children}
    </p>
  );
};

// --- Main Video Component ---

export const RemotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Helper function to convert time (s) to frames
  const T = (seconds: number) => Math.round(seconds * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Audio src={staticFile('BOOKS/Temp/TTS/Lesson_1.wav')} />

      {/* Scene 1: Key Lesson & Long-Term Vision (0.00s - 5.3s) */}
      <Sequence from={T(0)} durationInFrames={T(5.3)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 1:
            - background_abstract_dark.jpg: A dark, moody, subtly textured background.
            - foreground_key.png: A large, ornate, antique key with a transparent background.
            - overlay_glowing_path.png: A faint, glowing path or nebula leading into the distance, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_abstract_dark.jpg')}
            style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              objectFit: 'cover',
              transform: `scale(${interpolate(frame, [T(0), T(5.3)], [1, 1.05], {
                easing: Easing.bezier(0.5, 0, 0.5, 1),
              })}) translateX(${interpolate(frame, [T(0), T(5.3)], [0, -50])}px)`,
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_glowing_path.png')}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0.6,
              transform: `scale(${interpolate(frame, [T(0), T(5.3)], [1, 1.15], {
                easing: Easing.bezier(0.5, 0, 0.5, 1),
              })})`,
            }}
          />
          <Img
            src={staticFile('assets/images/foreground_key.png')}
            style={{
              position: 'absolute',
              height: '80%',
              left: '-10%',
              top: '10%',
              opacity: 0.7,
              transform: `translateX(${interpolate(frame, [T(0), T(5.3)], [0, 50])}px)`,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(0.0)} duration={T(0.46)}>Key</Word>
            <Word start={T(0.46)} duration={T(0.42)}>lesson.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(1.48)} duration={T(0.6)}>Ignore</Word>
            <Word start={T(2.08)} duration={T(0.34)}>short</Word>
            <Word start={T(2.42)} duration={T(0.26)}>-term</Word>
            <Word start={T(2.68)} duration={T(0.52)}>reality</Word>
            <Word start={T(3.2)} duration={T(0.46)}>for</Word>
            <Word start={T(3.66)} duration={T(0.14)}>a</Word>
            <Word start={T(3.8)} duration={T(0.32)}>long</Word>
            <Word start={T(4.12)} duration={T(0.28)}>-term</Word>
            <Word start={T(4.4)} duration={T(0.44)}>vision.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: 1999 & Dot-Com Bubble (5.3s - 10.7s) */}
      <Sequence from={T(5.3)} durationInFrames={T(5.4)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 2:
            - background_1999_computer.jpg: A retro CRT monitor with a green/black terminal screen aesthetic.
            - overlay_stock_chart_green.png: A glowing green stock chart line going sharply up, transparent background.
            - overlay_bubbles.png: Subtle, semi-transparent bubbles floating upwards.
          */}
          <Img
            src={staticFile('assets/images/background_1999_computer.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${interpolate(frame, [T(5.3), T(10.7)], [1.2, 1])})`,
              filter: 'brightness(0.7)',
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_stock_chart_green.png')}
            style={{
              width: '100%',
              height: '100%',
              transform: `translateX(${interpolate(frame, [T(5.3), T(10.7)], [-100, 100])}px)`,
              opacity: 0.5,
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_bubbles.png')}
            style={{
              width: '100%',
              height: '100%',
              transform: `translateY(${interpolate(frame, [T(5.3), T(10.7)], [200, -200])}px)`,
              opacity: 0.3,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(5.76)} duration={T(0.2)}>The</Word>
            <Word start={T(5.96)} duration={T(0.32)}>year</Word>
            <Word start={T(6.28)} duration={T(0.26)}>is</Word>
            <Word start={T(6.54)} duration={T(0.68)}>1999.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(7.9)} duration={T(0.3)}>The</Word>
            <Word start={T(8.2)} duration={T(0.3)}>world</Word>
            <Word start={T(8.5)} duration={T(0.28)}>is</Word>
            <Word start={T(8.78)} duration={T(0.36)}>high</Word>
            <Word start={T(9.14)} duration={T(0.26)}>on</Word>
            <Word start={T(9.4)} duration={T(0.14)}>the</Word>
            <Word start={T(9.54)} duration={T(0.18)}>dot</Word>
            <Word start={T(9.72)} duration={T(0.28)}>-com</Word>
            <Word start={T(10.0)} duration={T(0.28)}>bubble.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Genius & Stocks Go Up (10.7s - 14.1s) */}
      <Sequence from={T(10.7)} durationInFrames={T(3.4)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 3:
            - background_trading_floor.jpg: A bustling, slightly blurred 90s trading floor.
            - foreground_confident_trader.png: A silhouette of a trader looking triumphant, transparent background.
            - overlay_up_arrows.png: Faint, glowing green arrows pointing up, transparent background.
          */}
          <Img
            src={staticFile('assets/images/background_trading_floor.jpg')}
            style={{
              width: '120%',
              height: '120%',
              objectFit: 'cover',
              transform: `scale(${interpolate(frame, [T(10.7), T(14.1)], [1, 1.1])}) translateX(-5%)`,
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_up_arrows.png')}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.4,
              transform: `translateY(${interpolate(frame, [T(10.7), T(14.1)], [100, -100])}px)`,
            }}
          />
          <Img
            src={staticFile('assets/images/foreground_confident_trader.png')}
            style={{
              height: '100%',
              position: 'absolute',
              right: '0%',
              bottom: '0%',
              transform: `scale(${interpolate(frame, [T(10.7), T(14.1)], [1.05, 1])})`,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-start', paddingLeft: '10%' }}>
          <Sentence className="text-left">
            <Word start={T(10.8)} duration={T(0.34)}>Everyone</Word>
            <Word start={T(11.14)} duration={T(0.28)}>is</Word>
            <Word start={T(11.42)} duration={T(0.06)}>a</Word>
            <Word start={T(11.48)} duration={T(0.32)}>genius.</Word>
          </Sentence>
          <Sentence className="text-left">
            <Word start={T(12.38)} duration={T(0.46)}>Stocks</Word>
            <Word start={T(12.84)} duration={T(0.32)}>only</Word>
            <Word start={T(13.16)} duration={T(0.2)}>go</Word>
            <Word start={T(13.36)} duration={T(0.3)}>up.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Amazon Poster Child (14.1s - 19.5s) */}
      <Sequence from={T(14.1)} durationInFrames={T(5.4)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 4:
            - background_old_amazon_website.jpg: A recreation of the 1999 Amazon homepage.
            - midground_book_stack.png: A stack of physical books, transparent background.
            - overlay_server_lines.png: Glowing lines representing data/internet, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_old_amazon_website.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${interpolate(frame, [T(14.1), T(19.5)], [1.2, 1])})`,
              filter: 'blur(4px) brightness(0.6)',
            }}
          />
          <Img
            src={staticFile('assets/images/midground_book_stack.png')}
            style={{
              height: '90%',
              position: 'absolute',
              left: '5%',
              bottom: '-10%',
              transform: `scale(${interpolate(frame, [T(14.1), T(19.5)], [1.3, 1.05])})`,
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_server_lines.png')}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.3,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-end', paddingRight: '5%' }}>
          <Sentence className="text-right">
            <Word start={T(14.28)} duration={T(0.4)}>Amazon</Word>
            <Word start={T(14.68)} duration={T(0.36)}>is</Word>
            <Word start={T(15.04)} duration={T(0.14)}>the</Word>
            <Word start={T(15.18)} duration={T(0.42)}>poster</Word>
            <Word start={T(15.6)} duration={T(0.4)}>child</Word>
            <Word start={T(16.0)} duration={T(0.2)}>of</Word>
            <Word start={T(16.2)} duration={T(0.2)}>this</Word>
            <Word start={T(16.4)} duration={T(0.26)}>new</Word>
            <Word start={T(16.66)} duration={T(0.34)}>internet</Word>
            <Word start={T(17.0)} duration={T(0.56)}>economy.</Word>
          </Sentence>
          <Sentence className="text-right">
            <Word start={T(18.02)} duration={T(0.2)}>It</Word>
            <Word start={T(18.22)} duration={T(0.2)}>sells</Word>
            <Word start={T(18.42)} duration={T(0.26)}>books</Word>
            <Word start={T(18.68)} duration={T(0.42)}>online.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5: Bezos vs Wall Street (19.5s - 24.0s) */}
      <Sequence from={T(19.5)} durationInFrames={T(4.5)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 5:
            - background_wall_street.jpg: The iconic Wall Street bull or building, dark and imposing.
            - foreground_bezos_silhouette.png: A silhouette of a person facing the background, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_wall_street.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${interpolate(frame, [T(19.5), T(24.0)], [1, 1.1])})`,
              filter: 'brightness(0.5) contrast(1.2)',
            }}
          />
          <Img
            src={staticFile('assets/images/foreground_bezos_silhouette.png')}
            style={{
              height: '80%',
              position: 'absolute',
              left: '5%',
              bottom: '0',
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'flex-end', paddingRight: '10%' }}>
          <Sentence className="text-right">
            <Word start={T(19.78)} duration={T(0.18)}>But</Word>
            <Word start={T(19.96)} duration={T(0.26)}>Jeff</Word>
            <Word start={T(20.22)} duration={T(0.42)}>Bezos</Word>
            <Word start={T(20.64)} duration={T(0.36)}>is</Word>
            <Word start={T(21.0)} duration={T(0.3)}>telling</Word>
            <Word start={T(21.3)} duration={T(0.26)}>Wall</Word>
            <Word start={T(21.56)} duration={T(0.26)}>Street</Word>
            <Word start={T(21.82)} duration={T(0.48)}>something</Word>
            <Word start={T(22.3)} duration={T(0.26)}>they</Word>
            <Word start={T(22.56)} duration={T(0.18)}>do</Word>
            <Word start={T(22.74)} duration={T(0.3)}>not</Word>
            <Word start={T(23.04)} duration={T(0.24)}>want</Word>
            <Word start={T(23.28)} duration={T(0.18)}>to</Word>
            <Word start={T(23.46)} duration={T(0.2)}>hear.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6: Losing Money (24.0s - 31.6s) */}
      <Sequence from={T(24.0)} durationInFrames={T(7.6)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 6:
            - background_dark_abstract.jpg: A dark, textured background.
            - midground_falling_dollars.png: Bills of money falling, transparent background.
            - overlay_red_graph_down.png: A red line graph pointing downwards, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_dark_abstract.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(1.1) rotate(5deg)`,
            }}
          />
          <Img
            src={staticFile('assets/images/midground_falling_dollars.png')}
            style={{
              width: '100%',
              height: '100%',
              transform: `translateY(${interpolate(frame, [T(24.0), T(31.6)], [-200, 200])}px) rotate(-5deg)`,
              opacity: 0.5,
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_red_graph_down.png')}
            style={{
              position: 'absolute',
              width: '80%',
              left: '10%',
              top: '10%',
              opacity: interpolate(frame, [T(25.5), T(26.5)], [0, 0.7]),
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(24.16)} duration={T(0.22)}>He</Word>
            <Word start={T(24.38)} duration={T(0.14)}>is</Word>
            <Word start={T(24.52)} duration={T(0.28)}>telling</Word>
            <Word start={T(24.8)} duration={T(0.28)}>them</Word>
            <Word start={T(25.08)} duration={T(0.34)}>he</Word>
            <Word start={T(25.42)} duration={T(0.14)}>is</Word>
            <Word start={T(25.56)} duration={T(0.2)}>going</Word>
            <Word start={T(25.76)} duration={T(0.2)}>to</Word>
            <Word start={T(25.96)} duration={T(0.34)}>lose</Word>
            <Word start={T(26.3)} duration={T(0.38)}>money.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(27.16)} duration={T(0.16)}>He</Word>
            <Word start={T(27.32)} duration={T(0.14)}>is</Word>
            <Word start={T(27.46)} duration={T(0.26)}>telling</Word>
            <Word start={T(27.72)} duration={T(0.22)}>them</Word>
            <Word start={T(27.94)} duration={T(0.24)}>he</Word>
            <Word start={T(28.18)} duration={T(0.14)}>is</Word>
            <Word start={T(28.32)} duration={T(0.14)}>going</Word>
            <Word start={T(28.46)} duration={T(0.18)}>to</Word>
            <Word start={T(28.64)} duration={T(0.24)}>spend</Word>
            <Word start={T(28.88)} duration={T(0.56)}>every</Word>
            <Word start={T(29.44)} duration={T(0.32)}>dollar</Word>
            <Word start={T(29.76)} duration={T(0.2)}>they</Word>
            <Word start={T(29.96)} duration={T(0.2)}>give</Word>
            <Word start={T(30.16)} duration={T(0.26)}>him</Word>
            <Word start={T(30.42)} duration={T(0.52)}>and</Word>
            <Word start={T(30.94)} duration={T(0.26)}>more.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 7: Bookstore to Everything Store (31.6s - 36.2s) */}
      <Sequence from={T(31.6)} durationInFrames={T(4.6)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 7:
            - background_small_bookstore.jpg: A quaint, small bookstore.
            - background_massive_warehouse.jpg: A huge, sprawling Amazon fulfillment center.
            - overlay_blueprint_grid.png: A schematic/blueprint grid overlay, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_small_bookstore.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: interpolate(frame, [T(33.5), T(34.5)], [1, 0]),
            }}
          />
          <Img
            src={staticFile('assets/images/background_massive_warehouse.jpg')}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${interpolate(frame, [T(31.6), T(36.2)], [1.5, 1])})`,
              opacity: interpolate(frame, [T(33.5), T(34.5)], [0, 1]),
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_blueprint_grid.png')}
            style={{
              width: '100%',
              height: '100%',
              opacity: interpolate(frame, [T(34), T(36.2)], [0, 0.2]),
              transform: `scale(${interpolate(frame, [T(34), T(36.2)], [1, 1.2])})`,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(31.86)} duration={T(0.26)}>He</Word>
            <Word start={T(32.12)} duration={T(0.16)}>is</Word>
            <Word start={T(32.28)} duration={T(0.26)}>not</Word>
            <Word start={T(32.54)} duration={T(0.38)}>building</Word>
            <Word start={T(32.92)} duration={T(0.14)}>a</Word>
            <Word start={T(33.06)} duration={T(0.3)}>bookstore.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(33.86)} duration={T(0.2)}>He</Word>
            <Word start={T(34.06)} duration={T(0.12)}>is</Word>
            <Word start={T(34.18)} duration={T(0.36)}>building</Word>
            <Word start={T(34.54)} duration={T(0.42)}>the</Word>
            <Word start={T(34.96)} duration={T(0.46)}>everything</Word>
            <Word start={T(35.42)} duration={T(0.4)}>store.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 8: 1997 Letter (36.2s - 42.2s) */}
      <Sequence from={T(36.2)} durationInFrames={T(6.0)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 8:
            - background_parchment.jpg: A textured paper/parchment background.
            - overlay_handwritten_text.png: Stylized text quote from the letter, transparent.
            - overlay_light_beam.png: A soft light beam, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_parchment.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(1.1) translateX(${interpolate(frame, [T(36.2), T(42.2)], [-50, 50])}px)`,
              filter: 'brightness(0.9)',
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_handwritten_text.png')}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.5,
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_light_beam.png')}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.4,
              transform: `skewX(-15deg) translateX(${interpolate(frame, [T(36.2), T(42.2)], [-1000, 1000])}px)`,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(36.5)} duration={T(0.24)}>In</Word>
            <Word start={T(36.74)} duration={T(0.16)}>his</Word>
            <Word start={T(36.9)} duration={T(0.6)}>1997</Word>
            <Word start={T(37.5)} duration={T(0.66)}>letter</Word>
            <Word start={T(38.16)} duration={T(0.24)}>to</Word>
            <Word start={T(38.4)} duration={T(0.4)}>shareholders,</Word>
          </Sentence>
          <Sentence>
            <Word start={T(39.22)} duration={T(0.22)}>he</Word>
            <Word start={T(39.44)} duration={T(0.24)}>said</Word>
            <Word start={T(39.68)} duration={T(0.44)}>it</Word>
            <Word start={T(40.12)} duration={T(0.16)}>was</Word>
            <Word start={T(40.28)} duration={T(0.36)}>all</Word>
            <Word start={T(40.64)} duration={T(0.36)}>about</Word>
            <Word start={T(41.0)} duration={T(0.22)}>the</Word>
            <Word start={T(41.22)} duration={T(0.26)}>long</Word>
            <Word start={T(41.48)} duration={T(0.24)}>-term.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 9: Stocks Soared (42.2s - 49.3s) */}
      <Sequence from={T(42.2)} durationInFrames={T(7.1)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 9:
            - background_stock_ticker.jpg: A blur of green numbers and tickers.
            - midground_rocket.png: A rocket graphic with a green stock line trail, transparent.
            - overlay_confetti.png: Subtle celebratory confetti, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_stock_ticker.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(1.2) translateY(${interpolate(frame, [T(42.2), T(49.3)], [0, -100])}px)`,
            }}
          />
          <Img
            src={staticFile('assets/images/midground_rocket.png')}
            style={{
              height: '80%',
              position: 'absolute',
              left: '10%',
              bottom: '-10%',
              transform: `translateY(${interpolate(frame, [T(45.5), T(49.3)], [0, -800])}px) rotate(-15deg)`,
            }}
          />
          <Img
            src={staticFile('assets/images/overlay_confetti.png')}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.7,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(42.54)} duration={T(0.2)}>In</Word>
            <Word start={T(42.74)} duration={T(0.54)}>1999,</Word>
          </Sentence>
          <Sentence>
            <Word start={T(43.98)} duration={T(0.08)}>the</Word>
            <Word start={T(44.06)} duration={T(0.3)}>market</Word>
            <Word start={T(44.36)} duration={T(0.3)}>loved</Word>
            <Word start={T(44.66)} duration={T(0.24)}>him</Word>
            <Word start={T(44.9)} duration={T(0.22)}>for</Word>
            <Word start={T(45.12)} duration={T(0.2)}>it.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(45.8)} duration={T(0.28)}>Amazon</Word>
            <Word start={T(46.08)} duration={T(0.6)}>stocks</Word>
            <Word start={T(46.68)} duration={T(0.54)}>soared</Word>
            <Word start={T(47.22)} duration={T(0.18)}>to</Word>
            <Word start={T(47.4)} duration={T(0.32)}>over</Word>
            <Word start={T(47.72)} duration={T(0.68)}>$100</Word>
            <Word start={T(48.4)} duration={T(0.5)}>a</Word>
            <Word start={T(48.9)} duration={T(0.28)}>share.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 10: Not Profitable (49.3s - 57.0s) */}
      <Sequence from={T(49.3)} durationInFrames={T(7.7)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 10:
            - background_foggy_horizon.jpg: A vast, empty landscape with a foggy, distant horizon.
            - midground_single_coin.png: A single coin being tossed, representing a bet, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_foggy_horizon.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${interpolate(frame, [T(49.3), T(57.0)], [1, 1.2])})`,
              filter: 'saturate(0.5) brightness(0.8)',
            }}
          />
          <Img
            src={staticFile('assets/images/midground_single_coin.png')}
            style={{
              height: '30%',
              position: 'absolute',
              top: '35%',
              left: '35%',
              opacity: interpolate(frame, [T(54.5), T(55.5)], [0, 0.8], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              transform: `rotate(${interpolate(frame, [T(55), T(57.0)], [0, 360])}deg)`,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(49.52)} duration={T(0.34)}>But</Word>
            <Word start={T(49.86)} duration={T(0.1)}>the</Word>
            <Word start={T(49.96)} duration={T(0.36)}>company</Word>
            <Word start={T(50.32)} duration={T(0.38)}>was</Word>
            <Word start={T(50.7)} duration={T(0.32)}>not</Word>
            <Word start={T(51.02)} duration={T(0.54)}>profitable.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(51.96)} duration={T(0.2)}>Not</Word>
            <Word start={T(52.16)} duration={T(0.26)}>even</Word>
            <Word start={T(52.42)} duration={T(0.3)}>close.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(53.28)} duration={T(0.32)}>It</Word>
            <Word start={T(53.6)} duration={T(0.2)}>was</Word>
            <Word start={T(53.8)} duration={T(0.24)}>a</Word>
            <Word start={T(54.04)} duration={T(0.44)}>promise.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(55.02)} duration={T(0.12)}>A</Word>
            <Word start={T(55.14)} duration={T(0.28)}>bet</Word>
            <Word start={T(55.42)} duration={T(0.24)}>on</Word>
            <Word start={T(55.66)} duration={T(0.12)}>a</Word>
            <Word start={T(55.78)} duration={T(0.38)}>distant</Word>
            <Word start={T(56.16)} duration={T(0.5)}>future.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 11: Duality of Vision (57.0s - 64.0s) */}
      <Sequence from={T(57.0)} durationInFrames={T(7.0)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 11:
            - background_books_loss.jpg: A pile of books with red down-arrows on them.
            - background_global_empire.jpg: A futuristic image of a global network and data streams.
          */}
          <AbsoluteFill>
            <Img src={staticFile('assets/images/background_books_loss.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              clipPath: `polygon(0 0, ${interpolate(frame, [T(60.0), T(62.0)], [0, 100], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}% 0, ${interpolate(frame, [T(60.0), T(62.0)], [0, 100], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}% 100%, 0% 100%)`,
            }}
          >
            <Img src={staticFile('assets/images/background_global_empire.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.1)' }} />
          </AbsoluteFill>
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(57.3)} duration={T(0.24)}>Most</Word>
            <Word start={T(57.54)} duration={T(0.32)}>people</Word>
            <Word start={T(57.86)} duration={T(0.28)}>saw</Word>
            <Word start={T(58.14)} duration={T(0.16)}>a</Word>
            <Word start={T(58.3)} duration={T(0.3)}>company</Word>
            <Word start={T(58.6)} duration={T(0.46)}>selling</Word>
            <Word start={T(59.06)} duration={T(0.32)}>books</Word>
            <Word start={T(59.38)} duration={T(0.22)}>at</Word>
            <Word start={T(59.6)} duration={T(0.1)}>a</Word>
            <Word start={T(59.7)} duration={T(0.26)}>loss.</Word>
          </Sentence>
          <Sentence>
            <Word start={T(60.6)} duration={T(0.36)}>Bezos</Word>
            <Word start={T(60.96)} duration={T(0.42)}>saw</Word>
            <Word start={T(61.38)} duration={T(0.18)}>a</Word>
            <Word start={T(61.56)} duration={T(0.4)}>global</Word>
            <Word start={T(61.96)} duration={T(0.54)}>logistics</Word>
            <Word start={T(62.5)} duration={T(0.44)}>and</Word>
            <Word start={T(62.94)} duration={T(0.34)}>data</Word>
            <Word start={T(63.28)} duration={T(0.48)}>empire.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 12: Insanity (64.0s - durationInFrames) */}
      <Sequence from={T(64.0)}>
        <AbsoluteFill>
          {/*
            IMAGE ASSETS for Scene 12:
            - background_galaxy.jpg: A swirling galaxy or nebula.
            - midground_human_head_silhouette.png: A silhouette of a human head, transparent.
          */}
          <Img
            src={staticFile('assets/images/background_galaxy.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${interpolate(frame, [T(64.0), durationInFrames], [1, 1.5])}) rotate(${interpolate(
                frame,
                [T(64.0), durationInFrames],
                [0, 20]
              )}deg)`,
            }}
          />
          <Img
            src={staticFile('assets/images/midground_human_head_silhouette.png')}
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.3,
            }}
          />
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Sentence>
            <Word start={T(64.28)} duration={T(0.24)}>The</Word>
            <Word start={T(64.52)} duration={T(0.3)}>vision</Word>
            <Word start={T(64.82)} duration={T(0.2)}>was</Word>
            <Word start={T(65.02)} duration={T(0.32)}>so</Word>
            <Word start={T(65.34)} duration={T(0.36)}>big,</Word>
          </Sentence>
          <Sentence>
            <Word start={T(65.96)} duration={T(0.08)}>it</Word>
            <Word start={T(66.04)} duration={T(0.28)}>looked</Word>
            <Word start={T(66.32)} duration={T(0.32)}>like</Word>
            <Word start={T(66.64)} duration={T(0.58)}>insanity.</Word>
          </Sentence>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// --- Remotion Composition Setup ---

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="StorytellingVideo"
      component={RemotionVideo}
      durationInFrames={68 * 30} // Audio is ~67.22s, round up
      fps={30}
      width={3840}
      height={2160}
    />
  );
};
```