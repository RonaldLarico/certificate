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
  const [convertedGroups, setConvertedGroups] = useState<string[]>([]);
  const [conversionInProgress, setConversionInProgress] = useState(false);
  const [excelFilePath, setExcelFilePath] = useState<string | null>(null);

  useEffect(() => {
    const getImagesFromDB = async () => {
      try {
        const db = await openDatabase();
        const transaction = db.transaction(['ImagesEcomas'], 'readonly');
        const objectStore = transaction.objectStore('ImagesEcomas');
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
    const routeExcel = localStorage.getItem('excelFilePath');
    if (routeExcel) {
      setExcelFilePath(routeExcel);
    }
  }, []);

  const convertGroupToPDF = async (group: { name: string, images: File[] }) => {
    setConversionInProgress(true);
    for (let i = 0; i < group.images.length; i++) {
      await convertImageToPDF(group.images[i], group.name, i);
    }
    setConversionInProgress(false);
  };

  const convertAllToPDF = async () => {
    setConversionInProgress(true);
    for (const group of imageGroups) {
      await convertGroupToPDF(group);
    }
    setConversionInProgress(false);
  };

  const convertImageToPDF = async (image: File, groupName: string, index: number) => {
    return new Promise<void>((resolve, reject) => {
      const pdf = new jsPDF({
        orientation: 'landscape'
      });
      const reader = new FileReader();
      reader.onload = () => {
        const imgData = reader.result as string;
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
        const fileName = `${groupName}_${index + 1}.pdf`;
        pdf.save(fileName.replace('.jpeg', ''));
        setConvertedGroups(prevGroups => [...prevGroups, fileName.replace('.jpeg', '')]);
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
      // Envía el PDF a la API para guardar en la misma ruta que el archivo Excel
      if (excelFilePath) {
        const formData = new FormData();
        formData.append('emailService', 'gmail');
        formData.append('file', pdf.output('blob') as Blob);
        formData.append('fileName', `${groupName}_${index + 1}.pdf`);
        formData.append('rutaArchivoExcel', excelFilePath);

        fetch("../api/savePDF", {
          method: "POST",
          body: formData,
        })
        .then(response => response.json())
        .then(data => {
          console.log(data); // Puedes manejar la respuesta de la API aquí si es necesario
          alert('Guardado con éxito');
        })
        .catch(error => console.error('Error al enviar el PDF a la API:', error));
      } else {
        console.error('No se encontró la ruta del archivo Excel.');
      }
    });
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

  const deleteImagesFromDB = async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['ImagesEcomas'], 'readwrite');
      const objectStore = transaction.objectStore('ImagesEcomas');
      const clearRequest = objectStore.clear();
      clearRequest.onsuccess = () => {
        setImageGroups([]);
        console.log('Imágenes eliminadas correctamente.');
      };
    } catch (error) {
      console.error('Error al eliminar las imágenes:', error);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto mt-40">
      <div className="">
        <h2>Imágenes guardadas en IndexedDB:</h2>
        {imageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className='grid grid-cols-2 mx-auto '>
            <div className="flex bg-gray-500 w-96 p-2">
              <h3 className='text-red-500'>{group.name}</h3>
            </div>
            <div className='gap-10'>
              <button onClick={() => openModal(group)} className='mr-10'>Ver</button>
              <button onClick={() => convertGroupToPDF(group)}>Convertir a PDF</button>
            </div>
            <div className="image-grid mb-5">
              {group.images.map((image, index) => (
                <div key={index} className="image-item">
                  <p>{image.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => convertAllToPDF()} disabled={conversionInProgress} className="mt-4 p-2 bg-blue-600 text-white rounded-lg">
          {conversionInProgress ? 'Convirtiendo...' : 'Convertir todo a PDF'}
        </button>
        <button onClick={() => window.history.back()} className="mt-4 p-2 bg-blue-600 text-white rounded-lg">Atrás</button>
        <button onClick={deleteImagesFromDB}>Eliminar imágenes</button>
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
      </div>
    </div>
  );
};

export default ImageExport;



