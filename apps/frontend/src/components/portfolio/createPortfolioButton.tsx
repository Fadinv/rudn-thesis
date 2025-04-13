import {
	DrawerActionTrigger,
	DrawerBackdrop, DrawerBody, DrawerCloseTrigger,
	DrawerContent, DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTitle,
	DrawerTrigger,
} from '@frontend/components/ui/drawer';
import {useCreatePortfolioMutation} from '@frontend/generated/graphql-hooks';
import React, {useState} from 'react';
import {
	Button, Icon,
	Input, Field,
} from '@chakra-ui/react';
import {FaPlus} from 'react-icons/fa';

interface CreatePortfolioModalProps {
	onSave: () => void;
}

const CreatePortfolioButton: React.FC<CreatePortfolioModalProps> = (props) => {
	const [portfolioName, setPortfolioName] = useState('');
	const [open, setOpen] = useState(false);

	const [createPortfolio, {error, loading}] = useCreatePortfolioMutation();

	const handleSave = async () => {
		const portfolio = await createPortfolio({variables: {name: portfolioName}});
		if (portfolio?.data) {
			setOpen(false);
			props.onSave();
		}
	};

	return (
		<DrawerRoot size={'lg'} open={open} onOpenChange={(e) => setOpen(e.open)}>
			<DrawerBackdrop/>
			<DrawerTrigger asChild>
				<Button w={'100%'} variant="solid" size="lg">
					<Icon as={FaPlus} mr={2}/> Создать портфель
				</Button>
			</DrawerTrigger>
			<DrawerContent offset="4" rounded="md">
				<DrawerHeader>
					<DrawerTitle>Создание портфеля</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<Field.Root invalid={!!error}>
						<Field.Label>Название</Field.Label>
						<Input placeholder="Введите название портфеля"
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

export default CreatePortfolioButton;
