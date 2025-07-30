import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// إنشاء أيقونة بسيطة باستخدام Canvas أو SVG
function createIcon(size) {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad1)"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">CP</text>
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.1}" fill="#10b981"/>
</svg>`;

  return svg;
}

// أحجام الأيقونات المطلوبة
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// إنشاء مجلد الأيقونات إذا لم يكن موجوداً
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// إنشاء الأيقونات
sizes.forEach(size => {
  const iconPath = path.join(publicDir, `icon-${size}x${size}.png`);
  const svg = createIcon(size);
  
  // حفظ كـ SVG (يمكن تحويلها لـ PNG لاحقاً)
  const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  
  console.log(`✅ تم إنشاء الأيقونة: icon-${size}x${size}.svg`);
});

console.log('\n🎉 تم إنشاء جميع الأيقونات بنجاح!');
console.log('💡 يمكنك تحويل ملفات SVG إلى PNG باستخدام أدوات مثل:');
console.log('   - https://convertio.co/svg-png/');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - أو استخدام ImageMagick: convert icon.svg icon.png');