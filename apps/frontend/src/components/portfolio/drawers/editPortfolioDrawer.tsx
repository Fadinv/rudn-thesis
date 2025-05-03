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
import {useGetUserPortfoliosQuery, useUpdatePortfolioMutation} from '@frontend/generated/graphql-hooks';
import React, {useEffect, useState} from 'react';
import {Button, Input, Field} from '@chakra-ui/react';

interface EditPortfolioButtonProps {
	portfolioId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const EditPortfolioDrawer: React.FC<EditPortfolioButtonProps> = ({portfolioId, open, onOpenChange}) => {
	const [portfolioName, setPortfolioName] = useState('');

	const {
		data: portfolios,
		loading: portfoliosAreLoading,
		called: portfoliosHasCalled,
	} = useGetUserPortfoliosQuery({fetchPolicy: 'cache-only'});
	const [updatePortfolio, {error, loading}] = useUpdatePortfolioMutation();

	const handleSave = async () => {
		const result = await updatePortfolio({variables: {portfolioId, newName: portfolioName}});

		if (result?.data) onOpenChange(false);
	};

	useEffect(() => {
		const currentPortfolio = portfolios?.getUserPortfolios?.items.find((p) => p.id === portfolioId);
		if (!currentPortfolio) return;
		if (!portfolioName) setPortfolioName(currentPortfolio.name);
	}, [portfolios]);

	if (
		portfoliosAreLoading ||
		!portfoliosHasCalled ||
		!portfolios?.getUserPortfolios?.items.find((p) => p.id === portfolioId)
	) {
		return null;
	}

	return (
		<DrawerRoot size={'lg'} open={open} onOpenChange={(e) => onOpenChange(e.open)}>
			<DrawerBackdrop/>
			<DrawerContent offset="4" rounded="md">
				<DrawerHeader>
					<DrawerTitle>Редактирование портфеля</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<Field.Root invalid={!!error}>
						<Field.Label>Новое название</Field.Label>
						<Input
							placeholder="Введите новое название"
							value={portfolioName}
							onChange={(e) => setPortfolioName(e.target.value)}
						/>
						{error && <Field.ErrorText>{error.message}</Field.ErrorText>}
					</Field.Root>
				</DrawerBody>
				<DrawerFooter>
					<DrawerActionTrigger asChild>
						<Button disabled={loading} variant="outline">Отмена</Button>
					</DrawerActionTrigger>
					<Button
						onClick={handleSave}
						colorPalette="blue"
						loading={loading}
						disabled={!portfolioName}
					>
						Сохранить
					</Button>
				</DrawerFooter>
				<DrawerCloseTrigger/>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default EditPortfolioDrawer;
