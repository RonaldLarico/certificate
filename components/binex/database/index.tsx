/* // Establecer una variable global para almacenar la conexión a la base de datos
let dbConnection: IDBDatabase | null = null;

// Función para abrir la conexión a la base de datos
const openDatabaseConnection = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('ImageDatabase', 3);
    request.onerror = (event) => {
      console.error('Error al abrir la base de datos:', request.error);
      reject(request.error);
    };
    request.onupgradeneeded = (event) => {
      console.log('onupgradeneeded event triggered');
      const db = (event.target as IDBOpenDBRequest).result;
      // Crear almacenes de objetos si es necesario
      if (!db.objectStoreNames.contains('cimade')) {
        db.createObjectStore('cimade', { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('ecomas')) {
        db.createObjectStore('ecomas', { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('promas')) {
        db.createObjectStore('promas', { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('binex')) {
        db.createObjectStore('binex', { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('rizo')) {
        db.createObjectStore('rizo', { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('sayan')) {
        db.createObjectStore('sayan', { autoIncrement: true });
      }
    };
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
};

// Función para obtener la conexión a la base de datos
export const getDatabaseConnection = async (): Promise<IDBDatabase> => {
  if (!dbConnection) {
    dbConnection = await openDatabaseConnection();
  }
  return dbConnection;
};

// Ejemplo de cómo utilizar la conexión en tu código
export const getImagesFromIndexedDB = async (groupName: string) => {
  const db = await getDatabaseConnection();
  // Usar la conexión para acceder a la base de datos y obtener las imágenes
  // ...
};

// Ejemplo de cómo cerrar la conexión cuando ya no sea necesaria
export const closeDatabaseConnection = () => {
  if (dbConnection) {
    dbConnection.close();
    dbConnection = null;
  }
}; */