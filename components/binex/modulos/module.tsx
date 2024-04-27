"use client"
import React, { useState, ChangeEvent, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import Modal from '@/components/share/Modal'; // Importa el componente Modal

const Module = () => {
  const [numModules, setNumModules] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [excelFiles, setExcelFiles] = useState<File[]>(Array(numModules).fill(null));
  const [imagesAndExcel, setImagesAndExcel] = useState<{ image: File | null, excelData: string[] | null }[]>(Array(numModules).fill({ image: null, excelData: null }));
  const [excelData, setExcelData] = useState<any[]>([]);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [showViewButton, setShowViewButton] = useState<boolean>(false);
  const [modalExcelData, setModalExcelData] = useState<any[]>([]);

  const handleModuleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedNumModules = parseInt(event.target.value);
    setNumModules(selectedNumModules);
    setImageFiles(prevFiles => prevFiles.slice(0, selectedNumModules));
    setExcelFiles(prevFiles => prevFiles.slice(0, selectedNumModules));
    setImagesAndExcel(Array(selectedNumModules).fill({ image: null, excelData: null }));
    setExcelData([]);
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const eventFiles = event.target.files;
    if (eventFiles && eventFiles.length > 0) {
      const newImageFiles = Array.from(eventFiles).slice(0, numModules);
      setImageFiles(newImageFiles);
      setShowViewButton(true);
    }
  };

  const handleExcelFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const eventFiles = event.target.files;
    if (eventFiles && eventFiles.length > 0) {
      const newExcelFiles = Array.from(eventFiles).slice(0, numModules);
      setExcelFiles(newExcelFiles);

      newExcelFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array((e?.target as FileReader).result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const excelData = XLSX.utils.sheet_to_json(sheet);
          setModalExcelData(excelData);
        };
        reader.readAsArrayBuffer(file);
      });
    }
  };

  useEffect(() => {
    // Aquí puedes realizar la lógica para modificar las imágenes según los datos del archivo Excel
    // Por ejemplo, puedes usar excelData para modificar las imágenes según alguna regla específica
  }, [excelData]);

  const openModal = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
  };

  const closeModal = () => {
    setModalImageUrl("");
  };

  const clearFiles = () => {
    setImageFiles([]);
    setExcelFiles(Array(numModules).fill(null));
    setShowViewButton(false);
  };

  const imageFilesCount = imageFiles.filter(file => file !== null).length;
  const excelFilesCount = excelFiles.filter(file => file !== null).length;

  const longTexts = [
    { text: 'CERTIFICADO', style: 'top-60 left-64 text-white text-6xl font-extrabold text-black' },
    { text: 'Texto largo 2...', style: 'top-40 left-40 text-white text-lg font-bold text-black' },
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
        <div className='mt-20'>
          <h1 className='mb-10 text-center mr-40 p-3 border-2 rounded-xl font-bold text-xl'>Cargar imagenes</h1>
          <div className='image-container relative mb-10'>
            <input type='file' accept="image/*" onChange={handleImageFileChange} multiple
            className='bg-red-600/50'/>
          </div>
          {imageFiles.map((file, index) => (
            <div key={index} className="image-container relative mb-4 flex justify-between items-center">
              {file && (
                <div className='bg-red-600/35 p-2 w-80 rounded-lg'>
                  <p className=''>{file.name}</p>
                </div>
              )}
              {showViewButton && (
                <button onClick={() => openModal(URL.createObjectURL(file))} className='mr-28 p-2 bg-purple-600 rounded-lg'>Ver</button>
              )}
            </div>
          ))}
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
      {modalImageUrl && (
        <Modal imageUrl={modalImageUrl} onClose={closeModal} numModules={numModules} longTexts={longTexts} excelData={modalExcelData}/>
      )}
    </section>
  );
};

export default Module;