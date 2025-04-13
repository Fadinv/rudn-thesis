'use client';

import React from 'react';
import {ApolloProvider} from '@apollo/client';
import {Provider} from '@frontend/components/ui/provider';
import MainLayout from '@frontend/components/mainLayout/mainLayout';
import {client} from '@frontend/lib/apollo-client';

export default function ClientProviders({children}: { children: React.ReactNode }) {
	return (
		<Provider>
			<ApolloProvider client={client}>
				<MainLayout>{children}</MainLayout>
			</ApolloProvider>
		</Provider>
	);
}
