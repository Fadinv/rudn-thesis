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
} from '@frontend/components/ui/drawer';
import {UpdatePortfolioStockMutation, useUpdatePortfolioStockMutation} from '@frontend/generated/graphql-hooks';
import React, {useState} from 'react';
import {Button, Text} from '@chakra-ui/react';
import {Field} from '@frontend/components/ui/field';
import {
	NumberInputField,
	NumberInputRoot,
} from '@frontend/components/ui/number-input';

interface EditPortfolioStockButtonProps {
	portfolioStockId: number;
	currentQuantity?: number | null;
	currentAveragePrice?: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave?: (data?: UpdatePortfolioStockMutation | null | undefined) => void;
}

const EditPortfolioStockDrawer: React.FC<EditPortfolioStockButtonProps> = ({
	                                                                           portfolioStockId,
	                                                                           currentQuantity,
	                                                                           open,
	                                                                           onOpenChange,
	                                                                           onSave,
                                                                           }) => {
	const [quantity, setQuantity] = useState(currentQuantity);

	const [updatePortfolioStock, {error, loading}] = useUpdatePortfolioStockMutation();

	const handleSave = async () => {
		const result = await updatePortfolioStock({
			variables: {
				portfolioStockId,
				quantity,
			},
		});

		if (result?.data) onOpenChange(false);
		onSave?.(result?.data);
	};

	return (
		<DrawerRoot
			size="lg"
			open={open}
			onOpenChange={(e) => onOpenChange(e.open)}
		>
			<DrawerBackdrop/>
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
					{error && <Text colorPalette="red">{error.message}</Text>}
				</DrawerBody>
				<DrawerFooter>
					<DrawerActionTrigger asChild>
						<Button disabled={loading} variant="outline">Отмена</Button>
					</DrawerActionTrigger>
					<Button onClick={handleSave} colorPalette="blue"
					        disabled={typeof quantity !== 'number' || quantity <= 0}
					        loading={loading}>Сохранить</Button>
				</DrawerFooter>
				<DrawerCloseTrigger/>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default EditPortfolioStockDrawer;
