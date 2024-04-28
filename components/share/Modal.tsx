import React, { useState, useEffect } from 'react';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
  numModules: number;
  currentIndex: number;
  longTexts?: { text: string; style: string }[];
  ActividadAcademica: string | null; // Nueva línea para incluir actividad académica
  FechaInicio: string | null; // Nueva línea para incluir la fecha
  Nombres: string[];
}


const Modal = ({ imageUrl, onClose, numModules, longTexts, currentIndex, ActividadAcademica, FechaInicio, Nombres }: ModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const newImageUrls = Array.from({ length: numModules }, (_, index) => imageUrl);
    setImageUrls(newImageUrls);
  }, [imageUrl, numModules]);

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };


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

          {ActividadAcademica && (
            <div className="absolute top-96 left-0 m-4 px-4 py-1 text-xl font-bold text-white bg-black bg-opacity-75 rounded-xl">
              Actividad académica: {ActividadAcademica}
            </div>
          )}
          {FechaInicio && (
            <div className="absolute top-80 right-0 m-4 px-4 py-1 text-xl font-bold text-white bg-black bg-opacity-75 rounded-xl">
              Fecha Inicio: {FechaInicio}
            </div>
          )}

        <div className="absolute top-80 left-0 h-full w-full flex flex-col items-start">
          {Nombres && (
            <div className="p-2 bg-black bg-opacity-75 rounded-md mb-2">
              <p><strong>Nombres:</strong></p>
              <ul>
                {Nombres.map((nombre, index) => (
                  <li key={index}>{nombre}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button onClick={handlePrev} className="absolute top-1/2 left-0 transform -translate-y-1/2 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
          &lt;
        </button>
        <button onClick={handleNext} className="absolute top-1/2 right-0 transform -translate-y-1/2 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
          &gt;
        </button>

        <div className="absolute bottom-0 left-0 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
          Imágenes replicadas: {imageUrls.length}
        </div>
      </div>
    </div>
  );
};

export default Modal;
