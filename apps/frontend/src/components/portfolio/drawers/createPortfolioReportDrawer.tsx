'use client';
import StockSearch from '@frontend/components/portfolio/StocksSearch';
import {
	DrawerRoot,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerTitle,
	DrawerCloseTrigger,
} from '@frontend/components/ui/drawer';
import {Box, Button, Flex, IconButton, Stack, Text} from '@chakra-ui/react';
import {Field} from '@chakra-ui/react';
import {NumberInputRoot, NumberInputField} from '@frontend/components/ui/number-input';
import {
	SelectRoot,
	SelectTrigger,
	SelectValueText,
	SelectContent,
	SelectItem,
	SelectLabel,
} from '@frontend/components/ui/select';
import {Slider} from '@frontend/components/ui/slider';
import React, {useState, useEffect} from 'react';
import {createListCollection} from '@chakra-ui/react';
import {
	useCreateFutureReturnForecastGbmReportMutation,
	useCreateMarkovitzReportMutation,
} from '@frontend/generated/graphql-hooks';
import {FaTrash} from 'react-icons/fa';

interface CreatePortfolioReportDrawerProps {
	portfolioId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const CreatePortfolioReportDrawer: React.FC<CreatePortfolioReportDrawerProps> = ({
	                                                                                        portfolioId,
	                                                                                        open,
	                                                                                        onOpenChange,
                                                                                        }) => {
	// Все useState как у тебя
	const [reportType, setReportType] = useState<'markowitz' | 'future_returns_forecast_gbm' | 'value_at_risk'>('markowitz');
	const [currency, setCurrency] = useState<'usd' | 'sur'>('usd');
	const [additionalStocks, setAdditionalStocks] = useState<{ id: number; name: string; ticker: string }[]>([]);
	const [selectedPercentiles, setSelectedPercentiles] = useState<[number, number, number]>([5, 50, 95]);
	const [forecastHorizons, setForecastHorizons] = useState([30, 60, 90, 180, 365, 730, 1095]);
	const [dateRange, setDateRange] = useState('3y');
	const [riskFreeRate, setRiskFreeRate] = useState<number | null>(4);
	const [numPortfolios, setNumPortfolios] = useState<number | null>(20);
	const [covMethod, setCovMethod] = useState('ledoit');

	const [createMarkovitzReport, {loading: markowitzLoading}] = useCreateMarkovitzReportMutation();
	const [createFutureReport, {loading: futureReportLoading}] = useCreateFutureReturnForecastGbmReportMutation();

	const loading = markowitzLoading || futureReportLoading;

	useEffect(() => {
		if (open) {
			setAdditionalStocks([]);
			setReportType('markowitz');
			setDateRange('3y');
			setRiskFreeRate(4);
			setNumPortfolios(20);
			setCovMethod('ledoit');
			setForecastHorizons([30, 60, 90, 180, 365, 730, 1095]);
			setSelectedPercentiles([5, 50, 95]);
		}
	}, [open]);

	const handleCreateReport = async () => {
		try {
			if (reportType === 'markowitz') {
				await createMarkovitzReport({
					variables: {
						portfolioId,
						input: {
							additionalTickers: additionalStocks.map((s) => s.ticker),
							dateRange,
							riskFreeRate: +(riskFreeRate! / 100).toFixed(2),
							numPortfolios,
							covMethod,
							currency,
						},
					},
				});
			} else {
				await createFutureReport({
					variables: {
						portfolioId,
						input: {
							selectedPercentiles,
							forecastHorizons,
							dateRange,
							currency,
						},
					},
				});
			}
			onOpenChange(false);
		} catch (e) {
			console.error('Ошибка создания отчета', e);
		}
	};

	const handleSelectStock = (id: number, name: string, ticker: string) => {
		if (!additionalStocks.find((s) => s.id === id)) {
			setAdditionalStocks([...additionalStocks, {id, name, ticker}]);
		}
	};

	const handleRemoveStock = (id: number) => {
		setAdditionalStocks(additionalStocks.filter((s) => s.id !== id));
	};

	const reportTypes = createListCollection({
		items: [
			{label: 'Оптимальный портфель (Марковиц)', value: 'markowitz'},
			{label: 'Прогноз будущей стоимости (GBM)', value: 'future_returns_forecast_gbm'},
		],
	});

	const currencyCollection = createListCollection({
		items: [
			{label: 'Доллар США', value: 'usd'},
			{label: 'Рубль РФ', value: 'sur'},
		],
	});

	const dataRangeCollection = createListCollection({
		items: [
			{label: '1 месяц', value: '1m'},
			{label: '3 месяца', value: '3m'},
			{label: '6 месяцев', value: '6m'},
			{label: '1 год', value: '1y'},
			{label: '2 года', value: '2y'},
			{label: '3 года', value: '3y'},
		],
	});

	const forecastHorizonsCollection = createListCollection({
		items: [
			{label: 'Короткий срок (1-3 мес)', value: 'short'},
			{label: 'Средний срок (6 мес – 1 год)', value: 'medium'},
			{label: 'Долгий срок (2–3 года)', value: 'long'},
			{label: 'Все варианты', value: 'short_medium_long'},
		],
	});

	const covMethodCollection = createListCollection({
		items: [
			{label: 'Ledoit-Wolf (сглаженный)', value: 'ledoit'},
			{label: 'Классическая оценка', value: 'standard'},
		],
	});

	return (
		<DrawerRoot size="lg" open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Создать отчет</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<Stack>
						<Box>
							<Field.Root invalid={!reportType}>
								<SelectRoot
									defaultValue={['markowitz']}
									onValueChange={(e) => {
										setReportType(e.value[0] as 'markowitz' | 'future_returns_forecast_gbm' | 'value_at_risk');
									}}
									collection={reportTypes}
									size="sm"
								>
									<SelectLabel>Вид анализа</SelectLabel>
									<SelectTrigger>
										<SelectValueText placeholder="Выберите вид анализа"/>
									</SelectTrigger>
									<SelectContent>
										{reportTypes.items.map((reportType) => (
											<SelectItem item={reportType} key={reportType.value}>
												{reportType.label}
											</SelectItem>
										))}
									</SelectContent>
								</SelectRoot>
								<Field.ErrorText>Обязательно для заполнения</Field.ErrorText>
							</Field.Root>
						</Box>
						<Box>
							<Field.Root invalid={!currency}>
								<SelectRoot
									defaultValue={['usd']}
									onValueChange={(e) => {
										setCurrency(e.value[0] as 'usd' | 'sur');
									}}
									collection={currencyCollection}
									size="sm"
								>
									<SelectLabel>Валюта</SelectLabel>
									<SelectTrigger>
										<SelectValueText placeholder="Выберите валюту"/>
									</SelectTrigger>
									<SelectContent>
										{currencyCollection.items.map((cur) => (
											<SelectItem item={cur} key={cur.value}>
												{cur.label}
											</SelectItem>
										))}
									</SelectContent>
								</SelectRoot>
								<Field.ErrorText>Обязательно для заполнения</Field.ErrorText>
							</Field.Root>
						</Box>

						{reportType === 'future_returns_forecast_gbm' && (
							<Stack mt={4}>
								{/* Диапазон исторических данных */}
								<Box>
									<Text mb={1}>Диапазон исторических данных:</Text>
									<SelectRoot
										defaultValue={['3y']}
										onValueChange={(e) => setDateRange(e.value[0])}
										collection={dataRangeCollection}
										size="sm"
									>
										<SelectLabel>Выберите период</SelectLabel>
										<SelectTrigger>
											<SelectValueText placeholder="Выберите период"/>
										</SelectTrigger>
										<SelectContent>
											{dataRangeCollection.items.map((dateRangeItem) => (
												<SelectItem item={dateRangeItem} key={dateRangeItem.value}>
													{dateRangeItem.label}
												</SelectItem>
											))}
										</SelectContent>
									</SelectRoot>
								</Box>

								{/* Горизонты прогнозирования */}
								<Box>
									<SelectRoot
										defaultValue={['short_medium_long']}
										onValueChange={(e) => {
											const val = e.value[0];
											switch (val) {
												case 'short':
													setForecastHorizons([30, 60, 90]);
													break;
												case 'medium':
													setForecastHorizons([180, 365]);
													break;
												case 'long':
													setForecastHorizons([730, 1095]);
													break;
												default:
													setForecastHorizons([30, 60, 90, 180, 365, 730, 1095]);
											}
										}}
										collection={forecastHorizonsCollection}
										size="sm"
									>
										<SelectLabel>Горизонты прогнозирования</SelectLabel>
										<SelectTrigger>
											<SelectValueText placeholder="Выберите"/>
										</SelectTrigger>
										<SelectContent>
											{forecastHorizonsCollection.items.map((forecastItem) => (
												<SelectItem item={forecastItem} key={forecastItem.value}>
													{forecastItem.label}
												</SelectItem>
											))}
										</SelectContent>
									</SelectRoot>
								</Box>

								{/* Ползунки перцентилей */}
								<Box>
									<Text mb={1}>Выберите перцентили:</Text>
									<Flex direction="column" gap={3}>
										<Flex align="center" gap={4}>
											<Slider
												step={1}
												colorPalette={'green'}
												value={[selectedPercentiles[0]]}
												min={1}
												max={89}
												w={'400px'}
												onValueChange={(details) => {
													const p10 = details.value[0];
													let p50 = Math.max(p10 + 5, selectedPercentiles[1]);
													let p90 = Math.max(p50 + 5, selectedPercentiles[2]);
													p50 = Math.min(p50, 94);
													p90 = Math.min(p90, 99);
													setSelectedPercentiles([p10, p50, p90]);
												}}
											/>
											<Text>{selectedPercentiles[0]}</Text>
										</Flex>
										<Flex align="center" gap={4}>
											<Slider
												step={1}
												colorPalette={'blue'}
												min={6}
												max={94}
												w={'400px'}
												value={[selectedPercentiles[1]]}
												onValueChange={(details) => {
													const v = details.value[0];
													const p50 = v;
													const p10 = Math.min(selectedPercentiles[0], p50 - 5);
													let p90 = Math.max(p50 + 5, selectedPercentiles[2]);
													p90 = Math.min(p90, 99);
													setSelectedPercentiles([p10, p50, p90]);
												}}
											/>
											<Text>{selectedPercentiles[1]}</Text>
										</Flex>
										<Flex align="center" gap={4}>
											<Slider
												step={1}
												colorPalette={'red'}
												min={11}
												max={99}
												w={'400px'}
												value={[selectedPercentiles[2]]}
												onValueChange={(details) => {
													const p90 = details.value[0];
													const p50 = Math.min(selectedPercentiles[1], p90 - 5);
													const p10 = Math.min(selectedPercentiles[0], p50 - 5);
													setSelectedPercentiles([p10, p50, p90]);
												}}
											/>
											<Text>{selectedPercentiles[2]}</Text>
										</Flex>
									</Flex>
								</Box>
							</Stack>
						)}


						{reportType === 'markowitz' && (
							<Box>
								<Text mb={2}>Добавить акции в анализ:</Text>
								<StockSearch
									onSelectStock={(stockId, stockName, stockTicker) =>
										handleSelectStock(stockId, stockName, stockTicker)
									}
								/>

								<Box mt={2}>
									<SelectRoot
										defaultValue={['3y']}
										onValueChange={(e) => setDateRange(e.value[0])}
										collection={dataRangeCollection}
										size="sm"
									>
										<SelectLabel>Выберите диапазон</SelectLabel>
										<SelectTrigger>
											<SelectValueText placeholder="Выберите период"/>
										</SelectTrigger>
										<SelectContent>
											{dataRangeCollection.items.map((dateRangeItem) => (
												<SelectItem item={dateRangeItem} key={dateRangeItem.value}>
													{dateRangeItem.label}
												</SelectItem>
											))}
										</SelectContent>
									</SelectRoot>
								</Box>

								<Box mt={2}>
									<Text mb={1}>Безрисковая ставка (%):</Text>
									<Field.Root
										invalid={typeof riskFreeRate !== 'number' || riskFreeRate < 0 || riskFreeRate > 100}>
										<NumberInputRoot
											w={'100%'}
											value={typeof riskFreeRate === 'number' ? String(riskFreeRate) : undefined}
											onValueChange={(details) => {
												setRiskFreeRate(Number(details.value));
											}}
											min={0}
											max={100}
										>
											<NumberInputField
												min={0}
												max={100}
												defaultValue={4}
												step={1}
												onChange={(e) => {
													setRiskFreeRate(e.target.value ? parseFloat((+e.target.value).toFixed(2)) : null);
												}}
											/>
										</NumberInputRoot>
										<Field.ErrorText>от 0 до 100</Field.ErrorText>
									</Field.Root>
								</Box>

								<Box mt={2}>
									<Text mb={1}>Количество портфелей:</Text>
									<Field.Root invalid={!numPortfolios || numPortfolios < 3 || numPortfolios > 50}>
										<NumberInputRoot
											w={'100%'}
											value={typeof numPortfolios === 'number' ? String(numPortfolios) : undefined}
											onValueChange={(details) => {
												setNumPortfolios(Number(details.value));
											}}
											min={3}
											max={50}
										>
											<NumberInputField
												min={3}
												max={50}
												defaultValue="20"
												step={'1'}
												onChange={(e) => setNumPortfolios(parseInt(e.target.value ?? 0))}
											/>
										</NumberInputRoot>
										<Field.ErrorText>От 3 до 50</Field.ErrorText>
									</Field.Root>
								</Box>

								<Box mt={2}>
									<SelectRoot
										defaultValue={['ledoit']}
										onValueChange={(e) => setCovMethod(e.value[0])}
										collection={covMethodCollection}
										size="sm"
									>
										<SelectLabel>Метод ковариации</SelectLabel>
										<SelectTrigger>
											<SelectValueText placeholder="Выберите метод"/>
										</SelectTrigger>
										<SelectContent>
											{covMethodCollection.items.map((covMethodItem) => (
												<SelectItem item={covMethodItem} key={covMethodItem.value}>
													{covMethodItem.label}
												</SelectItem>
											))}
										</SelectContent>
									</SelectRoot>
								</Box>
							</Box>
						)}

						{reportType === 'markowitz' && additionalStocks.length > 0 && (
							<Box>
								<Text mb={2}>Дополнительные акции:</Text>
								<Stack>
									{additionalStocks.map((stock) => (
										<Flex key={stock.id} justify="space-between" align="center" p={2}
										      border="1px solid gray" borderRadius="md">
											<Text>
												{stock.ticker} - {stock.name}
											</Text>
											<IconButton
												aria-label="Удалить"
												colorScheme="red"
												size="sm"
												onClick={() => handleRemoveStock(stock.id)}
											>
												<FaTrash/>
											</IconButton>
										</Flex>
									))}
								</Stack>
							</Box>
						)}
					</Stack>
				</DrawerBody>
				<DrawerFooter>
					<Button colorScheme="blue" onClick={handleCreateReport} loading={loading}>
						Создать отчет
					</Button>
					<DrawerCloseTrigger asChild>
						<Button variant="outline">Отмена</Button>
					</DrawerCloseTrigger>
				</DrawerFooter>
			</DrawerContent>
		</DrawerRoot>
	);
};
