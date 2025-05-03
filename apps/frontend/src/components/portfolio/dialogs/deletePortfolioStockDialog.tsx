import {Reference} from '@apollo/client';
import React from 'react';
import {Button, Text} from '@chakra-ui/react';
import {useDeletePortfolioStockMutation} from '@frontend/generated/graphql-hooks';
import {
	DialogRoot,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogCloseTrigger,
} from '@frontend/components/ui/dialog';

interface DeletePortfolioStockButtonProps {
	portfolioStockId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	stockName: string;
	onDelete?: (deleted: boolean) => void;
}

const DeletePortfolioStockDialog: React.FC<DeletePortfolioStockButtonProps> = ({
	                                                                               portfolioStockId,
	                                                                               open,
	                                                                               stockName,
	                                                                               onOpenChange,
	                                                                               onDelete,
                                                                               }) => {
	const [deletePortfolioStock, {loading}] = useDeletePortfolioStockMutation();

	const handleDelete = async () => {
		const id = portfolioStockId;
		try {
			await deletePortfolioStock({
				variables: {portfolioStockId},
				update: (cache, result) => {
					if (result?.data) {
						cache.modify({
							fields: {
								getPortfolioStocks(existingRefs: ReadonlyArray<Reference> = [], {readField}) {
									return existingRefs.filter((ref) => {
										return readField<number>('id', ref) !== id;
									});
								},
							},
						});
					}
				},
			});
			onOpenChange(false);
			onDelete?.(true);
		} catch (err) {
			console.error('Ошибка удаления акции из портфеля:', err);
		}
	};

	return (
		<DialogRoot open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Удаление акции</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					<Text pl={8} pr={8}>
						Вы уверены, что хотите удалить акцию <b>{stockName}</b> из портфеля?
					</Text>
				</DialogDescription>
				<DialogFooter>
					<Button colorScheme="red" colorPalette="red" onClick={handleDelete} loading={loading}>
						Удалить
					</Button>
				</DialogFooter>
				<DialogCloseTrigger/>
			</DialogContent>
		</DialogRoot>
	);
};

export default DeletePortfolioStockDialog;
