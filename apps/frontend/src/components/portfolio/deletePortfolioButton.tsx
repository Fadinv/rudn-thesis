import {Portfolio} from '@frontend/generated/graphql-types';
import React, {useState} from 'react';
import {Button, Icon, IconButton, Text} from '@chakra-ui/react';
import {FaTrash} from 'react-icons/fa';
import {GetUserPortfoliosDocument, useDeletePortfolioMutation} from '@frontend/generated/graphql-hooks';
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
		const targetId = portfolioId;
		try {
			await deletePortfolio({
				variables: {portfolioId: targetId},
				update: (cache, result) => {
					const deleted = result.data?.deletePortfolio;
					if (!deleted) return;

					cache.updateQuery({query: GetUserPortfoliosDocument, overwrite: true}, (data) => {
						console.log(data.getUserPortfolios.items, targetId);
						console.log(data.getUserPortfolios.items, targetId);
						const items = (data.getUserPortfolios.items || []).filter((item: Portfolio) => item.id !== targetId);

						console.log('items', items);
						return ({
							getUserPortfolios: {
								...data.getUserPortfolios,
								items,
								maxVersion: data.getUserPortfolios.maxVersion + 1,
							},
						});
					});
					console.log('CACHE', cache);
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
