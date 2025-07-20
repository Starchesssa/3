import { makeScene2D } from '@revideo/2d';
import { Img, Txt, Rect } from '@revideo/2d';
import { createRef } from '@revideo/core';

export default makeScene2D(function* (view) {
  // Add your background image
  const image = createRef<Img>();
  view.add(
    <Img
      ref={image}
      src="./Generated Image July 20, 2025 - 11_49AM.jpeg"
      width={1920}
      height={1080}
    />
  );

  // Add animated text on top of the image
  const text = createRef<Txt>();
  view.add(
    <Txt
      ref={text}
      text="Hello, Revideo!"
      fontSize={80}
      fill="white"
      x={0}
      y={0}
    />
  );

  // Animate text: fade in and move
  yield* text().opacity(0, 0);
  yield* text().opacity(1, 1); // Fade in over 1s
  yield* text().y(-200, 2);    // Move upwards
  yield* text().rotation(360, 2); // Rotate 360 degrees
});
