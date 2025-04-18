import {useGetUserPortfoliosQuery} from '@frontend/generated/graphql-hooks';
import React, {useState} from 'react';
import {Box, Flex} from '@chakra-ui/react';
import Sidebar from './sidebar/sidebar';
import PortfolioView from '@frontend/components/portfolio/portfolioView';

const Home: React.FC = () => {
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
