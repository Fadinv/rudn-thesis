import {
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from '@/components/ui/select';
import React, {useEffect} from 'react';
import {
	DrawerRoot,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerTitle,
	DrawerCloseTrigger,
} from '@/components/ui/drawer';
import {useState} from 'react';
import {
	useCreateFutureReturnForecastGbmReportMutation,
	useCreateMarkovitzReportMutation,
} from '@/generated/graphql-hooks';
import {
	Button,
	IconButton,
	Icon,
	Stack,
	Box,
	Text,
	Flex,
	createListCollection,
} from '@chakra-ui/react';
import {FaPlus, FaTrash, FaFileAlt} from 'react-icons/fa';
import StockSearch from './StocksSearch';

interface CreatePortfolioReportButtonProps {
	portfolioId: number;
}

const CreatePortfolioReportButton: React.FC<CreatePortfolioReportButtonProps> = ({portfolioId}) => {
	const [open, setOpen] = useState(false);
	const [reportType, setReportType] = useState<'markowitz' | 'future_returns_forecast_gbm' | 'value_at_risk'>('markowitz');
	const [additionalStocks, setAdditionalStocks] = useState<{ id: number; name: string; ticker: string }[]>([]);
	const [createMarkovitzReport, {loading: createMarkovitzReportIsLoading}] = useCreateMarkovitzReportMutation();
	const [createFutureReturnForecastReport, {loading: createFutureReturnForecastReportIsLoading}] = useCreateFutureReturnForecastGbmReportMutation();

	const [modelType, setModelType] = useState<'linear_regression' | 'lstm' | 'arima'>('linear_regression');

	useEffect(() => {
		setAdditionalStocks([]);
		setReportType('markowitz');
	}, [open]);

	const handleSelectStock = (stockId: number, stockName: string, stockTicker: string) => {
		// Добавляем только уникальные акции
		if (!additionalStocks.find((s) => s.id === stockId)) {
			setAdditionalStocks([...additionalStocks, {id: stockId, name: stockName, ticker: stockTicker}]);
		}
	};

	const handleRemoveStock = (stockId: number) => {
		setAdditionalStocks(additionalStocks.filter((s) => s.id !== stockId));
	};

	const handleCreateReport = async () => {
		try {
			switch (reportType) {
				case 'markowitz': {
					await createMarkovitzReport({
						variables: {
							portfolioId,
							input: {
								additionalTickers: additionalStocks.map((s) => s.ticker),
							},
						},
					});
				}
				case 'future_returns_forecast_gbm': {
					await createFutureReturnForecastReport({
						variables: {
							portfolioId,
							input: {
								selectedPercentiles: [10, 50, 90],
								forecastHorizons: [30, 60, 90, 180, 365, 730, 1095],
							},
						},
					});
				}
				default: {
					console.error('Ошибка создания отчета:', reportType);
				}
			}
			setOpen(false);
		} catch (error) {
			console.error('Ошибка создания отчета:', error);
		}
	};

	const reportTypes = createListCollection({
		items: [
			{label: 'Оптимальный портфель (Марковиц)', value: 'markowitz'},
			{label: 'Прогноз будущей стоимости (GBM)', value: 'future_returns_forecast_gbm'},
			{label: 'Оценка риска (VaR)', value: 'value_at_risk'},
		],
	});

	const loading = createMarkovitzReportIsLoading || createFutureReturnForecastReportIsLoading;

	return (
		<>
			<Button colorScheme="blue" onClick={() => setOpen(true)} size="sm">
				<FaFileAlt/> Создать отчет
			</Button>

			<DrawerRoot size="lg" open={open} onOpenChange={(e) => setOpen(e.open)}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Создать отчет</DrawerTitle>
					</DrawerHeader>
					<DrawerBody>
						<Stack>
							<Box>
								<Text mb={2}>Выберите тип отчета:</Text>
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
							</Box>

							{reportType === 'markowitz' && (
								<Box>
									<Text mb={2}>Добавить акции в анализ:</Text>
									<StockSearch
										onSelectStock={(stockId, stockName, stockTicker) =>
											handleSelectStock(stockId, stockName, stockTicker)
										}
									/>
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
							<Button variant="outline">Закрыть</Button>
						</DrawerCloseTrigger>
					</DrawerFooter>
				</DrawerContent>
			</DrawerRoot>
		</>
	);
};

export default CreatePortfolioReportButton;
