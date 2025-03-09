import {useGetPortfolioReportQuery} from '@/generated/graphql-hooks';
import React, {FC, useState} from 'react';
import {XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, AreaChart} from 'recharts';
import {
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from '@/components/ui/select';
import {createListCollection, Box, Flex, Text} from '@chakra-ui/react';

interface ForecastGBMViewerProps {
	reportId: string;
}

const COLORS = {
	p10: '#dc3545', // Красный (pessimistic)
	p50: '#007bff', // Синий (median)
	p90: '#28a745', // Зеленый (optimistic)
};

const ForecastGBMViewer: FC<ForecastGBMViewerProps> = ({reportId}) => {
	const {data, loading} = useGetPortfolioReportQuery({variables: {reportId}});
	const [selectedStock, setSelectedStock] = useState<string | 'portfolio'>('portfolio');

	if (loading) return <Text>Загрузка...</Text>;

	const reportData = data?.getPortfolioReport?.data;
	if (!reportData) return <Text>Нет данных</Text>;

	const forecastData =
		selectedStock === 'portfolio'
			? reportData.portfolioForecast
			: reportData.stocksForecast[selectedStock];

	// Преобразуем данные: даты переводим в timestamp
	const chartData = Object.keys(forecastData || {}).map((date) => ({
		date: new Date(date).getTime(), // ✅ Преобразуем дату в timestamp
		p10: +forecastData[date]['p10'].toFixed(2),
		p50: +forecastData[date]['p50'].toFixed(2),
		p90: +forecastData[date]['p90'].toFixed(2),
	}));

	// Создаем список доступных активов
	const stockOptions = createListCollection({
		items: [
			{label: 'Портфель', value: 'portfolio'},
			...Object.keys(reportData.stocksForecast).map((ticker) => ({label: ticker, value: ticker})),
		],
	});

	return (
		<Flex direction="column" align="center" w="100%">
			<Text fontSize="lg" fontWeight="bold" mb={4}>
				Прогноз стоимости портфеля (GBM)
			</Text>

			<Box>
				<SelectRoot
					defaultValue={['portfolio']}
					onValueChange={(e) => setSelectedStock(e.value[0] as string)}
					collection={stockOptions}
					size="sm"
					width="320px"
					mb={4}
				>
					<SelectLabel>Выберите актив</SelectLabel>
					<SelectTrigger>
						<SelectValueText placeholder="Выберите актив"/>
					</SelectTrigger>
					<SelectContent>
						{stockOptions.items.map((stock) => (
							<SelectItem item={stock} key={stock.value}>
								{stock.label}
							</SelectItem>
						))}
					</SelectContent>
				</SelectRoot>
			</Box>

			<Box w={'1024px'} height={'1024px'} maxW={'70vw'} maxHeight={'70vh'}>
				<ResponsiveContainer width="100%" height={'100%'} maxHeight={700}>
					<AreaChart data={chartData} margin={{top: 20, right: 30, left: 20, bottom: 20}}>
						<XAxis
							dataKey="date"
							tickFormatter={(tick) => new Date(tick).toLocaleDateString()} // Форматируем дату обратно
							scale="time" //  Масштаб по времени
							type="number" // Данные числовые
							domain={['dataMin', 'dataMax']}
						/>
						<YAxis/>
						<Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()}/>
						<Legend/>

						{/* ✅ Область между p10 и p90 (заполнение) */}
						<Area type="monotone" dataKey="p90" stroke={COLORS.p90} strokeWidth={2} fill={COLORS.p90}
						      fillOpacity={.5}/>
						<Area type="monotone" dataKey="p50" stroke={COLORS.p50} strokeWidth={2} fill={'#bbd0ff'}
						      fillOpacity={1}/>
						<Area type="monotone" dataKey="p10" stroke={COLORS.p10} fill={'#fff'} strokeWidth={2}
						      fillOpacity={1}/>

					</AreaChart>
				</ResponsiveContainer>
			</Box>
		</Flex>
	);
};

export default ForecastGBMViewer;
