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
	DialogDescription,
	DialogFooter,
	DialogCloseTrigger,
} from '@frontend/components/ui/dialog';

interface LoginButtonProps {
	doNotRedirect?: boolean;
	size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const LoginButton: React.FC<LoginButtonProps> = ({doNotRedirect, size}) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const {data} = useCurrentUserQuery({fetchPolicy: 'cache-only'});

	return (
		<DialogRoot role="dialog" placement={'center'} open={open} onOpenChange={(e) => {
			if (data?.currentUser) {
				setLoading(true);
				if (!doNotRedirect) router.push('/home');
			} else {
				setOpen(e.open);
			}
		}}>
			<DialogTrigger asChild>
				<Button colorScheme="blue" colorPalette={'blue'} variant="solid" size={size ?? 'md'}>
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
