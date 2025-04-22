"use client"
import LoginForm from '@frontend/components/loginForm/loginForm';
import {useCurrentUserQuery} from '@frontend/generated/graphql-hooks';
import {useRouter} from 'next/navigation';
import React, {useState} from 'react';
import {Button, Center, Spinner, Text} from '@chakra-ui/react';
import {
	DialogRoot,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogCloseTrigger,
} from '@frontend/components/ui/dialog';

const LoginButton: React.FC = () => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const {data} = useCurrentUserQuery({fetchPolicy: 'cache-only'});

	return (
		<DialogRoot role="dialog" placement={'center'} open={open} onOpenChange={(e) => {
			if (data?.currentUser) {
				setLoading(true);
				router.push('/home');
			} else {
				setOpen(e.open);
			}
		}}>
			<DialogTrigger asChild>
				<Button colorScheme="teal" colorPalette={'teal'} variant="solid" size="md">
					Войти
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					{/*<DialogTitle>Вход в аккаунт</DialogTitle>*/}
				</DialogHeader>

				<DialogDescription>
					{loading && (
						<Center h="100vh">
							<Spinner size="xl" color="blue.500"/>
						</Center>
					)}
					<Text pl={8} pr={8} mb={4}>
						Введите логин и пароль, чтобы продолжить
					</Text>
					<LoginForm/>
				</DialogDescription>

				<DialogFooter>
					<DialogCloseTrigger/>
				</DialogFooter>
			</DialogContent>
		</DialogRoot>
	);
};

export default LoginButton;
