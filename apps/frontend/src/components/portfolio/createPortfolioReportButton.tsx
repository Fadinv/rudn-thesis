'use client';
import {CreatePortfolioReportDrawer} from '@frontend/components/portfolio/drawers/createPortfolioReportDrawer';
import React, {useState} from 'react';
import {Button, Icon, IconButton, Text, useBreakpointValue, VStack} from '@chakra-ui/react';
import {FaFileAlt} from 'react-icons/fa';
import {FiFileText} from 'react-icons/fi';

interface CreatePortfolioReportButtonProps {
	portfolioId: number;
}

const CreatePortfolioReportButton: React.FC<CreatePortfolioReportButtonProps> = ({portfolioId}) => {
	const [open, setOpen] = useState(false);

	const isMobile = useBreakpointValue({base: true, lg: false});

	return (
		<>
			{isMobile ? (
				<VStack gap={1} onClick={() => setOpen(true)} cursor="pointer">
					<IconButton
						aria-label="Создать отчет"
						variant="ghost"
						size="lg"
						rounded={'full'}
					>
						<FiFileText/>
					</IconButton>
					<Text fontSize="xs">Создать</Text>
				</VStack>
			) : (
				<Button size="sm" colorScheme="blue" onClick={() => setOpen(true)}>
					<Icon as={FaFileAlt} mr={2}/> Создать отчет
				</Button>
			)}
			<CreatePortfolioReportDrawer portfolioId={portfolioId} open={open} onOpenChange={setOpen}/>
		</>
	);
};

export default CreatePortfolioReportButton;
