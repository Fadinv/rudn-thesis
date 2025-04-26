import React from 'react';
import {Flex, Box, useBreakpointValue} from '@chakra-ui/react';
import AddStockToPortfolioButton from '@frontend/components/portfolio/addStockToPortfolioButton';
import CreatePortfolioReportButton from '@frontend/components/portfolio/createPortfolioReportButton';
import ShowPortfolioReportButton from '@frontend/components/portfolio/portfolioReport/ShowPortfolioReportButton';

interface MobileActionBarProps {
	portfolioId: number;
	refetch: () => void;
}

const MobileActionBar: React.FC<MobileActionBarProps> = ({portfolioId, refetch}) => {
	const isMobile = useBreakpointValue({base: true, lg: false});

	if (!isMobile) return null;

	return (
		<Box
			p={3}
			borderRadius="xl"
			shadow="lg"
		>
			<Flex justify="space-around" align="center">
				<AddStockToPortfolioButton onStockAdded={() => refetch()} portfolioId={portfolioId}/>
				<CreatePortfolioReportButton portfolioId={portfolioId}/>
				<ShowPortfolioReportButton portfolioId={portfolioId}/>
			</Flex>
		</Box>
	);
};

export default MobileActionBar;