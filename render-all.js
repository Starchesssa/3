// render-all.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Paths
const VIDEO_DIR = path.join(__dirname, "BOOKS", "Temp", "VIDEO_TSX");
const INDEX_FILE = path.join(__dirname, "src", "index.tsx");
const OUT_DIR = path.join(__dirname, "out");

// Ensure output folder exists
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// Get all .tsx files
const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith(".tsx"));

if (files.length === 0) {
  console.error("No .tsx video files found in", VIDEO_DIR);
  process.exit(1);
}

// --- 1. Generate dynamic src/index.tsx ---
let imports = [];
let videoMap = [];

files.forEach(file => {
  const base = path.parse(file).name;        // e.g. Intro.Video
  const compName = base.replace(/\W/g, "");  // e.g. IntroVideo

  // Always import as { RemotionVideo as <UniqueName> }
  imports.push(
    `import { RemotionVideo as ${compName} } from '../BOOKS/Temp/VIDEO_TSX/${base}';`
  );
  videoMap.push(`  "${compName}": ${compName},`);
});

const indexContent = `import { registerRoot } from 'remotion';
${imports.join("\n")}

export const videos = {
${videoMap.join("\n")}
};

const componentName = process.env.VIDEO_COMPONENT || Object.keys(videos)[0];
registerRoot(videos[componentName]);
`;

fs.writeFileSync(INDEX_FILE, indexContent, "utf-8");
console.log("Generated src/index.tsx successfully.");

// --- 2. Render each video ---
files.forEach(file => {
  const base = path.parse(file).name;
  const compName = base.replace(/\W/g, "");

  console.log(`Rendering ${file} -> out/${base}.mp4`);
  try {
    execSync(
      `VIDEO_COMPONENT="${compName}" npx remotion render src/index.tsx ${compName} out/${base}.mp4`,
      { stdio: "inherit" }
    );
  } catch (err) {
    console.error(`Failed to render ${file}:`, err.message);
  }
});

console.log("All videos rendered successfully.");
