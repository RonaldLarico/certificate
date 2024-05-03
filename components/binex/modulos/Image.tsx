import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
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
  const imageFilesRef = useRef<File[]>([]);

  useEffect(() => {
    const loadImagesFromIndexedDB = async () => {
      try {
        const groupName = getGroupName(numModules);
        console.log("Nombre del grupo:", groupName);
        const images = await getImagesFromIndexedDB(groupName); // Pasar el nombre del grupo como argumento
        // Verificar si images es un array válido antes de llamar a setStoredImages
        if (Array.isArray(images)) {
          setStoredImages(images);
        } else {
          console.error('Error: El resultado de getImagesFromIndexedDB no es un array:', images);
        }
      } catch (error) {
        console.error('Error al cargar las imágenes desde IndexedDB:', error);
      }
    };
    loadImagesFromIndexedDB();
  }, [numModules]);

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
          const groupName = getGroupName(numModules);
          await saveImageToIndexedDB([resizedImageFile], groupName); // Guardar la imagen en IndexedDB
        }
        await Promise.all(resizedImageFiles.map(async (resizedImageFile) => {
          const groupName = getGroupName(numModules);
          await saveImageToIndexedDB([resizedImageFile], groupName);
        }));
        // Actualiza la referencia mutable con las imágenes cargadas
        imageFilesRef.current = [...imageFilesRef.current, ...resizedImageFiles];
        // Llama a onImageUpload con las imágenes cargadas
        onImageUpload([...imageFilesRef.current]);
        const groupName = getGroupName(numModules); // Obtener el nombre del grupo
        const images = await getImagesFromIndexedDB(groupName);
        setStoredImages(images);
      } catch (error) {
        console.error('Error al guardar las imágenes en IndexedDB:', error);
      }
    }
  };

  const saveImageToIndexedDB = async (images: File[], groupName: string) => {
    console.log("Nombre del grupo en saveImageToIndexedDB:", groupName);
    return new Promise<void>((resolve, reject) => {
      try {
        const request = window.indexedDB.open('ImageDatabase', 2);
        request.onerror = (event) => {
          console.error('Error al abrir la base de datos:', request.error);
          reject(request.error);
        };
        request.onupgradeneeded = (event) => {
          console.log('onupgradeneeded event triggered');
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(groupName)) {
            console.log(`Creating object store for ${groupName}`);
            db.createObjectStore(groupName, { autoIncrement: true });
          }
        };
        request.onsuccess = (event) => {
          const db = request.result;
          const transaction = db.transaction([groupName], 'readwrite');
          const objectStore = transaction.objectStore(groupName);
          transaction.oncomplete = () => {
            db.close();
            resolve();
          };
          transaction.onerror = (event) => {
            console.error('Error al guardar las imágenes:', transaction.error);
            reject(transaction.error);
          };
          images.forEach((image) => {
            objectStore.add(image);
          });
        };
      } catch (error) {
        console.error('Error en saveImageToIndexedDB:', error);
        reject(error);
      }
    });
  };

  const getImagesFromIndexedDB = async (groupName: string): Promise<File[]> => {
    return new Promise<File[]>((resolve, reject) => {
      try {
        const request = window.indexedDB.open('ImageDatabase', 2);
        request.onerror = (event: Event) => {
          console.error('Error al abrir la base de datos:', (event.target as IDBOpenDBRequest).error);
          reject((event.target as IDBOpenDBRequest).error);
        };
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction([groupName], 'readonly');
          const objectStore = transaction.objectStore(groupName);
          const getRequest = objectStore.getAll();
          getRequest.onerror = (event: Event) => {
            console.error(`Error al obtener las imágenes para el grupo ${groupName}:`, (event.target as IDBRequest).error);
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
              console.error(`Error al obtener las imágenes para el grupo ${groupName}: result es null`);
              reject(new Error(`Error al obtener las imágenes para el grupo ${groupName}: result es null`));
            }
            db.close();
          };
        };
      } catch (error) {
        console.error('Error en getImagesFromIndexedDB:', error);
        reject(error);
      }
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

  const getGroupNameOfFile = (file: File): string => {
  const fileName = file.name.toLowerCase();
  if (fileName.includes('cimade')) {
    return 'cimade';
  } else if (fileName.includes('sayan')) {
    return 'sayan';
  } else if (fileName.includes('binex')) {
    return 'binex';
  } else if (fileName.includes('ecomas')) {
    return 'ecomas';
  } else if (fileName.includes('promas')) {
    return 'promas';
  } else {
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

  const deleteImagesByGroupName = async (groupName: string) => {
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
        const index = objectStore.index('groupIndex'); // Índice para buscar por grupo o almacén
        const range = IDBKeyRange.only(groupName);
        const deleteRequest = index.openCursor(range);
        deleteRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            objectStore.delete(cursor.primaryKey);
            cursor.continue();
          } else {
            resolve();
          }
        };
        deleteRequest.onerror = (event) => {
          console.error('Error al eliminar las imágenes:', deleteRequest.error);
          reject(deleteRequest.error);
        };
      };
    });
  };

  const handleDeleteImages = async () => {
    try {
      const groupName = getGroupName(numModules);
      await deleteImagesByGroupName(groupName); // Eliminar imágenes por grupo o almacén
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
      {storedImages.filter((file, index) => index < numModules).map((file, index) => {
    console.log(`Nombre del archivo: ${file.name}, Grupo de almacenamiento: ${getGroupNameOfFile(file)}`);
    return (
      <div key={index} className="image-container relative mb-4 flex justify-between items-center">
        {file && (
          <div className='bg-red-600/35 p-2 w-80 rounded-lg'>
            <p className=''>{file.name}</p>
          </div>
        )}
        <button onClick={() => openModal(URL.createObjectURL(file), index)} className='mr-28 p-2 bg-purple-600 rounded-lg'>Ver</button>
      </div>
    );
  })}
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