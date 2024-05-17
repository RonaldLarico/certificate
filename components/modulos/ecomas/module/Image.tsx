import React, { ChangeEvent, useEffect, useState } from 'react';
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

  const [imagesToShow, setImagesToShow] = useState<File[]>([]);
  const [imageTexts, setImageTexts] = useState<string[]>([]);

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
    // Ordenar las imágenes según los números en sus nombres
    const sortedImages = [...imagesToShow].sort((a, b) => {
      const numberA = getNumberFromFileName(a.name);
      const numberB = getNumberFromFileName(b.name);
      return numberA - numberB;
    });
    // Obtener las imágenes a mostrar según el número de módulos seleccionado
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
      const texts = selectedFiles.map(() => "");
      setImageTexts(texts);
      saveImages(selectedFiles);
      setImagesToShow(selectedFiles)
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

  const drawCanvas = (canvas: HTMLCanvasElement, data: ExcelData, dataIndex: number, arrayIndex: number) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const selectedData = data;
      const modalImageUrl = imagesToShow[dataIndex] ? URL.createObjectURL(imagesToShow[dataIndex]) : '';
      const image = new Image();
      image.src = modalImageUrl;
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        if (selectedData && Array.isArray(selectedData.nombres) && Array.isArray(selectedData.codigo)) {
          const width = 2280;
          const height = 1225;
          const currentNombre = selectedData.nombres[arrayIndex];
          const currentCodigo = selectedData.codigo[arrayIndex];
          ctx.font = '70px Arial';
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${currentNombre}`, width, canvas.height / 2.5);
          ctx.fillText(`${selectedData.actividadAcademica}`, width, height);
          const lineHeight = 100;
          const y = canvas.height / 1.7;
          ctx.fillText("Curso-taller organizado por Ecomás Consultoria y Capacitaciones,", width, y);
          ctx.fillText(`llevado a cabo desde el ${selectedData.fechaInicio} al ${selectedData.fechaFinal},`, width, y + lineHeight);
          ctx.fillText("con una duración de 20 horas académicas", width, y + lineHeight * 2);
          const fontSize = 45;
          ctx.fillStyle = 'white';
          ctx.font = `${fontSize}px Arial`;
          ctx.fillText(`${selectedData.ponente}`, canvas.width / 6.6, canvas.height / 3.7);
          const textYPx = 2130;
          ctx.fillStyle = 'black';
          ctx.fillText(`${currentCodigo}`, canvas.width / 6.6, textYPx);

          ctx.fillStyle = 'white';
          ctx.textAlign = 'left';
          const fontSizeT = 35;
          ctx.font = `${fontSizeT}px Arial`;
          const drawTemario = (temario: string, ctx: CanvasRenderingContext2D, x: number, y: number, maxWidth: number) => {
            const lineHeight = 50;
            const bulletIndent = 380;
            const marginLeft = 0;
            const viñetas = temario.split('\n').map(viñeta => viñeta.trim());
            let nivel = 0;
            let nivelAnterior = 0;
            let posY = y;
            viñetas.forEach((viñeta) => {
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
              ctx.fillText(line, xPos, posY);
              posY += lineHeight;
              if (nivel < nivelAnterior) {
                nivelAnterior = nivel;
              }
            });
          };
          const maxWidth = 800;
          drawTemario(selectedData.temario || "", ctx, canvas.width / 6.6, canvas.height / 2.9, maxWidth);
        }
      };
    }
  };

  const groupedImages: { [name: string]: { dataIndex: number; arrayIndex: number }[] } = {};
    excelData && excelData.forEach((data, dataIndex) => {
      data.nombres.forEach((nombre, arrayIndex) => {
        const key = `${nombre}_${dataIndex}_${arrayIndex}`; // Usamos una clave única para evitar duplicados
        if (!groupedImages[nombre]) {
          groupedImages[nombre] = [{ dataIndex, arrayIndex }];
        } else {
          groupedImages[nombre].push({ dataIndex, arrayIndex });
      }
    });
  });

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
          {/* <button onClick={() => handleVerClick(index)} className='mr-28 p-2 text-blue-700 rounded-lg underline'>Ver</button> */}
          {imageTexts[index] && <p className="absolute top-80 left-80 text-yellow-400 bg-black bg-opacity-75 p-1 rounded-md">{imageTexts[index]}</p>}
        </div>
      ))}
      <p className=''>Archivos de imagenes mostrados: {numModules}</p>
      <button onClick={handleDeleteAllImages} className='mt-4 p-2 bg-red-600 text-white rounded-lg'>Cambiar diseño de las imágenes</button>

      <div className="drawn-image-list-container">
        <h2>Imágenes Dibujadas</h2>
          <div className="drawn-image-list">
            {excelData && Object.keys(groupedImages).map((nombre, index) => (
              <div key={index} className="drawn-image-item">
                <h3>{nombre}</h3>
                {groupedImages[nombre].map(({ dataIndex, arrayIndex }, subIndex) => (
                  <div key={subIndex}>
                    <canvas ref={(canvas) => {
                      if (canvas && excelData[dataIndex]) drawCanvas(canvas, excelData[dataIndex], dataIndex, arrayIndex); // Asegúrate de que excelData[dataIndex] no sea null
                    }} width={1122} height={793} style={{ width: '1122px', height: '793px' }} className=''/>
                    <p>{nombre}</p>
                    ---------------------------------------------------------------------------------------------------------------------
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default ImageUploader;