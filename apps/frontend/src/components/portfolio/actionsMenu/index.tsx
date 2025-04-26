import React from 'react';
import {useBreakpointValue, Flex} from '@chakra-ui/react';
import MobileActionBar from '@frontend/components/portfolio/actionsMenu/mobileAnchorBar';
import AddStockToPortfolioButton from '@frontend/components/portfolio/addStockToPortfolioButton';
import CreatePortfolioReportButton from '@frontend/components/portfolio/createPortfolioReportButton';
import ShowPortfolioReportButton from '@frontend/components/portfolio/portfolioReport/ShowPortfolioReportButton';

const ActionsMenu: React.FC<{ portfolioId: number; refetch: () => void }> = ({portfolioId, refetch}) => {
	const isMobile = useBreakpointValue({base: true, lg: false});

	if (isMobile) {
		// На мобиле — показываем компактное меню
		return <MobileActionBar portfolioId={portfolioId} refetch={refetch}/>;
	}

	// На десктопе — обычные текстовые кнопки
	return (
		<Flex gap={2} wrap="wrap">
			<AddStockToPortfolioButton portfolioId={portfolioId} onStockAdded={refetch}/>
			<CreatePortfolioReportButton portfolioId={portfolioId}/>
			<ShowPortfolioReportButton portfolioId={portfolioId}/>
		</Flex>
	);
};

export default ActionsMenu;
