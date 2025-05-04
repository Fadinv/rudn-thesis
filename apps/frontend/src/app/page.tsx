import Header from '@frontend/components/header/header';
import React from 'react';
import {
	Box,
	Heading,
	Text,
	VStack,
	Container,
	Link,
	SimpleGrid,
	Flex,
	Separator,
	Button,
	Image,
} from '@chakra-ui/react';
import {FaTelegramPlane} from 'react-icons/fa';
import LoginButton from '@frontend/components/loginButton/loginButton';

export const metadata = {
	title: 'Анализ инвестиционного портфеля — Portfolio Analyzer',
	description: 'Онлайн-инструмент для анализа инвестиционных портфелей. Расчет структуры, прогноз стоимости, поддержка MOEX и NASDAQ.',
	openGraph: {
		title: 'Portfolio Analyzer',
		description: 'Анализируй свои инвестиции с умом',
		url: 'https://portfolioanalyzer.ru',
		siteName: 'Portfolio Analyzer',
		images: [
			{
				url: 'https://portfolioanalyzer.ru/og-cover.png',
				width: 1200,
				height: 630,
				alt: 'Portfolio Analyzer',
			},
		],
		locale: 'ru_RU',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Portfolio Analyzer',
		description: 'Анализируй свои инвестиции с умом',
		images: ['https://portfolioanalyzer.ru/og-cover.png'],
	},
	// robots: {
	// 	index: true,
	// 	follow: true,
	// },
};

export default function HomePage() {
	return (
		<>
			<Flex
				p={4}
				justify="flex-end"
				height={'96px'}
			>
				<Header/>
			</Flex>
			{/* Hero */}
			<Box py={{base: 24, md: 48}}>
				<Container maxW="container.lg">
					<SimpleGrid columns={{base: 1, md: 2}} gap={12} alignItems="center">
						<VStack gap={6} textAlign={{base: 'center', md: 'left'}}>
							<Heading fontSize="4xl">Portfolio Analyzer</Heading>
							<Text textAlign="center" fontSize="xl" fontWeight="600" maxW="600px" color="gray.500">
								Умный анализ инвестиционного портфеля по Марковицу и GBM-прогноз.
							</Text>
							<LoginButton/>
						</VStack>
						<Image src="/illustrations/business-analytics.svg" alt="Анализ"/>
					</SimpleGrid>
				</Container>
			</Box>

			<Separator maxW={'7xl'} m={'0 auto'}/>

			{/* Telegram */}
			<Container borderRadius="xl" mt={8} mb={8} maxW="container.lg" py={{base: 12, md: 16}}>
				<VStack gap={8} textAlign="center">
					{/* Доступ через бота */}
					<VStack gap={3}>
						<Text fontSize="md" fontWeight="medium">
							Получите доступ к сервису через Telegram-бота за пару кликов.
						</Text>
						<Link href="https://t.me/portfolio_invite_bot" target="_blank">
							<Button size="sm" colorPalette="blue" variant="solid">
								<FaTelegramPlane/>
								Получить доступ через бота
							</Button>
						</Link>
					</VStack>

					{/* Обратная связь */}
					<VStack gap={3}>
						<Text fontSize="sm" maxW="480px" color="gray.500">
							Есть идеи, вопросы или пожелания? Напишите мне в Telegram. Буду рад обратной связи!
						</Text>
						<Link href="https://t.me/vfadrik" target="_blank">
							<Button size="sm" variant="ghost" colorPalette="blue">
								<FaTelegramPlane/>
								Я в Telegram
							</Button>
						</Link>
					</VStack>
				</VStack>
			</Container>

			<Separator maxW={'7xl'} m={'0 auto'}/>

			{/* Что делает */}
			<Container py={{base: 12, md: 16}}>
				<SimpleGrid columns={{base: 1, md: 2}} gap={12} alignItems="center">
					<Image src="/illustrations/success_factors.svg" alt="Функции"/>
					<VStack gap={4} textAlign="left">
						<Heading fontSize="2xl">Что делает приложение?</Heading>
						<Text textAlign="center" fontSize="md" maxW="700px">
							Portfolio Analyzer — независимый сервис, который анализирует риски и прогнозирует доходность
							инвестиционного портфеля на основе исторических данных. Поддерживает мультивалютность и
							работает с активами, представленными на MOEX и NASDAQ.
						</Text>
					</VStack>
				</SimpleGrid>
			</Container>

			<Separator maxW={'7xl'} m={'0 auto'}/>

			{/* Преимущества */}
			<Container borderRadius="xl" mt={8} mb={8} maxW="container.lg" py={{base: 12, md: 16}}>
				<VStack gap={4} textAlign="center">
					<Heading fontSize="2xl">Как это работает?</Heading>
				</VStack>
				<SimpleGrid columns={{base: 1, md: 3}} gap={10} mt={8}>
					<Feature
						image="/illustrations/investing.svg"
						title="Анализ по Марковицу"
						description="Оцениваем риск и доходность на основе исторических данных."
					/>
					<Feature
						image="/illustrations/predictive-analytics.svg"
						title="GBM-прогноз"
						description="Моделируем будущее поведение портфеля с учетом волатильности."
					/>
					<Feature
						image="/illustrations/online-banking.svg"
						title="Приватность данных"
						description="Ваши данные обрабатываются локально и безопасно."
					/>
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
					<UserCard image="/illustrations/personal-finance.svg" label="Частным инвесторам"/>
					<UserCard image="/illustrations/bull-market.svg" label="Алго-трейдерам"/>
					<UserCard image="/illustrations/growth-chart.svg" label="Аналитикам и студентам"/>
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

const Feature = ({image, title, description}: { image: string; title: string; description: string }) => (
	<Flex direction="column" align="center" textAlign="center" px={4}>
		<Image src={image} alt={title} h="100px"/>
		<Text fontWeight="bold" mt={4}>{title}</Text>
		<Text fontSize="sm" mt={2}>{description}</Text>
	</Flex>
);

const UserCard = ({image, label}: { image: string; label: string }) => (
	<Flex direction="column" align="center" gap={2}>
		<Image src={image} alt={label} h="100px"/>
		<Text fontWeight="medium">{label}</Text>
	</Flex>
);