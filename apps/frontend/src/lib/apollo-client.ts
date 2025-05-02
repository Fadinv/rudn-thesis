import {ApolloClient, InMemoryCache, from, HttpLink} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {
	logoutOutOfSession,
	throttledInvalidTokenToast,
	throttledLogoutOfSessionToast,
} from '@frontend/lib/logoutOutOfSession';

const errorLink = onError(({graphQLErrors, networkError}) => {
	if (graphQLErrors) {
		for (const err of graphQLErrors) {
			if (err.extensions?.code === 'UNAUTHENTICATED') {
				console.warn('❌ GraphQL UNAUTHENTICATED, выполняем logout...');
				void logoutOutOfSession();
				throttledLogoutOfSessionToast();
				break;
			}
			if (err.extensions?.code === 'INVALID_TOKEN') {
				console.warn('❌ GraphQL INVALID_TOKEN, выполняем logout...');
				void logoutOutOfSession();
				throttledInvalidTokenToast();
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
	cache: new InMemoryCache({
		typePolicies: {
			GetUserPortfoliosResponse: {
				fields: {
					items: {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						merge(existing: any[], incoming: any[], { readField, mergeObjects }) {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							const merged: any[] = existing ? existing.slice(0) : [];
							const authorNameToIndex: Record<string, number> = Object.create(null);
							if (existing) {
								existing.forEach((portfolio, index) => {
									const id = readField<string>("id", portfolio);
									if (!id) return;
									authorNameToIndex[id] = index;
								});
							}
							incoming.forEach(portfolio => {
								const id = readField<string>("id", portfolio);
								if (!id) return;
								const index = authorNameToIndex[id];
								if (typeof index === "number") {
									// Merge the new author data with the existing author data.
									merged[index] = mergeObjects(merged[index], portfolio);
								} else {
									// First time we've seen this author in this array.
									authorNameToIndex[id] = merged.length;
									merged.push(portfolio);
								}
							});
							return merged;
						},
					},
				},
			},
		},
	}),
});