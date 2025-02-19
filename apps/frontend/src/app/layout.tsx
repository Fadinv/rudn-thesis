'use client';

import MainLayout from '@/components/mainLayout/mainLayout';
import {ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';
import {Provider} from '@/components/ui/provider';
import React from 'react';

const client = new ApolloClient({
	uri: 'http://localhost:4000/graphql', // Замени на актуальный адрес
	cache: new InMemoryCache(),
	credentials: 'include', // 🔥 ОБЯЗАТЕЛЬНО, иначе куки не передадутся!
});

export default function RootLayout({children}: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body>
		<Provider>
			<ApolloProvider client={client}>
				<MainLayout>
					{children}
				</MainLayout>
			</ApolloProvider>
		</Provider>
		</body>
		</html>
	);
}
