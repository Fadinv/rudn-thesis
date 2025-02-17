'use client';

import Home from '@/components/home/home';
import LoginForm from '@/components/loginForm/loginForm';
import {gql, useQuery} from '@apollo/client';
import {Spinner, Center} from '@chakra-ui/react';

const GET_CURRENT_USER = gql`
    query GetCurrentUser {
        currentUser {
            id
            email
        }
    }
`;

export default function IndexPage() {
	const {data, loading, error} = useQuery(GET_CURRENT_USER);

	if (loading) {
		return (
			<Center h="100vh">
				<Spinner size="xl" color="blue.500"/>
			</Center>
		);
	}
	if (error) return <p>Error: {error.message}</p>;

	return (
		<div>
			{data?.currentUser ? (
				<Home/>
			) : (
				<Center h="100vh">
					<LoginForm/>
				</Center>
			)}
		</div>
	);
}
