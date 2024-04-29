import React, { useState, useEffect } from 'react';

interface ImageModalContentProps {
    imageUrl: string;
    numModules: number;
    excelData: { actividadAcademica: string | null; fechaInicio: string | null; nombres: string[] } | null;
    longTexts: { text: string; style: string }[];
    actividadAcademica: string | null;
    fechaInicio: string | null;
    nombres: string[];
}

const ImageModalContent = ({ imageUrl, numModules, longTexts, excelData }: ImageModalContentProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  console.log(excelData);

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
    <>
      <img src={imageUrls[currentImageIndex]} alt="Imagen"
        className="mx-auto max-h-screen max-w-screen"
        style={{ width: '297mm', height: '210mm' }}/>

        {longTexts && longTexts.map((text, index) => (
          <div key={index} className={`absolute ${text.style}`}>
            {text.text}
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

      <button onClick={handlePrev} className="absolute top-1/2 left-0 transform -translate-y-1/2 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
        &lt;
      </button>
      <button onClick={handleNext} className="absolute top-1/2 right-0 transform -translate-y-1/2 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
        &gt;
      </button>

      <div className="absolute bottom-0 left-0 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
        Imágenes replicadas: {imageUrls.length}
      </div>
    </>
  );
};

export default ImageModalContent;