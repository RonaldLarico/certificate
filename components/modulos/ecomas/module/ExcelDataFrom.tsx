"use client"
import React, { useState, ChangeEvent, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ImageUploader from './ImageFrom';
import Link from 'next/link';

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

const ExcelDataFrom = () => {
  const [numModules, setNumModules] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [excelFiles, setExcelFiles] = useState<File[]>(Array(numModules).fill(null));
  const [imagesAndExcel, setImagesAndExcel] = useState<{ image: File | null; imageId: number | null; excelData:ExcelData | null }[]>([]);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [excelLoaded, setExcelLoaded] = useState(false);
  const [conversionInProgress, setConversionInProgress] = useState(false);
  const [nextButtonText, setNextButtonText] = useState("Siguiente");

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
      // Obtén la ruta del archivo seleccionado
      const filePath = eventFiles[0].path;
      // Guarda la ruta en el localStorage
      sessionStorage.setItem('excelFilePath', filePath);
      console.log('Folder path:', filePath);
      const updatedImagesAndExcel = newExcelFiles.map((file, index) => {
        console.log(`Excel file ${file.name} is related to imageId ${index}`);
        return {
        imageId: index,
        image: index < imageFiles.length ? imageFiles[index] : null,
        excelData: null,
        }
      });
      setImagesAndExcel(updatedImagesAndExcel);
      setExcelLoaded(true);
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
        const nombres = filteredData.slice(10).map((row: string[]) => row[0]);
        const email = filteredData.slice(10).map((row: string[]) => row[2]);
        const codigo = filteredData.slice(10).map((row: string[]) => row[8]);
        const participacion = filteredData.slice(9).map((row: string[]) => row[9]);
        const actividadAcademica = sheet['B1'] ? sheet['B1'].v : null;
        const fechaInicio = sheet['B2'] ? sheet['B2'].v : null;
        const fechaFinal = sheet['B3'] ? sheet['B3'].v : null;
        const temario = sheet['B4'] ? sheet['B4'].v : null;
        const ponente = sheet['B5'] ? sheet['B5'].v : null;
        const horas = sheet['B6'] ? sheet['B6'].v : null;
        //const materiales = sheet['B9'] ? sheet['B9'].v : null;
        resolve({nombres, email, codigo, participacion, actividadAcademica, fechaInicio, fechaFinal, temario, ponente, horas });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(new Blob([file]));
    });
  };

  useEffect(() => {
    const updateImagesAndExcel = async () => {
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

  const excelFilesCount = excelFiles.filter(file => file !== null).length;

  return (
    <section className=''>
      <h1 className='mt-5 ml-5'>Módulares/Ecomás</h1>
      <div className='flex justify-center items-center mt-10 gap-6 p-8 bg-blue-600'>
        <h1 className='text-4xl font-extrabold text-white'>Número de módulos</h1>
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
          {imagesAndExcel.length > 0 && (
            <div>
              <ImageUploader
                numModules={numModules}
                excelData={imagesAndExcel.map(item => item.excelData).filter(excelData => excelData !== null) as ExcelData[]}
              />
            </div>
          )}
          </div>
        <div className='mt-20 mr-16'>
          <h1 className='mb-10 text-center p-4 font-bold text-xl bg-green-600/80 w-full text-white rounded-e-xl'>Cargar archivos excel ({numModules})</h1>
          <div className='flex relative mb-10 text-white font-mono justify-center'>
          <input type="file" accept=".xlsx, .xlsm, .xls" onChange={handleExcelFileChange} multiple
            className='p-4 rounded-xl bg-green-600/80 cursor-pointer hover:scale-110 duration-300' />
          </div>
          {excelFiles.map((file, index) => (
            <div key={index} className='mb-4'>
              {file && (
                <div className='inline-flex text-green-600/80'>
                  <p className='p-2 w-full border-2 border-green-600/80 rounded-lg'>{file.name}</p>
                </div>
              )}
            </div>
          ))}
          <p>Archivos de excel mostrados: {excelFilesCount}</p>
          <Link href="/pdf" className={`flex justify-end font-extrabold text-xl hover:scale-110 duration-300 ${!excelLoaded ? 'pointer-events-none' : ''}`}>
            <button className={`mt-4 p-3 w-full bg-green-600 text-white rounded-e-xl uppercase ${!excelLoaded || conversionInProgress ? 'opacity-50' : ''}`}>
              {conversionInProgress ? "Dibujando..." : nextButtonText}
            </button>
          </Link>


        </div>
      </div>
    </section>
  );
};

export default ExcelDataFrom;