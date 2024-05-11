import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import Modal from '@/components/share/Modal';

interface ExcelData {
  nombres: string[];
  email: string[];
  codigo: string[];
  participacion: string[];
  actividadAcademica: string | null;
  fechaInicio: string | null;
  fechaFinal: string | null;
  temario: string | null;
  ponente: string | null;
  horas: string | null;
}

interface ImageUploaderProps {
  numModules: number;
  excelData: ExcelData[] | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ numModules, excelData }) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [storedImages, setStoredImages] = useState<File[]>([]);
  const [imageTexts, setImageTexts] = useState<string[]>([]);
  const [nextImageId, setNextImageId] = useState<number>(0);
  const [imagesAndExcel, setImagesAndExcel] = useState<{ image: File | null; imageId: string | null; excelData: ExcelData | null; }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clonedImageUrls, setClonedImageUrls] = useState<string[]>([]);
  const [excelDataIndex, setExcelDataIndex] = useState(0);

  useEffect(() => {
    const createDatabaseAndObjectStore = async () => {
      try {
        const db = await openDatabase();
        const images = await getImagesFromIndexedDB(db);
        const updatedImagesAndExcel = images.map((image, index) => ({
          imageId: image.name,
          image: image,
          excelData: excelData && excelData[index] ? excelData[index] : null,
        }));
        setImagesAndExcel(updatedImagesAndExcel);
        setStoredImages(images);
        setNextImageId(images.length);
      } catch (error) {
        console.error('Error al crear la base de datos o al cargar las imágenes:', error);
      }
    };
    createDatabaseAndObjectStore();
  }, [excelData]);

  useEffect(() => {
    if (modalImageUrl && canvasRef.current && excelData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.src = modalImageUrl;
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          const selectedData = excelData[currentIndex];
          if (selectedData) {
            // Multiplicar o clonar la imagen original por la cantidad de strings en el array 'codigo'
            for (let i = 0; i < selectedData.nombres.length; i++) {
              ctx.drawImage(image, 0, image.height * (i + 1));
              console.log(`Imagen clonada: ${modalImageUrl}`);
              console.log(`Nombre: ${selectedData.nombres[i]}`);
              console.log(`Codigo: ${selectedData.codigo[i]}`);
              console.log(`Academica: ${selectedData.actividadAcademica}`);
              setExcelDataIndex(excelDataIndex + 1);
            }
            const clonedImageUrl = canvas.toDataURL(); // Obtener la URL de la imagen clonada como base64
            setClonedImageUrls((prevUrls) => [...prevUrls, clonedImageUrl]);
            // Insertar encima de las imágenes clonadas los strings del array 'codigo'
            for (let i = 0; i < selectedData.nombres.length; i++) {
              ctx.font = '66px Arial';
              ctx.fillStyle = 'red';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${selectedData.nombres[i]}`, canvas.width / 1.5, canvas.height * i + canvas.height / 2.5);
              ctx.fillText(`${selectedData.codigo[i]}`, canvas.width / 6.6, canvas.height * i + canvas.height / 1.2);
              ctx.fillText(`${selectedData.actividadAcademica}`, canvas.width / 1.5, canvas.height * i + canvas.height / 2);
              ctx.fillText(`${selectedData.email[i]}`, canvas.width / 6.6, canvas.height * i + canvas.height / 1.5);
              ctx.fillText(`${selectedData.fechaInicio}`, canvas.width / 1.5, canvas.height * i + canvas.height / 1.8);
            }
          }
        };
      }
    }
  }, [modalImageUrl, excelData, currentIndex]);


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
        const updatedImagesAndExcel = images.map((image, index) => ({
          imageId: image.name,
          image: image,
          excelData: excelData && excelData[index] && excelData[index].actividadAcademica && excelData[index].fechaInicio && excelData[index].nombres
          ? excelData[index]
          : null,
        }));
        setImagesAndExcel(updatedImagesAndExcel);
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

  const getImagesFromIndexedDB = async (db: IDBDatabase): Promise<File[]> => {
    if (!db.objectStoreNames.contains('ecomas')) {
      console.error('El almacén de objetos "ecomas" no existe en la base de datos.');
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
          resolve(result);
        } else {
          console.error('Error al obtener las imágenes: result es null');
          reject(new Error('Result es null'));
        }
      };
    });
  };

  const openModal = (imageUrl: string, index: number) => {
    setModalImageUrl(imageUrl);
    setCurrentIndex(index);
    setModalImageUrl(URL.createObjectURL(storedImages[currentIndex]));
  };

  const closeModal = () => {
    setModalImageUrl("");
  };
  
  const handleDeleteImages: () => Promise<void> = async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['ecomas'], 'readwrite');
      const objectStore = transaction.objectStore('ecomas');
      const clearRequest = objectStore.clear();
      clearRequest.onsuccess = () => {
        console.log('Todas las imágenes eliminadas correctamente.');
        setStoredImages([]);
        setNextImageId(0);
      };
      clearRequest.onerror = (event) => {
        console.error('Error al eliminar las imágenes:', clearRequest.error);
      };
    } catch (error) {
      console.error('Error al abrir la base de datos:', error);
    }
  };
  
  
  const getNumberFromFileName = (fileName: string): number => {
    const match = fileName.match(/\d+/);
    return match ? parseInt(match[0]) : Infinity;
  };
  // Ordenar las imágenes según los números en sus nombres
  const sortedImages = [...storedImages].sort((a, b) => {
    const numberA = getNumberFromFileName(a.name);
    const numberB = getNumberFromFileName(b.name);
    return numberA - numberB;
  });
  // Obtener las imágenes a mostrar según el número de módulos seleccionado
  const imagesToShow = sortedImages.slice(0, numModules);
  const handleVerClick = async (index: number) => {
    const selectedImage = imagesAndExcel[index];
    if (selectedImage.image) {
      openModal(clonedImageUrls[index], index);
    }
  };

  const handleNextImage = () => {
    if (currentIndex < imagesAndExcel.length - 1 && imagesAndExcel[currentIndex + 1].image) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentIndex > 0 && imagesAndExcel[currentIndex - 1] && imagesAndExcel[currentIndex - 1].image) {
      setCurrentIndex(currentIndex - 1);
    }
  };

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
        <button onClick={() => handleVerClick(index)} className='mr-28 p-2 text-blue-700 rounded-lg underline'>Ver</button>
        {imageTexts[index] && <p className="absolute top-80 left-80 text-yellow-400 bg-black bg-opacity-75 p-1 rounded-md">{imageTexts[index]}</p>}
      </div>
    ))}
    <p className=''>Archivos de imagenes mostrados: {numModules}</p>
    <button onClick={handleDeleteImages} className="bg-red-600 text-white p-2 rounded-md mb-4">Eliminar todas las imágenes</button>
    {modalImageUrl && (
    <Modal onClose={closeModal}>
      <div className="flex items-center justify-center">
        <button onClick={handlePrevImage} className="p-2 bg-gray-800 text-white rounded-full mr-4">&lt;</button>
        <div>
        <canvas ref={canvasRef} width={1122} height={793} style={{ width: '1122px', height: '793px' }} className=''/>
        </div>
        <button onClick={handleNextImage} className="p-2 bg-gray-800 text-white rounded-full ml-4">&gt;</button>
      </div>
    </Modal>
    )}
  </div>
);
};

export default ImageUploader;