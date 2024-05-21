"use client";
import React, { useEffect, useState } from 'react';
import { openDatabase } from '@/components/modulos/ecomas/database/index';
import jsPDF from 'jspdf';
import Modal from '@/components/share/Modal';

const ImageExport = () => {
  const [imageGroups, setImageGroups] = useState<{ name: string, images: File[] }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<{ name: string, images: File[] } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const getImagesFromDB = async () => {
      try {
        const db = await openDatabase();
        const transaction = db.transaction(['drawnImages'], 'readonly');
        const objectStore = transaction.objectStore('drawnImages');
        const storedImages: File[] = [];

        const cursorRequest = objectStore.openCursor();
        cursorRequest.onsuccess = function(event) {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            storedImages.push(cursor.value);
            cursor.continue();
          } else {
            const groupedImages = storedImages.reduce((groups: { [name: string]: File[] }, image: File) => {
              const nameParts = image.name.split('_');
              const name = nameParts[0];
              if (!groups[name]) {
                groups[name] = [];
              }
              groups[name].push(image);
              return groups;
            }, {});
            const imageGroupsArray = Object.keys(groupedImages).map(name => ({
              name,
              images: groupedImages[name]
            }));
            setImageGroups(imageGroupsArray);
          }
        };
      } catch (error) {
        console.error('Error al abrir la base de datos:', error);
      }
    };
    getImagesFromDB();
  }, []);

  const convertImageToPDF = (image: File) => {
    const pdf = new jsPDF({
      orientation: 'landscape' // Establecer la orientación horizontal
    });
    const reader = new FileReader();
    reader.onload = () => {
      const imgData = reader.result as string;

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210); // A4 size: 210mm × 297mm
      pdf.save(`${image.name}.pdf`);
    };
    reader.readAsDataURL(image);
  };

  const openModal = (group: { name: string, images: File[] }) => {
    setCurrentGroup(group);
    setCurrentImageIndex(0);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentGroup(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentGroup!.images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentGroup!.images.length) % currentGroup!.images.length);
  };

  return (
    <div>
      <h2>Imágenes guardadas en IndexedDB:</h2>
      {imageGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h3 className='text-red-500'>{group.name}</h3>
          <div className="image-grid">
            {group.images.map((image, index) => (
              <div key={index} className="image-item">
                {/* <img src={URL.createObjectURL(image)} alt={`Image ${groupIndex}-${index}`} /> */}
                {/* <p>{image.name}</p> */}
                {/* <button onClick={() => convertImageToPDF(image)}>Convertir a PDF</button> */}
              </div>
            ))}
            <button onClick={() => openModal(group)}>Ver</button>
          </div>
        </div>
      ))}
      {currentGroup && (
        <Modal onClose={closeModal}>
          <div className="modal-buttons" style={{ textAlign: 'center' }}>
            <button onClick={handlePrevImage} className='text-red-600'>Anterior</button>
            <button onClick={handleNextImage}>Siguiente</button>
          </div>
          <img
            src={URL.createObjectURL(currentGroup.images[currentImageIndex])}
            alt={`Image ${currentImageIndex}`}
            style={{ width: '297mm', height: '210mm' }} // Tamaño A4
          />
        </Modal>
      )}
      <button onClick={() => window.history.back()} className="mt-4 p-2 bg-blue-600 text-white rounded-lg">Atrás</button>
    </div>
  );
};

export default ImageExport;


