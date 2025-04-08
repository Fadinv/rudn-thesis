import {useCurrentUserQuery, useLogoutMutation} from '@/generated/graphql-hooks';
import {useApolloClient} from '@apollo/client';
import {Button} from '@chakra-ui/react';
import React, {MouseEventHandler} from 'react';

export const Logout = () => {
	const client = useApolloClient();
	const [logout, {loading}] = useLogoutMutation();
	const {refetch: refetchCurrentUser} = useCurrentUserQuery();

	const handleLogout: MouseEventHandler<HTMLButtonElement> = async (e) => {
		e.preventDefault();
		try {
			await logout();
			await client.resetStore();
			await refetchCurrentUser();
		} catch (err) {
			console.error('Login error:', err);
		}
	};

	return (
		<Button colorPalette="red" onClick={handleLogout} loading={loading}>
			Logout
		</Button>
	);
};