import {useColorModeValue} from '@frontend/components/ui/color-mode';
import React from 'react';
import DeletePortfolioButton from '@frontend/components/portfolio/deletePortfolioButton';
import EditPortfolioButton from '@frontend/components/portfolio/editPortfolioButton';
import {useGetUserPortfoliosQuery} from '@frontend/generated/graphql-hooks';
import {Portfolio} from '@frontend/generated/graphql-types';
import {
	Box,
	Stack,
	Text,
	Flex,
} from '@chakra-ui/react';
import CreatePortfolioButton from '@frontend/components/portfolio/createPortfolioButton';

interface SidebarProps {
	portfolios?: Pick<Portfolio, 'id' | 'name'>[];
	onSelectPortfolio: (id: number) => void;
	selectedPortfolioId: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({
	                                         portfolios,
	                                         onSelectPortfolio,
	                                         selectedPortfolioId,
                                         }) => {
	// Цвета для темной и светлой темы
	const bgColor = useColorModeValue('white', 'gray.900');
	const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
	const activeBgColor = useColorModeValue('blue.100', 'blue.900');
	const activeBorderColor = useColorModeValue('blue.500', 'blue.300');
	const textColor = useColorModeValue('gray.800', 'gray.200');

	const {refetch: refetchGetUserPortfolio} = useGetUserPortfoliosQuery({initialFetchPolicy: 'cache-only'});

	return (
		<Box w="350px" p={4} bg={bgColor} borderRadius="md" boxShadow="lg">
			{/* Кнопка создания портфеля */}
			<Box w="100%" pb={4}>
				<CreatePortfolioButton onSave={() => refetchGetUserPortfolio()}/>
			</Box>

			{/* Список портфелей */}
			<Stack align="stretch" gap={2}>
				{portfolios?.map((portfolio) => {
					const isSelected = portfolio.id === selectedPortfolioId;

					return (
						<Flex
							key={portfolio.id}
							p={3}
							shadow="md"
							borderRadius="lg"
							cursor="pointer"
							justify="space-between"
							align="center"
							bg={isSelected ? activeBgColor : bgColor}
							border="2px solid"
							borderColor={isSelected ? activeBorderColor : 'transparent'}
							transition="all 0.2s ease-in-out"
							_hover={isSelected ? {} : {bg: hoverBgColor}} // Отключаем hover для активного элемента
							onClick={() => onSelectPortfolio(portfolio.id)}
						>
							<Text fontWeight="medium" color={textColor}>{portfolio.name}</Text>
							<Flex gap={1}>
								<EditPortfolioButton
									portfolioId={portfolio.id}
									currentName={portfolio.name}
									onSave={() => refetchGetUserPortfolio()}
								/>
								<DeletePortfolioButton
									onDelete={() => refetchGetUserPortfolio()}
									portfolioId={portfolio.id}
									portfolioName={portfolio.name}
								/>
							</Flex>
						</Flex>
					);
				})}
			</Stack>
		</Box>
	);
};

export default Sidebar;
