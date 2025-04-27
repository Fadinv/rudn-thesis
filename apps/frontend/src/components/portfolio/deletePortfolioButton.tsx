import {Reference} from '@apollo/client';
import React, {useState} from 'react';
import {Button, Icon, IconButton, Text} from '@chakra-ui/react';
import {FaTrash} from 'react-icons/fa';
import {useDeletePortfolioMutation} from '@frontend/generated/graphql-hooks';
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

interface DeletePortfolioButtonProps {
	portfolioId: number;
	portfolioName: string;
	onDelete?: (deleted: boolean) => void;
}

const DeletePortfolioButton: React.FC<DeletePortfolioButtonProps> = ({
	                                                                     portfolioId,
	                                                                     portfolioName,
	                                                                     onDelete,
                                                                     }) => {
	const [open, setOpen] = useState(false);
	const [deletePortfolio, {loading}] = useDeletePortfolioMutation();

	const handleDelete = async () => {
		try {
			await deletePortfolio({
				variables: {portfolioId},
				update: (cache) => {
					cache.modify({
						fields: {
							getUserPortfolios(existingRefs: ReadonlyArray<Reference> = [], {readField}) {
								return existingRefs.filter((ref) => {
									return readField<number>('id', ref) !== portfolioId;
								});
							},
						},
					});
				},
			});
			setOpen(false);
			onDelete?.(true);
		} catch (err) {
			console.error('Ошибка удаления портфеля:', err);
		}
	};

	return (
		<DialogRoot role="alertdialog" open={open} onOpenChange={(e) => setOpen(e.open)}>
			<DialogTrigger asChild>
				<IconButton size="xs" colorScheme="red" colorPalette="red" variant="solid">
					<Icon as={FaTrash}/>
				</IconButton>
			</DialogTrigger>
			<DialogContent
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
			>
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
