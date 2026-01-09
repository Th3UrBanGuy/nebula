
/**
 * PHASE 1 & 2: Backend Preview Generation
 * 
 * Usage: node generate-previews.js <input_video.mp4>
 * Dependencies: npm install fluent-ffmpeg
 */

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = process.argv[2];
const OUTPUT_DIR = './output';
const INTERVAL = 5; // Extract frame every 5 seconds
const THUMB_WIDTH = 160;
const THUMB_HEIGHT = 90;
const COLUMNS = 5; // 5 images per row in sprite sheet

if (!INPUT_FILE) {
    console.error("Please provide an input file.");
    process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

console.log(`Processing ${INPUT_FILE}...`);

// 1. Get Video Duration
ffmpeg.ffprobe(INPUT_FILE, (err, metadata) => {
    if (err) throw err;
    
    const duration = metadata.format.duration;
    const framesCount = Math.ceil(duration / INTERVAL);
    
    console.log(`Duration: ${duration}s. Generating ${framesCount} frames.`);

    // 2. Extract Frames & Create Sprite Sheet (simplified via complex filter)
    // Note: In a production env, you might extract individual images first, then stitch using ImageMagick.
    // Here we extract individual frames for simplicity in mapping.
    
    let vttContent = "WEBVTT\n\n";
    
    // Simulating VTT Generation logic
    for (let i = 0; i < framesCount; i++) {
        const startTime = new Date(i * INTERVAL * 1000).toISOString().substr(11, 8) + ".000";
        const endTime = new Date((i + 1) * INTERVAL * 1000).toISOString().substr(11, 8) + ".000";
        
        // Calculate Sprite Coordinates
        const col = i % COLUMNS;
        const row = Math.floor(i / COLUMNS);
        const x = col * THUMB_WIDTH;
        const y = row * THUMB_HEIGHT;

        vttContent += `${startTime} --> ${endTime}\n`;
        vttContent += `sprite.webp#xywh=${x},${y},${THUMB_WIDTH},${THUMB_HEIGHT}\n\n`;
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'thumbnails.vtt'), vttContent);
    console.log("VTT file generated.");
    
    console.log("To generate the actual sprite image, run:");
    console.log(`ffmpeg -i ${INPUT_FILE} -vf "fps=1/${INTERVAL},scale=${THUMB_WIDTH}:${THUMB_HEIGHT},tile=${COLUMNS}x${Math.ceil(framesCount/COLUMNS)}" ${path.join(OUTPUT_DIR, 'sprite.webp')}`);
});
