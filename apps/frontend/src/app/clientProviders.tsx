'use client';

import {Toaster} from '@frontend/components/ui/toaster';
import React from 'react';
import {ApolloProvider} from '@apollo/client';
import {Provider} from '@frontend/components/ui/provider';
import {client} from '@frontend/lib/apollo-client';

export default function ClientProviders({children}: { children: React.ReactNode }) {
	return (
		<Provider>
			<Toaster/>
			<ApolloProvider client={client}>
				{children}
			</ApolloProvider>
		</Provider>
	);
}
