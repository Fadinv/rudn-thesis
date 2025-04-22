import {ServerErrorFallback} from '@frontend/components/mainLayout/serverErrorFallback';
import {useRouter} from 'next/navigation';
import React, {useEffect} from 'react';
import Header from '@frontend/components/header/header';
import LoginForm from '@frontend/components/loginForm/loginForm';
import {ColorModeProvider, useColorMode} from '@frontend/components/ui/color-mode';
import {useCurrentUserQuery} from '@frontend/generated/graphql-hooks';
import {Spinner, Center, Theme, defaultSystem, ChakraProvider, Flex} from '@chakra-ui/react';

const Layout = ({children}: { children: React.ReactNode }) => {
	const {data, loading, error, called} = useCurrentUserQuery();
	const {colorMode} = useColorMode();
	const router = useRouter();

	useEffect(() => {
		if (called && !loading && !data?.currentUser) router.push('/');
	}, [data, loading, called]);

	const isDark = colorMode === 'dark';
	const colorPalette = isDark ? 'teal' : undefined;

	if (loading) {
		return (
			<Center h="100vh">
				<Spinner size="xl" color="blue.500"/>
			</Center>
		);
	}

	if (error) return <ServerErrorFallback/>;

	if (!data?.currentUser) {
		return (
			<Theme appearance={colorMode} colorPalette={colorPalette}>
				<Center h="100vh">
					<LoginForm/>
				</Center>
			</Theme>
		);
	}
	return (
		<ChakraProvider value={defaultSystem}>
			<ColorModeProvider>
				<Theme appearance={colorMode} colorPalette={colorPalette}>
					<Flex overflow={'hidden'} direction={'column'} w="100vw" h="100vh" p={4}>
						<Header/>
						<Flex overflow={'hidden'} p={2} flex={1}>
							{children}
						</Flex>
					</Flex>
				</Theme>
			</ColorModeProvider>
		</ChakraProvider>
	);
};

export default Layout;
