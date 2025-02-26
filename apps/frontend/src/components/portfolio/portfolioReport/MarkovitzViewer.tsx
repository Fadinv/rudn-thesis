import {useGetPortfolioReportQuery} from '@/generated/graphql-hooks';
import React, {FC, useState} from 'react';
import {PieChart, Pie, Cell, Tooltip, Legend} from 'recharts';
import {
	Box,
	SliderTrack,
	SliderThumb,
	Text,
	Table, Spinner,
} from '@chakra-ui/react';
import {Slider} from '@/components/ui/slider';

type MarkovitzData = {
	risk: number;
	return: number,
	weights: {
		[key: string]: number;
	},
	sharpe_ratio: number
}[];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

interface MarkovitzViewerProps {
	reportId: string;
}

const MarkovitzViewer: FC<MarkovitzViewerProps> = ({reportId}) => {
	const [selectedPortfolio, setSelectedPortfolio] = useState([0]);

	const {data, loading} = useGetPortfolioReportQuery({variables: {reportId}});

	const reports = data?.getPortfolioReport?.data as (MarkovitzData | undefined);

	const report = reports?.[selectedPortfolio[0]];

	if (!reportId) return null;

	const allocation = Object.keys(report?.weights || {}).map((key) => {
		return {name: key, value: +(report?.weights[key].toFixed(2) ?? 0)}
	}).filter((al) => {
		return al.value > 0;
	});

	return (
		<Box maxW="600px" mx="auto" textAlign="center" p={5}>
			{loading ? (
				<Spinner size="xl" color="blue.500"/>
			) : (
				<>
					<Text fontSize="lg" mb={4}>Выберите портфель</Text>

					<Slider
						defaultValue={[0]}
						min={0}
						max={(reports?.length ?? 1) - 1}
						step={1}
						onValueChange={(details) => setSelectedPortfolio(details.value)}
					>
						<SliderTrack bg="gray.200"/>
						<SliderThumb index={1}/>
					</Slider>

					<Text fontSize="md" mt={2}>
						Портфель {selectedPortfolio[0] + 1}
					</Text>

					{/* Pie Chart */}
					<PieChart width={400} height={250}>
						<Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
						     label>
							{allocation.map((_, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
							))}
						</Pie>
						<Tooltip/>
						<Legend/>
					</PieChart>

					{/* Таблица с новой API */}
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
									<Table.Cell>Доходность</Table.Cell>
									<Table.Cell>{(report.return * 100).toFixed(2)}%</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell>Риск</Table.Cell>
									<Table.Cell>{(report.risk * 100).toFixed(2)}%</Table.Cell>
								</Table.Row>
								<Table.Row>
									<Table.Cell>Sharpe Ratio</Table.Cell>
									<Table.Cell>{report.sharpe_ratio.toFixed(2)}</Table.Cell>
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
