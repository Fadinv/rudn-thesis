import {useGetPortfolioReportQuery} from '@/generated/graphql-hooks';
import React, {FC, useState} from 'react';
import {PieChart, Pie, Cell, Tooltip, Legend} from 'recharts';
import {
	Box,
	Button,
	Icon,
	Text,
	Table,
	Spinner,
	Flex,
} from '@chakra-ui/react';
import {FaChevronLeft, FaChevronRight} from 'react-icons/fa';

type MarkovitzData = {
	risk_annual: number;
	risk_daily: number;
	return_annual: number;
	return_daily: number;
	weights: { [key: string]: number };
	sharpe_ratio_annual: number;
	sharpe_ratio_daily: number;
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

	const reports = data?.getPortfolioReport?.data as MarkovitzData | undefined;
	const totalPortfolios = reports?.length ?? 0;
	const report = reports?.[selectedPortfolio];

	if (!reportId) return null;

	const allocation = Object.keys(report?.weights || {}).map((key) => ({
		name: key,
		value: +(report?.weights[key].toFixed(2) ?? 0),
	})).filter(al => al.value > 0);

	// Функции для переключения портфелей
	const prevPortfolio = () => {
		setSelectedPortfolio(prev => Math.max(0, prev - 1));
	};

	const nextPortfolio = () => {
		setSelectedPortfolio(prev => Math.min(totalPortfolios - 1, prev + 1));
	};

	return (
		<Box maxW="600px" mx="auto" textAlign="center" p={5}>
			{loading ? (
				<Spinner size="xl" color="blue.500"/>
			) : (
				<>
					<Text fontSize="lg" mb={4} fontWeight="bold">
						Выберите портфель
					</Text>

					{/* Кнопки переключения портфелей */}
					<Flex align="center" justify="center" mb={4}>
						<Button
							variant="solid"
							size="xs"
							colorPalette="blue"
							onClick={prevPortfolio}
							disabled={selectedPortfolio === 0}
						>
							<Icon as={FaChevronLeft}/>
						</Button>

						<Text w={70} fontSize="md" mx={4} fontWeight="bold">
							{selectedPortfolio + 1} / {totalPortfolios}
						</Text>

						<Button
							variant="solid"
							size="xs"
							colorPalette="blue"
							onClick={nextPortfolio}
							disabled={selectedPortfolio === totalPortfolios - 1}
						>
							<Icon as={FaChevronRight}/>
						</Button>
					</Flex>

					{/* Pie Chart */}
					<PieChart width={400} height={250} style={{width: '100%', height: 400}}>
						<Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
							{allocation.map((_, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
							))}
						</Pie>
						<Tooltip/>
						<Legend/>
					</PieChart>

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
								<Table.Row>
									<Table.Cell>Доходность (годовая)</Table.Cell>
									<Table.Cell
										fontWeight="bold">{(report.return_annual * 100).toFixed(2)}%</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell>Доходность (ежедневная)</Table.Cell>
									<Table.Cell>{(report.return_daily * 100).toFixed(2)}%</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell>Риск (годовой)</Table.Cell>
									<Table.Cell fontWeight="bold">{(report.risk_annual * 100).toFixed(2)}%</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell>Риск (ежедневный)</Table.Cell>
									<Table.Cell>{(report.risk_daily * 100).toFixed(2)}%</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell>Sharpe Ratio (годовой)</Table.Cell>
									<Table.Cell fontWeight="bold">{report.sharpe_ratio_annual.toFixed(2)}</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell>Sharpe Ratio (ежедневный)</Table.Cell>
									<Table.Cell>{report.sharpe_ratio_daily.toFixed(2)}</Table.Cell>
								</Table.Row>
							</Table.Body>
						)}
					</Table.Root>
				</>
			)}
		</Box>
	);
};

export default MarkovitzViewer;
