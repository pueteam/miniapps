let db: IDBDatabase;
const DB_NAME = 'templatesDB';
const STORE_NAME = 'templatesStore';

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function saveTemplate(name: string, content: ArrayBuffer): Promise<void> {
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  await new Promise<void>((resolve, reject) => {
    const request = store.put({ name, content });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function loadTemplates(templateName: string): Promise<{ name: string; content: ArrayBuffer } | undefined> {
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(templateName);
    request.onsuccess = () => resolve(request.result as { name: string; content: ArrayBuffer } | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTemplate(templateName: string): Promise<void> {
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  await new Promise<void>((resolve, reject) => {
    const request = store.delete(templateName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllTemplates(): Promise<string[]> {
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const templates = await new Promise<{ name: string }[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as { name: string }[]);
    request.onerror = () => reject(request.error);
  });
  return templates.map((t) => t.name);
}
