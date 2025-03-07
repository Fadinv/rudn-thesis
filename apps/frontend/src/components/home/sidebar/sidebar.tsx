import {useColorModeValue} from '@/components/ui/color-mode';
import React from 'react';
import DeletePortfolioButton from '@/components/portfolio/deletePortfolioButton';
import EditPortfolioButton from '@/components/portfolio/editPortfolioButton';
import {useGetUserPortfoliosQuery} from '@/generated/graphql-hooks';
import {Portfolio} from '@/generated/graphql-types';
import {
	Box,
	Button,
	Stack,
	Text,
	IconButton,
	Icon,
	Flex,
} from '@chakra-ui/react';
import CreatePortfolioButton from '@/components/portfolio/createPortfolioButton';

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
	const bgHover = useColorModeValue('gray.100', 'gray.700');
	const boxBg = useColorModeValue('white', 'gray.800');
	const activeBorder = useColorModeValue('blue.500', 'blue.300');
	const textColor = useColorModeValue('gray.800', 'gray.200');

	const {refetch: refetchGetUserPortfolio} = useGetUserPortfoliosQuery({initialFetchPolicy: 'cache-only'});

	return (
		<Box w="350px" p={4} bg={boxBg} borderRadius="md" boxShadow="lg">
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
							bg={isSelected ? 'blue.100' : boxBg}
							boxShadow={isSelected ? `2px solid ${activeBorder}` : '1px solid transparent'}
							transition="all 0.2s ease-in-out"
							_hover={isSelected ? undefined : {bg: bgHover}} // Отключаем hover для активного
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
