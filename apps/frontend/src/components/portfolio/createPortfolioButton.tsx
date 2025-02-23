import {
	DrawerActionTrigger,
	DrawerBackdrop, DrawerBody, DrawerCloseTrigger,
	DrawerContent, DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import {useCreatePortfolioMutation} from '@/generated/graphql-hooks';
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
				<Button variant="outline" size="sm">
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
					<Button onClick={handleSave} colorPalette="green" loading={loading}>Сохранить</Button>
				</DrawerFooter>
				<DrawerCloseTrigger/>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default CreatePortfolioButton;
