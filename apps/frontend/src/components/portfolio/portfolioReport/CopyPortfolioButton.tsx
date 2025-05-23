import {
	DrawerActionTrigger,
	DrawerBackdrop, DrawerBody, DrawerCloseTrigger,
	DrawerContent, DrawerFooter,
	DrawerHeader, DrawerRoot,
	DrawerTitle,
	DrawerTrigger,
} from '@frontend/components/ui/drawer';
import {Tooltip} from '@frontend/components/ui/tooltip';
import {
	GetDistributedPortfolioAssetsQuery,
	useCreatePortfolioMutation,
	useGetDistributedPortfolioAssetsLazyQuery, useGetUserPortfoliosQuery,
} from '@frontend/generated/graphql-hooks';
import {StocksWhileCreatingPortfolio} from '@frontend/generated/graphql-types';
import React, {useEffect, useState} from 'react';
import {
	Button, Icon,
	Input, Field, Spinner, Text,
} from '@chakra-ui/react';
import {
	NumberInputField,
	NumberInputRoot,
} from '@frontend/components/ui/number-input';
import {FaCopy} from 'react-icons/fa';

interface CopyPortfolioButtonProps {
	onSave: () => void;
	stockTickerList: string[];
	weights: number[];
}

const CopyPortfolioButton: React.FC<CopyPortfolioButtonProps> = ({onSave, stockTickerList, weights}) => {
	const [portfolioName, setPortfolioName] = useState('Портфель по Марковицу');
	const [capital, setCapital] = useState<number>(10000); // Пользователь вводит капитал
	const [open, setOpen] = useState(false);
	const [distributedPortfolio, setDistributedPortfolio] = useState<GetDistributedPortfolioAssetsQuery | null>(null);
	const [getDistributedPortfolioAssets, {loading}] = useGetDistributedPortfolioAssetsLazyQuery();
	const [createPortfolio, {error, loading: creating}] = useCreatePortfolioMutation();
	const {
		data: getUserPortfoliosQueryData,
		loading: getUserPortfoliosQueryDataLoading,
		called: getUserPortfoliosQueryDataCalled,
	} = useGetUserPortfoliosQuery({fetchPolicy: 'cache-only'});

	const handleCalculate = async () => {
		if (capital && capital > 0) {
			const data = await getDistributedPortfolioAssets({variables: {capital, stockTickerList, weights}});
			setDistributedPortfolio(data.data ?? null);
		}
	};

	const createButtonIsDisabled =
		!getUserPortfoliosQueryData ||
		!getUserPortfoliosQueryDataCalled ||
		getUserPortfoliosQueryDataLoading ||
		getUserPortfoliosQueryData.getUserPortfolios.items.length >= 5;

	useEffect(() => {
		if (open) {
			setPortfolioName('Портфель по Марковицу');
			setCapital(10000);
			setDistributedPortfolio(null);
		}
	}, [open]);

	const handleSave = async () => {
		const stocks: StocksWhileCreatingPortfolio[] = [];

		const currentAssets = distributedPortfolio?.getDistributedPortfolioAssets;

		(currentAssets?.stocks || []).forEach((stockTicker, index) => {
			stocks.push({
				stockTicker,
				averagePrice: currentAssets!.averagePrices[index],
				quantity: currentAssets!.quantities[index],
			});
		});
		const portfolio = await createPortfolio({
			variables: {
				name: portfolioName,
				stocks: stocks.filter((s) => s.quantity),
			},
		});
		if (portfolio?.data) {
			setOpen(false);
			onSave();
		}
	};

	return (
		<DrawerRoot
			size={'lg'}
			open={open}
			onOpenChange={(e) => setOpen(e.open)}
		>
			<DrawerBackdrop/>
			<Tooltip
				content={createButtonIsDisabled ? 'Ограничение по количеству портфелей: 5' : undefined}
				disabled={!createButtonIsDisabled}
				openDelay={0}
				closeDelay={100}
			>
				<DrawerTrigger asChild>
					<Button
						colorPalette="teal"
						variant="solid"
						size="xs"
						mt={2}
						disabled={createButtonIsDisabled}
					>
						<Icon as={FaCopy} mr={2}/> Копировать портфель
					</Button>
				</DrawerTrigger>
			</Tooltip>
			<DrawerContent offset="4" rounded="md">
				<DrawerHeader>
					<DrawerTitle>Копирование портфеля</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<Field.Root invalid={!!error}>
						<Field.Label>Название</Field.Label>
						<Input
							placeholder="Введите название портфеля"
							value={portfolioName || ''}
							onChange={(e) => setPortfolioName(e.target.value)}
						/>
						{error && <Field.ErrorText>{error.message}</Field.ErrorText>}
					</Field.Root>

					<Field.Root mt={4}>
						<Field.Label>Капитал</Field.Label>
						<NumberInputRoot>
							<NumberInputField
								min={1}
								defaultValue={10000}
								placeholder="Введите сумму капитала"
								onChange={(e) => {
									setDistributedPortfolio(null);
									setCapital(Number(e.target.value));
								}}
							/>
						</NumberInputRoot>
					</Field.Root>

					<Button
						size="xs"
						onClick={handleCalculate}
						mt={4}
						disabled={!capital || capital <= 0}
						loading={loading}
					>
						Рассчитать распределение
					</Button>

					<Text fontWeight="bold" mt={4} mb={2}>Распределение активов:</Text>
					{loading ? (
						<Spinner/>
					) : distributedPortfolio?.getDistributedPortfolioAssets ? (
						<ul>
							{distributedPortfolio.getDistributedPortfolioAssets.stocks.map((stockId, index) => (
								<li key={stockId}>{stockId}: {distributedPortfolio.getDistributedPortfolioAssets.quantities[index]} шт.</li>
							))}
						</ul>
					) : (
						<Text color="gray.500">Нет данных</Text>
					)}
				</DrawerBody>
				<DrawerFooter>
					<DrawerActionTrigger asChild>
						<Button disabled={creating} variant="outline">Отмена</Button>
					</DrawerActionTrigger>
					<Button onClick={handleSave} colorPalette="blue" loading={creating || loading || !portfolioName}
					        disabled={!distributedPortfolio}>
						Сохранить
					</Button>
				</DrawerFooter>
				<DrawerCloseTrigger/>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default CopyPortfolioButton;
