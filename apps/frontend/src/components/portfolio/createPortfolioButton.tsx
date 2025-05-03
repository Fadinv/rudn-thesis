import {
	DrawerActionTrigger,
	DrawerBackdrop, DrawerBody, DrawerCloseTrigger,
	DrawerContent, DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTitle,
	DrawerTrigger,
} from '@frontend/components/ui/drawer';
import {toaster} from '@frontend/components/ui/toaster';
import {Tooltip} from '@frontend/components/ui/tooltip';
import {
	CreatePortfolioMutation,
	GetUserPortfoliosDocument,
	useCreatePortfolioMutation, useGetUserPortfoliosQuery,
} from '@frontend/generated/graphql-hooks';
import React, {useEffect, useState} from 'react';
import {
	Button, Icon,
	Input, Field, VStack, Text,
	Link, Flex,
} from '@chakra-ui/react';
import {FaPlus, FaUpload} from 'react-icons/fa';

interface CreatePortfolioModalProps {
	onSave?: (data?: CreatePortfolioMutation | null) => void;
}

interface CsvPortfolioEntry {
	ticker: string;
	quantity: number;
}

const CreatePortfolioButton: React.FC<CreatePortfolioModalProps> = (props) => {
	const [portfolioName, setPortfolioName] = useState('');
	const [open, setOpen] = useState(false);
	const [csvData, setCsvData] = useState<CsvPortfolioEntry[]>([]);

	const {
		data: getUserPortfoliosQueryData,
		loading: getUserPortfoliosQueryDataLoading,
		called: getUserPortfoliosQueryDataCalled,
	} = useGetUserPortfoliosQuery({fetchPolicy: 'cache-only'});
	const [createPortfolio, {error, loading}] = useCreatePortfolioMutation();

	const createButtonIsDisabled =
		!getUserPortfoliosQueryData ||
		!getUserPortfoliosQueryDataCalled ||
		getUserPortfoliosQueryDataLoading ||
		getUserPortfoliosQueryData.getUserPortfolios.items.length >= 5;

	useEffect(() => {
		if (!open) {
			setCsvData([]);
			setPortfolioName('');
		}
	}, [open]);

	const handleSave = async () => {
		const portfolio = await createPortfolio({
			variables: {
				name: portfolioName,
				stocks: csvData.map((item) => ({
					averagePrice: null,
					stockTicker: item.ticker,
					quantity: item.quantity,
				})),
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

		if (portfolio?.data) {
			setOpen(false);
			props.onSave?.(portfolio?.data);
		}
	};

	const parseCsv = (text: string) => {
		const lines = text.trim().split(/\r?\n/);
		const tickerMap = new Map<string, number>();

		for (const line of lines) {
			const cleanLine = line.replace(/^"|"$/g, '');
			const parts = cleanLine.split(/[;,]/).map((p) => p.replace(/^"|"$/g, '').trim());

			if (parts.length >= 2) {
				const [tickerRaw, quantityRaw] = parts;
				const ticker = tickerRaw.toUpperCase();
				const quantity = Number(quantityRaw.replace(',', '.'));

				const isValidTicker = /^[A-Z0-9]{1,10}$/.test(ticker);
				const isValidQuantity = Number.isInteger(quantity) && quantity > 0 && quantity <= 1_000_000;

				if (isValidTicker && isValidQuantity) {
					// Если тикер уже есть, суммируем
					tickerMap.set(ticker, (tickerMap.get(ticker) || 0) + quantity);
				}
			}
		}

		const entries = Array.from(tickerMap.entries()).map(([ticker, quantity]) => ({
			ticker,
			quantity,
		}));

		return entries;
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const parsedAll = parseCsv(text);

			if (parsedAll.length === 0) {
				toaster.create({
					title: 'Ошибка загрузки файла',
					description: 'Не удалось загрузить ни одной валидной записи. Проверьте формат CSV.',
					type: 'error',
				});
				return;
			}

			let finalParsed = parsedAll;

			if (parsedAll.length > 10) {
				finalParsed = parsedAll.slice(0, 10);

				toaster.create({
					title: 'Ограничение по количеству',
					description: `Загружено только 10 позиций из ${parsedAll.length}. Остальные были отброшены.`,
					type: 'warning',
				});
			} else {
				toaster.create({
					title: 'Файл успешно загружен',
					description: `Загружено ${finalParsed.length} позиций.`,
					type: 'success',
				});
			}

			setCsvData(finalParsed);
		};
		reader.readAsText(file);
	};

	return (
		<DrawerRoot size="lg" open={open} onOpenChange={(e) => setOpen(e.open)}>
			<DrawerBackdrop/>
			<Tooltip
				content={createButtonIsDisabled ? 'Ограничение по количеству портфелей: 5' : undefined}
				disabled={!createButtonIsDisabled}
				openDelay={0}
				closeDelay={100}
			>
				<DrawerTrigger asChild>
					<Button
						w="100%"
						variant="solid"
						size="lg"
						colorPalette="blue"
						disabled={createButtonIsDisabled}
					>
						<Icon as={FaPlus} mr={2}/> Создать портфель
					</Button>
				</DrawerTrigger>
			</Tooltip>
			<DrawerContent offset="4" rounded="md">
				<DrawerHeader>
					<DrawerTitle>Создание портфеля</DrawerTitle>
				</DrawerHeader>
				<DrawerBody>
					<VStack gap="4" align="stretch">
						<Field.Root invalid={!!error}>
							<Field.Label>Название</Field.Label>
							<Input
								placeholder="Введите название портфеля"
								value={portfolioName}
								onChange={(e) => setPortfolioName(e.target.value)}
							/>
							{error && <Field.ErrorText>{error.message}</Field.ErrorText>}
						</Field.Root>

						{/* Блок загрузки CSV */}
						<Field.Root>
							<Field.Label>Импорт списка акций из CSV</Field.Label>

							{/* Скрытый инпут */}
							<Input
								type="file"
								accept=".csv"
								id="file-upload"
								onChange={handleFileUpload}
								display="none"
							/>

							<Flex align="start" direction="row" gap="2">
								<label htmlFor="file-upload">
									<Button
										as="span"
										variant="outline"
										size="md"
									>
										<Icon as={FaUpload}/>
										Выбрать CSV файл
									</Button>
								</label>

								<Link href="/example_portfolio.csv" download>
									<Button variant="ghost" size="sm">
										Скачать пример CSV
									</Button>
								</Link>
							</Flex>

							{csvData.length > 0 && (
								<VStack align="start" gap="1" mt="2">
									<Text fontSize="sm" fontWeight="bold">Загружено {csvData.length} позиций:</Text>
									{csvData.slice(0, 5).map((entry, idx) => (
										<Text key={idx} fontSize="sm">{entry.ticker}: {entry.quantity}</Text>
									))}
									{csvData.length > 5 && (
										<Text fontSize="xs" color="gray.500">...и
											ещё {csvData.length - 5} позиций</Text>
									)}
								</VStack>
							)}
						</Field.Root>
					</VStack>
				</DrawerBody>
				<DrawerFooter>
					<DrawerActionTrigger asChild>
						<Button
							disabled={loading}
							variant="outline"
						>
							Отмена
						</Button>
					</DrawerActionTrigger>
					<Button
						onClick={handleSave}
						disabled={!portfolioName}
						colorPalette="blue"
						loading={loading}
					>
						Сохранить
					</Button>
				</DrawerFooter>
				<DrawerCloseTrigger/>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default CreatePortfolioButton;
