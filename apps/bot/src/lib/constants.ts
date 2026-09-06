import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');