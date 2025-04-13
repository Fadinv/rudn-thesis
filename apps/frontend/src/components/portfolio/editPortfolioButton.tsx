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
	DrawerTrigger,
} from '@frontend/components/ui/drawer';
import {useUpdatePortfolioMutation} from '@frontend/generated/graphql-hooks';
import React, {useState} from 'react';
import {Button, Icon, Input, Field, IconButton} from '@chakra-ui/react';
import {FaEdit} from 'react-icons/fa';

interface EditPortfolioButtonProps {
	portfolioId: number;
	currentName: string;
	onSave: () => void;
}

const EditPortfolioButton: React.FC<EditPortfolioButtonProps> = ({portfolioId, currentName, onSave}) => {
	const [portfolioName, setPortfolioName] = useState(currentName);
	const [open, setOpen] = useState(false);

	const [updatePortfolio, {error, loading}] = useUpdatePortfolioMutation();

	const handleSave = async () => {
		const result = await updatePortfolio({variables: {portfolioId, newName: portfolioName}});
		if (result?.data) {
			setOpen(false);
			onSave();
		}
	};

	return (
		<DrawerRoot size={'lg'} open={open} onOpenChange={(e) => setOpen(e.open)}>
			<DrawerBackdrop/>
			<DrawerTrigger asChild>
				<IconButton size="xs" colorPalette="teal" variant="solid">
					<Icon as={FaEdit}/>
				</IconButton>
			</DrawerTrigger>
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
					<Button onClick={handleSave} colorPalette="blue" loading={loading}>Сохранить</Button>
				</DrawerFooter>
				<DrawerCloseTrigger/>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default EditPortfolioButton;
