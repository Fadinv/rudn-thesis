'use client';
import {useApolloClient} from '@apollo/client';
import {
	Menu,
	IconButton,
	Icon,
	Portal,
} from '@chakra-ui/react';
import {CurrentUserDocument, useLogoutMutation} from '@frontend/generated/graphql-hooks';
import React, {MouseEventHandler, useEffect} from 'react';
import {FaUserCircle, FaQuestionCircle, FaSignOutAlt} from 'react-icons/fa';
import {useRouter} from 'next/navigation';

export const ProfileMenu = () => {
	const router = useRouter();

	const client = useApolloClient();
	const [logout, {loading}] = useLogoutMutation();

	useEffect(() => {
		router.prefetch('/faq');
		// router.prefetch('/feedback');
		// router.prefetch('/support');
	}, []);

	const handleLogout: MouseEventHandler<HTMLDivElement> = async (e) => {
		e.preventDefault();
		try {
			router.push('/');
			client.writeQuery({
				query: CurrentUserDocument,
				data: {currentUser: null},
			});
			await logout();
			// Дать React перерендерить компоненты, чтобы не вызывать GetUserPortfolios
			await new Promise((resolve) => setTimeout(resolve, 30));
			// В худшем случае мы покажем выпадашку "Сессия завершена"
			await client.resetStore();
		} catch (err) {
			console.error('Login error:', err);
		}
	};

	return (
		<Menu.Root>
			<Menu.Trigger
				onClick={(e) => e.stopPropagation()}
				asChild
			>
				<IconButton
					variant="ghost"
					size="sm"
					aria-label="Профиль"
				>
					<Icon as={FaUserCircle} fontSize="xs"/>
				</IconButton>
			</Menu.Trigger>
			<Portal>
				<Menu.Positioner>
					<Menu.Content>
						<Menu.Item
							value="faq"
							onClick={() => router.push('/faq')}
						>
							<FaQuestionCircle/>
							Как это работает
						</Menu.Item>
						{/*<Menu.Item*/}
						{/*	value="feedback"*/}
						{/*	onClick={() => router.push('/feedback')}*/}
						{/*>*/}
						{/*	<FaComment/>*/}
						{/*	Оставить отзыв*/}
						{/*</Menu.Item>*/}
						{/*<Menu.Item*/}
						{/*	value="support"*/}
						{/*	onClick={() => router.push('/support')}*/}
						{/*>*/}
						{/*	<FaDonate/>*/}
						{/*	Поддержать проект*/}
						{/*</Menu.Item>*/}
						<Menu.Item
							value="logout"
							as="div"
							disabled={loading}
							color="fg.error"
							_hover={{bg: 'bg.error', color: 'fg.error'}}
							onClick={handleLogout}
						>
							<FaSignOutAlt/>
							Выйти...
						</Menu.Item>
					</Menu.Content>
				</Menu.Positioner>
			</Portal>
		</Menu.Root>
	);
};
