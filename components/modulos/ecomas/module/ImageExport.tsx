import React, { useState } from 'react';
import Modal from '@/components/share/Modal'; // Asegúrate de tener el componente Modal implementado

interface ImageListProps {
  imageNames: string[];
}

const ImageList: React.FC<ImageListProps> = ({ imageNames }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleViewClick = (name: string) => {
    setSelectedImage(name);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div>
      <h2>Lista de Imágenes Dibujadas</h2>
      <ul>
        {imageNames.map((name, index) => (
          <li key={index}>
            {name}
            <button onClick={() => handleViewClick(name)}>Ver</button>
          </li>
        ))}
      </ul>
      {selectedImage && (
        <Modal onClose={closeModal}>
          <div className="flex items-center justify-center">
            <img src={selectedImage} alt={selectedImage} />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageList;
