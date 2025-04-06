import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['@chakra-ui/react'],
	},
	typescript: {
		// Абсолютный путь до tsconfig
		tsconfigPath: path.resolve(__dirname, 'tsconfig.json'),
	},
	webpack(config) {
		config.resolve.alias['@'] = path.resolve(__dirname, 'src');
		return config;
	},
};

export default nextConfig;
