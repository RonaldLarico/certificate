import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import Modal from '@/components/share/Modal';
import { openDatabase }  from '@/components/modulos/ecomas/database/index';

interface ExcelData {
  nombres: string[];
  email: string[];
  codigo: string[];
  participacion: string[];
  actividadAcademica: string | null;
  fechaInicio: string | null;
  fechaFinal: string | null;
  temario: string | null;
  ponente: string | null;
  horas: string | null;
}

interface ImageUploaderProps {
  numModules: number;
  excelData: ExcelData[] | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ numModules, excelData }) => {

  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [imagesToShow, setImagesToShow] = useState<File[]>([]);
  const [imageTexts, setImageTexts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [newImages, setNewImages] = useState<File[]>([])
  const [excelDataSet, setExcelDataSet] = useState<ExcelData[] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (modalImageUrl && canvasRef.current && excelData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const image = new Image();
        image.src = modalImageUrl;
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          const selectedData = excelData[currentIndex];
          if (selectedData) {
            for (let i = 0; i < selectedData.nombres.length; i++) {
              console.log("siiiiiiiii",i)
              const width = 2280
              const height = 1225
              ctx.font = '70px Arial';
              ctx.fillStyle = 'black';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${selectedData.nombres[i]}`, width, canvas.height * i + canvas.height / 2.5);
              console.log(`Nombresssssss: ${selectedData.nombres[i]}`);
              ctx.fillText(`${selectedData.actividadAcademica}`, width, canvas.height * i + height);
              const lineHeight = 100; // Ajusta el espacio entre líneas según sea necesario
              const y = canvas.height * i + canvas.height / 1.7; // Posición vertical inicial
              ctx.fillText("Curso-taller organizado por Ecomás Consultoria y Capacitaciones,", width, y);
              ctx.fillText(`llevado a cabo desde el ${selectedData.fechaInicio} al ${selectedData.fechaFinal},`, width, y + lineHeight);
              ctx.fillText("con una duración de 20 horas académicas", width, y + lineHeight * 2);
              const fontSize = 45;
              ctx.fillStyle = 'white';
              ctx.font = `${fontSize}px Arial`;
              ctx.fillText(`${selectedData.ponente}`, canvas.width / 6.6, canvas.height * i + canvas.height / 3.7);
              const textYPx = 2130;
              ctx.fillStyle = 'black';
              ctx.fillText(`${selectedData.codigo[i]}`, canvas.width / 6.6, canvas.height * i + textYPx);

              ctx.fillStyle = 'white';
              ctx.textAlign = 'left';
              const fontSizeT = 35;
              ctx.font = `${fontSizeT}px Arial`;
              const drawTemario = (temario: string, ctx: CanvasRenderingContext2D, x: number, y: number, maxWidth: number) => {
                const lineHeight = 50;
                const bulletIndent = 380; // Ajusta la sangría según sea necesario
                const marginLeft = 0;
                const viñetas = temario.split('\n').map(viñeta => viñeta.trim());
                let nivel = 0;
                let nivelAnterior = 0;
                let posY = y
                viñetas.forEach((viñeta, index) => {
                  nivel = (viñeta.match(/^\*+/) || [""])[0].length;
                  const sangria = (nivel - 1) * bulletIndent;
                  const xPos = x + marginLeft + sangria;
                  let text = viñeta.substring(nivel).trim();
                  const words = text.split(' ');
                  let line = '';
                  words.forEach(word => {
                    const testLine = line + word + ' ';
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth) {
                      ctx.fillText(line, xPos, posY);
                      line = word;
                      posY += lineHeight;
                    } else {
                      line = testLine;
                    }
                  });
                  const mainTextWidth = ctx.measureText(viñeta.substring(0, nivel).trim()).width;
                  const adjustedXPos = x + marginLeft + mainTextWidth;
                  ctx.fillText(line, xPos, posY);
                  posY += lineHeight;
                  if (nivel < nivelAnterior) {
                    nivelAnterior = nivel;
                  }
                });
              };
              const maxWidth = 800;
              drawTemario(selectedData.temario || "", ctx, canvas.width / 6.6, canvas.height * i + canvas.height / 2.9, maxWidth);
              console.log(`Imagen clonada: ${modalImageUrl}`);
              console.log(`Nombre: ${selectedData.nombres[i]}`);
              console.log(`Codigo: ${selectedData.codigo[i]}`);
              console.log(`Academica: ${selectedData.actividadAcademica}`);
              console.log(`Nombre: ${selectedData.nombres.length}`);
            }
          }
        };
      }
    }
  }, [modalImageUrl, excelData, currentIndex]);

  useEffect(() => {
    const getStoredImages = async () => {
      try {
        const db = await openDatabase();
        const transaction = db.transaction(['ecomas'], 'readonly');
        const objectStore = transaction.objectStore('ecomas');
        const storedImages: File[] = [];
        objectStore.openCursor().onsuccess = function(event) {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            storedImages.push(cursor.value);
            cursor.continue();
          }
        };
        setImagesToShow(storedImages);
      } catch (error) {
        console.error('Error al abrir la base de datos:', error);
      }
    };
    getStoredImages();
  }, []);

  useEffect(() => {
    const sortedImages = [...imagesToShow].sort((a, b) => {
      const numberA = getNumberFromFileName(a.name);
      const numberB = getNumberFromFileName(b.name);
      return numberA - numberB;
    });
    const imagesToDisplay = sortedImages.slice(0, numModules);
    setImagesToShow(imagesToDisplay);
  }, [numModules]);

const getNumberFromFileName = (fileName: string): number => {
    const match = fileName.match(/\d+/);
    return match ? parseInt(match[0]) : Infinity;
};

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const selectedFiles = Array.from(files).slice(0, numModules);
      setNewImages(selectedFiles);
      const texts = selectedFiles.map(() => "");
      setImageTexts(texts);
      saveImages(selectedFiles);
      setImagesToShow((prevImages) => [...prevImages, ...selectedFiles])
    }
  };

  const saveImages = async (images: File[]) => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['ecomas'], 'readwrite');
      const objectStore = transaction.objectStore('ecomas');
      images.forEach((image) => {
        const request = objectStore.add(image);
        request.onerror = (event) => {
          console.error('Error al guardar la imagen en la base de datos:', (event.target as IDBRequest).error);
        };
      });
      transaction.oncomplete = async () => {
        const storedImages: File[] = [];
        const newTransaction = db.transaction(['ecomas'], 'readonly');
        const newObjectStore = newTransaction.objectStore('ecomas');
        const cursor = newObjectStore.openCursor();
        cursor.onsuccess = function (event) {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            storedImages.push(cursor.value);
            cursor.continue();
          } else {
            const sortedImages = storedImages.sort((a, b) => {
              const numberA = getNumberFromFileName(a.name);
              const numberB = getNumberFromFileName(b.name);
              return numberA - numberB;
            });
            setImagesToShow(sortedImages);
          }
        };
      };
    } catch (error) {
      console.error('Error al abrir la base de datos:', error);
    }
  };

  const handleDeleteAllImages = async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['ecomas'], 'readwrite');
      const objectStore = transaction.objectStore('ecomas');
      const request = objectStore.clear();
      request.onsuccess = () => {
        console.log('Todas las imágenes eliminadas correctamente.');
        setImagesToShow([]);
      };
      request.onerror = (event) => {
        console.error('Error al eliminar las imágenes:', (event.target as IDBRequest).error);
      };
    } catch (error) {
      console.error('Error al abrir la base de datos:', error);
    }
  };

  const closeModal = () => {
    setModalImageUrl(null);
  };

  const handleVerClick = (index: number) => {
    const imageUrl = URL.createObjectURL(imagesToShow[index]);
    setModalImageUrl(imageUrl);
    setCurrentIndex(index);
  };
  const handleNextImage = () => {
    if (currentIndex < imagesToShow.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setExcelDataSet((prevExcelData) => {
        if (!prevExcelData) return prevExcelData;
        const newData = [...prevExcelData];
        newData[currentIndex] = { ...newData[currentIndex], nombres: [...newData[currentIndex].nombres], codigo: [...newData[currentIndex].codigo] }; // Copiar el objeto actual y sus arrays
        return newData;
      });
    }
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setExcelDataSet((prevExcelData) => {
        if (!prevExcelData) return prevExcelData;
        const newData = [...prevExcelData];
        newData[currentIndex] = { ...newData[currentIndex], nombres: [...newData[currentIndex].nombres], codigo: [...newData[currentIndex].codigo] }; // Copiar el objeto actual y sus arrays
        return newData;
      });
    }
  };

  return (
    <div>
      <h1 className='mb-10 text-center mr-40 p-3 border-2 rounded-xl font-bold text-xl'>Cargar imagenes ({numModules})</h1>
      <div className='image-container relative mb-10'>
        <input type='file' accept="image/*" onChange={handleImage} multiple className='bg-red-600/50'/>
      </div>
      {imagesToShow.map((file, index) => (
        <div key={index} className="image-container relative mb-4 flex justify-between items-center">
          {file && (
            <div className='bg-red-600/35 p-2 w-80 rounded-lg'>
              <p className=''>{file.name}</p>
            </div>
          )}
          <p className="text-gray-500">ID: {index >= numModules ? index - numModules : index}</p>
          <button onClick={() => handleVerClick(index)} className='mr-28 p-2 text-blue-700 rounded-lg underline'>Ver</button>
          {imageTexts[index] && <p className="absolute top-80 left-80 text-yellow-400 bg-black bg-opacity-75 p-1 rounded-md">{imageTexts[index]}</p>}
        </div>
      ))}
      <p className=''>Archivos de imagenes mostrados: {numModules}</p>
      <button onClick={handleDeleteAllImages} className='mt-4 p-2 bg-red-600 text-white rounded-lg'>Eliminar todas las imágenes</button>
      {modalImageUrl && (
        <Modal onClose={closeModal}>
          <div className="flex items-center justify-center">
            <button onClick={handlePrevImage} className="p-2 bg-gray-800 text-white rounded-full mr-4 text-3xl">&lt;</button>
            <div>
              <canvas ref={canvasRef} width={1122} height={793} style={{ width: '1122px', height: '793px' }} className=''/>
            </div>
            <button onClick={handleNextImage} className="p-2 bg-gray-800 text-white rounded-full ml-4 text-3xl">&gt;</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageUploader;
