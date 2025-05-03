'use client';
import ActionsMenu from '@frontend/components/portfolio/actionsMenu';
import BackButton from '@frontend/components/portfolio/backButton';
import DeletePortfolioStockDialog from '@frontend/components/portfolio/dialogs/deletePortfolioStockDialog';
import EditPortfolioStockDrawer from '@frontend/components/portfolio/drawers/EditPortfolioStockDrawer';
import React, {useState} from 'react';
import {Box, Flex, Heading, Text, Spinner, Badge, Menu, Portal, Icon, Button} from '@chakra-ui/react';
import {Table} from '@chakra-ui/react';
import {useGetPortfolioStocksQuery, useGetUserPortfoliosQuery} from '@frontend/generated/graphql-hooks';
import {FaChartPie, FaEllipsisV} from 'react-icons/fa';

interface PortfolioViewProps {
	portfolioId: number;
	onBack?: () => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({portfolioId, onBack}) => {
	const {data, loading, error, refetch} = useGetPortfolioStocksQuery({variables: {portfolioId}});
	const {data: userPortfolio} = useGetUserPortfoliosQuery({fetchPolicy: 'cache-only'});

	const [editOpenId, setEditOpenId] = useState<number | null>(null);
	const [deleteOpenId, setDeleteOpenId] = useState<number | null>(null);

	const currentPortfolio = (userPortfolio?.getUserPortfolios.items || []).find((portfolio) => portfolio.id === portfolioId);

	// TODO: Раскомментировать, когда нужно будет отображать цены
	// const getCurrencyByExchange = (exchange: string) => {
	// 	switch (exchange) {
	// 		case 'MOEX':
	// 			return '₽';
	// 		case 'NASDAQ':
	// 			return '$';
	// 		default:
	// 			return null;
	// 	}
	// };

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

	const renderEditDrawer = (id: number | null) => {
		if (typeof id !== 'number') return null;

		const currentStock = data?.getPortfolioStocks.find(s => s.id === id);

		if (!currentStock) return null;

		return (
			<EditPortfolioStockDrawer
				portfolioStockId={id}
				open
				onOpenChange={(open) => {
					if (!open) setEditOpenId(null);
				}}
				currentQuantity={currentStock.quantity}
				currentAveragePrice={currentStock.averagePrice}
			/>
		);
	};

	const renderDeleteDialog = (id: number | null) => {
		if (typeof id !== 'number') return null;

		const currentStock = data?.getPortfolioStocks.find(s => s.id === id);

		if (!currentStock) return null;

		return (
			<DeletePortfolioStockDialog
				stockName={currentStock.stock?.name ?? '{UNKNOWN_NAME}'}
				open
				onOpenChange={(open) => {
					if (!open) setDeleteOpenId(null);
				}}
				portfolioStockId={id}
			/>
		);
	};

	return (
		<Flex direction="column" h="100%" gap={4} w="100%">
			{/* Шапка */}
			<Flex align="center" justify="space-between" wrap="wrap" gap={4}>
				<Flex align="center" gap={2}>
					{onBack && <BackButton onClick={onBack}/>}

					{currentPortfolio && (
						<Heading size="md" display="flex" alignItems="center" gap={2}>
							<Icon as={FaChartPie} color="blue.500"/>
							{currentPortfolio.name || 'Портфель'}
						</Heading>
					)}
				</Flex>
			</Flex>
			<ActionsMenu
				portfolioId={portfolioId}
				refetch={() => refetch()}
			/>

			{/* Ошибка */}
			{error && (
				<Text color="red.500" textAlign="center">
					{error.message}
				</Text>
			)}

			{/* Контент */}
			{
				<Box flex="1" w="100%" overflow="auto">
					<Box minW={{base: '600px', md: '800px'}}>
						{
							loading ? (
								<Flex flex="1" align="center" justify="center">
									<Spinner size="xl" color="blue.500"/>
								</Flex>
							) : (
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.ColumnHeader>Название</Table.ColumnHeader>
											<Table.ColumnHeader>Тикер</Table.ColumnHeader>
											<Table.ColumnHeader>Рынок</Table.ColumnHeader>
											<Table.ColumnHeader>Количество</Table.ColumnHeader>
											{/*<Table.ColumnHeader>Средняя цена</Table.ColumnHeader>*/}
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
												{/*<Table.Cell/>*/}
												<Table.Cell/>
											</Table.Row>
										) : (
											data.getPortfolioStocks.map((pStock) => (
												<Table.Row key={pStock.id}>
													<Table.Cell>{pStock.stock.name}</Table.Cell>
													<Table.Cell>{pStock.stock.ticker}</Table.Cell>
													<Table.Cell>{getExchangeBadge(pStock.stock.exchange)}</Table.Cell>
													<Table.Cell>{pStock.quantity}</Table.Cell>
													{/*<Table.Cell>*/}
													{/*	{getCurrencyByExchange(pStock.stock.exchange)}*/}
													{/*	{typeof pStock.averagePrice === 'number' ? pStock.averagePrice.toFixed(2) : '-'}*/}
													{/*</Table.Cell>*/}
													<Table.Cell textAlign="center">
														<Menu.Root>
															<Menu.Trigger
																onClick={(e) => e.stopPropagation()}
																asChild
															>
																<Button variant="ghost" colorPalette="gray" size="xs">
																	<Icon as={FaEllipsisV} fontSize="xs"/>
																</Button>
															</Menu.Trigger>
															<Portal>
																<Menu.Positioner>
																	<Menu.Content>
																		<Menu.Item
																			value="edit"
																			onClick={() => setEditOpenId(pStock.id)}
																		>
																			Редактировать
																		</Menu.Item>
																		<Menu.Item
																			value="delete"
																			color="fg.error"
																			_hover={{bg: 'bg.error', color: 'fg.error'}}
																			onClick={() => setDeleteOpenId(pStock.id)}
																		>
																			Удалить...
																		</Menu.Item>
																	</Menu.Content>
																</Menu.Positioner>
															</Portal>
														</Menu.Root>
													</Table.Cell>
												</Table.Row>
											))
										)}
									</Table.Body>
								</Table.Root>
							)
						}
					</Box>
				</Box>
			}
			{renderEditDrawer(editOpenId)}
			{renderDeleteDialog(deleteOpenId)}
		</Flex>
	);
};

export default PortfolioView;
