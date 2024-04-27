import React, { useState, useEffect } from 'react';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
  numModules: number;
  longTexts?: { text: string; style: string }[];
  excelData: ExcelRow[];
}

interface ExcelRow {
  Correo: string;
  Nombres: string;
  Codigo: string;
  ActividadAcademica: string;
  Participacion: string;
  Instituciones: string;
  Horas: string;
  Inicio: string;
  Finalizacion: string;
  YourTop: string;
  YourLeft: string;
}

const Modal = ({ imageUrl, onClose, numModules, longTexts, excelData }: ModalProps) => {
  console.log(excelData)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    // Crear un array con la misma imagen replicada 10 veces
    const newImageUrls = Array.from({ length: numModules * 10 }, () => imageUrl);
    setImageUrls(newImageUrls);
  }, [imageUrl, numModules]);

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };

  const filteredExcelData = excelData.slice(11);

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center bg-gray-800 bg-opacity-75 backdrop-blur">
      <div className="relative p-20">
        <button onClick={onClose} className="absolute top-0 right-0 m-4 px-4 py-1 text-xl font-bold text-white bg-red-500 rounded-xl">X</button>
        <img src={imageUrls[currentImageIndex]} alt="Imagen"
          className="mx-auto max-h-screen max-w-screen"
          style={{ width: '297mm', height: '210mm' }}/>

          {longTexts && longTexts.map((text, index) => (
            <div key={index} className={`absolute ${text.style}`}>
              {text.text}
            </div>
          ))}

<div className="absolute top-80 left-0 h-full w-full flex flex-col items-start">
          {filteredExcelData.map((row, index) => (
            <div key={index} className="p-2 bg-black bg-opacity-75 rounded-md mb-2">
              <p><strong>DNI:</strong> {row.Correo}</p>
              <p><strong>Nombre:</strong> {row.Nombres}</p>
              <p><strong>Código:</strong> {row.Codigo}</p>
              <p><strong>Actividad:</strong> {row.ActividadAcademica}</p>
              <p><strong>Participacion:</strong> {row.Participacion}</p>
              <p><strong>Institucion:</strong> {row.Instituciones}</p>
              <p><strong>Horas</strong> {row.Horas}</p>
              <p><strong>FechaInicio</strong> {row.Inicio}</p>
              <p><strong>FechaF:</strong> {row.Finalizacion}</p>
            </div>
          ))}
        </div>

        <button onClick={handlePrev} className="absolute top-1/2 left-0 transform -translate-y-1/2 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
          &lt;
        </button>
        <button onClick={handleNext} className="absolute top-1/2 right-0 transform -translate-y-1/2 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
          &gt;
        </button>

        <div className="absolute bottom-0 left-0 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
          Imágenes replicadas: {numModules * 10}
        </div>
      </div>
    </div>
  );
};

export default Modal;
