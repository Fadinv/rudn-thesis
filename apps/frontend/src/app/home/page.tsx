'use client';
import MainLayout from '@frontend/components/mainLayout/mainLayout';
import React, {useState} from 'react';
import {Box, Flex, useBreakpointValue} from '@chakra-ui/react';
import Sidebar from 'apps/frontend/src/components/home/sidebar/sidebar';
import PortfolioView from '@frontend/components/portfolio/portfolioView';

const Page: React.FC = () => {
	const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
	const isMobile = useBreakpointValue({base: true, lg: false});

	return (
		<MainLayout>
			<Flex w={'100%'} style={{flex: 1}}>
				{(isMobile && selectedPortfolioId) ? null : (
					<Sidebar
						onSelectPortfolio={setSelectedPortfolioId}
						selectedPortfolioId={selectedPortfolioId}
					/>
				)}
				{(isMobile && !!selectedPortfolioId) && (
					<Box flex="1" w={'100%'} display={{lg: 'none', base: 'flex'}}>
						<PortfolioView
							onBack={() => setSelectedPortfolioId(null)}
							portfolioId={selectedPortfolioId}
						/>
					</Box>
				)}
				{isMobile ? null : (
					<Box flex="1" p={4} overflow={'hidden'} display={{lg: 'flex', base: 'none'}}>
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
				)}
			</Flex>
		</MainLayout>
	);
};

export default Page;
