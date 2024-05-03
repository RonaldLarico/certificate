import React, { useState, useEffect, ChangeEvent } from 'react';
import Modal from '@/components/share/Modal'; // Importa el componente Modal

interface ImageUploaderProps {
  numModules: number;
  onImageUpload: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ numModules, onImageUpload }) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [storedImages, setStoredImages] = useState<File[]>([]);
  

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
      const resizedImageFiles: File[] = [];
      for (const imageFile of newImageFiles) {
        const resizedImageBlob = await resizeImageToA4(imageFile);
        const resizedImageFile = new File([resizedImageBlob], imageFile.name, { type: imageFile.type });
        resizedImageFiles.push(resizedImageFile);
      }
      try {
        for (const resizedImageFile of resizedImageFiles) {
          console.log("Número de módulos:", numModules);
          const groupName = getGroupName(numModules);
          console.log("Nombre del grupo:", groupName);
          await saveImageToIndexedDB([resizedImageFile], groupName);
        }
        // Actualizar el estado después de completar todas las operaciones
        setImageFiles(prevFiles => [...prevFiles, ...resizedImageFiles]);
        onImageUpload([...imageFiles, ...resizedImageFiles]);
        const images = await getImagesFromIndexedDB();
        setStoredImages(images);
      } catch (error) {
        console.error('Error al guardar las imágenes en IndexedDB:', error);
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

  const openModal = (imageUrl: string, index: number) => {
    setModalImageUrl(imageUrl);
    setCurrentIndex(index);
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
          <button onClick={() => openModal(URL.createObjectURL(file), index)} className='mr-28 p-2 bg-purple-600 rounded-lg'>Ver</button>
        </div>
      ))}
      <button onClick={handleDeleteImages} className="bg-red-600 text-white p-2 rounded-md mb-4">Eliminar todas las imágenes</button>
      {modalImageUrl && (
        <Modal onClose={closeModal}>
          <div className="flex items-center justify-center">
            <button onClick={handlePrevImage} className="p-2 bg-gray-800 text-white rounded-full mr-4">&lt;</button>
              <img src={modalImageUrl} alt="Preview" className="max-h-[21cm] max-w-[29.7cm]" style={{ width: '100%', height: 'auto' }} />
            <button onClick={handleNextImage} className="p-2 bg-gray-800 text-white rounded-full ml-4">&gt;</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageUploader;
