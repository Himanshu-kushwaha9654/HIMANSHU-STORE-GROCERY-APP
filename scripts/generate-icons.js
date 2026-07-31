import fs from 'fs';
import sharp from 'sharp';

async function generateIcons() {
  const svgBuffer = fs.readFileSync('./public/favicon.svg');

  // favicon.png (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('./public/favicon.png');

  // apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('./public/apple-touch-icon.png');

  // og-image.png (1200x630)
  // We'll create a nice background and put the logo in the center
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 17, g: 24, b: 39, alpha: 1 } // #111827
    }
  })
    .composite([
      {
        input: await sharp(svgBuffer).resize(300, 300).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile('./public/og-image.png');

  // web-app-manifest-192x192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('./public/web-app-manifest-192x192.png');

  // web-app-manifest-512x512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('./public/web-app-manifest-512x512.png');

  console.log("Generated all icons successfully!");
}

generateIcons().catch(console.error);
