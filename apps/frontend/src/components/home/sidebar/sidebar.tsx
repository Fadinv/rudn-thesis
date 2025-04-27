import CreateDefaultPortfolioButton from '@frontend/components/portfolio/createDefaultPortfolioButton';
import {useColorModeValue} from '@frontend/components/ui/color-mode';
import React from 'react';
import DeletePortfolioButton from '@frontend/components/portfolio/deletePortfolioButton';
import EditPortfolioButton from '@frontend/components/portfolio/editPortfolioButton';
import {useGetUserPortfoliosQuery} from '@frontend/generated/graphql-hooks';
import {
	Box,
	Stack,
	Text,
	Flex,
} from '@chakra-ui/react';
import CreatePortfolioButton from '@frontend/components/portfolio/createPortfolioButton';

interface SidebarProps {
	onSelectPortfolio: (id: number | null) => void;
	selectedPortfolioId: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({
	                                         onSelectPortfolio,
	                                         selectedPortfolioId,
                                         }) => {
	// Цвета для темной и светлой темы
	const bgColor = useColorModeValue('white', 'gray.900');
	const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
	const activeBgColor = useColorModeValue('blue.100', 'blue.900');
	const activeBorderColor = useColorModeValue('blue.500', 'blue.300');
	const textColor = useColorModeValue('gray.800', 'gray.200');
	const {data: portfolios} = useGetUserPortfoliosQuery();

	return (
		<Box minW={'350px'} w={{lg: '350px', base: '100%'}} p={4} bg={bgColor} borderRadius="md" boxShadow="lg">
			{/* Кнопка создания портфеля */}
			<Box w="100%" pb={4}>
				<CreatePortfolioButton/>
			</Box>

			{/* Список портфелей */}
			<Box maxH="calc(100vh - 200px)" overflowY="auto" pr={2}>
				<Stack align="stretch" gap={2}>
					{!portfolios?.getUserPortfolios?.length && (
						<CreateDefaultPortfolioButton
							onCreated={(portfolio) => onSelectPortfolio(portfolio.id)}
						/>
					)}
					{portfolios?.getUserPortfolios?.map((portfolio) => {
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
								_hover={isSelected ? {} : {bg: hoverBgColor}}
								onClick={() => onSelectPortfolio(portfolio.id)}
							>
								<Text fontWeight="medium" color={textColor}>
									{portfolio.name}
								</Text>
								<Flex gap={1}>
									<EditPortfolioButton
										portfolioId={portfolio.id}
										currentName={portfolio.name}
									/>
									<DeletePortfolioButton
										portfolioId={portfolio.id}
										portfolioName={portfolio.name}
										onDelete={() => onSelectPortfolio(null)}
									/>
								</Flex>
							</Flex>
						);
					})}
				</Stack>
			</Box>

		</Box>
	);
};

export default Sidebar;
