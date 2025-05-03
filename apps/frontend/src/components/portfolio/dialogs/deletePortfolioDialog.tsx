import {
	GetUserPortfoliosDocument,
	useDeletePortfolioMutation,
	useGetUserPortfoliosQuery,
} from '@frontend/generated/graphql-hooks';
import {Portfolio} from '@frontend/generated/graphql-types';
import React from 'react';
import {Button, Text} from '@chakra-ui/react';
import {
	DialogRoot,
	DialogBackdrop,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogCloseTrigger,
} from '@frontend/components/ui/dialog';

interface EditPortfolioButtonProps {
	portfolioId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete?: (deleted: boolean) => void;
}

const DeletePortfolioDialog: React.FC<EditPortfolioButtonProps> = ({portfolioId, open, onOpenChange, onDelete}) => {
	const [deletePortfolio, {loading}] = useDeletePortfolioMutation();
	const {
		data: portfolios,
		loading: portfoliosAreLoading,
		called: portfoliosHasCalled,
	} = useGetUserPortfoliosQuery({fetchPolicy: 'cache-only'});

	const handleDelete = async () => {
		const targetId = portfolioId;
		try {
			await deletePortfolio({
				variables: {portfolioId: targetId},
				update: (cache, result) => {
					const deleted = result.data?.deletePortfolio;
					if (!deleted) return;

					cache.updateQuery({query: GetUserPortfoliosDocument, overwrite: true}, (data) => {
						const items = (data.getUserPortfolios.items || []).filter((item: Portfolio) => item.id !== targetId);

						return ({
							getUserPortfolios: {
								...data.getUserPortfolios,
								items,
								maxVersion: data.getUserPortfolios.maxVersion + 1,
							},
						});
					});
				},
			});
			onOpenChange(false);
			onDelete?.(true);
		} catch (err) {
			console.error('Ошибка удаления портфеля:', err);
		}
	};

	const currentPortfolio = portfolios?.getUserPortfolios?.items.find((p) => p.id === portfolioId);

	if (
		portfoliosAreLoading ||
		!portfoliosHasCalled ||
		!currentPortfolio
	) {
		return null;
	}

	return (
		<DialogRoot role="alertdialog" open={open} onOpenChange={(e) => onOpenChange(e.open)}>
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
					<Text pl={8} pr={8}>Вы уверены, что хотите удалить портфель <b>{currentPortfolio.name}</b>?</Text>
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

export default DeletePortfolioDialog;
