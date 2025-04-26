'use client';
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

	return (
		<>
			{isMobile ? (
				<VStack gap={1} onClick={() => setOpen(true)} cursor="pointer">
					<IconButton
						aria-label="Добавить акцию"
						variant="ghost"
						size="lg"
						rounded={'full'}
					>
						<FiPlus/>
					</IconButton>
					<Text fontSize="xs">Добавить</Text>
				</VStack>
			) : (
				<Button size="sm" variant="solid" onClick={() => setOpen(true)}>
					<Icon as={FaPlus}/> Добавить акцию
				</Button>
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
