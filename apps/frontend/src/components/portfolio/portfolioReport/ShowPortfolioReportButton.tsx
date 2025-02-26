import DeletePortfolioReportButton from '@/components/portfolio/portfolioReport/deletePortfolioReportButton';
import MarkovitzViewer from '@/components/portfolio/portfolioReport/MarkovitzViewer';
import React from 'react';
import {
	DrawerRoot,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerTitle,
	DrawerCloseTrigger,
} from '@/components/ui/drawer';
import {useState} from 'react';
import {
	useGetPortfolioReportsQuery,
} from '@/generated/graphql-hooks';
import {
	Button,
	IconButton,
	Icon,
	Stack,
	Box,
	Text,
	Flex,
	createListCollection,
} from '@chakra-ui/react';
import {FaFileAlt} from 'react-icons/fa';

interface CreatePortfolioReportButtonProps {
	portfolioId: number;
}

const ShowPortfolioReportButton: React.FC<CreatePortfolioReportButtonProps> = ({portfolioId}) => {
	const [open, setOpen] = useState(false);
	const [openedReportId, setOpenedReportId] = useState('');
	const {data, refetch} = useGetPortfolioReportsQuery({variables: {portfolioId}});
	const portfolioReports = data?.getPortfolioReports;

	const openedReport = portfolioReports?.find((r) => r.id === openedReportId);

	const handleOpenReport = async (reportId: string) => {
		try {
			setOpenedReportId(reportId);
		} catch (error) {
			console.error('Ошибка создания отчета:', error);
		}
	};

	const reportTypes = createListCollection({
		items: [
			{label: 'Оптимальный портфель (Марковиц)', value: 'markowitz'},
			{label: 'Прогноз роста', value: 'growth_forecast'},
			{label: 'Оценка риска (VaR)', value: 'value_at_risk'},
		],
	});

	return (
		<>
			<Button colorPalette="teal" onClick={() => setOpen(true)} size="sm">
				<FaFileAlt/> Показать отчеты
			</Button>

			<DrawerRoot size="lg" open={open} onOpenChange={(e) => setOpen(e.open)}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Создать отчет</DrawerTitle>
					</DrawerHeader>
					<DrawerBody>
						<Stack>
							<Box>
								<Text mb={2}>Отчеты</Text>
							</Box>

							{portfolioReports && portfolioReports.length > 0 && (
								<Box>
									<Stack>
										{portfolioReports.map((report) => (
											<Flex
												key={report.id} justify="space-between" align="center" p={2}
												border={`3px solid ${report.status === 'ready' ? 'green' : report.status === 'error' ? 'red' : 'gray'}`}
												borderRadius="md"
												_hover={report.status === 'ready' ? {bg: 'green.300', cursor: 'pointer'} : undefined}
												onClick={() => handleOpenReport(report.id)}
											>
												<Text
													colorPalette={report.status === 'ready' ? 'green' : report.status === 'error' ? 'red' : 'gray'}>
													{reportTypes.find(report.reportType)?.label} - {report.status}
												</Text>
												<DeletePortfolioReportButton
													portfolioReportName={reportTypes.find(report.reportType)?.label || report.reportType}
													reportId={report.id}
													onDelete={() => refetch()}
												/>
											</Flex>
										))}
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
			<DrawerRoot size="full" open={!!openedReport} onOpenChange={() => setOpenedReportId('')}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Отчет {reportTypes.find(openedReport?.reportType)?.label || openedReport?.reportType}</DrawerTitle>
					</DrawerHeader>
					<DrawerBody>
						{openedReport && (
							<MarkovitzViewer
								reportId={openedReport.id}
							/>
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
