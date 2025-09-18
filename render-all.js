
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const VIDEO_DIR = "BOOKS/Temp/VIDEO_TSX";
const OUT_DIR = "out";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const videoFiles = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith(".Video.tsx"));

const listFile = path.join(OUT_DIR, "list.txt");
fs.writeFileSync(listFile, ""); // reset concat list

for (const file of videoFiles) {
  const baseName = path.basename(file, ".tsx"); // e.g. Intro.Video
  const outputFile = path.join(OUT_DIR, `${baseName}.mp4`);

  console.log(`🎬 Rendering ${file} -> ${outputFile}`);

  // Run remotion render with this file as entry
  execSync(
    `npx remotion render ${path.join(VIDEO_DIR, file)} ${baseName} ${outputFile}`,
    { stdio: "inherit" }
  );

  // Append to concat list
  fs.appendFileSync(listFile, `file '${baseName}.mp4'\n`);
}

// Concatenate all videos into one
console.log("📀 Concatenating into out/final_video.mp4");
execSync(
  `ffmpeg -f concat -safe 0 -i ${listFile} -c copy ${path.join(OUT_DIR, "final_video.mp4")}`,
  { stdio: "inherit" }
);

console.log("✅ Done!");
