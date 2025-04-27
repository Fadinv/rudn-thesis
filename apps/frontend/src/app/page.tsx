'use client';
import {ServerErrorFallback} from '@frontend/components/mainLayout/serverErrorFallback';
import {useCurrentUserQuery} from '@frontend/generated/graphql-hooks';
import React from 'react';
import {
	Box, Heading, Text, VStack, IconButton, Container, Link, SimpleGrid, Flex, Separator, Center, Spinner,
} from '@chakra-ui/react';
import {FaTelegramPlane, FaChartLine, FaRobot, FaLock} from 'react-icons/fa';
import LoginButton from '@frontend/components/loginButton/loginButton';
import {IconType} from 'react-icons/lib';

export default function HomePage() {
	const {error, loading} = useCurrentUserQuery({fetchPolicy: 'network-only'});

	if (loading) {
		return (
			<Center h="100vh">
				<Spinner size="xl" color="blue.500"/>
			</Center>
		);
	}

	if (error) {
		return <ServerErrorFallback/>;
	}
	return (
		<>
			{/* Hero */}
			<Box
				bgImage="url('/layout-min.png')"
				bgSize="cover"
				bgPos="center"
				bgRepeat="no-repeat"
				py={{base: 24, md: 48}}
			>
				<Container maxW="container.lg" py={{base: 24, md: 48}}>
					<VStack
						gap={6}
						textAlign="center"
						bg={'rgba(160, 185, 200, 0.75)'}
						backdropFilter="blur(8px)"
						p={8}
						borderRadius="xl"
					>
						<Heading color={'black'} fontSize="4xl">Portfolio Analyzer</Heading>
						<Text fontSize="xl" fontWeight={'600'} maxW="600px" color={'black'}>
							Умный анализ инвестиционного портфеля по Марковицу, GBM-прогноз и поддержка MOEX.
						</Text>
						<LoginButton/>
					</VStack>
				</Container>
			</Box>

			<Separator maxW={'7xl'} m={'0 auto'}/>

			{/* Telegram */}
			<Container borderRadius="xl" mt={8} mb={8} maxW="container.lg"
			           py={{base: 12, md: 16}}>
				<VStack gap={2} textAlign="center">
					<Text fontSize="md" fontWeight="medium">
						Приложение активно разрабатывается
					</Text>
					<Text fontSize="sm" maxW="400px" color={'gray.500'}>
						Вы можете запросить доступ, написав мне в Telegram. Буду рад обратной связи!
					</Text>
					<Link href="https://t.me/vfadrik" target={'_blank'}>
						<IconButton
							aria-label="Написать в Telegram"
							variant="solid"
							colorPalette="blue"
							size="xs"
							rounded="full"
						>
							<FaTelegramPlane/>
						</IconButton>
					</Link>
				</VStack>
			</Container>

			<Separator maxW={'7xl'} m={'0 auto'}/>

			{/* О приложении */}
			<Container py={{base: 12, md: 16}}>
				<VStack gap={4} textAlign="center">
					<Heading fontSize="2xl">Что делает приложение?</Heading>
					<Text fontSize="md" maxW="700px">
						Portfolio Analyzer помогает инвесторам принимать взвешенные решения, анализируя риски и
						прогнозируя доходность с помощью финансовых моделей. Поддерживает мультивалютность и работает с
						MOEX и NASDAQ.
					</Text>
				</VStack>
			</Container>

			<Separator maxW={'7xl'} m={'0 auto'}/>

			{/* Преимущества */}
			<Container borderRadius="xl" mt={8} mb={8} maxW="container.lg"
			           py={{base: 12, md: 16}}>
				<VStack gap={4} textAlign="center">
					<Heading fontSize="2xl">Как это работает?</Heading>
				</VStack>
				<SimpleGrid columns={{base: 1, md: 3}} gap={10} mt={8}>
					<Feature icon={FaChartLine} title="Анализ по Марковицу"
					         description="Оцениваем риск и доходность на основе исторических данных."/>
					<Feature icon={FaRobot} title="GBM-прогноз"
					         description="Моделируем будущее поведение портфеля с учетом волатильности."/>
					<Feature icon={FaLock} title="Приватность данных"
					         description="Ваши данные обрабатываются локально и безопасно."/>
				</SimpleGrid>
			</Container>

			<Separator maxW={'7xl'} m={'0 auto'}/>

			{/* Кому подойдёт */}
			<Container maxW="container.lg" py={{base: 12, md: 16}}>
				<VStack gap={4} textAlign="center">
					<Heading fontSize="2xl">Кому подойдёт?</Heading>
					<Text fontSize="md" maxW="700px">
						Portfolio Analyzer подойдёт для инвесторов, которым важно понимать риски и перспективы своих
						вложений.
					</Text>
				</VStack>
				<SimpleGrid columns={{base: 1, md: 3}} gap={8} mt={8}>
					<UserCard icon={FaChartLine} label="Частным инвесторам"/>
					<UserCard icon={FaRobot} label="Алго-трейдерам"/>
					<UserCard icon={FaLock} label="Аналитикам и студентам"/>
				</SimpleGrid>
			</Container>

			<Separator maxW={'7xl'} m={'0 auto'}/>

			{/* Футер */}
			<Box as="footer" py={8} textAlign="center" fontSize="sm" color="gray.500">
				© {new Date().getFullYear()} Portfolio Analyzer
			</Box>
		</>
	);
}

const Feature = ({icon: Icon, title, description}: { icon: IconType; title: string; description: string }) => (
	<Flex direction="column" align="center" textAlign="center" px={4}>
		<Icon size={32}/>
		<Text fontWeight="bold" mt={4}>{title}</Text>
		<Text fontSize="sm" mt={2}>{description}</Text>
	</Flex>
);

const UserCard = ({icon: Icon, label}: { icon: IconType; label: string }) => (
	<Flex direction="column" align="center" gap={2}>
		<Icon size={32}/>
		<Text fontWeight="medium">{label}</Text>
	</Flex>
);
