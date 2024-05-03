import React, { useState, useEffect, ChangeEvent } from 'react';
import Modal from '@/components/share/Modal'; // Importa el componente Modal
import ImageModalContent from './texts';

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
        const images = await getImagesFromIndexedDB();
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
      const newImageFiles = Array.from(eventFiles).slice(0, numModules * 13);
      const texts: string[] = [];
        for (let i = 0; i < newImageFiles.length; i++) {
            const text = prompt(`Texto para la imagen ${i + 1}`);
            if (text) {
                texts.push(text);
            } else {
                texts.push("");
            }
        }
        setImageTexts(texts);
      try {
        for (const imageFile of newImageFiles) {
          const resizedImageBlob = await resizeImageToA4(imageFile);
          const resizedImageFile = new File([resizedImageBlob], imageFile.name, { type: imageFile.type });
          setImageFiles((prevFiles: File[]) => {
            const newFiles = [...prevFiles, resizedImageFile];
            return newFiles;
          });
          onImageUpload([...imageFiles, resizedImageFile]);
          const groupName = getGroupName(numModules);
          await saveImageToIndexedDB([resizedImageFile], groupName);
        }
        const images = await getImagesFromIndexedDB();
        setStoredImages(images);
      } catch (error) {
        console.error('Error al procesar las imágenes:', error);
      }
    }
  };

  const saveImageToIndexedDB = async (images: File[], groupName: string) => {
    console.log("Nombre del grupo en saveImageToIndexedDB:", groupName);
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open('ImageDatabase', 2);
      request.onerror = (event) => {
        console.error('Error al abrir la base de datos:', request.error);
        reject(request.error);
      };
      request.onupgradeneeded = (event) => {
        console.log('onupgradeneeded event triggered');
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          console.log('Creating object store: images');
          db.createObjectStore('images', { autoIncrement: true });
        }
      };
      request.onsuccess = (event) => {
        const db = request.result;
        const transaction = db.transaction(['images'], 'readwrite');
        const objectStore = transaction.objectStore('images');
        transaction.oncomplete = () => {
          db.close();
          resolve(); // Aquí llamamos a resolve sin ningún argumento
        };
        transaction.onerror = (event) => {
          console.error('Error al guardar las imágenes:', transaction.error);
          reject(transaction.error);
        };
        images.forEach((image) => {
          objectStore.add(image);
        });
      };
    });
  };

  const getImagesFromIndexedDB = async () => {
    return new Promise<File[]>((resolve, reject) => {
      const request = window.indexedDB.open('ImageDatabase', 2); // Cambiar la versión de la base de datos
      request.onerror = (event: Event) => {
        console.error('Error al abrir la base de datos:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
      request.onupgradeneeded = (event) => {
        console.log('onupgradeneeded event triggered');
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('images')) {
          console.log('Creating object store: images');
          db.createObjectStore('images', { autoIncrement: true });
        } else {
          console.log('Object store "images" already exists');
        }
      };
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction('images', 'readonly');
        const objectStore = transaction.objectStore('images');
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
          db.close();
        };
      };
    });
  };

  const openModal = (imageUrl: string, index: number, longTexts: { text: string; style: string }[]) => {
    setModalImageUrl(imageUrl);
    setCurrentIndex(index);
    setLongTexts(longTexts);
    setSelectedExcelData(excelData);
    //loadExcelData()
  };

  const cargarDatosExcel = async (): Promise<ExcelData> => {
    try {
      // Lógica para cargar los datos del archivo Excel
      return Promise.resolve({ actividadAcademica: 'Academica', fechaInicio: 'Inicio', nombres: ['Nombre1', 'Nombre2'] });
    } catch (error) {
      console.error('Error al cargar los datos del archivo Excel:', error);
      throw error; // Lanzar el error para que sea manejado externamente
    }
  };
  
  /* const loadExcelData = async () => {
    try {
      // Aquí cargarías los datos del archivo Excel y los asignarías a selectedExcelData
      const excelData = await cargarDatosExcel(); // Pseudocódigo para cargar los datos del archivo Excel
      setSelectedExcelData(excelData);
    } catch (error) {
      console.error('Error al cargar los datos del archivo Excel:', error);
    }
  }; */

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
        return 'sayan';
      case 3:
        return 'binex';
      case 4:
        return 'ecomas';
      case 5:
        return 'promas';
      default:
        return 'rizo';
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
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open('ImageDatabase', 2);
      request.onerror = (event) => {
        console.error('Error al abrir la base de datos:', request.error);
        reject(request.error);
      };
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['images'], 'readwrite');
        const objectStore = transaction.objectStore('images');
        const clearRequest = objectStore.clear();
        clearRequest.onsuccess = () => {
          resolve();
        };
        clearRequest.onerror = (event) => {
          console.error('Error al eliminar las imágenes:', clearRequest.error);
          reject(clearRequest.error);
        };
      };
    });
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
      {storedImages.slice(0, numModules).map((file, index) => (
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
