
// render.js
import { renderVideo } from '@revideo/renderer';

(async () => {
  try {
    const output = await renderVideo({
      projectFile: './coolText.tsx',
      settings: { outFile: 'output.mp4', logProgress: true },
      variables: { message: process.env.MESSAGE || 'Default Message' }
    });
    console.log('Rendered to', output);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
