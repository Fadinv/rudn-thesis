import {Injectable} from '@nestjs/common';

// Функция, по которой строится агрегатный ключ (например userId)
type AggregateFn<T> = (item: T) => number;

// Структура хранилища для одного aggregateKey
interface StoreEntry<T> {
	byId: Map<number | string, T>;
	sortedByVersion: T[];         // отсортированный массив
	freshSortedByVersion: T[];         // отсортированный массив не удаленных
	versionSortedIndex: Map<number, number>; // id -> индекс в sortedByVersion
	maxVersion: number;
	maxItemId: number | string;
}

@Injectable()
export class MemoryCacheStore<T extends { id: number | string; version: number; deleted: boolean }> {
	private _itemsByAggregateKey = new Map<number | string, StoreEntry<T>>();
	private _maxVersion = 0;

	constructor(private readonly _aggregateFn: AggregateFn<T>) {}

	/** Getters */
	private get getDefaultStore(): StoreEntry<T> {
		return {
			byId: new Map(),
			sortedByVersion: [],
			freshSortedByVersion: [],
			versionSortedIndex: new Map(),
			maxVersion: 0,
			maxItemId: 0,
		};
	}

	/** Функция инициализации Store */
	async initialize(loadFn: () => Promise<T[]>) {
		// Получаем сущности
		const items = await loadFn();

		// Сортируем их по версии
		items.sort((a, b) => a.version - b.version);

		// Добавляем новые элементы
		items.forEach((item) => this.addItem(item));
	}

	/** Безопасная функция получения store */
	private getOrCreateStore(key: number): StoreEntry<T> {
		// Если нет store по ключу - создаем
		if (!this._itemsByAggregateKey.has(key)) this._itemsByAggregateKey.set(key, this.getDefaultStore);

		return this._itemsByAggregateKey.get(key)!;
	}

	/** Безопасная функция получения store по сущности */
	private getStoreByItem(item: T): StoreEntry<T> {
		const key = this._aggregateFn(item);
		if (key === undefined) {
			let foundStore: StoreEntry<T> | null;
			console.log('this._itemsByAggregateKey.values()', this._itemsByAggregateKey.values());
			foundStore = [...this._itemsByAggregateKey.values()].find((store) => store.byId.has(item.id)) ?? null;;

			if (foundStore) return foundStore;
		}
		return this.getOrCreateStore(key);
	}

	/** Функция добавления элемента в Store */
	addItem(item: T) {
		// Если элемент не удален (удаление делается только через updateItem)
		if (!item.deleted) {
			// Получаем store
			const store = this.getStoreByItem(item);

			// Записываем по ID этот элемент
			store.byId.set(item.id, item);

			// Добавляем в список сортированный по version. Новые элементы должны быть всегда с версией больше
			store.versionSortedIndex.set(item.version, store.sortedByVersion.length);
			store.sortedByVersion.push(item);

			// Добавляем в список не удаленных по версии. Новые элементы должны быть всегда с версией больше
			store.freshSortedByVersion.push(item);

			// Дополнительно: версия store
			if (item.version > store.maxVersion) {
				store.maxVersion = item.version;
				store.maxItemId = item.id;
			}
		}
		// Проверяем общую версию кеша
		if (this._maxVersion < item.version) this._maxVersion = item.version;
	}

	/** Функция обновления или удаления элемента в Store */
	updateItem(newItem: T) {
		const store = this.getStoreByItem(newItem);

		console.log('store', store);
		// Получаем элемент по id
		const item = store.byId.get(newItem.id);
		console.log('item', this._itemsByAggregateKey, item, newItem, newItem.id);
		// Если мы не нашли этот элемент, то выходим
		if (!item || !store.versionSortedIndex.has(item.version) || newItem.version <= item.version) {
			throw new Error(
				`Version conflict: incoming version ${newItem.version} <= current ${item?.version} for id=${newItem.id}`,
			);
		}

		if (item.deleted) {
			throw new Error(
				`Cannot update deleted object: incoming version ${newItem.version} <= current ${item?.version} for id=${newItem.id}`,
			);
		}

		// Получаем текущий индекс в массиве элементов
		const currentSortedIndex = store.versionSortedIndex.get(item.version)!;
		// Получаем текущий индекс в массиве не удаленных элементов
		const currentFreshIndex = this.findInsertIndex(store.freshSortedByVersion, item.version);

		// Обновляем элемент по ссылке
		Object.assign(item || {}, newItem);

		// Удаляем по индексу
		store.sortedByVersion.splice(currentSortedIndex, 1);

		// Обновляем индексы после удаления
		store.versionSortedIndex.delete(item.version);
		for (let i = currentSortedIndex; i < store.sortedByVersion.length; i++) {
			const v = store.sortedByVersion[i].version;
			store.versionSortedIndex.set(v, i);
		}

		// Вставляем в конец
		store.sortedByVersion.push(item);
		store.versionSortedIndex.set(newItem.version, store.sortedByVersion.length - 1);

		// Удаляем по индексу
		store.freshSortedByVersion.splice(currentFreshIndex, 1);

		if (!item.deleted) {
			// Обновляем индексы после удаления
			store.freshSortedByVersion.push(item);
		}

		// Проверяем максимальную версию всех элементов
		if (this._maxVersion < newItem.version) {
			this._maxVersion = newItem.version;
		}

		// Проверяем версию store
		if (newItem.version >= store.maxVersion) {
			store.maxVersion = newItem.version;
			store.maxItemId = newItem.id;
		}
	}

	maxVersion() {
		return this._maxVersion;
	}

	getItems(key: number | string, fromVersion?: number, maxCount: number = 100): {
		items: T[],
		maxVersion: number,
		hasMoreData: boolean
	} {
		const store = this._itemsByAggregateKey.get(key);

		if (!store) {
			return {items: [], maxVersion: 0, hasMoreData: false};
		}

		let items: T[];
		let hasMoreData: boolean;

		if (fromVersion === undefined) {
			items = store.freshSortedByVersion.slice(0, maxCount);
			hasMoreData = store.freshSortedByVersion.length > maxCount;
		} else {
			let startIdx = store.versionSortedIndex.get(fromVersion);
			if (!startIdx) startIdx = this.findInsertIndex(store.sortedByVersion, fromVersion) + 1;
			else startIdx += 1;

			const endIdx = startIdx + maxCount;
			items = store.sortedByVersion.slice(startIdx, endIdx);
			hasMoreData = store.sortedByVersion.length > endIdx;
		}

		return {
			items,
			maxVersion: items[items.length - 1]?.version ?? store.maxVersion ?? 0,
			hasMoreData,
		};
	}

	getAllItems() {
		const response: Partial<T>[] = [];

		this._itemsByAggregateKey.forEach(store => {
			store.byId.forEach(item => response.push(item));
		});

		return response as T[];
	}

	getAllItems2() {
		const response: Partial<T>[][] = [];

		this._itemsByAggregateKey.forEach(store => {
			response.push(store.freshSortedByVersion);
		});

		return response as T[][];
	}

	private findInsertIndex(array: T[], version: number): number {
		let low = 0;
		let high = array.length - 1;
		while (low <= high) {
			const mid = Math.floor((low + high) / 2);
			if (array[mid].version === version) {
				return mid;
			} else if (array[mid].version < version) {
				low = mid + 1;
			} else {
				high = mid - 1;
			}
		}
		return -1; // не найдено
	}
}
