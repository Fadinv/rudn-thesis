import {useRouter} from 'next/navigation';
import React, {useState} from 'react';
import {Fieldset, Input, Button, Box, Text, Heading} from '@chakra-ui/react';
import {Field} from '@frontend/components/ui/field';
import {useCurrentUserQuery, useLoginMutation} from '@frontend/generated/graphql-hooks';
import {PasswordInput} from '@frontend/components/ui/password-input';

const LoginForm = () => {
	const [email, setEmail] = useState('');
	const [waitingForRedirect, setWaitingForRedirect] = useState(false);
	const [password, setPassword] = useState('');
	const [login, {loading, error}] = useLoginMutation();
	const {refetch: refetchCurrentUser} = useCurrentUserQuery({fetchPolicy: 'cache-only'});
	const router = useRouter();

	const handleLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		try {
			const {data} = await login({variables: {email, password}});

			if (data?.login) {
				setWaitingForRedirect(true);
				console.log('redirect to home');
				router.push('/home');
				await refetchCurrentUser();
			}
		} catch (err) {
			console.error('Login error:', err);
		}
	};

	return (
		<Box w={'100%'} maxW="md" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
			<Heading size="lg" mb={4} textAlign="center">Войти</Heading>
			<form onSubmit={handleLogin}>
				<Fieldset.Root size="lg">
					<Field label="Email">
						<Input
							type="email"
							name="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Введите ваш email"
						/>
					</Field>
					<Field label="Пароль">
						<PasswordInput
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Введите пароль"
						/>
					</Field>
					{error && <Text color="red.500">Не удалось выполнить вход</Text>}
					<Button colorScheme="blue" width="full" type="submit" loading={loading || waitingForRedirect}>
						Далее
					</Button>
				</Fieldset.Root>
			</form>
		</Box>
	);
};

export default LoginForm;
