import {useApolloClient} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Fieldset, Input, Button, Box, Heading, Text} from '@chakra-ui/react';
import {Field} from '@frontend/components/ui/field';
import {useCurrentUserQuery, useLoginMutation} from '@frontend/generated/graphql-hooks';

const LoginForm = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [login, {loading, error}] = useLoginMutation();
	const {refetch: refetchCurrentUser} = useCurrentUserQuery({fetchPolicy: 'cache-only'});

	const handleLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		try {
			const {data} = await login({variables: {email, password}});

			if (data?.login) {
				await refetchCurrentUser();
			}
		} catch (err) {
			console.error('Login error:', err);
		}
	};

	return (
		<Box maxW="md" minW="md" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
			<Heading size="lg" mb={4} textAlign="center">Войти</Heading>
			<form onSubmit={handleLogin}>
				<Fieldset.Root size="lg">
					<Field label="Email">
						<Input
							type="email"
							name="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
						/>
					</Field>
					<Field label="Пароль">
						<Input
							type="password"
							name="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
						/>
					</Field>
					{error && <Text color="red.500">Не удалось выполнить вход</Text>}
					<Button colorScheme="blue" width="full" type="submit" loading={loading}>
						Login
					</Button>
				</Fieldset.Root>
			</form>
		</Box>
	);
};

export default LoginForm;
