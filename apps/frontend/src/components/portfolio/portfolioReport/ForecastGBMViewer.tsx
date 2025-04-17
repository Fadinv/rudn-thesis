import {useColorModeValue} from '@frontend/components/ui/color-mode';
import {useGetPortfolioReportQuery} from '@frontend/generated/graphql-hooks';
import React, {FC, useEffect, useState} from 'react';
import {XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, AreaChart} from 'recharts';
import {
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectRoot,
	SelectTrigger,
	SelectValueText,
} from '@frontend/components/ui/select';
import {createListCollection, Box, Flex, Text} from '@chakra-ui/react';

interface ForecastGBMViewerProps {
	reportId: string;
}

const COLORS: { [key: string]: string } = {
	'0': '#dc3545', // Красный (pessimistic)
	'1': '#007bff', // Синий (median)
	'2': '#28a745', // Зеленый (optimistic)
};

const FILL_COLORS: { [key: string]: string } = {
	'0': '#dc3545',
	'1': '#bbd0ff',
	'2': '#fff',
};

const FILL_COLORS_BLACK: { [key: string]: string } = {
	'0': '#dc3545',
	'1': '#bbd0ff',
	'2': '#111111',
};

const OPACITY: { [key: string]: number } = {
	'0': .5,
	'1': 1,
	'2': 1,
};

const ForecastGBMViewer: FC<ForecastGBMViewerProps> = ({reportId}) => {
	const {data, loading} = useGetPortfolioReportQuery({variables: {reportId}});
	const [selectedStock, setSelectedStock] = useState<string | 'portfolio'>('portfolio');

	const [percentiles, setPersentiles] = useState<number[]>([]);
	const [chartData, setChartData] = useState<{ [key: string]: number }[]>([]);
	const fillColors = useColorModeValue(FILL_COLORS, FILL_COLORS_BLACK);

	const reportData = data?.getPortfolioReport?.data;

	const forecastData =
		selectedStock === 'portfolio'
			? reportData?.portfolioForecast
			: reportData?.stocksForecast?.[selectedStock];

	useEffect(() => {
		const mapData: { [key: string]: { [key: string]: number } } = {};
		const newPercentiles = new Set<number>();

		Object.keys(forecastData || {}).forEach((date) => {
			Object.keys(forecastData[date]).forEach(key => {
				newPercentiles.add(+(+key.replace('p', '')).toFixed(2));
				if (!mapData[date]) mapData[date] = {
					date: new Date(date).getTime(),
				};
				mapData[date][key] = +forecastData[date][key].toFixed(2);
			});
		});

		if (reportData?.portfolioHistory && selectedStock === 'portfolio') {
			Object.entries(reportData.portfolioHistory).forEach(([date, value], index, list) => {
				const ts = new Date(date).getTime();
				if (!mapData[date]) {
					mapData[date] = {date: ts};
				}
				if (!value) return;
				mapData[date].value = +(value as number).toFixed(2);
				if (index === list.length - 1) {
					newPercentiles.forEach(p => {
						mapData[date][`p${p}`] = +(value as number).toFixed(2);
					});
				}
			});
		}

		setChartData(Object.keys(mapData).map((key) => {
			return {...mapData[key]};
		}).sort((a, b) => a.date - b.date));
		setPersentiles(Array.from(newPercentiles).reverse());

	}, [data, reportData, selectedStock, forecastData]);

	if (loading) return <Text>Загрузка...</Text>;
	if (!reportData) return <Text>Нет данных</Text>;

	// Создаем список доступных активов
	const stockOptions = createListCollection({
		items: [
			{label: 'Портфель', value: 'portfolio'},
			...Object.keys(reportData.stocksForecast).map((ticker) => ({label: ticker, value: ticker})),
		],
	});

	if (!chartData.length) return null;
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

						{percentiles.map((el, index) => {
							return <Area style={{zIndex: Math.abs(-index)}} key={index} type="monotone"
							             dataKey={`p${el}`} stroke={COLORS[String(index)]}
							             strokeWidth={2}
							             fill={fillColors[String(index)]}
							             fillOpacity={OPACITY[String(index)]}
							/>;
						})}

						{selectedStock === 'portfolio' && (
							<Area
								type="monotone"
								dataKey="value"
								stroke="#6c757d"
								strokeWidth={2}
								fillOpacity={0}
								fill={fillColors[String(2)]}
								name="Исторические данные"
							/>
						)}
					</AreaChart>
				</ResponsiveContainer>
			</Box>
		</Flex>
	);
};

export default ForecastGBMViewer;
