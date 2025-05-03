import BackButton from '@frontend/app/faq/backButton';
import Header from '@frontend/components/header/header';
import React from 'react';
import {
	Box,
	Heading,
	Text,
	VStack,
	Link,
	Flex,
} from '@chakra-ui/react';
import {Timeline} from '@chakra-ui/react';
import {LuCheck} from 'react-icons/lu';

// export const metadata = {
// 	title: 'FAQ — Portfolio Analyzer',
// 	description: 'Ответы на часто задаваемые вопросы по использованию Portfolio Analyzer.',
// 	openGraph: {
// 		title: 'FAQ — Portfolio Analyzer',
// 		description: 'Ответы на часто задаваемые вопросы по использованию Portfolio Analyzer.',
// 		url: 'https://portfolioanalyzer.ru/faq',
// 		siteName: 'Portfolio Analyzer',
// 		images: [
// 			{
// 				url: 'https://portfolioanalyzer.ru/og-cover.png',
// 				width: 1200,
// 				height: 630,
// 				alt: 'Portfolio Analyzer FAQ',
// 			},
// 		],
// 		locale: 'ru_RU',
// 		type: 'website',
// 	},
// 	twitter: {
// 		card: 'summary_large_image',
// 		title: 'FAQ — Portfolio Analyzer',
// 		description: 'Ответы на часто задаваемые вопросы по использованию Portfolio Analyzer',
// 		images: ['https://portfolioanalyzer.ru/og-cover.png'],
// 	},
// 	robots: {
// 		index: true,
// 		follow: true,
// 	},
// };

const FaqPage = () => {
	return (
		<>
			<Flex
				p={4}
				width="100%"
				// justify="space-between"
				height={'96px'}
			>
				<Header/>
			</Flex>
			<Box maxW="4xl" mx="auto" p={6}>
				<Flex align="center" gap={3} mb={6}>
					<BackButton/>
				</Flex>

				<VStack align="stretch" gap={6}>
					<Heading as="h1" size="2xl">
						Часто задаваемые вопросы
					</Heading>

					<Box>
						<Heading as="h2" size="md" mb={2}>Что делает это приложение?</Heading>
						<Text>
							Portfolio Analyzer помогает вам анализировать инвестиционные портфели: рассчитывать
							оптимальные
							доли активов, прогнозировать стоимость, учитывать валюту и рынок.
						</Text>
					</Box>

					<Box>
						<Heading as="h2" size="md" mb={2}>Какие данные нужно ввести?</Heading>
						<Text>
							Вы указываете тикер и количество. Исторические данные подтягиваются автоматически.
						</Text>
					</Box>

					<Box>
						<Heading as="h2" size="md" mb={2}>Как начать работу?</Heading>
						<Text mb={4}>Вот шаги, которые помогут вам использовать приложение:</Text>
						<Timeline.Root colorPalette="blue" size="md">
							<Timeline.Item>
								<Timeline.Connector>
									<Timeline.Separator/>
									<Timeline.Indicator>
										<LuCheck/>
									</Timeline.Indicator>
								</Timeline.Connector>
								<Timeline.Content textStyle="sm">
									<Timeline.Title>
										Создайте новый портфель, указав название
									</Timeline.Title>
								</Timeline.Content>
							</Timeline.Item>

							<Timeline.Item>
								<Timeline.Connector>
									<Timeline.Separator/>
									<Timeline.Indicator>
										<LuCheck/>
									</Timeline.Indicator>
								</Timeline.Connector>
								<Timeline.Content textStyle="sm">
									<Timeline.Title>
										Добавьте бумаги в портфель: тикер и количество (максимум 10 бумаг на портфель)
									</Timeline.Title>
								</Timeline.Content>
							</Timeline.Item>

							<Timeline.Item>
								<Timeline.Connector>
									<Timeline.Separator/>
									<Timeline.Indicator>
										<LuCheck/>
									</Timeline.Indicator>
								</Timeline.Connector>
								<Timeline.Content textStyle="sm">
									<Timeline.Title>
										Создайте отчёт, выбрав дату начала анализа и валюту пересчёта
									</Timeline.Title>
								</Timeline.Content>
							</Timeline.Item>

							<Timeline.Item>
								<Timeline.Connector>
									<Timeline.Separator/>
									<Timeline.Indicator>
										<LuCheck/>
									</Timeline.Indicator>
								</Timeline.Connector>
								<Timeline.Content textStyle="sm">
									<Timeline.Title>
										Просмотрите отчёт: структура по Марковицу, прогноз стоимости и метрики (beta,
										Sortino)
									</Timeline.Title>
								</Timeline.Content>
							</Timeline.Item>
						</Timeline.Root>
					</Box>

					<Box>
						<Heading as="h2" size="md" mb={2}>Какие ограничения?</Heading>
						<Text>
							В демо-режиме вы можете создать до 5 портфелей. Каждый портфель может содержать до 10 бумаг.
							В будущем ограничения будут смягчены или сняты.
						</Text>
					</Box>

					<Box>
						<Heading as="h2" size="md" mb={2}>Можно ли использовать российские бумаги?</Heading>
						<Text>
							Да. Поддерживаются как американские (NASDAQ, NYSE), так и российские (MOEX) рынки.
						</Text>
					</Box>

					<Box>
						<Heading as="h2" size="md" mb={2}>Как помочь проекту?</Heading>
						<Text>
							Вы можете оставить отзыв, поделиться ссылкой с друзьями или поддержать финансово. Это очень
							мотивирует развивать продукт дальше.
						</Text>
					</Box>

					<Box pt={8} borderTopWidth={1} borderColor="gray.200">
						<Text fontSize="sm">
							Есть вопросы? Напишите мне в{' '}
							<Link target="_blank" href="https://t.me/vfadrik" color="blue.500">
								Telegram
							</Link>
							{/*{' '}или откройте{' '}*/}
							{/*<Link href="/feedback" color="blue.500">*/}
							{/*	форму обратной связи*/}
							{/*</Link>*/}
							.
						</Text>
					</Box>
				</VStack>
			</Box>
		</>
	);
};

export default FaqPage;