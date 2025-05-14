import {Box, Button, createListCollection, Flex, Stack, Text, useBreakpointValue} from '@chakra-ui/react';
import ForecastGBMViewer from '@frontend/components/portfolio/portfolioReport/ForecastGBMViewer';
import MarkovitzViewer from '@frontend/components/portfolio/portfolioReport/MarkovitzViewer';
import PortfolioReportCard from '@frontend/components/portfolio/portfolioReport/PortfolioReportCard';
import {useColorModeValue} from '@frontend/components/ui/color-mode';
import {
	DrawerBody, DrawerCloseTrigger,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerRoot,
	DrawerTitle,
} from '@frontend/components/ui/drawer';
import {
	GetPortfolioReportsQuery,
	GetPortfolioReportsQueryVariables,
	useGetPortfolioReportsQuery,
} from '@frontend/generated/graphql-hooks';
import {PortfolioReport} from '@frontend/generated/graphql-types';
import {useMemorySyncedQuery} from '@frontend/lib/useMemorySyncedQuery';
import React, {useEffect, useMemo, useState} from 'react';
import {FaCheckCircle, FaHourglassHalf, FaTimesCircle} from 'react-icons/fa';

interface ShowPortfolioReportDrawerProps {
	portfolioId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const ShowPortfolioReportDrawer: React.FC<ShowPortfolioReportDrawerProps> = ({
	                                                                             portfolioId,
	                                                                             open,
	                                                                             onOpenChange,
                                                                             }) => {
	const [openedReportId, setOpenedReportId] = useState('');
	const isMobile = useBreakpointValue({base: true, lg: false});

	const variables = useMemo(() => ({portfolioId}), [portfolioId])

	const {
		refetchFromCurrentVersion,
		items: portfolioReports,
	} = useMemorySyncedQuery<
		GetPortfolioReportsQuery,
		GetPortfolioReportsQueryVariables,
		Pick<PortfolioReport, 'id' | 'version' | 'deleted' | 'status' | 'reportType' | 'createdAt'>
	>(
		useGetPortfolioReportsQuery,
		(selectSyncData) => selectSyncData.getPortfolioReports,
		// undefined,
		2000,
		variables,
	);

	useEffect(() => {
		if (open) void refetchFromCurrentVersion();
	}, [open, refetchFromCurrentVersion]);


	useEffect(() => {
		if (open) void refetchFromCurrentVersion();
	}, [open, refetchFromCurrentVersion]);

	const openedReport = portfolioReports?.find((r) => r.id === openedReportId);

	const handleOpenReport = async (reportId: string) => {
		try {
			setOpenedReportId(reportId);
		} catch (error) {
			console.error('Ошибка открытия отчета:', error);
		}
	};

	const reportTypes = createListCollection({
		items: [
			{label: 'Оптимальный портфель (Марковиц)', value: 'markowitz'},
			{label: 'Прогноз будущей стоимости (GBM)', value: 'future_returns_forecast_gbm'},
			{label: 'Оценка риска (VaR)', value: 'value_at_risk'},
		],
	});

	const totalReady = (portfolioReports || []).filter(r => r.status === 'ready').length;
	const totalError = (portfolioReports || []).filter(r => r.status === 'error').length;
	const totalCalculating = (portfolioReports || []).filter(r => r.status === 'calculating').length;

	const countBg = useColorModeValue('gray.100', 'gray.700');

	return (
		<>
			<DrawerRoot size="lg" open={open} onOpenChange={(e) => onOpenChange(e.open)}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Список отчетов</DrawerTitle>
					</DrawerHeader>
					<DrawerBody>
						<Stack>
							<Box mb={4}>
								<Flex
									justify="space-between"
									align="center"
									p={3}
									borderRadius="md"
									bg={countBg}
								>
									<Text fontWeight="semibold" fontSize="sm">
										Всего {isMobile ? '' : 'отчетов'}: {(portfolioReports || []).length}
									</Text>
									<Flex>
										<Flex align="center" mr={4} color="green.600" opacity={0.85}>
											<FaCheckCircle size={14} style={{marginRight: '6px'}}/>
											<Text fontSize="sm">{isMobile ? '' : 'Завершено: '}{totalReady}</Text>
										</Flex>
										<Flex align="center" mr={4} color="red.500" opacity={0.85}>
											<FaTimesCircle size={14} style={{marginRight: '6px'}}/>
											<Text fontSize="sm">{isMobile ? '' : 'Ошибок: '}{totalError}</Text>
										</Flex>
										<Flex align="center" color="blue.500" opacity={0.85}>
											<FaHourglassHalf size={14} style={{marginRight: '6px'}}/>
											<Text fontSize="sm">{isMobile ? '' : 'В процессе: '}{totalCalculating}</Text>
										</Flex>
									</Flex>
								</Flex>
							</Box>
							{portfolioReports && portfolioReports.length > 0 && (
								<Box>
									<Stack gap={3}>
										{portfolioReports.map((report) => {
											const reportLabel = reportTypes.find(report.reportType)?.label || report.reportType;

											return (
												<PortfolioReportCard
													key={report.id}
													report={report}
													reportLabel={reportLabel}
													onOpen={handleOpenReport}
													onDelete={refetchFromCurrentVersion}
												/>
											);
										})}
									</Stack>
								</Box>
							)}
						</Stack>
					</DrawerBody>
					<DrawerFooter>
						<DrawerCloseTrigger asChild>
							<Button variant="outline">Закрыть</Button>
						</DrawerCloseTrigger>
					</DrawerFooter>
				</DrawerContent>
			</DrawerRoot>

			{/* Отображение отчета */}
			<DrawerRoot size="full" open={!!openedReport} onOpenChange={() => setOpenedReportId('')}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Отчет {reportTypes.find(openedReport?.reportType)?.label || openedReport?.reportType}</DrawerTitle>
					</DrawerHeader>
					<DrawerBody p={2}>
						{openedReport && openedReport.reportType === 'markowitz' && (
							<MarkovitzViewer reportId={openedReport.id}/>
						)}
						{openedReport && openedReport.reportType === 'future_returns_forecast_gbm' && (
							<ForecastGBMViewer reportId={openedReport.id}/>
						)}
					</DrawerBody>
					<DrawerFooter>
						<DrawerCloseTrigger asChild>
							<Button variant="outline">Закрыть</Button>
						</DrawerCloseTrigger>
					</DrawerFooter>
				</DrawerContent>
			</DrawerRoot>
		</>
	);
};

export default ShowPortfolioReportDrawer;