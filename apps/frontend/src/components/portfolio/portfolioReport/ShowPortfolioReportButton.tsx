import ForecastGBMViewer from '@frontend/components/portfolio/portfolioReport/ForecastGBMViewer';
import MarkovitzViewer from '@frontend/components/portfolio/portfolioReport/MarkovitzViewer';
import PortfolioReportCard from '@frontend/components/portfolio/portfolioReport/PortfolioReportCard';
import React, {useEffect, useState} from 'react';
import {
	DrawerRoot,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerTitle,
	DrawerCloseTrigger,
} from '@frontend/components/ui/drawer';
import {
	useGetPortfolioReportsQuery,
} from '@frontend/generated/graphql-hooks';
import {
	Button,
	Box,
	Text,
	Flex,
	Stack,
	createListCollection,
} from '@chakra-ui/react';
import {FaCheckCircle, FaFileAlt, FaHourglassHalf, FaTimesCircle} from 'react-icons/fa';
import {useColorModeValue} from '@frontend/components/ui/color-mode';

interface CreatePortfolioReportButtonProps {
	portfolioId: number;
}

const ShowPortfolioReportButton: React.FC<CreatePortfolioReportButtonProps> = ({portfolioId}) => {
	const [open, setOpen] = useState(false);
	const [openedReportId, setOpenedReportId] = useState('');
	const {data, refetch} = useGetPortfolioReportsQuery({variables: {portfolioId}});
	const portfolioReports = data?.getPortfolioReports;

	useEffect(() => {
		if (open) void refetch();
	}, [open, refetch]);

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
			<Button colorPalette="teal" onClick={() => setOpen(true)} size="sm">
				<FaFileAlt/> Показать отчеты
			</Button>

			<DrawerRoot size="lg" open={open} onOpenChange={(e) => setOpen(e.open)}>
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
										Всего отчетов: {(portfolioReports || []).length}
									</Text>
									<Flex>
										<Flex align="center" mr={4} color="green.600" opacity={0.85}>
											<FaCheckCircle size={14} style={{marginRight: '6px'}}/>
											<Text fontSize="sm">Завершено: {totalReady}</Text>
										</Flex>
										<Flex align="center" mr={4} color="red.500" opacity={0.85}>
											<FaTimesCircle size={14} style={{marginRight: '6px'}}/>
											<Text fontSize="sm">Ошибок: {totalError}</Text>
										</Flex>
										<Flex align="center" color="blue.500" opacity={0.85}>
											<FaHourglassHalf size={14} style={{marginRight: '6px'}}/>
											<Text fontSize="sm">В процессе: {totalCalculating}</Text>
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
													onDelete={refetch}
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
					<DrawerBody>
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

export default ShowPortfolioReportButton;
