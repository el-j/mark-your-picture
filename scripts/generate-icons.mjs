import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'public/icons/icon.svg');
const svg = readFileSync(svgPath);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(resolve(root, `public/icons/icon-${size}x${size}.png`));
  console.log(`Generated ${size}x${size}`);
}

// Apple touch icon (180x180)
await sharp(svg)
  .resize(180, 180)
  .png()
  .toFile(resolve(root, 'public/apple-touch-icon.png'));
console.log('Generated apple-touch-icon.png');

// Favicon 32x32
await sharp(svg)
  .resize(32, 32)
  .png()
  .toFile(resolve(root, 'public/favicon-32x32.png'));
console.log('Generated favicon-32x32.png');

// Favicon 16x16
await sharp(svg)
  .resize(16, 16)
  .png()
  .toFile(resolve(root, 'public/favicon-16x16.png'));
console.log('Generated favicon-16x16.png');

console.log('All icons generated!');
