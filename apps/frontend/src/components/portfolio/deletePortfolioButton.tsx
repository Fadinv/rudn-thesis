import React, {useState} from 'react';
import {Button, Field, Icon, IconButton, Text} from '@chakra-ui/react';
import {FaTrash, FaTimes} from 'react-icons/fa';
import {useDeletePortfolioMutation} from '@/generated/graphql-hooks';
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

interface DeletePortfolioButtonProps {
	portfolioId: number;
	portfolioName: string;
	onDelete: () => void;
}

const DeletePortfolioButton: React.FC<DeletePortfolioButtonProps> = ({
	                                                                     portfolioId,
	                                                                     portfolioName,
	                                                                     onDelete,
                                                                     }) => {
	const [open, setOpen] = useState(false);
	const [deletePortfolio, {loading, error}] = useDeletePortfolioMutation();

	const handleDelete = async () => {
		try {
			await deletePortfolio({variables: {portfolioId}});
			setOpen(false);
			onDelete();
		} catch (err) {
			console.error('Ошибка удаления портфеля:', err);
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
					<DialogTitle>Удаление портфеля</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					<Text pl={8} pr={8}>Вы уверены, что хотите удалить портфель <b>{portfolioName}</b>?</Text>
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

export default DeletePortfolioButton;
