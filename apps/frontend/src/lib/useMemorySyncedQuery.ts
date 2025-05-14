import {QueryResult} from '@apollo/client';
import {Exact, InputMaybe, Scalars} from '@frontend/generated/graphql-hooks';
import {useState, useEffect, useLayoutEffect, useCallback, useRef} from 'react';
import * as ApolloReactHooks from '@apollo/client';

interface SyncData<TItem> {
	items: TItem[];
	maxVersion: number;
	hasMoreData: boolean;
}

type VersionedVariables = Exact<{
	fromVersion?: InputMaybe<Scalars['Int']['input']>;
}>;

export function useMemorySyncedQuery<
	QueryT,
	VariablesT extends VersionedVariables = VersionedVariables,
	TItem extends { id: number | string, deleted: boolean, version: number } = {
		id: number | string,
		deleted: boolean,
		version: number
	},
>(
	useQueryHook: (baseOptions: ApolloReactHooks.QueryHookOptions<QueryT, VariablesT> & ({
		variables: VariablesT;
		skip?: boolean;
	} | { skip: boolean; })) => QueryResult<QueryT, VariablesT>,
	selectSyncData: (data: QueryT) => SyncData<TItem>,
	pollInterval?: number,
	variables?: VariablesT,
	externalMaxVersion?: number,
) {
	const {data, loading, fetchMore, refetch, called} = useQueryHook({
		variables,
		skip: false,
		notifyOnNetworkStatusChange: true,
	});

	const [allItems, setAllItems] = useState<TItem[]>([]);
	const [localMaxVersion, setLocalMaxVersion] = useState<number>(0);
	const initialLoaded = useRef(false);

	const updateItems = (newItems: TItem[]) => {
		if (!newItems?.length) return;
		const deletedNewItems = new Set<number | string>();
		const itemsToAddIds = new Set<number | string>();
		const newItemsToAdd: TItem[] = [];
		newItems.forEach((item) => {
			if (item.deleted) deletedNewItems.add(item.id);
			else {
				itemsToAddIds.add(item.id);
				newItemsToAdd.push(item);
			}
		});
		setAllItems((prevItems) => {
			const existingItems = prevItems.filter((prevItem) => !itemsToAddIds.has(prevItem.id) && !deletedNewItems.has(prevItem.id));
			return [...existingItems, ...newItemsToAdd];
		});
	};

	const createList = (newItems: TItem[]) => {
		const deletedNewItems = new Set<number | string>();
		const itemsToAddIds = new Set<number | string>();
		const newItemsToAdd: TItem[] = [];
		newItems.forEach((item) => {
			if (item.deleted) deletedNewItems.add(item.id);
			else {
				itemsToAddIds.add(item.id);
				newItemsToAdd.push(item);
			}
		});
		setAllItems(newItemsToAdd);
	};

	const initialLoad = () => {
		if (!data) return;

		const syncData = selectSyncData(data);
		updateItems(syncData.items);
		setLocalMaxVersion(syncData.maxVersion);

		if (syncData.hasMoreData) fetchAll().catch(console.error);
	};

	useLayoutEffect(() => {
		if (!initialLoaded.current && data && called && !loading && !allItems.length) {
			initialLoad();
			initialLoaded.current = true;
		}
	}, [data, called, loading, allItems, initialLoaded]);

	useLayoutEffect(() => {
		if (initialLoaded.current && data) {
			const syncData = selectSyncData(data);
			createList(syncData.items);
			setLocalMaxVersion(syncData.maxVersion);
		}
	}, [data, initialLoaded.current]);

	const fetchAll = async () => {
		if (!data) return;

		const syncData = selectSyncData(data);

		while (syncData.hasMoreData) {
			const {data: moreData} = await fetchMore({
				variables: {
					...variables,
					fromVersion: syncData.maxVersion,
				} as VariablesT,
			});

			if (moreData) {
				const moreSyncData = selectSyncData(moreData);
				updateItems(moreSyncData.items);
				setLocalMaxVersion(moreSyncData.maxVersion);

				if (!moreSyncData.hasMoreData) {
					break;
				}
			} else {
				break;
			}
		}
	};

	const pollingInProgress = useRef(false);

	const pollForUpdates = useCallback(async () => {
		if (!called || pollingInProgress.current) return;

		pollingInProgress.current = true;

		try {
			const {data: newData} = await fetchMore({
				variables: {
					...variables,
					fromVersion: localMaxVersion,
				},
			});
			if (newData) {
				const syncData = selectSyncData(newData);
				if (syncData.items.length) {
					updateItems(syncData.items);
					if (syncData.maxVersion > localMaxVersion) {
						setLocalMaxVersion(syncData.maxVersion);
					}
				}
			}
		} finally {
			pollingInProgress.current = false;
		}
	}, [called, loading, localMaxVersion, refetch, variables]);

	useEffect(() => {
		if (externalMaxVersion !== undefined && externalMaxVersion > localMaxVersion) {
			void pollForUpdates();
		}
	}, [externalMaxVersion, pollForUpdates]);

	useEffect(() => {
		if (!pollInterval) return;

		console.log('setInterval', pollInterval);
		const intervalId = setInterval(() => {
			void pollForUpdates();
		}, pollInterval);

		return () => clearInterval(intervalId);
	}, [pollInterval, pollForUpdates]);

	return {
		items: allItems,
		maxVersion: localMaxVersion,
		hasMoreData: data ? selectSyncData(data).hasMoreData : false,
		loading: !called || (loading && allItems.length === 0),
		called,
		fetchAll,
		refetchFromCurrentVersion: pollForUpdates,
	};
}
