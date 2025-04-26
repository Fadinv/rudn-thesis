import ClientProviders from '@frontend/app/clientProviders';
import {Analytics} from '@vercel/analytics/next';
import React from 'react';

export default function RootLayout({children}: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
		</head>
		<body>
		<ClientProviders>{children}</ClientProviders>
		<Analytics/>
		</body>
		</html>
	);
}
