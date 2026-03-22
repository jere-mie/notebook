import { Resvg } from '@resvg/resvg-js';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(resolve(__dirname, '../public/favicon.svg'), 'utf8');

mkdirSync(resolve(__dirname, '../public/icons'), { recursive: true });

for (const size of [192, 512]) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  writeFileSync(resolve(__dirname, `../public/icons/icon-${size}x${size}.png`), png);
  console.log(`Generated icon-${size}x${size}.png`);
}
