'use client';
import {CreatePortfolioReportDrawer} from '@frontend/components/portfolio/drawers/createPortfolioReportDrawer';
import {Tooltip} from '@frontend/components/ui/tooltip';
import {useGetPortfolioStocksQuery} from '@frontend/generated/graphql-hooks';
import React, {useState} from 'react';
import {Button, Icon, IconButton, Text, useBreakpointValue, VStack} from '@chakra-ui/react';
import {FaFileAlt} from 'react-icons/fa';
import {FiFileText} from 'react-icons/fi';

interface CreatePortfolioReportButtonProps {
	portfolioId: number;
}

const CreatePortfolioReportButton: React.FC<CreatePortfolioReportButtonProps> = ({portfolioId}) => {
	const [open, setOpen] = useState(false);

	const {data} = useGetPortfolioStocksQuery({variables: {portfolioId}, fetchPolicy: 'cache-only'});

	const stocksLength = data?.getPortfolioStocks.length ?? 0;
	const createButtonIsDisabled = stocksLength <= 2;
	const isMobile = useBreakpointValue({base: true, lg: false});

	return (
		<>
			<Tooltip
				content={createButtonIsDisabled ? 'Нужно добавить 3 или более тикеров для анализа' : undefined}
				disabled={!createButtonIsDisabled}
				openDelay={0}
				closeDelay={100}
			>
				{isMobile ? (
					<VStack gap={1} onClick={() => setOpen(true)} cursor="pointer">
						<IconButton
							aria-label="Создать отчет"
							variant="ghost"
							size="lg"
							rounded={'full'}
							disabled={createButtonIsDisabled}
						>
							<FiFileText/>
						</IconButton>
						<Text textAlign="center" fontSize="xs">Создать <br/> отчет</Text>
					</VStack>
				) : (
					<Button disabled={createButtonIsDisabled} size="xs" colorPalette="blue"
					        onClick={() => setOpen(true)}>
						<Icon as={FaFileAlt} mr={2}/> Создать отчет
					</Button>
				)}
			</Tooltip>
			<CreatePortfolioReportDrawer portfolioId={portfolioId} open={open} onOpenChange={setOpen}/>
		</>
	);
};

export default CreatePortfolioReportButton;
