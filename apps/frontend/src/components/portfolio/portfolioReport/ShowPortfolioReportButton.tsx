import ShowPortfolioReportDrawer from '@frontend/components/portfolio/drawers/showPortfolioReportDrawer';
import React, {useEffect, useState} from 'react';
import {
	useGetPortfolioReportsQuery,
} from '@frontend/generated/graphql-hooks';
import {Button, IconButton, Text, useBreakpointValue, VStack} from '@chakra-ui/react';
import {FaFileAlt} from 'react-icons/fa';
import {FiBarChart2} from 'react-icons/fi';

interface CreatePortfolioReportButtonProps {
	portfolioId: number;
}

const ShowPortfolioReportButton: React.FC<CreatePortfolioReportButtonProps> = ({portfolioId}) => {
	const [open, setOpen] = useState(false);
	const isMobile = useBreakpointValue({base: true, lg: false});
	const {refetch} = useGetPortfolioReportsQuery({variables: {portfolioId}});

	useEffect(() => {
		if (open) void refetch();
	}, [open, refetch]);

	return (
		<>
			{isMobile ? (
				<VStack gap={1} onClick={() => setOpen(true)} cursor="pointer">
					<IconButton
						aria-label="Показать отчет"
						variant="ghost"
						size="lg"
						rounded={'full'}
					>
						<FiBarChart2/>
					</IconButton>
					<Text fontSize="xs">Отчеты</Text>
				</VStack>
			) : (
				<Button colorPalette="teal" onClick={() => setOpen(true)} size="sm">
					<FaFileAlt/> Показать отчеты
				</Button>
			)}

			<ShowPortfolioReportDrawer
				portfolioId={portfolioId}
				open={open}
				onOpenChange={(open) => setOpen(open)}
			/>
		</>
	);
};

export default ShowPortfolioReportButton;
