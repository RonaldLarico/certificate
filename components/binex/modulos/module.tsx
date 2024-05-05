"use client"
import React, { useState, ChangeEvent, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ImageUploader from './Image';
import ImageModalContent from './texts';

interface ExcelData {
  actividadAcademica: string | null;
  fechaInicio: string | null;
  nombres: string[];
}

interface ImageAndExcel {
  imageId: number | null;
  image: File | null;
  excelData: ExcelData | null;
}

const Module = () => {
  const [numModules, setNumModules] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [excelFiles, setExcelFiles] = useState<File[]>(Array(numModules).fill(null));
  const [imagesAndExcel, setImagesAndExcel] = useState<{ image: File | null; imageId: number | null; excelData:ExcelData | null }[]>([]);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [showViewButton, setShowViewButton] = useState<boolean>(false);
  const [excelLoaded, setExcelLoaded] = useState<boolean>(false);

  const handleModuleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedNumModules = parseInt(event.target.value);
    setNumModules(selectedNumModules);
    setImageFiles(prevFiles => prevFiles.slice(0, selectedNumModules));
    setExcelFiles(prevFiles => prevFiles.slice(0, selectedNumModules));
    setExcelData(null);
  };

  const handleExcelFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const eventFiles = event.target.files;
    if (eventFiles && eventFiles.length > 0) {
      const newExcelFiles = Array.from(eventFiles).slice(0, numModules);
      setExcelFiles(newExcelFiles);
      const updatedImagesAndExcel = newExcelFiles.map((_, index) => ({
        imageId: index < imageFiles.length ? index : null,
        image: index < imageFiles.length ? imageFiles[index] : null,
        excelData: null,
      }));
      setImagesAndExcel(updatedImagesAndExcel);
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
      reader.readAsArrayBuffer(new Blob([file]));
    });
  };

  useEffect(() => {
    const updateImagesAndExcel = async () => { // Marcar la función como async
      const updatedImagesAndExcel = await Promise.all(excelFiles.map(async (file, index) => ({
        imageId: index < imageFiles.length ? index : null,
        image: index < imageFiles.length ? imageFiles[index] : null,
        excelData: await extractExcelData(file),
      })));
      setImagesAndExcel(updatedImagesAndExcel);
    };
    if (excelFiles.length > 0) {
      updateImagesAndExcel();
    }
  }, [excelFiles, imageFiles]);

 /*  useEffect(() => {
    // Aquí puedes realizar la lógica para modificar las imágenes según los datos del archivo Excel
    // Por ejemplo, puedes usar excelData para modificar las imágenes según alguna regla específica
  }, [excelData]); */

  const clearFiles = () => {
    setImageFiles([]);
    setExcelFiles(Array(numModules).fill(null));
    setImagesAndExcel([]);
    //setExcelLoaded(false);
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
      <h1 className='mt-5 ml-5'>Módulares/Binex</h1>
      <div className='flex justify-center mt-10 gap-6'>
        <h1 className='text-3xl font-bold'>Número de módulos</h1>
        <div className='text-gray-500 items-center'>
          <div className='relative'>
            <select {...{ required: true }} name='country' className="bg-gray-100 border-2 border-gray-300 text-gray-600 text-3xl rounded-lg ps-5 p-1 font-bold" onChange={handleModuleChange}>
              {[...Array(15)].map((_, index) => (
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
          {imagesAndExcel.map(({ image, excelData }, index) => (
            <div key={index} className=''>
              <ImageUploader
                numModules={numModules}
                onImageUpload={(files) => setShowViewButton(true)}
                excelData={excelData}
              />
              <p className=''>Archivos de imagenes mostrados: {numModules}</p>
            </div>
          ))}

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
    </section>
  );
};

export default Module;
