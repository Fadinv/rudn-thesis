import ClientProviders from '@frontend/app/clientProviders';
import {Analytics} from '@vercel/analytics/next';
import React from 'react';

export const metadata = {
	title: 'Portfolio Analyzer',
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon.ico',
		apple: '/icons/icon-192.png',
	},
	viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
	// manifest: '/manifest.json',
};

export default function RootLayout({children}: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body>
		<ClientProviders>{children}</ClientProviders>
		<Analytics/>
		</body>
		</html>
	);
}
