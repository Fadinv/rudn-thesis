import {ApolloClient, InMemoryCache} from '@apollo/client';

export const client = new ApolloClient({
	uri: 'http://localhost:4000/graphql', // Замени на актуальный адрес
	cache: new InMemoryCache(),
	credentials: 'include', // 🔥 ОБЯЗАТЕЛЬНО, иначе куки не передадутся!
});