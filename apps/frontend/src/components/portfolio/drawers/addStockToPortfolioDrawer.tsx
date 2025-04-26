'use client';
import React, {useEffect, useState} from 'react';
import {
	DrawerRoot,
	DrawerBackdrop,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerBody,
	DrawerFooter,
	DrawerCloseTrigger,
} from '@frontend/components/ui/drawer';
import {Button} from '@chakra-ui/react';
import {Field} from '@frontend/components/ui/field';
import {NumberInputRoot, NumberInputField} from '@frontend/components/ui/number-input';
import {useAddStockToPortfolioMutation, useGetStockByIdLazyQuery} from '@frontend/generated/graphql-hooks';
import StockSearch from '@frontend/components/portfolio/StocksSearch';

interface AddStockToPortfolioDrawerProps {
	portfolioId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onStockAdded: () => void;
}

export const AddStockToPortfolioDrawer: React.FC<AddStockToPortfolioDrawerProps> = ({
	                                                                                    portfolioId,
	                                                                                    open,
	                                                                                    onOpenChange,
	                                                                                    onStockAdded,
                                                                                    }) => {
	const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [averagePrice, setAveragePrice] = useState(120);

	const [addStock, {loading, error}] = useAddStockToPortfolioMutation();
	const [getStockById, {data: stockData}] = useGetStockByIdLazyQuery({
		fetchPolicy: 'cache-first',
	});

	useEffect(() => {
		if (!selectedStockId) return;
		void getStockById({variables: {id: selectedStockId}});
	}, [selectedStockId, getStockById]);

	const handleSave = async () => {
		if (!selectedStockId) return;

		await addStock({
			variables: {
				portfolioId,
				stockId: selectedStockId,
				quantity: Number(quantity),
				averagePrice: averagePrice,
			},
		});

		onOpenChange(false);
		onStockAdded();
	};

	return (
		<DrawerRoot size="lg" open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<DrawerBackdrop/>
			<DrawerContent offset="4" rounded="md">
				<DrawerHeader>
					<DrawerTitle>Добавление акции</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<Field invalid={!!error} label="Укажите тикер">
						<StockSearch stockData={stockData} onSelectStock={(v) => setSelectedStockId(v)}/>
					</Field>

					<Field mt={4} label="Количество" invalid={quantity <= 0}>
						<NumberInputRoot>
							<NumberInputField
								min={1}
								defaultValue={1}
								onChange={(e) => setQuantity(Number(e.target.value))}
							/>
						</NumberInputRoot>
					</Field>

					<Field mt={4} label="Средняя цена" invalid={averagePrice <= 0}>
						<NumberInputRoot>
							<NumberInputField
								min={0}
								defaultValue={100}
								onChange={(e) => setAveragePrice(Number(e.target.value))}
							/>
						</NumberInputRoot>
					</Field>
				</DrawerBody>
				<DrawerFooter>
					<DrawerCloseTrigger asChild>
						<Button variant="outline">Отмена</Button>
					</DrawerCloseTrigger>
					<Button
						disabled={!selectedStockId || averagePrice <= 0 || quantity <= 0}
						colorPalette="blue"
						onClick={handleSave}
						loading={loading}
					>
						Добавить
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</DrawerRoot>
	);
};
