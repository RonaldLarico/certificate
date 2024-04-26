import React, { useState, useEffect } from 'react';

interface ModalProps {
  imageUrl: string;
  onClose: () => void;
  numModules: number;
}

const Modal = ({ imageUrl, onClose, numModules }: ModalProps) => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center bg-gray-800 bg-opacity-75 backdrop-blur">
      <div className="relative p-20">
        <button onClick={onClose} className="absolute top-0 right-0 m-4 px-4 py-1 text-xl font-bold text-white bg-red-500 rounded-xl">X</button>
        <img src={imageUrls[currentImageIndex]} alt="Imagen" className="mx-auto max-h-screen max-w-screen" />

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
