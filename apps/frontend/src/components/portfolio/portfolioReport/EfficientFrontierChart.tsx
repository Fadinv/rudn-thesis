import {MarkovitzData} from '@frontend/components/portfolio/portfolioReport/MarkovitzViewer';
import React, {FC} from 'react';
import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ZAxis,
	CartesianGrid, Cell,
} from 'recharts';
import {Box, Text} from '@chakra-ui/react';
import {ResponsiveContainer} from 'recharts';

interface EfficientFrontierChartProps {
	portfolios: MarkovitzData;
	selectedIndex?: number;
	onSelect: (index: number) => void;
	selected?: number;
}

const riskCategoryColors: Record<string, string> = {
	conservative: '#28a745', // зеленый
	standard: '#007bff',     // синий
	aggressive: '#dc3545',   // красный
	default: '#A0AEC0',      // серый
};

const EfficientFrontierChart: FC<EfficientFrontierChartProps> = ({portfolios, selected, onSelect}) => {
	if (!portfolios || portfolios.length === 0) return <Text>Нет данных для отображения.</Text>;

	const chartData = portfolios.map((p, index) => ({
		risk: +(p.risk_annual * 100).toFixed(2),
		return: +(p.return_annual * 100).toFixed(2),
		sharpe: p.sharpe_ratio_annual,
		index,
		category: p.risk_category,
		color: riskCategoryColors[p.risk_category] || riskCategoryColors.default,
		isSelected: index === selected,
	}));

	const risks = chartData.map(d => d.risk);
	const minRisk = Math.floor(risks[0]);
	const maxRisk = Math.ceil(risks[risks.length - 1]);

	return (
		<Box width="100%" minH="520px" overflowX="auto">
			<ResponsiveContainer width="100%" height={400}>
				<ScatterChart width={500} height={500} margin={{top: 20, right: 30, bottom: 20, left: 30}}>
					<CartesianGrid strokeDasharray="3 3"/>
					<XAxis
						type="number"
						dataKey="risk"
						name="Риск"
						unit="%"
						tick={{fontSize: 12}}
						label={{value: 'Риск (волатильность)', position: 'insideBottom', offset: -10}}
						domain={[minRisk, maxRisk]}
					/>
					<YAxis
						type="number"
						dataKey="return"
						name="Доходность"
						unit="%"
						tick={{fontSize: 12}}
						label={{value: 'Доходность (годовая)', angle: -90, position: 'insideLeft'}}
					/>
					<ZAxis type="number" dataKey="sharpe" range={[100, 300]} name="Sharpe Ratio"/>
					<Tooltip
						cursor={{strokeDasharray: '3 3'}}
						formatter={(value: number) => `${value.toFixed(2)}`}
						labelFormatter={() => ''}
					/>
					<Legend verticalAlign="top" height={36}/>
					<Scatter
						name="Портфели"
						data={chartData}
						shape="circle"
						onClick={(e) => onSelect(e.index)}
					>
						{chartData.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={entry.isSelected ? '#000' : entry.color}
								r={entry.isSelected ? 6 : 4}
							/>
						))}
					</Scatter>
				</ScatterChart>
			</ResponsiveContainer>
		</Box>
	);
};

export default EfficientFrontierChart;
