import React from 'react';
import {
	DrawerRoot,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerTitle,
	DrawerCloseTrigger,
} from '@/components/ui/drawer';
import {useMemo, useState} from 'react';
import {useCreatePortfolioReportMutation} from '@/generated/graphql-hooks';
import {
	Button,
	IconButton,
	Icon,
	Stack,
	Box,
	Text,
	Flex,
	Select,
	SelectRoot,
	SelectLabel,
	SelectTrigger, SelectValueText, SelectContent, SelectItem, createListCollection,
} from '@chakra-ui/react';
import {FaPlus, FaTrash, FaFileAlt} from 'react-icons/fa';
import StockSearch from './StocksSearch';

interface CreatePortfolioReportButtonProps {
	portfolioId: number;
}

const CreatePortfolioReportButton: React.FC<CreatePortfolioReportButtonProps> = ({portfolioId}) => {
	const [open, setOpen] = useState(false);
	const [reportType, setReportType] = useState<'markowitz' | 'growth_forecast' | 'value_at_risk'>('markowitz');
	const [additionalStocks, setAdditionalStocks] = useState<{ id: number; name: string; ticker: string }[]>([]);
	const [createReport, {loading}] = useCreatePortfolioReportMutation();

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
			await createReport({
				variables: {
					portfolioId,
					reportType,
					additionalTickers: additionalStocks.map((s) => s.ticker),
				},
			});
			setOpen(false);
		} catch (error) {
			console.error('Ошибка создания отчета:', error);
		}
	};

	const reportTypes = createListCollection({
		items: [
			{label: 'Оптимальный портфель (Марковиц)', value: 'markowitz'},
			{label: 'Прогноз роста', value: 'growth_forecast'},
			{label: 'Оценка риска (VaR)', value: 'value_at_risk'},
		],
	});

	return (
		<>
			<Button colorScheme="blue" onClick={() => setOpen(true)}>
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
									onValueChange={(e) => {
										setReportType(e.value[0] as 'markowitz' | 'growth_forecast' | 'value_at_risk');
									}}
									collection={reportTypes}
									size="sm"
									width="320px"
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
								{/*<Select value={reportType} onChange={(e) => setReportType(e.target.value as any)}>*/}
								{/*	<option value="markowitz">Оптимальный портфель (Марковиц)</option>*/}
								{/*	<option value="growth_forecast">Прогноз роста</option>*/}
								{/*	<option value="value_at_risk">Оценка риска (VaR)</option>*/}
								{/*</Select>*/}
							</Box>

							<Box>
								<Text mb={2}>Добавить акции в анализ:</Text>
								<StockSearch
									onSelectStock={(stockId, stockName, stockTicker) =>
										handleSelectStock(stockId, stockName, stockTicker)
									}
								/>
							</Box>

							{additionalStocks.length > 0 && (
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
