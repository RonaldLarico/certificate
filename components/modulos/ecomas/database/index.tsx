import React, { useEffect } from 'react';

export const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('ImageDatabaseEcomas', 1);
    request.onerror = (event) => {
      console.error('Error al abrir la base de datos:', request.error);
      reject(request.error);
    };
    request.onupgradeneeded = (event) => {
      console.log('onupgradeneeded event triggered');
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('ecomas')) {
        console.log('Creating object store: images');
        db.createObjectStore('ecomas', { autoIncrement: true });
      }
    };
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
};

/* const Database: React.FC = () => {
  useEffect(() => {
    const createDatabaseAndObjectStore = async () => {
      try {
        const db = await openDatabase();
        await createObjectStoreIfNotExists(db);
      } catch (error) {
        console.error('Error al crear la base de datos o al cargar las imágenes:', error);
      }
    };
    createDatabaseAndObjectStore();
  }, []);

  const createObjectStoreIfNotExists = (db: IDBDatabase): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains('ecomas')) {
        console.log('Creating object store: images');
        const transaction = db.transaction(['ecomas'], 'readwrite');
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = (event) => {
          console.error('Error al crear el almacén de objetos:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
        transaction.objectStore('ecomas');
      } else {
        resolve();
      }
    });
  };

  return null;
};

export default Database; */
