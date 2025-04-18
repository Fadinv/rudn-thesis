import {Box, Button, Heading, Text, VStack, Icon} from '@chakra-ui/react';
import {useColorMode} from '@frontend/components/ui/color-mode';
import {FaExclamationTriangle} from 'react-icons/fa';

export const ServerErrorFallback = () => {
	const {colorMode} = useColorMode();
	const isDark = colorMode === 'dark';

	const colorPalette = isDark ? 'teal' : undefined;

	return (
		<Box
			minH="100vh"
			display="flex"
			alignItems="center"
			justifyContent="center"
			bg={isDark ? 'gray.900' : 'gray.50'}
			color={isDark ? 'gray.200' : 'gray.800'}
			px={4}
		>
			<VStack gap={6} textAlign="center">
				<Icon as={FaExclamationTriangle} boxSize={12} color="orange.400"/>
				<Heading size="lg">Сервер временно недоступен</Heading>
				<Text>
					Возможно, происходит обновление или технические работы.
					<br/>
					Попробуйте обновить страницу позже.
				</Text>
				<Button colorPalette={colorPalette} onClick={() => window.location.reload()} variant="solid">
					Обновить страницу
				</Button>
			</VStack>
		</Box>
	);
};
