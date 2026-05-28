import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateICO() {
  const svg = fs.readFileSync(path.join(__dirname, '../public/logo.svg'), 'utf-8');
  const sizes = [16, 32, 48, 64];
  const pngBuffers = [];

  for (const size of sizes) {
    const pngBuffer = await sharp(Buffer.from(svg))
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push({ size, buffer: pngBuffer });
  }

  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(sizes.length, 4);

  const dirSize = sizes.length * 16;
  const ico = Buffer.alloc(6 + dirSize + pngBuffers.reduce((sum, p) => sum + p.buffer.length, 0));
  icoHeader.copy(ico, 0);

  let offset = 6 + dirSize;
  pngBuffers.forEach((entry, i) => {
    const entrySize = entry.buffer.length;
    const icoDirEntry = Buffer.alloc(16);
    icoDirEntry.writeUInt8(entry.size === 256 ? 0 : entry.size, 0);
    icoDirEntry.writeUInt8(entry.size === 256 ? 0 : entry.size, 1);
    icoDirEntry.writeUInt8(0, 2);
    icoDirEntry.writeUInt8(0, 3);
    icoDirEntry.writeUInt16LE(1, 4);
    icoDirEntry.writeUInt16LE(32, 6);
    icoDirEntry.writeUInt32LE(entrySize, 8);
    icoDirEntry.writeUInt32LE(offset, 12);
    icoDirEntry.copy(ico, 6 + i * 16);
    entry.buffer.copy(ico, offset);
    offset += entrySize;
  });

  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), ico);
  console.log('favicon.ico generated successfully');
}

generateICO().catch(console.error);