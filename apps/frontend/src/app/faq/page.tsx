'use client';

import MainLayout from '@frontend/components/mainLayout/mainLayout';
import React from 'react';
import {
	Box,
	Heading,
	Text,
	VStack,
	Button,
	Link,
	Icon,
	Flex,
} from '@chakra-ui/react';
import {Timeline} from '@chakra-ui/react';
import {LuCheck, LuArrowLeft} from 'react-icons/lu';
import {useRouter} from 'next/navigation';

const FaqPage = () => {
	const router = useRouter();

	return (
		<MainLayout doNotRedirect>
			<Box maxW="4xl" mx="auto" p={6}>
				<Flex align="center" gap={3} mb={6}>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							if (window.history.length > 1) {
								router.back();
							} else {
								router.push('/');
							}
						}}
					>
						<Icon as={LuArrowLeft}/>
						Назад
					</Button>
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
		</MainLayout>
	);
};

export default FaqPage;