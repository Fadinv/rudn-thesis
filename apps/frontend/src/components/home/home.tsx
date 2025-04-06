import {useGetUserPortfoliosQuery} from '@/generated/graphql-hooks';
import React, {useState} from 'react';
import {Box, Flex} from '@chakra-ui/react';
import Sidebar from './sidebar/sidebar';
import PortfolioView from '@/components/portfolio/portfolioView';

interface HomeProps {
	// onCreatePortfolio: () => void;
	// onEditPortfolio: (id: number) => void;
	// onDeletePortfolio: (id: number) => void;
	onAddStock: (portfolioId: number) => void;
	onUpdateStock: (portfolioId: number, stockId: number) => void;
}

const Home: React.FC<HomeProps> = ({onAddStock, onUpdateStock}) => {
	const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
	const {data} = useGetUserPortfoliosQuery();

	return (
		<Flex style={{flex: 1}}>
			<Sidebar
				portfolios={data?.getUserPortfolios}
				onSelectPortfolio={setSelectedPortfolioId}
				selectedPortfolioId={selectedPortfolioId}
			/>
			<Box flex="1" p={4}>
				{selectedPortfolioId ? (
					<PortfolioView
						portfolioId={selectedPortfolioId}
						onAddStock={onAddStock}
						onUpdateStock={onUpdateStock}
					/>
				) : (
					<Box textAlign="center" color="gray.500" fontSize="xl">
						Выберите портфель для просмотра
					</Box>
				)}
			</Box>
		</Flex>
	);
};

export default Home;
