import StockSearch from '@/components/portfolio/StocksSearch';
import React, {useEffect, useState} from 'react';
import {Button, Icon} from '@chakra-ui/react';
import {FaPlus} from 'react-icons/fa';
import {
	DrawerRoot,
	DrawerTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerBody,
	DrawerFooter,
	DrawerBackdrop,
	DrawerCloseTrigger,
} from '@/components/ui/drawer';
import {Field} from '@/components/ui/field';
import {
	NumberInputField,
	NumberInputRoot,
} from '@/components/ui/number-input';
import {
	useAddStockToPortfolioMutation,
	useGetStockByIdLazyQuery,
} from '@/generated/graphql-hooks';

interface AddStockToPortfolioProps {
	portfolioId: number;
	onStockAdded: () => void;
}

const AddStockToPortfolioButton: React.FC<AddStockToPortfolioProps> = ({
	                                                                       portfolioId,
	                                                                       onStockAdded,
                                                                       }) => {
	const [open, setOpen] = useState(false);
	const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [averagePrice, setAveragePrice] = useState(100);

	const [addStock, {loading, error}] = useAddStockToPortfolioMutation();

	const [getStockById, {
		data: stockData,
		loading: stockByTickerIsLoading,
		error: stockDataError,
	}] = useGetStockByIdLazyQuery({
		fetchPolicy: 'cache-first',
	});

	useEffect(() => {
		if (!selectedStockId) return;
		void getStockById({variables: {id: selectedStockId}});
	}, [selectedStockId]);

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

		setOpen(false);
		onStockAdded();
	};

	return (
		<DrawerRoot size={'lg'} open={open} onOpenChange={(e) => setOpen(e.open)}>
			<DrawerBackdrop/>
			<DrawerTrigger asChild>
				<Button variant="solid" size="sm" mb={4}>
					<Icon as={FaPlus}/> Добавить акцию
				</Button>
			</DrawerTrigger>
			<DrawerContent offset="4" rounded="md">
				<DrawerHeader>
					<DrawerTitle>Добавление акции</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<Field
						invalid={!!error}
						label={'Укажите тикер'}
					>
						<StockSearch stockData={stockData} onSelectStock={(v) => setSelectedStockId(v)}/>
					</Field>

					<Field
						mt={4}
						label={'Количество'}
						invalid={typeof quantity !== 'number' || quantity <= 0}
					>
						<NumberInputRoot>
							<NumberInputField
								min={1}
								defaultValue={1}
								onChange={(e) => setQuantity(Number(e.target.value))}
							/>
						</NumberInputRoot>
					</Field>
					<Field
						mt={4}
						label={'Средняя цена'}
						invalid={typeof averagePrice !== 'number' || averagePrice <= 0}
					>
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
						disabled={!selectedStockId || typeof averagePrice !== 'number' || averagePrice <= 0 || typeof quantity !== 'number' || quantity <= 0}
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

export default AddStockToPortfolioButton;
