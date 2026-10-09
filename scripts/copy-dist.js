const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'landing page', 'eva-music-app', 'dist');
const distTarget = path.join(__dirname, '..', 'dist');
const publicTarget = path.join(__dirname, '..', 'public');

if (fs.existsSync(src)) {
  fs.mkdirSync(distTarget, { recursive: true });
  fs.cpSync(src, distTarget, { recursive: true });

  fs.mkdirSync(publicTarget, { recursive: true });
  fs.cpSync(src, publicTarget, { recursive: true });
  console.log('✓ Successfully copied build output to dist/ and public/');
} else {
  console.error('Build output not found at', src);
  process.exit(1);
}
