import CreateDefaultPortfolioButton from '@frontend/components/portfolio/createDefaultPortfolioButton';
import EditPortfolioDrawer from '@frontend/components/portfolio/drawers/editPortfolioDrawer';
import {useColorModeValue} from '@frontend/components/ui/color-mode';
import {Portfolio} from '@frontend/generated/graphql-types';
import {useMemorySyncedQuery} from '@frontend/lib/useMemorySyncedQuery';
import React, {useState} from 'react';
import {
	GetUserPortfoliosQuery,
	GetUserPortfoliosQueryVariables,
	useGetUserPortfoliosQuery,
} from '@frontend/generated/graphql-hooks';
import {
	Box,
	Stack,
	Text,
	Flex,
	Icon,
	Menu,
	Button,
	Portal,
} from '@chakra-ui/react';
import CreatePortfolioButton from '@frontend/components/portfolio/createPortfolioButton';
import {FaChartPie, FaEllipsisV} from 'react-icons/fa';
import DeletePortfolioDialog from '@frontend/components/portfolio/dialogs/deletePortfolioDialog';

interface SidebarProps {
	onSelectPortfolio: (id: number | null) => void;
	selectedPortfolioId: number | null;
}

interface PortfolioItemProps {
	portfolio: Pick<Portfolio, 'id' | 'name'>;
	isSelected: boolean;
	onSelect: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

interface PortfolioMenuProps {
	portfolioId: number;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

const useSidebarColors = () => {
	return {
		bgColor: useColorModeValue('white', 'gray.900'),
		selectedBg: useColorModeValue('blue.50', 'blue.900'),
		defaultBg: useColorModeValue('gray.50', 'gray.800'),
		selectedHoverBg: useColorModeValue('blue.100', 'blue.800'),
		defaultHoverBg: useColorModeValue('gray.100', 'gray.700'),
		selectedBorder: useColorModeValue('blue.400', 'blue.300'),
		defaultBorder: useColorModeValue('gray.200', 'gray.600'),
		textColor: useColorModeValue('gray.800', 'gray.100'),
	};
};

const PortfolioMenu: React.FC<PortfolioMenuProps> = ({portfolioId, onEdit, onDelete}) => (
	<Menu.Root>
		<Menu.Trigger
			onClick={(e) => e.stopPropagation()}
			asChild
		>
			<Button variant="ghost" colorPalette="gray" size="xs">
				<Icon as={FaEllipsisV} fontSize="xs"/>
			</Button>
		</Menu.Trigger>
		<Portal>
			<Menu.Positioner>
				<Menu.Content
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<Menu.Item
						value="rename"
						onClick={() => onEdit(portfolioId)}
					>
						Переименовать
					</Menu.Item>
					<Menu.Item
						value="delete"
						color="fg.error"
						_hover={{bg: 'bg.error', color: 'fg.error'}}
						onClick={() => onDelete(portfolioId)}
					>
						Удалить...
					</Menu.Item>
				</Menu.Content>
			</Menu.Positioner>
		</Portal>
	</Menu.Root>
);

const PortfolioItem: React.FC<PortfolioItemProps> = ({
	portfolio,
	isSelected,
	onSelect,
	onEdit,
	onDelete,
}) => {
	const colors = useSidebarColors();
	const bg = isSelected ? colors.selectedBg : colors.defaultBg;
	const hoverBg = isSelected ? colors.selectedHoverBg : colors.defaultHoverBg;
	const borderColor = isSelected ? colors.selectedBorder : colors.defaultBorder;

	return (
		<Flex
			align="center"
			justify="space-between"
			p={3}
			cursor="pointer"
			bg={bg}
			border="1px solid"
			borderColor={borderColor}
			borderRadius="lg"
			shadow="base"
			transition="background-color 0.3s ease-out"
			_hover={{bg: hoverBg}}
			onClick={() => onSelect(portfolio.id)}
		>
			<Flex align="center" gap={2}>
				<Icon as={FaChartPie} color="blue.500"/>
				<Text fontWeight="semibold" color={colors.textColor}>{portfolio.name}</Text>
			</Flex>
			<PortfolioMenu
				portfolioId={portfolio.id}
				onEdit={onEdit}
				onDelete={onDelete}
			/>
		</Flex>
	);
};

const Sidebar: React.FC<SidebarProps> = ({
	onSelectPortfolio,
	selectedPortfolioId,
}) => {
	const colors = useSidebarColors();
	const [editOpenId, setEditOpenId] = useState<number | null>(null);
	const [deleteOpenId, setDeleteOpenId] = useState<number | null>(null);

	const {
		items: portfolios,
		loading,
		called,
	} = useMemorySyncedQuery<GetUserPortfoliosQuery, GetUserPortfoliosQueryVariables, Pick<Portfolio, 'id' | 'name' | 'version' | 'createdAt' | 'deleted'>>(
		useGetUserPortfoliosQuery,
		(selectSyncData) => selectSyncData.getUserPortfolios,
	);

	return (
		<Box minW={'350px'} w={{lg: '350px', base: '100%'}} p={4} bg={colors.bgColor} borderRadius="md" boxShadow="lg">
			<Box w="100%" pb={4}>
				<CreatePortfolioButton onSave={(item) => onSelectPortfolio(item?.createPortfolio.id ?? null)}/>
			</Box>

			<Box maxH="calc(100vh - 200px)" overflowY="auto">
				<Stack align="stretch" gap={2}>
					{!portfolios?.length && !loading && called && (
						<CreateDefaultPortfolioButton
							onCreated={(portfolio) => onSelectPortfolio(portfolio.id)}
						/>
					)}
					{portfolios.sort((a, b) => a.id - b.id)?.map((portfolio) => (
						<PortfolioItem
							key={portfolio.id}
							portfolio={portfolio}
							isSelected={portfolio.id === selectedPortfolioId}
							onSelect={onSelectPortfolio}
							onEdit={setEditOpenId}
							onDelete={setDeleteOpenId}
						/>
					))}
				</Stack>
			</Box>

			{typeof editOpenId === 'number' && (
				<EditPortfolioDrawer
					open
					portfolioId={editOpenId}
					onOpenChange={(open) => {
						if (!open) setEditOpenId(null);
					}}
				/>
			)}
			{typeof deleteOpenId === 'number' && (
				<DeletePortfolioDialog
					open
					portfolioId={deleteOpenId}
					onOpenChange={(open) => {
						if (!open) setDeleteOpenId(null);
					}}
					onDelete={(deleted) => {
						if (deleted && selectedPortfolioId === deleteOpenId) onSelectPortfolio(null);
					}}
				/>
			)}
		</Box>
	);
};

export default Sidebar;
