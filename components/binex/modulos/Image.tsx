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
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [storedImages, setStoredImages] = useState<File[]>([]);
  const [imageTexts, setImageTexts] = useState<string[]>([]);
  const [selectedExcelData, setSelectedExcelData] = useState<ExcelData | null>(null);
  const [nextImageId, setNextImageId] = useState<number>(0);
  const [imagesAndExcel, setImagesAndExcel] = useState<{ image: File | null; imageId: string | null; excelData: ExcelData | null; }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    if (excelData && storedImages.length > 0) {
      generateImagesWithText();
    }
  }, [excelData, storedImages]);

  const generateImagesWithText = () => {
    const updatedImagesAndExcel: { image: File | null; imageId: string | null; excelData: ExcelData | null; }[] = [];
    storedImages.forEach((image, index) => {
      const selectedData = excelData ? excelData[index] : null;
      if (selectedData) {
        selectedData.nombres.forEach((nombre, nombreIndex) => {
          const newImageId = `${image.name}_${nombreIndex}`;
          const newImage = new File([image], newImageId, { type: image.type });
          updatedImagesAndExcel.push({
            imageId: newImageId,
            image: newImage,
            excelData: { nombres: [nombre], email: [selectedData.email[nombreIndex]], codigo: [selectedData.codigo[nombreIndex]], participacion: [selectedData.participacion[nombreIndex]], actividadAcademica: selectedData.actividadAcademica, fechaInicio: selectedData.fechaInicio, fechaFinal: selectedData.fechaFinal, temario: selectedData.temario, ponente: selectedData.ponente, horas: selectedData.horas },
          });
        });
      }
    });
    setImagesAndExcel(updatedImagesAndExcel);
  };

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
            const academy = `Academica ${selectedData.actividadAcademica}`
            const nombre = `Nombre: ${selectedData.nombres[currentIndex]}`;
            const codigo = `codigo; ${selectedData.codigo.join(', ')}`
            ctx.font = '66px Arial';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(nombre, canvas.width / 2, canvas.height / 2);
            ctx.fillText(codigo, canvas.width / 2, canvas.height / 1.2);
            ctx.fillText(academy, canvas.width / 2, canvas.height / 3);
          }
        };
      }
    }
  }, [modalImageUrl, excelData, currentIndex]);

  const createImageFile = (nombre: string, index: number): File => {
    // Crear un nuevo archivo de imagen con el nombre
    const imageFile = new File([], `${nombre}_${index}.png`, { type: 'image/png' });
    return imageFile;
  };

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

  const handleDeleteImages = async () => {
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

  const handleVerClick = async (index: number) => {
    const selectedImageFile = storedImages[index];
    openModal(URL.createObjectURL(selectedImageFile), index);
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