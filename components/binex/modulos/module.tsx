"use client"
import React, { useState, ChangeEvent, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Modal from '@/components/share/Modal'; // Importa el componente Modal

const Module = () => {
  const [numModules, setNumModules] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([new File([], "")]);
  const [excelFiles, setExcelFiles] = useState<File[]>(Array(numModules).fill(null));
  const [excelData, setExcelData] = useState<any[]>([]);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const [multiplicationCount, setMultiplicationCount] = useState<number>(0);

  const handleModuleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedNumModules = parseInt(event.target.value);
    setNumModules(selectedNumModules);
    setImageFiles(Array(selectedNumModules).fill(null));
    setExcelFiles(Array(selectedNumModules).fill(null));
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const eventFiles = event.target.files;
    if (eventFiles && eventFiles.length > 0) {
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = eventFiles[0];
      setImageFiles(newImageFiles);

      if (eventFiles[0].type.startsWith('image')) {
        const multipliedImages = Array.from({ length: numModules }, () => eventFiles[0]);
        setImageFiles((prevImageFiles) => {
          const updatedFiles = [...prevImageFiles];
          updatedFiles[index] = eventFiles[0];
          return updatedFiles;
        });
        setMultiplicationCount((prevCount) => prevCount + 1);
      } else {
        console.error('El archivo seleccionado no es una imagen');
      }
    }
  };

  const handleExcelFileChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    if (event.target.files && event.target.files.length > 0) {
      const newExcelFiles = [...excelFiles];
      newExcelFiles[index] = event.target.files[0];
      setExcelFiles(newExcelFiles);

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array((e?.target as FileReader).result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(sheet);
        setExcelData(excelData);
      };
      reader.readAsArrayBuffer(event.target.files[0]);
    }
  };

  useEffect(() => {
    // Aquí puedes realizar la lógica para modificar las imágenes según los datos del archivo Excel
    // Por ejemplo, puedes usar excelData para modificar las imágenes según alguna regla específica
  }, [excelData]);

  const openModal = (index: number) => {
    setModalImageIndex(index);
  };

  const closeModal = () => {
    setModalImageIndex(null);
  };

  return (
    <section className=''>
      <h1 className='mt-5 ml-5'>Módulares</h1>
      <div className='flex justify-center mt-20 gap-6'>
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
      <div className='grid grid-cols-2 text-center'>
        <div className='mt-20'>
          <h1 className='mb-5'>Cargar imagenes</h1>
            {imageFiles.map((file, index) => (
              <div key={index} className="image-container relative mb-4">
              <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e, index)} />
              {file && (
                <div>
                  <button onClick={() => openModal(index)}>Ver</button>
                </div>
              )}
              </div>
            ))}
        </div>
        <div className='mt-20'>
          <h1 className='mb-5'>Cargar archivo excel</h1>
          {excelFiles.map((file, index) => (
            <div key={index} className='mb-4'>
              <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelFileChange(e, index)} />
              {file && (
                <div className='text-'>
                  <p>Archivo seleccionado: {file.name}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalImageIndex !== null && (
        <Modal
          imageUrlArray={imageFiles
            .filter(file => file && file.type.startsWith('image')) // Filtrar solo archivos de imagen
            .map(file => URL.createObjectURL(file))}
          onClose={closeModal}
        />
      )}

    </section>
  );
};

export default Module;