import {QueryResult} from '@apollo/client';
import type {OperationVariables} from '@apollo/client/core';
import {useState, useEffect, useLayoutEffect} from 'react';
import * as ApolloReactHooks from '@apollo/client';

interface SyncData<TItem> {
	items: TItem[];
	maxVersion: number;
	hasMoreData: boolean;
}

export function useMemorySyncedQuery<
	QueryT,
	VariablesT extends OperationVariables = OperationVariables,
	TItem = object,
>(
	useQueryHook: (baseOptions?: ApolloReactHooks.QueryHookOptions<QueryT, VariablesT>) => QueryResult<QueryT, VariablesT>,
	selectSyncData: (data: QueryT) => SyncData<TItem>,
	variables?: VariablesT,
	externalMaxVersion?: number,
) {
	const {data, loading, fetchMore, refetch, called} = useQueryHook({
		variables,
		notifyOnNetworkStatusChange: true,
	});

	const [allItems, setAllItems] = useState<TItem[]>([]);
	const [localMaxVersion, setLocalMaxVersion] = useState<number>(0);

	const initialLoad = () => {
		if (!data) return;

		const syncData = selectSyncData(data);

		setAllItems(syncData.items.filter((item) => !(item as Record<string, unknown>)['deleted']));
		setLocalMaxVersion(syncData.maxVersion);

		// TODO: Написать обработку ошибок
		if (syncData.hasMoreData) fetchAll().catch(console.error);
	};

	useLayoutEffect(() => {
		if (data && called && !loading) {
			initialLoad();
		}
	}, [data, called, loading]);

	const fetchAll = async () => {
		if (!data) return;

		const syncData = selectSyncData(data);

		while (syncData.hasMoreData) {
			const {data: moreData} = await fetchMore({
				variables: {
					...variables,
					...(syncData.maxVersion ? {fromVersion: syncData.maxVersion} : {}),
				},
			});

			if (moreData) {
				const moreSyncData = selectSyncData(moreData);
				setAllItems((prev) => [...prev, ...moreSyncData.items]);
				setLocalMaxVersion(moreSyncData.maxVersion);

				if (!moreSyncData.hasMoreData) {
					break;
				}
			} else {
				break;
			}
		}
	};

	const refetchFromCurrentVersion = async () => {
		const {data: newData} = await refetch({
			...variables,
			fromVersion: localMaxVersion,
		} as never);

		if (newData) {
			const syncData = selectSyncData(newData);
			setAllItems((prev) => [...prev, ...syncData.items]);
			setLocalMaxVersion(syncData.maxVersion);
		}
	};

	useEffect(() => {
		if (externalMaxVersion !== undefined && externalMaxVersion > localMaxVersion) {
			void refetchFromCurrentVersion();
		}
	}, [externalMaxVersion, localMaxVersion, refetchFromCurrentVersion]);

	return {
		items: allItems,
		maxVersion: localMaxVersion,
		hasMoreData: data ? selectSyncData(data).hasMoreData : false,
		loading: !called || (loading && allItems.length === 0),
		called,
		fetchAll,
		refetchFromCurrentVersion,
	};
}
