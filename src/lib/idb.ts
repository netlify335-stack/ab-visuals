const DB_NAME = 'abv-visuals';
const DB_VERSION = 1;
export const STORES = ['kv', 'projects', 'media', 'inquiries'] as const;
export type StoreName = (typeof STORES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(store, mode);
    const req = fn(transaction.objectStore(store));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export const idb = {
  getAll<T>(store: StoreName): Promise<T[]> {
    return tx<T[]>(store, 'readonly', (s) => s.getAll());
  },
  get<T>(store: StoreName, key: string): Promise<T | undefined> {
    return tx<T | undefined>(store, 'readonly', (s) => s.get(key));
  },
  put<T extends { id: string }>(store: StoreName, value: T): Promise<IDBValidKey> {
    return tx<IDBValidKey>(store, 'readwrite', (s) => s.put(value));
  },
  delete(store: StoreName, key: string): Promise<undefined> {
    return tx<undefined>(store, 'readwrite', (s) => s.delete(key));
  },
  clear(store: StoreName): Promise<undefined> {
    return tx<undefined>(store, 'readwrite', (s) => s.clear());
  },
};
