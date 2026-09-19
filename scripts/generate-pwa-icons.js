import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

// 1. Regular icon SVG (Clean, high contrast for icon.svg and standard icons)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Rounded App Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="url(#amberGrad)" stroke-width="4" stroke-opacity="0.3" />

  <!-- Inner Ambient Glow Circle -->
  <circle cx="256" cy="256" r="170" fill="url(#amberGrad)" opacity="0.08" />

  <!-- Academy / Book / Wisdom Flame Motif inside 80% safe zone -->
  <g filter="url(#shadow)" transform="translate(256, 256) scale(0.95) translate(-256, -256)">
    <!-- Graduation Cap / Temple Top -->
    <path d="M 256 128 L 384 192 L 256 256 L 128 192 Z" fill="url(#amberGrad)" />
    <!-- Tassel hanging from cap -->
    <path d="M 352 208 L 352 268 C 352 278, 362 284, 370 284 C 378 284, 388 278, 388 268 L 388 224" fill="none" stroke="#fcd34d" stroke-width="5" stroke-linecap="round" />
    <circle cx="370" cy="286" r="6" fill="#fbbf24" />

    <!-- Open Book / Wings of Wisdom below cap -->
    <!-- Left Page -->
    <path d="M 246 290 C 206 270, 160 274, 132 284 C 122 288, 116 298, 116 310 L 116 384 C 116 396, 126 404, 138 402 C 166 394, 210 390, 246 410 Z" fill="#ffffff" opacity="0.95" />
    <!-- Right Page -->
    <path d="M 266 290 C 306 270, 352 274, 380 284 C 390 288, 396 298, 396 310 L 396 384 C 396 396, 386 404, 374 402 C 346 394, 302 390, 266 410 Z" fill="#ffffff" opacity="0.95" />
    
    <!-- Book Spine Divider -->
    <path d="M 256 280 L 256 418" stroke="url(#amberGrad)" stroke-width="6" stroke-linecap="round" />

    <!-- Central AI Sparkle / Star of Knowledge -->
    <path d="M 256 210 Q 256 240, 276 250 Q 256 260, 256 290 Q 256 260, 236 250 Q 256 240, 256 210 Z" fill="#ffffff" />
    <circle cx="256" cy="250" r="4" fill="#f59e0b" />
  </g>

  <!-- Mithila Academy Monogram & AI Badge -->
  <g transform="translate(256, 442)">
    <rect x="-80" y="-18" width="160" height="34" rx="17" fill="url(#amberGrad)" />
    <text x="0" y="6" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#090d16" letter-spacing="2">MITHILA AI</text>
  </g>
</svg>`;

// 2. Maskable Icon SVG (full bleed background, all essential graphics inside 75% center safe zone)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mbgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0b1120" />
    </linearGradient>
    <linearGradient id="mamberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="mshadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Full-bleed background with no rounded corners for Android maskable crop -->
  <rect width="512" height="512" fill="url(#mbgGrad)" />

  <!-- Inner safe zone decorative subtle ring -->
  <circle cx="256" cy="256" r="190" fill="none" stroke="url(#mamberGrad)" stroke-width="2" stroke-opacity="0.25" stroke-dasharray="8 6" />

  <!-- Graphic scaled precisely to fit in safe-zone (radius 200px) -->
  <g filter="url(#mshadow)" transform="translate(256, 240) scale(0.78) translate(-256, -256)">
    <!-- Graduation Cap / Temple Top -->
    <path d="M 256 128 L 384 192 L 256 256 L 128 192 Z" fill="url(#mamberGrad)" />
    <!-- Tassel hanging from cap -->
    <path d="M 352 208 L 352 268 C 352 278, 362 284, 370 284 C 378 284, 388 278, 388 268 L 388 224" fill="none" stroke="#fcd34d" stroke-width="5" stroke-linecap="round" />
    <circle cx="370" cy="286" r="6" fill="#fbbf24" />

    <!-- Open Book / Wings of Wisdom below cap -->
    <path d="M 246 290 C 206 270, 160 274, 132 284 C 122 288, 116 298, 116 310 L 116 384 C 116 396, 126 404, 138 402 C 166 394, 210 390, 246 410 Z" fill="#ffffff" opacity="0.95" />
    <path d="M 266 290 C 306 270, 352 274, 380 284 C 390 288, 396 298, 396 310 L 396 384 C 396 396, 386 404, 374 402 C 346 394, 302 390, 266 410 Z" fill="#ffffff" opacity="0.95" />
    
    <path d="M 256 280 L 256 418" stroke="url(#mamberGrad)" stroke-width="6" stroke-linecap="round" />

    <!-- Central AI Sparkle -->
    <path d="M 256 210 Q 256 240, 276 250 Q 256 260, 256 290 Q 256 260, 236 250 Q 256 240, 256 210 Z" fill="#ffffff" />
    <circle cx="256" cy="250" r="4" fill="#f59e0b" />

    <!-- Mithila Academy Monogram & AI Badge -->
    <g transform="translate(256, 448)">
      <rect x="-80" y="-18" width="160" height="34" rx="17" fill="url(#mamberGrad)" />
      <text x="0" y="6" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#090d16" letter-spacing="2">MITHILA AI</text>
    </g>
  </g>
</svg>`;

async function run() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), iconSvg);
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable.svg'), maskableSvg);

  const iconBuffer = Buffer.from(iconSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // Generate PNGs
  await sharp(iconBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  await sharp(iconBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  await sharp(iconBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  await sharp(iconBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon-48x48.png'));

  console.log('Successfully generated all PWA PNG icons!');
}

run().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
