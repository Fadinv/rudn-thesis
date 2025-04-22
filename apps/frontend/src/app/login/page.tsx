'use client';

import {useRouter, useSearchParams} from 'next/navigation';
import React, {useEffect} from 'react';
import {Center, Spinner} from '@chakra-ui/react';
import {useLoginByTokenMutation} from '@frontend/generated/graphql-hooks';

const LoginPage = ({}: { children: React.ReactNode }) => {
	const [login] = useLoginByTokenMutation();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	useEffect(() => {
		if (!token) {
			router.push('/');
		} else {
			login({variables: {token}})
				.then(() => router.push('/home'))
				.catch(() => router.push('/'));
		}
	}, [login]);

	return (
		<Center h="100vh">
			<Spinner size="xl" color="blue.500"/>
		</Center>
	);
};

export default LoginPage;
