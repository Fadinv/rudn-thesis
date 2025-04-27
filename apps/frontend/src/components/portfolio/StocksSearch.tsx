import {
	DrawerRoot,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerTitle,
	DrawerCloseTrigger,
} from '@frontend/components/ui/drawer';
import {GetStockByIdQuery, useSearchStocksLazyQuery} from '@frontend/generated/graphql-hooks';
import React, {useCallback, useEffect, useState} from 'react';
import {Input, Box, IconButton, Icon, Button, Stack, Flex, Spinner, Text} from '@chakra-ui/react';
import {FaSearch} from 'react-icons/fa';

interface StockSearchProps {
	onSelectStock: (stockId: number, stockName: string, stockTicker: string) => void;
	stockData?: GetStockByIdQuery;
	includedStocks?: string[];
}

const StockSearch: React.FC<StockSearchProps> = ({onSelectStock, stockData, includedStocks}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [open, setOpen] = useState(false);

	const [search, {data, loading, error}] = useSearchStocksLazyQuery({
		fetchPolicy: 'cache-first',
	});

	const doSearch = useCallback(() => {
		return search({variables: {search: searchTerm, includedStocks}});
	}, [searchTerm, search, includedStocks]);

	useEffect(() => {
		if (searchTerm.length > 1) void doSearch();
	}, [searchTerm, doSearch]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const handleSelectStock = (stockId: number, stockName: string, stockTicker: string) => {
		onSelectStock(stockId, stockName, stockTicker);
		setOpen(false); // Закрываем модалку после выбора акции
	};

	return (
		<Box>
			{/*<Button colorScheme="blue" onClick={() => setOpen(true)}>*/}
			{/*	<Icon as={FaSearch} mr={2}/> Найти акцию*/}
			{/*</Button>*/}
			<Input
				placeholder="Найти акцию ..."
				value={stockData?.getStockById?.name ?? ''}
				_hover={{cursor: 'pointer'}}
				onClick={() => setOpen(true)}
				onChange={() => {}}
			/>

			<DrawerRoot size="lg" open={open} onOpenChange={(e) => setOpen(e.open)}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Выберите акцию</DrawerTitle>
					</DrawerHeader>
					<DrawerBody>
						<Flex gap={2}>
							<Input
								placeholder="Введите тикер или название..."
								value={searchTerm}
								onChange={handleSearch}
							/>
							<IconButton aria-label="Поиск акции" onClick={doSearch}>
								<Icon as={FaSearch}/>
							</IconButton>
						</Flex>

						{loading && <Spinner mt={4}/>}

						{error && <Text color="red.500">Ошибка загрузки</Text>}

						<Stack mt={4}>
							{data?.searchStocks?.slice(0, 10).map((stock) => (
								<Button
									key={stock.id}
									variant="outline"
									justifyContent="start"
									onClick={() => handleSelectStock(stock.id, stock.name, stock.ticker)}
								>
									{stock.ticker} - {stock.name}
								</Button>
							))}
						</Stack>
					</DrawerBody>
					<DrawerFooter>
						<DrawerCloseTrigger asChild>
							<Button variant="outline">Закрыть</Button>
						</DrawerCloseTrigger>
					</DrawerFooter>
				</DrawerContent>
			</DrawerRoot>
		</Box>
	);
};

export default StockSearch;
