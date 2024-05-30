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
  const [sendButtonState, setSendButtonState] = useState<{ [groupName: string]: "initial" | "sending" | "sent" }>({});
  const [allEmailsSent, setAllEmailsSent] = useState(false);


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
    setSaveButtonText('Guardado');
    if (!saveSuccess) { // Solo mostrar el mensaje de éxito si aún no se ha mostrado
      setSaveSuccess(true);
      alert(`Guardado con éxito`);
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
  const actividadAcademicaData = sessionStorage.getItem('actividadAcademicaData');
  const dataString = actividadAcademicaData ? JSON.parse(actividadAcademicaData) : [];
  //console.log("Datos guardados en sessionStorage:", actividadAcademicaData);

  const getEmailForGroup = (groupName: string) => {
    // Verificar si hay datos guardados en sessionStorage
    if (emailData) {
      // Convertir los datos guardados de sessionStorage a objetos JavaScript
      const emailDataArray = JSON.parse(emailData);
      // Encontrar el objeto correspondiente al nombre de grupo
      const groupData = emailDataArray.find((group: { nombre: string }) => group.nombre === groupName);
      // Verificar si se encontró el grupo
      if (groupData) {
        console.log(`Correo asignado para ${groupName}: ${groupData.email}`);
        return groupData.email
        // Asignar el correo y los materiales al grupo
      } else {
        console.log(`No se encontraron datos para el grupo ${groupName}`);
      }
    } else {
      console.log("No hay datos guardados en sessionStorage");
    }
  };
// Llamar a la función para asignar correo y materiales a cada nombre de grupo
imageGroups.forEach(group => getEmailForGroup(group.name));

const convertToPDFAndEmail = async (group: { name: string, images: File[] }) => {
  try {
    setSendButtonState((prevState) => ({
      ...prevState,
      [group.name]: 'sending'
    }));
    const pdfs: string[] = [];
    // Iterar sobre cada imagen en el grupo y convertirla a PDF
    for (const image of group.images) {
      const pdf = new jsPDF({
        orientation: 'landscape'
      });
      const reader = new FileReader();
      const promise = new Promise((resolve) => {
        reader.onload = () => {
          const imgData = reader.result as string;
          pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
          resolve(undefined);
        };
      });
      reader.readAsDataURL(image);
      await promise;
      // Convertir el PDF a una cadena Base64 y agregarlo al array de PDFs
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      pdfs.push(pdfBase64);
    }
    // Crear el objeto JSON con los datos del PDF y enviarlo a la API
    const dataEmail = {
      groupName: group.name,
      email: getEmailForGroup(group.name),
      pdfBase64Array: pdfs,
      dataString,
      templateName: 'Ecomas',
      user: 'ecomas.201@gmail.com',
      pass: 'aubslrrzusgphuad'
    };
    const response = await fetch("../api/apiMail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dataEmail)
    });
    const data = await response.json();
    console.log(data);
    setSendButtonState(prevState => ({
      ...prevState,
      [group.name]: 'sent'
    }));
  } catch (error) {
    console.error('Error al enviar el PDF por correo:', error);
    alert('Error al enviar el PDF por correo');
    setSendButtonState(prevState => ({
      ...prevState,
      [group.name]: 'initial'
    }));
  }
};

const sendEmailToAllGroups = async () => {
  try {
    // Iterar sobre cada grupo de imágenes y enviar el correo electrónico
    for (const group of imageGroups) {
      await convertToPDFAndEmail(group);
      // Pausa para dar tiempo entre cada envío de correo electrónico
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
    }
    setAllEmailsSent(true);
  } catch (error) {
    console.error('Error al enviar correos electrónicos:', error);
    alert('Error al enviar correos electrónicos');
  }
};

  return (
    <div className="max-w-screen-xl mx-auto mt-40">
      <div className="">
        <h2>Imágenes guardadas en IndexedDB:</h2>
        {imageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className=''>
            <div className='gap-10 inline-flex items-center text-xl'>
              <h3 className='w-[500px] border-2 border-blue-600 p-4 rounded-xl font-bold'>{group.name}
                <span className="text-sm text-gray-400 ml-1">
                  ({group.images.length} módul{group.images.length !== 0 ? 'os' : ''})
                </span>
              </h3>
              <button onClick={() => openModal(group)} className='w-40 p-4 bg-blue-600 rounded-xl font-mono hover:scale-110 duration-300'>Ver módulos</button>
              <p className='w-96 border-2 border-green-600 rounded-xl p-4 font-semibold'>{getEmailForGroup(group.name)}</p>
              <button
                onClick={() => convertToPDFAndEmail(group)}
                disabled={sendButtonState[group.name] === 'sending' || sendButtonState[group.name] === 'sent'}
                className={`bg-${sendButtonState[group.name] === 'sent' ? 'red' : 'green'}-600 p-4 rounded-xl hover:scale-110 duration-300 font-mono`}>
                {sendButtonState[group.name] === 'sending' ? 'Enviando...' : (sendButtonState[group.name] === 'sent' ? 'Enviado' : 'Enviar')}
              </button>
            </div>
            <div className="image-grid mb-8">
              {group.images.map((image, index) => (
                <div key={index} className="image-item">
                  {/* <p>{image.name}</p> */}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className='flex justify-between text-2xl font-extrabold mt-20 mb-10'>
        <button
  onClick={() => convertAllToPDF()}
  disabled={conversionInProgress || saveButtonText === 'Guardado'} 
  className="p-4 bg-red-500 text-white rounded-s-xl w-full uppercase hover:scale-110 duration-300"
>
  {conversionInProgress ? 'Guardando...' : saveButtonText}
</button>
          <button
            onClick={sendEmailToAllGroups}
            disabled={allEmailsSent} // Deshabilitar el botón si todos los correos electrónicos ya se han enviado
            className={`w-full text-white p-4 text-2xl font-extrabold uppercase bg-green-600 rounded-e-xl hover:scale-110 duration-300 ${allEmailsSent ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {allEmailsSent ? 'Módulos Enviados' : 'Enviar a Email (Todos los Módulos)'}
          </button>
        </div>
        <div className='flex justify-between text-2xl font-extrabold mb-40'>
          <button onClick={() => window.history.back()} className="p-4 bg-blue-600 text-white rounded-s-xl w-full uppercase hover:scale-110 duration-300">Atrás</button>
          <button onClick={deleteImagesFromDB} className='w-full text-white p-4 text-2xl font-extrabold uppercase bg-red-600 rounded-e-xl hover:scale-110 duration-300'>Limpiar Datos</button>
        </div>
          {currentGroup && (
            <Modal onClose={closeModal}>
              <div className='flex justify-center'>
                <div className="modal-buttons inline-flex mb-5">
                  <button
                    onClick={handlePrevImage}
                    className={`text-gray-200 mr-3 border-2 border-blue-600 hover:bg-blue-600 px-3 py-1 rounded-xl uppercase font-extrabold text-xl hover:scale-125 duration-300${currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    &#60;
                  </button>
                  <div className="pagination flex font-extrabold">
                    {currentGroup.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`page-btn ${index === currentImageIndex ? 'bg-gray-300 text-blue-600 rounded-xl' : 'bg-blue-600 text-gray-200 hover:scale-125 duration-300 hover:bg-slate-200 hover:text-blue-600'} px-4 py-2 rounded-xl`}>
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextImage}
                    className={`text-gray-200 ml-3 border-2 border-blue-600 hover:bg-blue-600 px-3 py-1 rounded-xl uppercase font-extrabold text-xl hover:scale-125 duration-300${currentImageIndex === currentGroup.images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    &#62;
                  </button>
                </div>
              </div>
              <img
                src={URL.createObjectURL(currentGroup.images[currentImageIndex])}
                alt={`Image ${currentImageIndex}`}
                style={{ width: '297mm', height: '210mm' }}/>
            </Modal>
          )}

      </div>
    </div>
  );
};

export default ImageExport;