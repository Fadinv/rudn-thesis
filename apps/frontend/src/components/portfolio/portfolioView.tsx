'use client';
import ActionsMenu from '@frontend/components/portfolio/actionsMenu';
import BackButton from '@frontend/components/portfolio/backButton';
import React from 'react';
import {Box, Flex, Heading, Text, Spinner, Badge} from '@chakra-ui/react';
import {Table} from '@chakra-ui/react';
import {useGetPortfolioStocksQuery, useGetUserPortfoliosQuery} from '@frontend/generated/graphql-hooks';
import EditPortfolioStockButton from '@frontend/components/portfolio/editPortfolioStockButton';
import DeletePortfolioStockButton from '@frontend/components/portfolio/deletePortfolioStockButton';

interface PortfolioViewProps {
	portfolioId: number;
	onBack?: () => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({portfolioId, onBack}) => {
	const {data, loading, error, refetch} = useGetPortfolioStocksQuery({variables: {portfolioId}});
	const {data: portfolios} = useGetUserPortfoliosQuery({fetchPolicy: 'cache-only'});

	const currentPortfolio = portfolios?.getUserPortfolios.find((portfolio) => portfolio.id === portfolioId);

	const getCurrencyByExchange = (exchange: string) => {
		switch (exchange) {
			case 'MOEX':
				return '₽';
			case 'NASDAQ':
				return '$';
			default:
				return null;
		}
	};

	const getExchangeBadge = (exchange: string) => {
		switch (exchange) {
			case 'MOEX':
				return <Badge colorPalette="red">{exchange}</Badge>;
			case 'NASDAQ':
				return <Badge colorPalette="green">{exchange}</Badge>;
			default:
				return <Badge>{exchange}</Badge>;
		}
	};

	return (
		<Flex direction="column" h="100%" gap={4} w="100%">
			{/* Шапка */}
			<Flex align="center" justify="space-between" wrap="wrap" gap={4}>
				<Flex align="center" gap={2}>
					{onBack && <BackButton onClick={onBack}/>}

					{currentPortfolio && (
						<Heading size="md">
							{currentPortfolio.name || 'Портфель'}
						</Heading>
					)}
				</Flex>
			</Flex>
			<ActionsMenu
				portfolioId={portfolioId}
				refetch={() => refetch()}
			/>

			{/*<Flex gap={2} wrap="wrap" justify={{base: 'flex-end', md: 'flex-start'}}>*/}
			{/*	<AddStockToPortfolioButton portfolioId={portfolioId} onStockAdded={() => refetch()}/>*/}
			{/*	<CreatePortfolioReportButton portfolioId={portfolioId}/>*/}
			{/*	<ShowPortfolioReportButton portfolioId={portfolioId}/>*/}
			{/*</Flex>*/}

			{/* Ошибка */}
			{error && (
				<Text color="red.500" textAlign="center">
					{error.message}
				</Text>
			)}

			{/* Контент */}
			{loading ? (
				<Flex flex="1" align="center" justify="center">
					<Spinner size="xl" color="blue.500"/>
				</Flex>
			) : (
				<Box flex="1" w="100%" overflow="auto">
					<Box minW={{base: '600px', md: '800px'}}>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.ColumnHeader>Название</Table.ColumnHeader>
									<Table.ColumnHeader>Тикер</Table.ColumnHeader>
									<Table.ColumnHeader>Рынок</Table.ColumnHeader>
									<Table.ColumnHeader>Количество</Table.ColumnHeader>
									<Table.ColumnHeader>Средняя цена</Table.ColumnHeader>
									<Table.ColumnHeader textAlign="center">Действия</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{!data?.getPortfolioStocks.length ? (
									<Table.Row key="empty">
										<Table.Cell>Список пуст</Table.Cell>
										<Table.Cell/>
										<Table.Cell/>
										<Table.Cell/>
										<Table.Cell/>
										<Table.Cell/>
									</Table.Row>
								) : (
									data.getPortfolioStocks.map((pStock) => (
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
												<Flex justify="center" gap={2}>
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
									))
								)}
							</Table.Body>
						</Table.Root>
					</Box>
				</Box>
			)}
		</Flex>
	);
};

export default PortfolioView;
