import {Logout} from '@/components/home/logout/logout';
import React from 'react';
import {Box, Flex, Heading, Text} from '@chakra-ui/react';

const Home = () => {
	return (
		<Box w="100vw" h="100vh" p={4}>
			<Flex justify="space-between" align="center" mb={6}>
				<Heading size="lg">Home</Heading>
				<Logout/>
			</Flex>
			<Text fontSize="xl" textAlign="center" color="gray.500">
				Находится в разработке
			</Text>
		</Box>
	);
};

export default Home;