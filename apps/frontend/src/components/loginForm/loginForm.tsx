import React, {useState} from 'react';
import {Fieldset, Input, Button, Box, Heading, Text} from '@chakra-ui/react';
import {Field} from '@/components/ui/field';
import {useCurrentUserQuery, useLoginMutation} from '@/generated/graphql-hooks';

const LoginForm = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [login, {loading, error}] = useLoginMutation();
	const {refetch: refetchCurrentUser} = useCurrentUserQuery();

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
			<Heading size="lg" mb={4} textAlign="center">Login</Heading>
			{error && <Text color="red.500">Error logging in</Text>}
			<form onSubmit={handleLogin}>
				<Fieldset.Root size="lg">
					<Fieldset.Legend>Login Details</Fieldset.Legend>
					<Field label="Email">
						<Input
							type="email"
							name="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
						/>
					</Field>
					<Field label="Password">
						<Input
							type="password"
							name="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
						/>
					</Field>
					<Button colorScheme="blue" width="full" type="submit" loading={loading}>
						Login
					</Button>
				</Fieldset.Root>
			</form>
		</Box>
	);
};

export default LoginForm;
