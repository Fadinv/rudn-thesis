import React from 'react';
import AddStockToPortfolioButton from '@frontend/components/portfolio/addStockToPortfolioButton';
import CreatePortfolioReportButton from '@frontend/components/portfolio/createPortfolioReportButton';
import DeletePortfolioStockButton from '@frontend/components/portfolio/deletePortfolioStockButton';
import EditPortfolioStockButton from '@frontend/components/portfolio/editPortfolioStockButton';
import ShowPortfolioReportButton from '@frontend/components/portfolio/portfolioReport/ShowPortfolioReportButton';
import {useGetPortfolioStocksQuery} from '@frontend/generated/graphql-hooks';
import {Text, Table, Spinner, Flex, Badge} from '@chakra-ui/react';

interface PortfolioViewProps {
	portfolioId: number;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({portfolioId}) => {
	const {data, loading, error, refetch} = useGetPortfolioStocksQuery({variables: {portfolioId}});

	const getCurrencyByExchange = (exchange: string) => {
		switch (exchange) {
			case 'MOEX': {
				return '₽';
			}
			case 'NASDAQ': {
				return '$';
			}
			default: {
				return null;
			}
		}
	};

	const getExchangeBadge = (exchange: string) => {
		switch (exchange) {
			case 'MOEX': {
				return <Badge colorPalette="red">{exchange}</Badge>;
			}
			case 'NASDAQ': {
				return <Badge colorPalette="green">{exchange}</Badge>;
			}
			default: {
				return <Badge>{exchange}</Badge>;
			}
		}
	};

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
								<Table.ColumnHeader>Рынок</Table.ColumnHeader>
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
									<Table.Cell></Table.Cell>
								</Table.Row>
							)}
							{data?.getPortfolioStocks?.map((pStock) => (
								<Table.Row key={pStock.id}>
									<Table.Cell>{pStock.stock.name}</Table.Cell>
									<Table.Cell>{pStock.stock.ticker}</Table.Cell>
									<Table.Cell>{getExchangeBadge(pStock.stock.exchange)}</Table.Cell>
									<Table.Cell>{pStock.quantity}</Table.Cell>
									<Table.Cell>
										{getCurrencyByExchange(pStock.stock.exchange)}
										{typeof pStock.averagePrice === 'number' ? pStock.averagePrice.toFixed(2) : '-'}
									</Table.Cell>
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
