import React, { useState, useEffect, ChangeEvent } from 'react';
import Modal from '@/components/share/Modal'; // Importa el componente Modal
import ImageModalContent from './texts';
//import { getDatabaseConnection } from '../database/index';

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
  const [nextImageId, setNextImageId] = useState<number>(0);

  useEffect(() => {
    const createDatabaseAndObjectStore = async () => {
      try {
        const db = await openDatabase();
        const images = await getImagesFromIndexedDB(db);
        setStoredImages(images);
        setNextImageId(images.length);
      } catch (error) {
        console.error('Error al crear la base de datos o al cargar las imágenes:', error);
      }
    };
    createDatabaseAndObjectStore();
  }, []);

  const openDatabase = (): Promise<IDBDatabase> => {
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

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const eventFiles = event.target.files;
    if (eventFiles && eventFiles.length > 0) {
      const newImageFiles = Array.from(eventFiles).slice(0, numModules * 15);
      try {
        const db = await openDatabase();
        await saveImageGroupToIndexedDB(db, newImageFiles);
        const images = await getImagesFromIndexedDB(db);
        setStoredImages(images);
        setNextImageId(0);
      } catch (error) {
        console.error('Error al procesar las imágenes:', error);
      }
    }
  };

  const saveImageGroupToIndexedDB = async (db: IDBDatabase, images: File[]) => {
    try {
      const transaction = db.transaction(['ecomas'], 'readwrite');
      const objectStore = transaction.objectStore('ecomas');
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

  const getImagesFromIndexedDB = async (db: IDBDatabase) => {
    if (!db.objectStoreNames.contains('ecomas')) {
        console.error('El almacén de objetos "images" no existe en la base de datos.');
        return [];
    }
    return new Promise<File[]>((resolve, reject) => {
        const transaction = db.transaction('ecomas', 'readonly');
        const objectStore = transaction.objectStore('ecomas');
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

  const handleDeleteImages = async () => {
    try {
      const db = await openDatabase(); // Obtener la instancia de la base de datos
      const transaction = db.transaction(['ecomas'], 'readwrite');
      const objectStore = transaction.objectStore('ecomas');
      const clearRequest = objectStore.clear();
      clearRequest.onsuccess = () => {
        console.log('Todas las imágenes eliminadas correctamente.');
        setStoredImages([]); // Limpiar la lista de imágenes en el estado local
        setNextImageId(0); // Restablecer el contador de ID de imagen a 0
      };
      clearRequest.onerror = (event) => {
        console.error('Error al eliminar las imágenes:', clearRequest.error);
      };
    } catch (error) {
      console.error('Error al abrir la base de datos:', error);
    }
  };

  const handleVerClick = async (index: number) => {
    const selectedImageFile = storedImages[index];
    openModal(URL.createObjectURL(selectedImageFile), index, longTexts);
  };

  const getNumberFromFileName = (fileName: string): number => {
    const match = fileName.match(/\d+/); // Extraer el número del nombre del archivo
    return match ? parseInt(match[0]) : Infinity; // Si no se encuentra un número, se coloca al final
  };
  // Ordenar las imágenes según los números en sus nombres
  const sortedImages = [...storedImages].sort((a, b) => {
    const numberA = getNumberFromFileName(a.name);
    const numberB = getNumberFromFileName(b.name);
    return numberA - numberB;
  });

  // Obtener las imágenes a mostrar según el número de módulos seleccionado
  const imagesToShow = sortedImages.slice(0, numModules);

return (
  <div>
    <h1 className='mb-10 text-center mr-40 p-3 border-2 rounded-xl font-bold text-xl'>Cargar imagenes ({numModules})</h1>
    <div className='image-container relative mb-10'>
      <input type='file' accept="image/*" onChange={handleImageFileChange} multiple className='bg-red-600/50'/>
    </div>
    {imagesToShow.map(( file, index) => (
      <div key={index} className="image-container relative mb-4 flex justify-between items-center">
        {file && (
          <div className='bg-red-600/35 p-2 w-80 rounded-lg'>
            <p className=''>{file.name}</p>
          </div>
        )}
        <p className="text-gray-500">ID: {index >= numModules ? index - numModules : index}</p>
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
