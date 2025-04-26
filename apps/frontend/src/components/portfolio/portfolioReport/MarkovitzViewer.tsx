import CopyPortfolioButton from '@frontend/components/portfolio/portfolioReport/CopyPortfolioButton';
import EfficientFrontierChart from '@frontend/components/portfolio/portfolioReport/EfficientFrontierChart';
import {
	useGetPortfolioReportQuery, useGetUserPortfoliosQuery,
} from '@frontend/generated/graphql-hooks';
import React, {FC, JSX, useState} from 'react';
import {LuFolder, LuSquareCheck, LuChartNoAxesCombined} from 'react-icons/lu';
import {PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip} from 'recharts';
import {Tabs, Box, Button, Icon, Text, Table, Spinner, Flex, Badge} from '@chakra-ui/react';
import {
	FaBalanceScale,
	FaChevronLeft,
	FaChevronRight,
	FaFire,
	FaQuestionCircle,
	FaShieldAlt,
	FaInfoCircle,
} from 'react-icons/fa';
import {Tooltip} from '@frontend/components/ui/tooltip';
import {ResponsiveContainer} from 'recharts';

export type MarkovitzData = {
	risk_annual: number;
	risk_daily: number;
	return_annual: number;
	beta: number;
	return_daily: number;
	weights: { [key: string]: number };
	sharpe_ratio_annual: number;
	sharpe_ratio_daily: number;
	sortino_ratio_annual: number;
	sortino_ratio_daily: number;
	treynor_ratio_annual: number;
	treynor_ratio_daily: number;
	risk_category: string; // Добавляем новое поле
}[];

const COLORS = [
	'#390099', '#9e0059', '#ff0054', '#ff5400', '#ffbd00',
	'#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4',
	'#144318', '#0496ff',
];

interface MarkovitzViewerProps {
	reportId: string;
}

const MarkovitzViewer: FC<MarkovitzViewerProps> = ({reportId}) => {
	const [selectedPortfolio, setSelectedPortfolio] = useState(0);
	const {data, loading} = useGetPortfolioReportQuery({variables: {reportId}});
	const [tabValue, setTabValue] = useState<'frontier' | 'portfolio' | 'metrics'>('portfolio');
	const {refetch} = useGetUserPortfoliosQuery({fetchPolicy: 'cache-only'});

	const reports = data?.getPortfolioReport?.data as MarkovitzData | undefined;
	const totalPortfolios = reports?.length ?? 0;
	const report = reports?.[selectedPortfolio];

	if (!reportId) return null;

	const allocation = Object.keys(report?.weights || {})
		.map((key) => ({
			name: key,
			value: +(report?.weights[key].toFixed(2) ?? 0),
		}))
		.filter((al) => al.value > 0);

	const weights = allocation.map((al) => al.value);
	const stockTickers = allocation.map((al) => al.name);

	// Функции для переключения портфелей
	const prevPortfolio = () => {
		setSelectedPortfolio((prev) => Math.max(0, prev - 1));
	};

	const nextPortfolio = () => {
		setSelectedPortfolio((prev) => Math.min(totalPortfolios - 1, prev + 1));
	};

	// Функция для отображения категории риска
	const getRiskCategoryLabel = (category: string) => {
		let colorPalette: string;
		let icon: JSX.Element;
		let label: string;

		switch (category) {
			case 'conservative':
				colorPalette = 'green';
				icon = <FaShieldAlt/>;
				label = 'Консервативный';
				break;
			case 'standard':
				colorPalette = 'blue';
				icon = <FaBalanceScale/>;
				label = 'Сбалансированный';
				break;
			case 'aggressive':
				colorPalette = 'red';
				icon = <FaFire/>;
				label = 'Агрессивный';
				break;
			default:
				colorPalette = 'gray';
				icon = <FaQuestionCircle/>;
				label = 'Не определен';
		}

		return (
			<Badge colorPalette={colorPalette} px={3} py={1} borderRadius="md">
				<Flex align="center" gap={2}>
					{icon}
					<Text fontWeight="bold">{label}</Text>
				</Flex>
			</Badge>
		);
	};

	// Описание коэффициентов
	const metricTooltips: { [key: string]: string } = {
		'risk_annual': 'Годовая стандартная волатильность портфеля, измеряющая степень колебания доходности. Высокая волатильность указывает на более рискованные инвестиции.',
		'risk_daily': 'Средняя дневная волатильность, показывающая, насколько изменяется доходность портфеля в течение одного дня. Используется для оценки краткосрочного риска.',
		'sharpe_ratio_annual': 'Измеряет, насколько хорошо портфель компенсирует инвестора за принимаемый риск. Рассчитывается как отношение избыточной доходности к общей волатильности. Чем выше коэффициент, тем лучше риск-доходность.',
		'sortino_ratio_annual': 'Модифицированная версия коэффициента Шарпа, учитывающая только негативную волатильность. Высокий коэффициент указывает на стабильные доходы с меньшим количеством значительных потерь.',
		'beta': 'Показывает, насколько портфель коррелирует с рынком. Beta = 1 означает, что портфель повторяет движения рынка, Beta < 1 — менее волатильный портфель, Beta > 1 — более агрессивный.',
		'treynor_ratio_annual': 'Измеряет доходность портфеля на единицу рыночного риска (β). Высокий коэффициент указывает на то, что портфель эффективно компенсирует инвестора за риск, связанный с изменениями рынка.',
	};

	// Компонент строки таблицы с подсказками
	const MetricRow = ({label, value, metricKey}: { label: string; value: string; metricKey: string }) => (
		<Table.Row>
			<Table.Cell>
				<Flex align="center" gap={2}>
					<Text>{label}</Text>
					{metricTooltips[metricKey] && (
						<Tooltip
							content={metricTooltips[metricKey]}
							openDelay={300}
							closeDelay={100}
						>
							<Icon as={FaInfoCircle} cursor="pointer"/>
						</Tooltip>
					)}
				</Flex>
			</Table.Cell>
			<Table.Cell fontWeight="bold">{value}</Table.Cell>
		</Table.Row>
	);

	return (
		<Box maxW="600px" mx="auto" textAlign="center">
			{loading ? (
				<Spinner size="xl" color="blue.500"/>
			) : (
				<>
					<Text fontSize="lg" mb={4} fontWeight="bold">
						Выберите портфель
					</Text>

					{/* Кнопки переключения портфелей */}
					<Flex align="center" justify="center" mb={4}>
						<Button variant="solid" size="xs" colorScheme="blue" onClick={prevPortfolio}
						        disabled={selectedPortfolio === 0}>
							<Icon as={FaChevronLeft}/>
						</Button>
						<Text w={70} fontSize="md" mx={4} fontWeight="bold">
							{selectedPortfolio + 1} / {totalPortfolios}
						</Text>
						<Button variant="solid" size="xs" colorScheme="blue" onClick={nextPortfolio}
						        disabled={selectedPortfolio === totalPortfolios - 1}>
							<Icon as={FaChevronRight}/>
						</Button>
					</Flex>

					<Tabs.Root
						unmountOnExit
						value={tabValue}
						onValueChange={(val) => {
							setTabValue(val.value as 'frontier' | 'portfolio' | 'metrics');
						}}
						variant="plain"
					>
						<Box overflowX="auto" w="100%">
							<Tabs.List bg="bg.muted" rounded="l3" p="1">
								<Tabs.Trigger value="portfolio">
									<LuFolder/>
									Портфель
								</Tabs.Trigger>
								<Tabs.Trigger value="frontier">
									<LuChartNoAxesCombined/>
									Граница
								</Tabs.Trigger>
								<Tabs.Trigger value="metrics">
									<LuSquareCheck/>
									Метрика
								</Tabs.Trigger>
								<Tabs.Indicator rounded="l2"/>
							</Tabs.List>
						</Box>
						<Tabs.Content value={'frontier'}>
							<EfficientFrontierChart
								onSelect={(index) => {
									setTabValue('portfolio');
									setSelectedPortfolio(index);
								}}
								portfolios={reports!}
								selected={selectedPortfolio}
							/>
						</Tabs.Content>
						<Tabs.Content value="portfolio">
							{/* Pie Chart */}
							<ResponsiveContainer width="100%" height={300}>
								<PieChart width={400} height={250} style={{width: '100%', height: 400}}>
									<Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%"
									     outerRadius={80}
									     label>
										{allocation.map((_, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
										))}
									</Pie>
									<RechartsTooltip/>
									<Legend max={'100vw'}/>
								</PieChart>
							</ResponsiveContainer>

							<Table.Root mt={4} border="1px solid" borderColor="gray.200" borderRadius="md">
								<Table.Header>
									<Table.Row>
										<Table.ColumnHeader>Метрика</Table.ColumnHeader>
										<Table.ColumnHeader>Значение</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								{report && (
									<Table.Body>
										<MetricRow
											label="Доходность (годовая)"
											value={`${(report.return_annual * 100).toFixed(2)}%`}
											metricKey="return_annual"
										/>
										<MetricRow
											label="Риск (годовой)"
											value={`${(report.risk_annual * 100).toFixed(2)}%`}
											metricKey="risk_annual"
										/>
										<Table.Row>
											<Table.Cell>Категория риска</Table.Cell>
											<Table.Cell>{getRiskCategoryLabel(report.risk_category)}</Table.Cell>
										</Table.Row>
									</Table.Body>
								)}
							</Table.Root>
						</Tabs.Content>
						<Tabs.Content value="metrics">
							{/* Таблица */}
							<Table.Root mt={4} border="1px solid" borderColor="gray.200" borderRadius="md">
								<Table.Header>
									<Table.Row>
										<Table.ColumnHeader>Метрика</Table.ColumnHeader>
										<Table.ColumnHeader>Значение</Table.ColumnHeader>
									</Table.Row>
								</Table.Header>
								{report && (
									<Table.Body>
										<MetricRow
											label="Доходность (годовая)"
											value={`${(report.return_annual * 100).toFixed(2)}%`}
											metricKey="return_annual"
										/>
										<MetricRow
											label="Доходность (ежедневная)"
											value={`${(report.return_daily * 100).toFixed(2)}%`}
											metricKey="return_daily"
										/>
										<MetricRow
											label="Риск (годовой)"
											value={`${(report.risk_annual * 100).toFixed(2)}%`}
											metricKey="risk_annual"
										/>
										<MetricRow
											label="Риск (ежедневный)"
											value={`${(report.risk_daily * 100).toFixed(2)}%`}
											metricKey="risk_daily"
										/>
										<MetricRow
											label="Коэффициент Шарпа (годовой)"
											value={report.sharpe_ratio_annual.toFixed(2)}
											metricKey="sharpe_ratio_annual"
										/>
										<MetricRow
											label="Коэффициент Шарпа (ежедневный)"
											value={report.sharpe_ratio_daily.toFixed(2)}
											metricKey="sharpe_ratio_daily"
										/>
										<MetricRow
											label="Коэффициент Sortino (годовой)"
											value={report.sortino_ratio_annual.toFixed(2)}
											metricKey="sortino_ratio_annual"
										/>
										<MetricRow
											label="Коэффициент Sortino (ежедневный)"
											value={report.sortino_ratio_daily.toFixed(2)}
											metricKey="sortino_ratio_daily"
										/>
										{report.beta && (
											<MetricRow
												label="beta"
												value={report.beta.toFixed(2)}
												metricKey="beta"
											/>
										)}
										{report.treynor_ratio_annual && (
											<MetricRow
												label="Коэффициент Трейнора (годовой)"
												value={report.treynor_ratio_annual.toFixed(2)}
												metricKey="treynor_ratio_annual"
											/>
										)}
										<Table.Row>
											<Table.Cell>Категория риска</Table.Cell>
											<Table.Cell>{getRiskCategoryLabel(report.risk_category)}</Table.Cell>
										</Table.Row>
									</Table.Body>
								)}
							</Table.Root>
						</Tabs.Content>
					</Tabs.Root>
				</>
			)}
			<CopyPortfolioButton
				stockTickerList={stockTickers}
				weights={weights}
				onSave={() => refetch()}
			/>
		</Box>
	);
};

export default MarkovitzViewer;
