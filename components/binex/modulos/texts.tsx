import React, { useState, useEffect } from 'react';

interface ImageModalContentProps {
  
    numModules: number;
    excelData: { actividadAcademica: string | null; fechaInicio: string | null; nombres: string[] } | null;
    longTexts: { text: string; style: string }[];
    actividadAcademica: string | null;
    fechaInicio: string | null;
    nombres: string[];
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

        {excelData && (
        <>
          <div className="absolute top-96 left-0 m-4 px-4 py-1 text-xl font-bold text-white bg-black bg-opacity-75 rounded-xl">
            Actividad académica: {excelData.actividadAcademica}
          </div>
          <div className="absolute top-80 right-0 m-4 px-4 py-1 text-xl font-bold text-white bg-black bg-opacity-75 rounded-xl">
            Fecha Inicio: {excelData.fechaInicio}
          </div>
          <div className="absolute top-80 left-0 h-full w-full flex flex-col items-start">
            <div className="p-2 bg-black bg-opacity-75 rounded-md mb-2">
              <p><strong>Nombres:</strong></p>
              <ul>
                {excelData.nombres.map((nombre, index) => (
                  <li key={index}>{nombre}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
      </div>
      <div className="absolute top-10 left-10 text-white text-lg font-bold bg-black bg-opacity-75 p-2 rounded-md">
        Tu texto aquí
      </div>
    </>
  );
};

export default ImageModalContent;