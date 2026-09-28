import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const srcDir = './Frames';
const destDir = './public/Frames';
const videoSrc = './hero-vid.mp4';
const videoDest = './public/hero-vid.mp4';

async function main() {
  console.log('Starting optimization script...');

  // Ensure public and public/Frames directories exist
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  // Copy hero-vid.mp4 if it exists
  if (fs.existsSync(videoSrc)) {
    console.log(`Copying ${videoSrc} to ${videoDest}...`);
    fs.copyFileSync(videoSrc, videoDest);
    console.log('Video copied successfully.');
  } else {
    console.warn(`Warning: ${videoSrc} not found.`);
  }

  // Read and sort files in Frames directory
  const files = fs.readdirSync(srcDir)
    .filter(file => file.startsWith('ezgif-frame-') && file.endsWith('.png'))
    .sort();

  console.log(`Found ${files.length} frames to convert.`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const srcPath = path.join(srcDir, file);
    
    // Map ezgif-frame-001.png to frame_001.webp (three-digit zero padding)
    const match = file.match(/ezgif-frame-(\d+)\.png/);
    if (!match) continue;
    
    const frameNum = match[1]; // e.g. "001"
    const destName = `frame_${frameNum}.webp`;
    const destPath = path.join(destDir, destName);

    console.log(`Converting [${i + 1}/${files.length}]: ${file} -> ${destName}`);
    
    try {
      await sharp(srcPath)
        .webp({ quality: 85, effort: 4 }) // WebP quality 85 is visually indistinguishable but highly compressed
        .toFile(destPath);
    } catch (err) {
      console.error(`Error converting ${file}:`, err);
    }
  }

  console.log('Optimization complete!');
}

main().catch(err => {
  console.error('Script failed:', err);
});
