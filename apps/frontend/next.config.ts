import fs from 'fs';
import path from 'path';
import type {NextConfig} from 'next';

const isProd = process.env.NODE_ENV === 'production';
const robotsFileName = isProd ? 'robots.prod.txt' : 'robots.dev.txt';

const sourcePath = path.resolve(__dirname, 'public', robotsFileName);
const destPath = path.resolve(__dirname, 'public', 'robots.txt');

try {
	fs.copyFileSync(sourcePath, destPath);
	console.log(`[robots.txt] Copied ${robotsFileName} → robots.txt`);
} catch (err) {
	console.warn(`[robots.txt] Failed to copy: ${err}`);
}

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['@chakra-ui/react'],
	},
};

export default nextConfig;
