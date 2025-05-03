import {Button, Icon} from '@chakra-ui/react';
import {FaPlus} from 'react-icons/fa';
import {GetUserPortfoliosDocument, useCreatePortfolioMutation} from '@frontend/generated/graphql-hooks';
import {toaster} from '@frontend/components/ui/toaster';
import React from 'react';

interface CreateDefaultPortfolioButtonProps {
	onCreated: (portfolio: { id: number; name: string }) => void;
}

const CreateDefaultPortfolioButton: React.FC<CreateDefaultPortfolioButtonProps> = ({onCreated}) => {
	const [createPortfolio, {loading}] = useCreatePortfolioMutation();

	const handleClick = async () => {
		const portfolio = await createPortfolio({
			variables: {
				name: 'Мой первый портфель',
				stocks: [
					{averagePrice: null, stockTicker: 'AAPL', quantity: 5},
					{averagePrice: null, stockTicker: 'KO', quantity: 3},
					{averagePrice: null, stockTicker: 'GOOG', quantity: 2},
					{averagePrice: null, stockTicker: 'TSLA', quantity: 4},
					{averagePrice: null, stockTicker: 'NFLX', quantity: 5},
				],
			},
			update: (cache, result) => {
				const newItem = result.data?.createPortfolio;
				if (!newItem) return;

				cache.updateQuery({query: GetUserPortfoliosDocument}, (data) => ({
					getUserPortfolios: {
						...data.getUserPortfolios,
						items: [...data.getUserPortfolios.items, newItem],
						maxVersion: newItem.version,
					},
				}));
			},
		});

		if (portfolio?.data?.createPortfolio) {
			toaster.create({
				title: 'Портфель создан',
				description: 'Ваш первый портфель успешно создан!',
				type: 'success',
			});
			onCreated(portfolio.data.createPortfolio);
		} else {
			toaster.create({
				title: 'Ошибка',
				description: 'Не удалось создать портфель. Попробуйте ещё раз.',
				type: 'error',
			});
		}
	};

	return (
		<Button
			w="100%"
			variant="outline"
			size="lg"
			colorPalette="blue"
			onClick={handleClick}
			loading={loading}
		>
			<Icon as={FaPlus}/>
			Создать пример портфеля
		</Button>
	);
};

export default CreateDefaultPortfolioButton;
