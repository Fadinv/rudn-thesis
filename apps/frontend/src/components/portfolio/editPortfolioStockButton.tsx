import {
	DrawerActionTrigger,
	DrawerBackdrop,
	DrawerBody,
	DrawerCloseTrigger,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTitle,
	DrawerTrigger,
} from '@frontend/components/ui/drawer';
import {useUpdatePortfolioStockMutation} from '@frontend/generated/graphql-hooks';
import React, {useState} from 'react';
import {Button, Icon, IconButton, Input, Text} from '@chakra-ui/react';
import {Field} from '@frontend/components/ui/field';
import {
	NumberInputField,
	NumberInputRoot,
} from '@frontend/components/ui/number-input';
import {FaEdit} from 'react-icons/fa';

interface EditPortfolioStockButtonProps {
	portfolioStockId: number;
	currentQuantity?: number | null;
	currentAveragePrice?: number | null;
	onSave: () => void;
}

const EditPortfolioStockButton: React.FC<EditPortfolioStockButtonProps> = ({
	                                                                           portfolioStockId,
	                                                                           currentQuantity,
	                                                                           currentAveragePrice,
	                                                                           onSave,
                                                                           }) => {
	const [quantity, setQuantity] = useState(currentQuantity);
	const [averagePrice, setAveragePrice] = useState(currentAveragePrice);
	const [open, setOpen] = useState(false);

	const [updatePortfolioStock, {error, loading}] = useUpdatePortfolioStockMutation();

	const handleSave = async () => {
		const result = await updatePortfolioStock({
			variables: {portfolioStockId, quantity, averagePrice},
		});
		if (result?.data) {
			setOpen(false);
			onSave();
		}
	};

	return (
		<DrawerRoot size="lg" open={open} onOpenChange={(e) => setOpen(e.open)}>
			<DrawerBackdrop/>
			<DrawerTrigger asChild>
				<IconButton colorPalette="teal" size="xs">
					<Icon as={FaEdit}/>
				</IconButton>
			</DrawerTrigger>
			<DrawerContent offset="4" rounded="md">
				<DrawerHeader>
					<DrawerTitle>Редактирование акции</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<Field
						mt={4}
						label={'Количество'}
					>
						<NumberInputRoot>
							<NumberInputField
								min={1}
								defaultValue="1"
								onChange={(e) => setQuantity(Number(e.target.value))}
							/>
						</NumberInputRoot>
					</Field>

					<Field
						mt={4}
						label={'Средняя цена'}
					>
						<Input
							type="number"
							placeholder="Введите среднюю цену"
							value={averagePrice ?? ''}
							onChange={(e) => setAveragePrice(parseFloat(e.target.value))}
						/>
					</Field>

					{error && <Text colorPalette="red">{error.message}</Text>}
				</DrawerBody>
				<DrawerFooter>
					<DrawerActionTrigger asChild>
						<Button disabled={loading} variant="outline">Отмена</Button>
					</DrawerActionTrigger>
					<Button onClick={handleSave} colorPalette="blue" loading={loading}>Сохранить</Button>
				</DrawerFooter>
				<DrawerCloseTrigger/>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default EditPortfolioStockButton;
