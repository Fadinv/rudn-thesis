import path from 'path';
import type { NextConfig } from 'next';

process.chdir(__dirname);

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['@chakra-ui/react'],
	},
	typescript: {
		tsconfigPath: './tsconfig.json',
	},
	webpack(config) {
		// Явно задаём одну копию React и ReactDOM
		config.resolve.alias['react'] = path.resolve(__dirname, 'node_modules', 'react');
		config.resolve.alias['react-dom'] = path.resolve(__dirname, 'node_modules', 'react-dom');
		config.resolve.alias['@'] = path.resolve(__dirname, 'src');
		return config;
	},
};

export default nextConfig;
