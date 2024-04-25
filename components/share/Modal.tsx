import React from 'react';

interface ModalProps {
  imageUrlArray: string[];
  onClose: () => void;
}

const Modal = ({ imageUrlArray, onClose }: ModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrlArray.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrlArray.length) % imageUrlArray.length);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center bg-gray-800 bg-opacity-75 backdrop-blur">
      <div className="relative p-20">
        <button onClick={onClose} className="absolute top-0 right-0 m-4 px-4 py-1 text-xl font-bold text-white bg-red-500 rounded-xl">X</button>
        <img src={imageUrlArray[currentImageIndex]} alt="Imagen" className="mx-auto max-h-screen max-w-screen" />

        <button onClick={handlePrev} className="absolute top-1/2 left-0 transform -translate-y-1/2 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
          &lt;
        </button>
        <button onClick={handleNext} className="absolute top-1/2 right-0 transform -translate-y-1/2 m-4 px-4 py-1 text-xl font-bold text-white bg-gray-500 rounded-xl">
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Modal;


