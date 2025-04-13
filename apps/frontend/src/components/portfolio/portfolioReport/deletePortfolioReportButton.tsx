import React, {useState} from 'react';
import {Button, Icon, IconButton, Text} from '@chakra-ui/react';
import {FaTrash} from 'react-icons/fa';
import {useDeletePortfolioReportMutation} from '@frontend/generated/graphql-hooks';
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
	reportId: string;
	portfolioReportName: string;
	onDelete: () => void;
}

const DeletePortfolioReportButton: React.FC<DeletePortfolioButtonProps> = ({
	                                                                           reportId,
	                                                                           portfolioReportName,
	                                                                           onDelete,
                                                                           }) => {
	const [open, setOpen] = useState(false);
	const [deletePortfolio, {loading}] = useDeletePortfolioReportMutation();

	const handleDelete: React.MouseEventHandler = async (e) => {
		e.stopPropagation();
		e.preventDefault();
		try {
			await deletePortfolio({variables: {reportId}});
			setOpen(false);
			onDelete();
		} catch (err) {
			console.error('Ошибка удаления отчета:', err);
		}
	};

	return (
		<DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
			<DialogTrigger asChild>
				<IconButton onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					setOpen(true);
				}} size="xs" colorPalette="cyan" variant="solid">
					<Icon as={FaTrash}/>
				</IconButton>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Удаление отчета</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					<Text pl={8} pr={8}>Вы уверены, что хотите удалить отчет <b>{portfolioReportName}</b>?</Text>
				</DialogDescription>
				<DialogFooter>
					<Button colorScheme="red" colorPalette="red" onClickCapture={handleDelete} loading={loading}>
						Удалить
					</Button>
				</DialogFooter>
				<DialogCloseTrigger/>
			</DialogContent>
		</DialogRoot>
	);
};

export default DeletePortfolioReportButton;
