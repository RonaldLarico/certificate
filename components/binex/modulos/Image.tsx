import React, { useState, useEffect, ChangeEvent } from 'react';
import Modal from '@/components/share/Modal'; // Importa el componente Modal
import ImageModalContent from './texts';
import { getDatabaseConnection } from '../database/index';

interface ExcelData {
  actividadAcademica: string | null;
  fechaInicio: string | null;
  nombres: string[];
}

interface ImageUploaderProps {
  numModules: number;
  onImageUpload: (files: File[]) => void;
  excelData: ExcelData | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ numModules, onImageUpload, excelData }) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [storedImages, setStoredImages] = useState<File[]>([]);
  const [imageTexts, setImageTexts] = useState<string[]>([]);
  const [longTexts, setLongTexts] = useState<{ text: string; style: string }[]>([]);
  const [selectedExcelData, setSelectedExcelData] = useState<ExcelData | null>(null);

  useEffect(() => {
    const loadImagesFromIndexedDB = async () => {
      try {
        const storeNames = ['cimade', 'ecomas', 'promas', 'binex', 'rizo', 'sayan'];
        const groupName = storeNames[numModules - 1];
        const db = await getDatabaseConnection();
        const images = await getImagesFromIndexedDB(db, groupName);
        setStoredImages(images);
      } catch (error) {
        console.error('Error al cargar las imágenes desde IndexedDB:', error);
      }
    };
    loadImagesFromIndexedDB();
  }, []);

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const eventFiles = event.target.files;
    if (eventFiles && eventFiles.length > 0) {
      const newImageFiles = Array.from(eventFiles).slice(0, numModules * 15);
      const groupName = getGroupName(numModules); // Asegúrate de que groupName se establezca correctamente aquí
      console.log("Nombre del almacén:", groupName);
      try {
        const db = await getDatabaseConnection();
        await saveImageGroupToIndexedDB(db, newImageFiles, groupName); // Pasar groupName a la función saveImageGroupToIndexedDB
        const images = await getImagesFromIndexedDB(db, groupName);
        setStoredImages(images);
      } catch (error) {
        console.error('Error al procesar las imágenes:', error);
      }
    }
  };

  const clearObjectStore = (objectStore: IDBObjectStore) => {
    return new Promise<void>((resolve, reject) => {
      const clearRequest = objectStore.clear();
      clearRequest.onsuccess = () => {
        resolve();
      };
      clearRequest.onerror = (event) => {
        console.error('Error al limpiar el almacén:', clearRequest.error);
        reject(clearRequest.error);
      };
    });
  };

  const saveImageGroupToIndexedDB = async (db: IDBDatabase, images: File[], groupName: string) => {
    console.log("Nombre del almacén:", groupName);
    try {
      const transaction = db.transaction([groupName], 'readwrite');
      const objectStore = transaction.objectStore(groupName);
      await clearObjectStore(objectStore);
      images.forEach(image => {
        objectStore.add(image);
      });
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = (event: Event) => {
          console.error('Error al guardar las imágenes:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error al guardar las imágenes en IndexedDB:', error);
      throw error;
    }
  };

  const getImagesFromIndexedDB = async (db: IDBDatabase, groupName: string) => {
    console.log("Nombre del almacén:", groupName); // Agregar este registro de consola
    if (!db.objectStoreNames.contains(groupName)) {
        console.error('El almacén de objetos', groupName, 'no existe en la base de datos.');
        return [];
    }
    return new Promise<File[]>((resolve, reject) => {
        const transaction = db.transaction(groupName, 'readonly');
        const objectStore = transaction.objectStore(groupName);
        const getRequest = objectStore.getAll();
        getRequest.onerror = (event: Event) => {
            console.error('Error al obtener las imágenes:', (event.target as IDBRequest).error);
            reject((event.target as IDBRequest).error);
        };
        getRequest.onsuccess = async (event: Event) => {
            const result = (event.target as IDBRequest).result;
            if (result) {
                const resizedImages: File[] = [];
                for (const imageFile of result) {
                    const resizedImageBlob = await resizeImageToA4(imageFile);
                    const resizedImageFile = new File([resizedImageBlob], imageFile.name, { type: imageFile.type });
                    resizedImages.push(resizedImageFile);
                }
                resolve(resizedImages);
            } else {
                console.error('Error al obtener las imágenes: result es null');
                reject(new Error('Result es null'));
            }
        };
    });
  };

  const openModal = (imageUrl: string, index: number, longTexts: { text: string; style: string }[]) => {
    setModalImageUrl(imageUrl);
    setCurrentIndex(index);
    setLongTexts(longTexts);
    setSelectedExcelData(excelData);
  };

  const cargarDatosExcel = async (): Promise<ExcelData> => {
    try {
      return Promise.resolve({ actividadAcademica: 'Academica', fechaInicio: 'Inicio', nombres: ['Nombre1', 'Nombre2'] });
    } catch (error) {
      console.error('Error al cargar los datos del archivo Excel:', error);
      throw error;
    }
  };

  const closeModal = () => {
    setModalImageUrl("");
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentIndex < imageFiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const getGroupName = (numModules: number): string => {
    switch (numModules) {
      case 1:
        return 'cimade';
      case 2:
        return 'ecomas';
      case 3:
        return 'promas';
      case 4:
        return 'binex';
      case 5:
        return 'rizo';
      default:
        return 'sayan';
    }
  };

  const resizeImageToA4 = (image: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 3508; // A4 width in pixels at 300dpi
        canvas.height = 2480; // A4 height in pixels at 300dpi
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, image.type); // Mantener la extensión original de la imagen
      };
      img.src = URL.createObjectURL(image);
    });
  };

  const deleteAllImagesFromIndexedDB = async () => {
    try {
      const db = await getDatabaseConnection(); // Obtener la instancia de la base de datos
      const transaction = db.transaction(['images'], 'readwrite');
      const objectStore = transaction.objectStore('images');
      const clearRequest = objectStore.clear();
      clearRequest.onsuccess = () => {
        console.log('Todas las imágenes eliminadas correctamente.');
      };
      clearRequest.onerror = (event) => {
        console.error('Error al eliminar las imágenes:', clearRequest.error);
      };
    } catch (error) {
      console.error('Error al abrir la base de datos:', error);
    }
  };

  const handleDeleteImages = async () => {
    try {
      await deleteAllImagesFromIndexedDB();
      setStoredImages([]); // Limpiar la lista de imágenes en el estado local
    } catch (error) {
      console.error('Error al eliminar las imágenes desde IndexedDB:', error);
    }
  };
  const handleVerClick = async (index: number) => {
    const selectedImageFile = storedImages[index];
    openModal(URL.createObjectURL(selectedImageFile), index, longTexts);
    const excelData = await cargarDatosExcel(); // Elimina los argumentos si no son necesarios
    setSelectedExcelData(excelData);
  };

  return (
    <div>
      <h1 className='mb-10 text-center mr-40 p-3 border-2 rounded-xl font-bold text-xl'>Cargar imagenes ({numModules})</h1>
      <div className='image-container relative mb-10'>
        <input type='file' accept="image/*" onChange={handleImageFileChange} multiple className='bg-red-600/50'/>
      </div>
      {storedImages.slice(numModules).map((file, index) => (
        <div key={index} className="image-container relative mb-4 flex justify-between items-center">
          {file && (
            <div className='bg-red-600/35 p-2 w-80 rounded-lg'>
              <p className=''>{file.name}</p>
            </div>
          )}
          <button onClick={() => handleVerClick(index)} className='mr-28 p-2 bg-purple-600 rounded-lg'>Ver</button>
          {imageTexts[index] && <p className="absolute top-0 left-0 text-white bg-black bg-opacity-75 p-1 rounded-md">{imageTexts[index]}</p>}
        </div>
      ))}
      <button onClick={handleDeleteImages} className="bg-red-600 text-white p-2 rounded-md mb-4">Eliminar todas las imágenes</button>
      {modalImageUrl && (
        <Modal onClose={closeModal}>
          <div className="flex items-center justify-center">
            <button onClick={handlePrevImage} className="p-2 bg-gray-800 text-white rounded-full mr-4">&lt;</button>
              <img src={modalImageUrl} alt="Preview" className="max-h-[21cm] max-w-[29.7cm]" style={{ width: '100%', height: 'auto' }} />
              {selectedExcelData && (
          <ImageModalContent
            numModules={numModules}
            longTexts={longTexts}
            excelData={selectedExcelData}
            actividadAcademica={selectedExcelData.actividadAcademica || null}
            fechaInicio={selectedExcelData.fechaInicio || null}
            nombres={selectedExcelData.nombres || []}
          />
        )}
            <button onClick={handleNextImage} className="p-2 bg-gray-800 text-white rounded-full ml-4">&gt;</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageUploader;
