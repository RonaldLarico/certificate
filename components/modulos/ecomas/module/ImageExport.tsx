"use client";
import React, { useEffect, useState } from 'react';
import { openDatabase } from '@/components/modulos/ecomas/database/index';
import jsPDF from 'jspdf';
import Modal from '@/components/modulos/share/Modal';

const ImageExport = () => {
  const [imageGroups, setImageGroups] = useState<{ name: string, images: File[] }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<{ name: string, images: File[] } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [conversionInProgress, setConversionInProgress] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState('Guardar PDF');
  const [saveSuccess, setSaveSuccess] = useState(false);

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
  }, []);

  const convertGroupToPDF = async (group: { name: string, images: File[] }) => {
    setConversionInProgress(true);
    for (let i = 0; i < group.images.length; i++) {
      await convertImageToPDF(group.images[i], group.name, i);
    }
    setConversionInProgress(false);
    setSaveButtonText('Guardado');
    if (!saveSuccess) { // Solo mostrar el mensaje de éxito si aún no se ha mostrado
      setSaveSuccess(true);
      alert(`Guardado con éxito '${group.name}'`);
    }
  };

  const convertAllToPDF = async () => {
    setConversionInProgress(true);
    for (const group of imageGroups) {
      await convertGroupToPDF(group);
    }
    setConversionInProgress(false);
  };

  const convertImagePDFEmail = async (image: File, groupName: string, index: number) => {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape'
      });
      const reader = new FileReader();
      reader.onload = async () => {
        const imgData = reader.result as string;
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
        // Convertir el PDF a una cadena Base64
        const pdfBase64 = pdf.output('datauristring');
        // Crear el objeto JSON con los datos del PDF
        const pdfData = {
          groupName,
          index,
          pdfBase64,
        };
        // Enviar el objeto JSON a la API para enviar por correo
        const response = await fetch("../api/apiMail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(pdfData)
        });
        const data = await response.json();
        console.log(data);
      };
      reader.readAsDataURL(image);
    } catch (error) {
      console.error('Error al enviar el PDF por correo:', error);
      alert('Error al enviar el PDF por correo');
    }
  };

  const convertImageToPDF = async (image: File, groupName: string, index: number) => {
    try {
      const pdf = new jsPDF({
        orientation: 'landscape'
      });
      const reader = new FileReader();
      reader.onload = async () => {
        const imgData = reader.result as string;
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
        // Obtener la ruta del archivo Excel del almacenamiento local
        let routeExcel;
        const excelFilePath = sessionStorage.getItem('excelFilePath');
        if (excelFilePath !== null) {
          routeExcel = excelFilePath.replace(/\\/g, '/').replace(/\/[^/]*$/, "");
          console.log(routeExcel);
        } else {
          console.log("La ruta del archivo Excel no está definida en el almacenamiento local.");
          return; // Salir de la función si no se encuentra la ruta del archivo Excel
        }
      console.log("rutaaaaaaaa", routeExcel);
        // Verificar si la ruta del archivo Excel está definida
        if (!excelFilePath) {
          console.error('La ruta del archivo Excel no está definida en el almacenamiento local');
          return;
        }
        // Convertir el PDF a una cadena Base64
        const pdfBase64 = pdf.output('datauristring');
        // Crear el objeto JSON con los datos del PDF
        const pdfData = {
          groupName,
          index,
          pdfBase64,
          routeExcel,
        };
        // Enviar el objeto JSON a la API
      const response = await fetch("../api/apiPdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pdfData)
      });
      const data = await response.json();
      console.log(data);
    };
      reader.readAsDataURL(image);
    } catch (error) {
      console.error('Error al enviar el PDF a la API:', error);
      alert('Error al enviar el PDF a la API');
    }
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

  const emailData = sessionStorage.getItem('emailData');
  //console.log("Datos guardados en sessionStorage:", emailData);

  const assignEmailAndGroup = (groupName: string) => {
    // Verificar si hay datos guardados en sessionStorage
    if (emailData) {
      // Convertir los datos guardados de sessionStorage a objetos JavaScript
      const emailDataArray = JSON.parse(emailData);
      // Encontrar el objeto correspondiente al nombre de grupo
      const groupData = emailDataArray.find((group: { nombre: string }) => group.nombre === groupName);
      // Verificar si se encontró el grupo
      if (groupData) {
        // Asignar el correo y los materiales al grupo
        console.log(`Correo asignado para ${groupName}: ${groupData.email}`);
        console.log(`Materiales asignados para ${groupName}: ${groupData.materiales}`);
      } else {
        console.log(`No se encontraron datos para el grupo ${groupName}`);
      }
    } else {
      console.log("No hay datos guardados en sessionStorage");
    }
  };

// Llamar a la función para asignar correo y materiales a cada nombre de grupo
imageGroups.forEach(group => assignEmailAndGroup(group.name));


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
              <button onClick={() => convertImagePDFEmail}>Enviar</button>
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
        <button onClick={() => window.history.back()} className="mt-4 p-2 bg-blue-600 text-white rounded-lg">Atrás</button>
        <button onClick={deleteImagesFromDB}>Eliminar imágenes</button>
        <button onClick={() => convertAllToPDF()} disabled={conversionInProgress} className="mt-4 p-2 bg-blue-600 text-white rounded-lg">
          {conversionInProgress ? 'Guardando...' : saveButtonText}
        </button>
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