"use client"
import MainLayout from '@frontend/components/mainLayout/mainLayout';
import React, {useState} from 'react';
import {Box, Flex} from '@chakra-ui/react';
import Sidebar from 'apps/frontend/src/components/home/sidebar/sidebar';
import PortfolioView from '@frontend/components/portfolio/portfolioView';

const Page: React.FC = () => {
	const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);

	return (
		<MainLayout>
			<Flex style={{flex: 1}}>
				<Sidebar
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
		</MainLayout>
	);
};

export default Page;
