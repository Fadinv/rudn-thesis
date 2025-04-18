import {CurrentUserDocument, useLogoutMutation} from '@frontend/generated/graphql-hooks';
import {useApolloClient} from '@apollo/client';
import {Button} from '@chakra-ui/react';
import React, {MouseEventHandler} from 'react';

export const Logout = () => {
	const client = useApolloClient();
	const [logout, {loading}] = useLogoutMutation();

	const handleLogout: MouseEventHandler<HTMLButtonElement> = async (e) => {
		e.preventDefault();
		try {
			await logout();
			client.writeQuery({
				query: CurrentUserDocument,
				data: {currentUser: null},
			});
			// Дать React перерендерить компоненты, чтобы не вызывать GetUserPortfolios
			await new Promise((resolve) => setTimeout(resolve, 30));
			// В худшем случае мы покажем выпадашку "Сессия завершена"
			await client.resetStore();
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