
import {makeProject} from '@revideo/core';
import {makeScene2D, Txt} from '@revideo/2d';

export default makeProject({
  scenes: [
    makeScene2D(function* (view) {
      const text = view.add(
        <Txt fontSize={80} fill="linear-gradient(90deg, #FF6347, #4682B4)">
          Cool Shiny Text!
        </Txt>
      );

      // Animate text
      yield* text.scale(1.5, 1);
      yield* text.rotation(360, 2);
      yield* text.position.x(300, 2);
      yield* text.scale(1, 1);
    }),
  ],
});
