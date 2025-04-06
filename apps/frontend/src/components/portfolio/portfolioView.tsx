import React from 'react';
import AddStockToPortfolioButton from '@/components/portfolio/addStockToPortfolioButton';
import CreatePortfolioReportButton from '@/components/portfolio/createPortfolioReportButton';
import DeletePortfolioStockButton from '@/components/portfolio/deletePortfolioStockButton';
import EditPortfolioStockButton from '@/components/portfolio/editPortfolioStockButton';
import ShowPortfolioReportButton from '@/components/portfolio/portfolioReport/ShowPortfolioReportButton';
import {useGetPortfolioStocksQuery} from '@/generated/graphql-hooks';
import {Text, Table, Spinner, Flex} from '@chakra-ui/react';

interface PortfolioViewProps {
	portfolioId: number;
	onAddStock: (portfolioId: number) => void;
	onUpdateStock: (portfolioId: number, stockId: number) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({portfolioId}) => {
	const {data, loading, error, refetch} = useGetPortfolioStocksQuery({variables: {portfolioId}});

	return (
		<Flex direction={'column'} h={'100%'}>
			{portfolioId && (
				<Flex gap={4}>
					<AddStockToPortfolioButton
						portfolioId={portfolioId}
						onStockAdded={() => refetch()}
					/>
					<CreatePortfolioReportButton
						portfolioId={portfolioId}
					/>
					<ShowPortfolioReportButton
						portfolioId={portfolioId}
					/>
				</Flex>
			)}

			{error && <Text color="red.500">{error.message}</Text>}
			{loading ? (
				<Spinner size="xl" color="blue.500"/>
			) : (
				<Flex flex={1} alignItems={'flex-start'} overflow={'auto'} position={'relative'}>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader>Название</Table.ColumnHeader>
								<Table.ColumnHeader>Тикер</Table.ColumnHeader>
								<Table.ColumnHeader>Количество</Table.ColumnHeader>
								<Table.ColumnHeader>Средняя цена</Table.ColumnHeader>
								<Table.ColumnHeader>Действия</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{!data?.getPortfolioStocks.length && (
								<Table.Row key={'emptyList'}>
									<Table.Cell>Список пуст</Table.Cell>
									<Table.Cell></Table.Cell>
									<Table.Cell></Table.Cell>
									<Table.Cell></Table.Cell>
									<Table.Cell></Table.Cell>
								</Table.Row>
							)}
							{data?.getPortfolioStocks?.map((pStock) => (
								<Table.Row key={pStock.id}>
									<Table.Cell>{pStock.stock.name}</Table.Cell>
									<Table.Cell>{pStock.stock.ticker}</Table.Cell>
									<Table.Cell>{pStock.quantity}</Table.Cell>
									<Table.Cell>${typeof pStock.averagePrice === 'number' ? pStock.averagePrice.toFixed(2) : '-'}</Table.Cell>
									<Table.Cell>
										<Flex gap={2}>
											<EditPortfolioStockButton
												currentAveragePrice={pStock.averagePrice}
												portfolioStockId={pStock.id}
												currentQuantity={pStock.quantity}
												onSave={() => refetch()}
											/>
											<DeletePortfolioStockButton
												portfolioStockId={pStock.id}
												stockName={pStock.stock.name}
												onDelete={() => refetch()}
											/>
										</Flex>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</Flex>
			)}
		</Flex>
	);
};

export default PortfolioView;
