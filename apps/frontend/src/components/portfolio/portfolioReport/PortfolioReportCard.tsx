import React from 'react';
import {useColorModeValue} from '@/components/ui/color-mode';
import {Flex, Text} from '@chakra-ui/react';
import DeletePortfolioReportButton from '@/components/portfolio/portfolioReport/deletePortfolioReportButton';

interface PortfolioReportCardProps {
	report: {
		id: string;
		reportType: string;
		status: string; // 'ready' | 'error' | 'calculating';
		createdAt: string;
	};
	reportLabel: string;
	onOpen: (reportId: string) => void;
	onDelete: () => void;
}

const PortfolioReportCard: React.FC<PortfolioReportCardProps> = ({report, reportLabel, onOpen, onDelete}) => {
	const isReady = report.status === 'ready';
	const isError = report.status === 'error';

	// Константы цветов для светлой и темной темы
	const bgColor = useColorModeValue(
		isReady ? 'green.50' : isError ? 'red.50' : 'gray.50',
		isReady ? 'green.900' : isError ? 'red.900' : 'gray.800',
	);

	const borderColor = useColorModeValue(
		isReady ? 'green.500' : isError ? 'red.500' : 'gray.500',
		isReady ? 'green.400' : isError ? 'red.400' : 'gray.600',
	);

	const textColor = useColorModeValue(
		isReady ? 'green.700' : isError ? 'red.700' : 'gray.700',
		isReady ? 'green.300' : isError ? 'red.300' : 'gray.300',
	);

	const hoverBgColor = useColorModeValue('green.100', 'green.800');

	return (
		<Flex
			direction="column"
			p={4}
			border="2px solid"
			borderColor={borderColor}
			borderRadius="md"
			transition="background-color 0.3s ease-out"
			bg={bgColor}
			_hover={isReady ? {bg: hoverBgColor, cursor: 'pointer'} : undefined}
			onClick={() => isReady && onOpen(report.id)}
		>
			{/* Заголовок отчета и дата */}
			<Flex justify="space-between" align="center">
				<Text fontWeight="bold" color={textColor}>{reportLabel}</Text>
				<Text fontSize="sm" color="gray.500">
					{new Date(report.createdAt).toLocaleString('ru-RU', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					})}
				</Text>
			</Flex>

			{/* Статус отчета */}
			<Text fontSize="sm" mt={1} color={textColor}>
				<b>Статус:</b> {isReady ? 'Завершен' : isError ? 'Ошибка' : 'В процессе'}
			</Text>

			{/* Кнопка удаления */}
			<Flex justify="flex-end" mt={2}>
				<DeletePortfolioReportButton
					portfolioReportName={reportLabel}
					reportId={report.id}
					onDelete={onDelete}
				/>
			</Flex>
		</Flex>
	);
};

export default PortfolioReportCard;
