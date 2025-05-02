'use client';
import {Tooltip} from '@frontend/components/ui/tooltip';
import {useGetPortfolioStocksQuery} from '@frontend/generated/graphql-hooks';
import React, {useState} from 'react';
import {Button, Icon, IconButton, Text, useBreakpointValue, VStack} from '@chakra-ui/react';
import {FaPlus} from 'react-icons/fa';
import {FiPlus} from 'react-icons/fi';
import {AddStockToPortfolioDrawer} from './drawers/addStockToPortfolioDrawer';

interface AddStockToPortfolioButtonProps {
	portfolioId: number;
	onStockAdded: () => void;
}

const AddStockToPortfolioButton: React.FC<AddStockToPortfolioButtonProps> = ({
	                                                                             portfolioId,
	                                                                             onStockAdded,
                                                                             }) => {
	const [open, setOpen] = useState(false);
	const isMobile = useBreakpointValue({base: true, lg: false});
	const {
		data: getPortfolioStocksQueryData,
		loading: getPortfolioStocksQueryDataLoading,
		called: getPortfolioStocksQueryDataCalled,
	} = useGetPortfolioStocksQuery({
		variables: {portfolioId},
		fetchPolicy: 'cache-only',
	});

	const addButtonIsDisabled =
		!getPortfolioStocksQueryData ||
		!getPortfolioStocksQueryDataCalled ||
		getPortfolioStocksQueryDataLoading ||
		getPortfolioStocksQueryData.getPortfolioStocks.length >= 10;

	return (
		<>
			{isMobile ? (
				<Tooltip
					content={addButtonIsDisabled ? 'Ограничение по количеству акций: 10' : undefined}
					disabled={!addButtonIsDisabled}
					openDelay={0}
					closeDelay={100}
				>
					<VStack
						gap={1}
						onClick={() => {
							if (addButtonIsDisabled) return;
							setOpen(true);
						}}
						cursor="pointer"
					>
						<IconButton
							aria-label="Добавить акцию"
							variant="ghost"
							size="lg"
							rounded={'full'}
							disabled={addButtonIsDisabled}
						>
							<FiPlus/>
						</IconButton>
						<Text fontSize="xs">Добавить</Text>
					</VStack>
				</Tooltip>
			) : (
				<Tooltip
					content={addButtonIsDisabled ? 'Ограничение по количеству акций: 5' : undefined}
					disabled={!addButtonIsDisabled}
					openDelay={0}
					closeDelay={100}
				>
					<Button disabled={addButtonIsDisabled} size="sm" variant="solid" onClick={() => setOpen(true)}>
						<Icon as={FaPlus}/> Добавить акцию
					</Button>
				</Tooltip>
			)}

			<AddStockToPortfolioDrawer
				portfolioId={portfolioId}
				open={open}
				onOpenChange={setOpen}
				onStockAdded={onStockAdded}
			/>
		</>
	);
};

export default AddStockToPortfolioButton;
