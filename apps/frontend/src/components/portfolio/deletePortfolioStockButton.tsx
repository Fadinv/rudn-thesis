import {Reference} from '@apollo/client';
import React, {useState} from 'react';
import {Button, Icon, IconButton, Text} from '@chakra-ui/react';
import {FaTrash} from 'react-icons/fa';
import {useDeletePortfolioStockMutation} from '@frontend/generated/graphql-hooks';
import {
	DialogRoot,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogCloseTrigger,
} from '@frontend/components/ui/dialog';

interface DeletePortfolioStockButtonProps {
	portfolioStockId: number;
	stockName: string;
	onDelete?: (deleted: boolean) => void;
}

const DeletePortfolioStockButton: React.FC<DeletePortfolioStockButtonProps> = ({
	                                                                               portfolioStockId,
	                                                                               stockName,
	                                                                               onDelete,
                                                                               }) => {
	const [open, setOpen] = useState(false);
	const [deletePortfolioStock, {loading}] = useDeletePortfolioStockMutation();

	const handleDelete = async () => {
		const id = portfolioStockId;
		try {
			await deletePortfolioStock({
				variables: {portfolioStockId},
				update: (cache, result) => {
					console.log('result', result.data);
					if (result?.data) {
						cache.modify({
							fields: {
								getPortfolioStocks(existingRefs: ReadonlyArray<Reference> = [], {readField}) {
									console.log(existingRefs);
									return existingRefs.filter((ref) => {
										return readField<number>('id', ref) !== id;
									});
								},
							},
						});
					}
				}
			});
			setOpen(false);
			onDelete?.(true);
		} catch (err) {
			console.error('Ошибка удаления акции из портфеля:', err);
		}
	};

	return (
		<DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
			<DialogTrigger asChild>
				<IconButton size="xs" colorScheme="red" colorPalette="red" variant="solid">
					<Icon as={FaTrash}/>
				</IconButton>
			</DialogTrigger>
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

export default DeletePortfolioStockButton;
