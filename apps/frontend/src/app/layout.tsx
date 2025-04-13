import ClientProviders from '@frontend/app/clientProviders';
import React from 'react';

export default function RootLayout({children}: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body>
		<ClientProviders>{children}</ClientProviders>
		</body>
		</html>
	);
}
