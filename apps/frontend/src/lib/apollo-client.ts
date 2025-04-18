import {ApolloClient, InMemoryCache, from, HttpLink} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {logoutOutOfSession, throttledLogoutOfSessionToast} from '@frontend/lib/logoutOutOfSession';

const errorLink = onError(({graphQLErrors, networkError}) => {
	if (graphQLErrors) {
		for (const err of graphQLErrors) {
			if (err.extensions?.code === 'UNAUTHENTICATED') {
				console.warn('❌ GraphQL UNAUTHENTICATED (401), выполняем logout...');
				void logoutOutOfSession();
				throttledLogoutOfSessionToast();
				break;
			}
		}
	}

	if (networkError) {
		console.warn('❌ Network error:', networkError);
	}
});

const httpLink = new HttpLink({
	uri: process.env.NEXT_PUBLIC_API_URL,
	credentials: 'include',
});

export const client = new ApolloClient({
	link: from([errorLink, httpLink]),
	cache: new InMemoryCache(),
});