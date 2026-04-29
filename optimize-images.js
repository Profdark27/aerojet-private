const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const artifactsDir = 'C:\\Users\\Corrado\\.gemini\\antigravity\\brain\\786c238a-42ce-48bc-85ed-a819883b3009';
const outDir = path.join(__dirname, 'public', 'images');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Map logical names to their actual generated filenames
// Some images failed due to quota, we'll map them to duplicates
const requiredImages = [
  'jet-phenom-300',
  'jet-citation-xls',
  'jet-challenger-350',
  'jet-falcon-2000',
  'jet-falcon-7x',
  'jet-global-6000',
  'jet-gulfstream-g650',
  'jet-gulfstream-g700',
  'cabin-wide',
  'cabin-night',
  'cabin-dining',
  'cabin-lounge',
  'service-catering',
  'service-champagne',
  'service-meal',
  'service-flight-attendant',
  'transfer-black-car',
  'transfer-driver',
  'terminal-private',
  'boarding-luxury'
];

const generatedPrefixes = {
  'jet-phenom-300': 'jet_phenom_300',
  'jet-citation-xls': 'jet_citation_xls',
  'jet-challenger-350': 'jet_challenger_350',
  'jet-falcon-2000': 'jet_falcon_2000',
  'jet-falcon-7x': 'jet_falcon_7x',
  'jet-global-6000': 'jet_global_6000',
  'jet-gulfstream-g650': 'jet_gulfstream_g650',
  'jet-gulfstream-g700': 'jet_gulfstream_g700',
  'cabin-wide': 'cabin_wide',
  'cabin-night': 'cabin_night',
  'cabin-dining': 'cabin_dining',
  'cabin-lounge': 'cabin_lounge',
  'service-catering': 'service_catering',
  'service-champagne': 'service_champagne',
  'service-meal': 'service_meal',
  'service-flight-attendant': 'service_flight_attendant',
  'transfer-black-car': 'transfer_black_car',
  // Fallbacks for quota exhausted
  'transfer-driver': 'transfer_black_car',
  'terminal-private': 'cabin_lounge',
  'boarding-luxury': 'service_flight_attendant'
};

async function optimize() {
  const files = fs.readdirSync(artifactsDir);
  let totalSaved = 0;
  let totalBytes = 0;

  for (const requiredName of requiredImages) {
    const prefix = generatedPrefixes[requiredName];
    // Find the newest file matching the prefix
    const matchingFiles = files.filter(f => f.startsWith(prefix) && (f.endsWith('.png') || f.endsWith('.webp'))).sort();
    
    if (matchingFiles.length === 0) {
      console.warn(`No source image found for ${requiredName} (prefix ${prefix})`);
      continue;
    }

    // Use the latest one
    const sourceFile = path.join(artifactsDir, matchingFiles[matchingFiles.length - 1]);
    const outFile = path.join(outDir, `${requiredName}.webp`);

    try {
      const info = await sharp(sourceFile)
        .resize({ width: 1200, height: 750, fit: 'cover', position: 'center' })
        .webp({ quality: 80, effort: 6 })
        .toFile(outFile);
      
      console.log(`✅ ${requiredName}.webp - ${(info.size / 1024).toFixed(1)} KB`);
      totalSaved++;
      totalBytes += info.size;
    } catch (err) {
      console.error(`❌ Failed to process ${requiredName}:`, err);
    }
  }

  console.log(`\n🎉 Processed ${totalSaved} images.`);
  console.log(`📦 Total Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

optimize();
