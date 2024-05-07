import React, { useState, useEffect } from 'react';

interface ImageModalContentProps {
    numModules: number;
    excelData: ExcelData[];
    longTexts: { text: string; style: string }[];
}

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

const ImageModalContent = ({ numModules, longTexts, excelData}: ImageModalContentProps) => {

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  console.log(excelData);

  useEffect(() => {
    const newImageUrls = Array.from({ length: numModules }, (_, index) => "");
    setImageUrls(newImageUrls);
  }, [numModules]);

  return (
    <>
    <div className=''>
      {longTexts && longTexts.map((text, index) => (
        <div key={index} className={`absolute ${text && text.style}`}>
          {text && text.text}
        </div>
      ))}
        {excelData && excelData.map((data, dataIndex) => (
        <div key={dataIndex} className='grid grid-cols-2'>

          <div className='col-span-1'>
          <div className="absolute top-[205px] left-[115px] text-xs font-bold text-gray-200">
            {data.ponente}
          </div>
          <div className="absolute top-[280px] left-[115px] text-xs font-bold text-gray-200">
            {data.temario}
          </div>
          <div className="absolute top-[635px] left-40 h-full w-full flex flex-col items-start">
            <div className="p-2 bg-black bg-opacity-75 rounded-md mb-2 text-white">
              <p><strong>Codigo:</strong></p>
              <ul>
                {data.codigo.map((codigo, index) => (
                  <li key={index}>{codigo}</li>
                ))}
              </ul>
            </div>
          </div>
          </div>

          <div className='col-span-1'>
          <div className="absolute top-[377px] left-[425px] text-xl font-bold text-gray-800">
            {data.actividadAcademica}
          </div>
          <div className="absolute top-[500px] right-0 text-xl font-bold text-gray-800">
            Curso-taller organizado por ECOMÁS Consultoria y Capacitaciones, llevado a cabo desde el {data.fechaInicio} al {data.fechaInicio} de 2024 con una duracion de 20 horas académicas.
          </div>
          <div className="absolute top-[280px] left-[600px] h-full w-full flex flex-col items-start">
            <div className="p-2 bg-black bg-opacity-75 rounded-md mb-2 text-white">
              <p><strong>Nombres:</strong></p>
              <ul>
                {data.nombres.map((nombre, index) => (
                  <li key={index}>{nombre}</li>
                ))}
              </ul>
            </div>
            </div>
          </div>

        </div>
      ))}
      </div>
    </>
  );
};

export default ImageModalContent;