
// render-all.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const VIDEO_DIR = path.join(__dirname, "BOOKS", "Temp", "VIDEO_TSX");
const INDEX_FILE = path.join(__dirname, "src", "index.tsx");
const OUT_DIR = path.join(__dirname, "out");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith(".tsx"));

// 1. Build imports + exports dynamically
let imports = [];
let videoMap = [];
files.forEach((file, i) => {
  const base = path.parse(file).name; // e.g. Intro.Video
  const compName = base.replace(/\W/g, ""); // remove . or _
  imports.push(`import { ${compName} } from '../BOOKS/Temp/VIDEO_TSX/${base}';`);
  videoMap.push(`  "${compName}": ${compName},`);
});

// 2. Write a fresh index.tsx
const indexContent = `
import { registerRoot } from 'remotion';
${imports.join("\n")}

export const videos = {
${videoMap.join("\n")}
};

const componentName = process.env.VIDEO_COMPONENT || Object.keys(videos)[0];
registerRoot(videos[componentName]);
`;

fs.writeFileSync(INDEX_FILE, indexContent, "utf-8");
console.log("📝 Generated src/index.tsx");

// 3. Render each video
files.forEach(file => {
  const base = path.parse(file).name;
  const compName = base.replace(/\W/g, "");

  console.log(\`🎬 Rendering \${file} -> out/\${base}.mp4\`);
  execSync(
    \`VIDEO_COMPONENT="\${compName}" npx remotion render src/index.tsx \${compName} out/\${base}.mp4\`,
    { stdio: "inherit" }
  );
});
