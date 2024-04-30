"use client"
import React, { useState, ChangeEvent, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Modal from '@/components/share/Modal'; // Importa el componente Modal
import ImageModalContent from './texts';
import ImageUploader from './Image';

interface ExcelData {
  actividadAcademica: string | null;
  fechaInicio: string | null;
  nombres: string[];
}

const Module = () => {
  const [numModules, setNumModules] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [excelFiles, setExcelFiles] = useState<File[]>(Array(numModules).fill(null));
  const [imagesAndExcel, setImagesAndExcel] = useState<{ image: File | null; excelData:ExcelData | null }[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [showViewButton, setShowViewButton] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleModuleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedNumModules = parseInt(event.target.value);
    setNumModules(selectedNumModules);
    setImageFiles(prevFiles => prevFiles.slice(0, selectedNumModules));
    setExcelFiles(prevFiles => prevFiles.slice(0, selectedNumModules));
    setImagesAndExcel(Array(selectedNumModules).fill({ image: null, excelData: null }));
    setExcelData([]);
  };

 /*  const saveImageToIndexedDB = async (imageFiles: File[], groupName: string) => {
    try {
      // Abre la base de datos o crea una nueva si no existe
      const request = indexedDB.open('imagesDB', 1);
      // Maneja la actualización de la base de datos
      request.onupgradeneeded = function(event) {
        const db = (event.target as IDBRequest<IDBDatabase>).result;
        // Crea un objeto de almacenamiento para el grupo específico
        db.createObjectStore(groupName, { keyPath: 'id', autoIncrement: true });
      };
      // Obtiene la base de datos una vez que está disponible
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      // Inicia una transacción para el grupo específico
      const transaction = db.transaction([groupName], 'readwrite');
      const objectStore = transaction.objectStore(groupName);
      // Agrega las imágenes al objeto de almacenamiento
      await Promise.all(imageFiles.map(async (file) => {
        const image = await readFileAsDataURL(file);
        const data = { name: file.name, data: image };
        objectStore.add(data);
      }));
      // Espera a que la transacción se complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      console.log('Imágenes guardadas en IndexedDB correctamente.');
    } catch (error) {
      console.error('Error al guardar las imágenes en IndexedDB:', error);
    }
  }; */
  /* const loadImageFromIndexedDB = async (groupName: string): Promise<{ name: string; data: string }[]> => {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('imagesDB', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const transaction = db.transaction([groupName], 'readonly');
      const objectStore = transaction.objectStore(groupName);
      const cursor = objectStore.openCursor();
      const images: { name: string; data: string }[] = [];
      await new Promise<void>((resolve, reject) => {
        cursor.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            images.push(cursor.value);
            cursor.continue();
          } else {
            resolve();
          }
        };
        cursor.onerror = () => reject(cursor.error);
      });
      return images;
    } catch (error) {
      console.error('Error al cargar las imágenes desde IndexedDB:', error);
      return [];
    }
  }; */

  /* const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }; */

  /* const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const eventFiles = event.target.files;
    if (eventFiles && eventFiles.length > 0) {
      const newImageFiles = Array.from(eventFiles).slice(0, numModules);
      setImageFiles(newImageFiles);
      const updatedImageAndExcel = newImageFiles.map(image => ({ image, excelData: null }));
      console.log("Nombre de la imagen", updatedImageAndExcel);
      setImagesAndExcel(updatedImageAndExcel);
      setShowViewButton(true);
      try {
        // Guardar las imágenes en IndexedDB
        await saveImageToIndexedDB(newImageFiles, `module_${numModules}`);
        // Determinar el nombre del grupo según el número de módulos seleccionados
        let groupName = '';
        switch (numModules) {
          case 1:
            groupName = 'cimade';
            break;
          case 2:
            groupName = 'sayan';
            break;
          case 3:
            groupName = 'binex';
            break;
          case 4:
            groupName = 'ecomas';
            break;
          case 5:
            groupName = 'promas';
            break;
          default:
            groupName = 'rizo';
            break;
        }
        // Cargar las imágenes del grupo correspondiente desde IndexedDB
        const loadedImages = await loadImageFromIndexedDB(groupName);
        // Actualizar el estado con las imágenes cargadas
        setImagesAndExcel(loadedImages.map(image => ({ image: null, excelData: null })));
      } catch (error) {
        console.error('Error al cargar las imágenes desde IndexedDB:', error);
      }
    }
  }; */

  const handleExcelFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const eventFiles = event.target.files;
    if (eventFiles && eventFiles.length > 0) {
      const newExcelFiles = Array.from(eventFiles).slice(0, numModules);
      setExcelFiles(newExcelFiles);
      const updatedImageAndExcel = await Promise.all(newExcelFiles.map(async (file) => {
        return {
          image: null,
          excelData: await extractExcelData(file)
        };
      }));
      console.log("Datos de archivos Excel extraídos:", updatedImageAndExcel);
      setImagesAndExcel(updatedImageAndExcel);
    }
  };

  const extractExcelData = async (file: File): Promise<ExcelData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array((e?.target as FileReader).result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const filteredData = sheetData.filter((row) => row.length > 0 && row.some((cell) => typeof cell === 'string' && cell.trim() !== ''));
        const nombres = filteredData.slice(11).map((row: string[]) => row[0]);
        const actividadAcademica = sheet['B1'] ? sheet['B1'].v : null;
        const fechaInicio = sheet['B2'] ? sheet['B2'].v : null;
        resolve({ actividadAcademica, fechaInicio, nombres });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  useEffect(() => {
    // Aquí puedes realizar la lógica para modificar las imágenes según los datos del archivo Excel
    // Por ejemplo, puedes usar excelData para modificar las imágenes según alguna regla específica
  }, [excelData]);

  const openModal = (imageUrl: string, index:number) => {
    setModalImageUrl(imageUrl);
    setCurrentIndex(index)
  };

  const closeModal = () => {
    setModalImageUrl("");
  };

  const clearFiles = () => {
    setImageFiles([]);
    setExcelFiles(Array(numModules).fill(null));
    setImagesAndExcel([]);
    setShowViewButton(false);
  };

  const imageFilesCount = imageFiles.filter(file => file !== null).length;
  const excelFilesCount = excelFiles.filter(file => file !== null).length;

  const longTexts = [
    { text: 'CERTIFICADO', style: 'top-64 left-56 text-black text-7xl font-extrabold' },
    { text: 'Otorgado a:', style: 'top-[330px] left-[415px] text-[22px] font- text-gray-400' },
  ];

  return (
    <section className=''>
      <h1 className='mt-5 ml-5'>Módulares</h1>
      <div className='flex justify-center mt-10 gap-6'>
        <h1 className='text-3xl font-bold'>Número de módulos</h1>
        <div className='text-gray-500 items-center'>
          <div className='relative'>
            <select {...{ required: true }} name='country' className="bg-gray-100 border-2 border-gray-300 text-gray-600 text-3xl rounded-lg ps-5 p-1 font-bold" onChange={handleModuleChange}>
              {[...Array(13)].map((_, index) => (
                <option key={index} value={index + 1}>{String(index + 1).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-2 ml-40'>
        <div className=''>
          <div className='image-container relative mb-20'>
          </div>
          <ImageUploader numModules={numModules} onImageUpload={(files) => setShowViewButton(true)} />
          <p className=''>Archivos de imagenes mostrados: {imageFilesCount}</p>
        </div>
        <div className='mt-20'>
          <h1 className='mb-10 text-center mr-40 p-3 border-2 rounded-xl font-bold text-xl'>Cargar archivos excel</h1>
          <div className='relative mb-10'>
          <input type="file" accept=".xlsx, .xls" onChange={handleExcelFileChange} multiple
            className='bg-green-600/50' />
          </div>
          {excelFiles.map((file, index) => (
            <div key={index} className='mb-4'>
              {file && (
                <div className='inline-flex'>
                  <p className='w-80 p-2 bg-green-600/35 rounded-lg'>{file.name}</p>
                </div>
              )}
            </div>
          ))}
          <p>Archivos de excel mostrados: {excelFilesCount}</p>
        </div>
      </div>
      <button onClick={clearFiles} className="mx-auto mt-10 p-4 bg-gray-700 rounded-lg block">Limpiar</button>
      {/* {modalImageUrl && (
        <Modal onClose={closeModal}>
          <ImageModalContent
            imageUrl={modalImageUrl}
            numModules={numModules}
            excelData={imagesAndExcel[currentIndex]?.excelData}
            longTexts={longTexts}
            actividadAcademica={imagesAndExcel[currentIndex]?.excelData?.actividadAcademica ?? null}
            fechaInicio={imagesAndExcel[currentIndex]?.excelData?.fechaInicio ?? null}
            nombres={imagesAndExcel[currentIndex]?.excelData?.nombres ?? []}
          />
        </Modal>
      )} */}
    </section>
  );
};

export default Module;
