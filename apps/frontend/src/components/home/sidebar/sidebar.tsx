import DeletePortfolioButton from '@/components/portfolio/deletePortfolioButton';
import {useGetUserPortfoliosQuery} from '@/generated/graphql-hooks';
import {Portfolio} from '@/generated/graphql-types';
import React, {useState} from 'react';
import {
	Box,
	Button,
	Stack,
	Text,
	IconButton,
	Icon, Flex,
} from '@chakra-ui/react';
import {useColorModeValue} from '@/components/ui/color-mode';
import {FaEdit, FaTrash} from 'react-icons/fa';
import CreatePortfolioButton from '@/components/portfolio/createPortfolioButton';

interface SidebarProps {
	portfolios?: Pick<Portfolio, 'id' | 'name'>[];
	onSelectPortfolio: (id: number) => void;
	selectedPortfolioId: number | null;
	onCreatePortfolio: (name: string) => void;
	onEditPortfolio: (id: number) => void;
	onDeletePortfolio: (id: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
	                                         portfolios,
	                                         onSelectPortfolio,
	                                         onCreatePortfolio,
	                                         onEditPortfolio,
	                                         onDeletePortfolio,
	                                         selectedPortfolioId,
                                         }) => {
	const bgHover = useColorModeValue('gray.200', 'gray.700');
	const boxBg = useColorModeValue('white', 'gray.800');

	const {refetch: refetchGetUserPortfolio} = useGetUserPortfoliosQuery({initialFetchPolicy: 'cache-only'});

	return (
		<>
			<Box w="400px" p={4}>
				<Box w="100%" pb={4}>
					<CreatePortfolioButton onSave={() => refetchGetUserPortfolio()}/>
				</Box>
				<Stack align="stretch" gap={3}>
					{portfolios?.map((portfolio) => (
						<Flex
							key={portfolio.id}
							p={3}
							shadow="md"
							borderRadius="md"
							cursor="pointer"
							justify="space-between"
							bg={portfolio.id === selectedPortfolioId ? bgHover : boxBg}
							_hover={{bg: bgHover}}
							onClick={() => onSelectPortfolio(portfolio.id)}
						>
							<Text fontWeight="bold">{portfolio.name}</Text>
							<Flex gap={2}>
								<IconButton
									size="xs"
									aria-label="Редактировать"
									onClick={() => onEditPortfolio(portfolio.id)}
								>
									<Icon as={FaEdit}/>
								</IconButton>
								<DeletePortfolioButton
									onDelete={() => refetchGetUserPortfolio()}
									portfolioId={portfolio.id}
									portfolioName={portfolio.name}
								/>
							</Flex>
						</Flex>
					))}
				</Stack>
			</Box>
		</>
	);
};

export default Sidebar;
