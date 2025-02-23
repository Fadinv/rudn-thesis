import React, {useState} from 'react';
import {Button, Field, Icon, IconButton, Text} from '@chakra-ui/react';
import {FaTrash} from 'react-icons/fa';
import {useDeletePortfolioStockMutation} from '@/generated/graphql-hooks';
import {
	DialogRoot,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogCloseTrigger,
} from '@/components/ui/dialog';

interface DeletePortfolioStockButtonProps {
	portfolioStockId: number;
	stockName: string;
	onDelete: () => void;
}

const DeletePortfolioStockButton: React.FC<DeletePortfolioStockButtonProps> = ({
	                                                                               portfolioStockId,
	                                                                               stockName,
	                                                                               onDelete,
                                                                               }) => {
	const [open, setOpen] = useState(false);
	const [deletePortfolioStock, {loading, error}] = useDeletePortfolioStockMutation();

	const handleDelete = async () => {
		try {
			await deletePortfolioStock({variables: {portfolioStockId}});
			setOpen(false);
			onDelete();
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
