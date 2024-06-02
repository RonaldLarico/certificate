import React, { ChangeEvent, useEffect, useState } from 'react';
import { openDatabase }  from '@/components/modulos/ecomas/database/index';
import { FaRegImages } from "react-icons/fa6";
import { BsImages } from "react-icons/bs";
import Link from 'next/link';

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
  const [drawnImagesList, setDrawnImagesList] = useState<JSX.Element[]>([]);
  const [convertedImages, setConvertedImages] = useState<File[]>([]);
  const [convertedImageIndexes, setConvertedImageIndexes] = useState<number[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

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
        setImagesLoaded(storedImages.length > 0);
      } catch (error) {
        console.error('Error al abrir la base de datossssssssssssss:', error);
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
  if (!imagesLoaded) {
    const files = event.target.files;
    if (files) {
      const selectedFiles = Array.from(files).slice(0, numModules);
      const texts = selectedFiles.map(() => "");
      setImageTexts(texts);
      saveImages(selectedFiles);
      setImagesToShow(selectedFiles)
      setImagesLoaded(true);
    }
  };
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
        setImagesLoaded(false);
      };
      request.onerror = (event) => {
        console.error('Error al eliminar las imágenes:', (event.target as IDBRequest).error);
      };
    } catch (error) {
      console.error('Error al abrir la base de datosdddddddddddd:', error);
    }
  };

  const drawCanvas = async (canvas: HTMLCanvasElement, data: ExcelData, dataIndex: number, arrayIndex: number) => {
    if (!convertedImageIndexes.includes(dataIndex)) {
      setConvertedImageIndexes(prevIndexes => [...prevIndexes, dataIndex]);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const selectedData = data;
      const modalImageUrl = imagesToShow[dataIndex] ? URL.createObjectURL(imagesToShow[dataIndex]) : '';
      const image = new Image();
      image.src = modalImageUrl;
      image.onload = async () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        if (selectedData && Array.isArray(selectedData.nombres) && Array.isArray(selectedData.codigo)) {
          const width = 2270;
          const height = 1225;
          const currentNombre = selectedData.nombres[arrayIndex];
          const currentCodigo = selectedData.codigo[arrayIndex];
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 72px Century Gothic';
          const maxWidthNombre = 1900; // Ancho máximo para el nombre
          const initialNombreFontSize = 72;
          ctx.font = `bold ${initialNombreFontSize}px Century Gothic`;
          if (currentNombre !== null) {
              const nombreWidth = ctx.measureText(currentNombre).width;
              if (nombreWidth > maxWidthNombre) {
                  const scaleFactor = maxWidthNombre / nombreWidth;
                  const reducedFontSize = initialNombreFontSize * scaleFactor;
                  ctx.font = `bold ${reducedFontSize}px Century Gothic`;
              }
          }
          ctx.fillText(`${currentNombre}`, width, canvas.height / 2.5);

          const actividadAcademicaMaxWidth = 2550; // Ancho máximo para la actividad académica
            if (selectedData.actividadAcademica !== null) {
              const actividadAcademicaWidth = ctx.measureText(selectedData.actividadAcademica).width;
              if (actividadAcademicaWidth > actividadAcademicaMaxWidth) {
                  const scaleFactor = actividadAcademicaMaxWidth / actividadAcademicaWidth;
                  const fontSize = 65 * scaleFactor;
                  ctx.font = `bold ${fontSize}px Century Gothic`;
              } else {
                  ctx.font = 'bold 60px Century Gothic'; // Tamaño de fuente normal
              }
              ctx.fillText(`${selectedData.actividadAcademica}`, width, height);
          }

          const lineHeight = 70;
          const y = canvas.height / 1.7;
          ctx.font = '52px Century Gothic';
          ctx.fillText("Curso - taller organizado por ECOMÁS Consultoria y Capacitación,", width, y);
          ctx.fillText(`llevado a cabo desde el ${selectedData.fechaInicio} al ${selectedData.fechaFinal}, con una`, width, y + lineHeight);
          ctx.fillText(`duración de ${selectedData.horas} académicas.`, width, y + lineHeight * 2);

          const maxWidthh = 800; // Ancho máximo permitido
          const fontSize = 32; // Tamaño de fuente
          const lineHeightt = 40; // Altura de línea
          const x = canvas.width / 6.6; // Posición X
          let yy = canvas.height / 3.7; // Posición Y
          let words;
          // Dividir el texto en palabras
          if (selectedData && selectedData.ponente !== null) {
            words = selectedData.ponente.split(' ');
            // Resto del código...
          } else {
            console.error("El ponente no está definido o es nulo.");
          }
          let line = '';
          // Configurar estilo de texto
          ctx.fillStyle = 'white';
          ctx.font = `bold ${fontSize}px Century Gothic`;
          ctx.textAlign = 'center';
          if (words) {
            // Iterar sobre cada palabra
            for (const word of words) {
                // Agregar palabra a la línea actual
                const testLine = line + word + ' ';
                // Medir el ancho de la línea actual
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                // Si la línea actual excede el ancho máximo permitido, dibujar la línea actual y comenzar una nueva línea
                if (testWidth > maxWidthh) {
                    ctx.fillText(line, x, yy);
                    line = word + ' ';
                    yy += lineHeightt;
                } else {
                    // Si no excede el ancho máximo, continuar agregando palabras a la línea actual
                    line = testLine;
                }
            }
          }
          // Dibujar la última línea restante
          ctx.fillText(line, x, yy);

          const textYPx = 2127;
          ctx.fillStyle = 'black';
          ctx.font = `bold 36px Century Gothic`;
          ctx.fillText(`${currentCodigo}`, canvas.width / 6.6, textYPx);

          ctx.fillStyle = 'white';
          ctx.textAlign = 'left';
          ctx.font = `bold 32px Century Gothic`;
          const drawTemario = (temario: string, ctx: CanvasRenderingContext2D, x: number, y: number, maxWidth: number) => {
            const lineHeight = 40;
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

          const dataURL = canvas.toDataURL('image/jpeg');
          const blob = await (await fetch(dataURL)).blob();
          const fileName = `${currentNombre}_${dataIndex}_${arrayIndex}.jpeg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });

          // Almacenar la imagen convertida en un array
          setConvertedImages(images => [...images, file]);
          setDrawnImagesList(prevList => [...prevList, <img src={dataURL} alt={`Converted Image ${arrayIndex}`} width={canvas.width} height={canvas.height} />]);

          try {
            const db = await openDatabase();
            const transaction = db.transaction(['ImagesEcomas'], 'readwrite');
            const objectStore = transaction.objectStore('ImagesEcomas');
            const request = objectStore.add(file);
            request.onerror = (event) => {
              console.error('Error al guardar la imagen en la base de datos:', (event.target as IDBRequest).error);
            };
          } catch (error) {
            console.error('Error al abrir la base de datos:', error);
          }
        }
      };
    }
  };
};

  const groupedData: { [name: string]: { dataIndex: number; arrayIndex: number }[] } = {};
    excelData && excelData.forEach((data, dataIndex) => {
      data.nombres.forEach((nombre, arrayIndex) => {
        const key = `${nombre}_${dataIndex}_${arrayIndex}`; // Usamos una clave única para evitar duplicados
        if (!groupedData[nombre]) {
          groupedData[nombre] = [{ dataIndex, arrayIndex  }];
        } else {
          groupedData[nombre].push({ dataIndex, arrayIndex });
      }
    });
  });

  const groupedConvertedImages: { [name: string]: { image: File; number: number }[] } = {};

// Iterar sobre las imágenes convertidas y agruparlas por nombre
convertedImages.forEach((image) => {
  const imageNameParts = image.name.split('_');
  const imageName = imageNameParts[0];
  const imageNumber = parseInt(imageNameParts[1]);
  if (!groupedConvertedImages[imageName]) {
    groupedConvertedImages[imageName] = [{ image, number: imageNumber }];
  } else {
    groupedConvertedImages[imageName].push({ image, number: imageNumber });
  }
});
Object.keys(groupedConvertedImages).forEach((name) => {
  groupedConvertedImages[name].sort((a, b) => a.number - b.number);
});

if (excelData) {
  const dataToSave: { nombre: string, email: string }[] = [];
  excelData.forEach((data) => {
    if (Array.isArray(data.nombres) && Array.isArray(data.email)) {
      data.nombres.forEach((nombre, index) => {
        const email = data.email[index];
        const entry = { nombre, email };
        dataToSave.push(entry);
        //console.log(`Nombre: ${nombre}, Email: ${email}, Materiales: ${materiales}`);
      });
    }
  });
  sessionStorage.setItem('emailData', JSON.stringify(dataToSave))
  //console.log("Datos guardados en sessionStorage:", sessionStorage.getItem('emailData'));
}

if (excelData) {
  const actividadAcademicaData: string[] = [];
  excelData.forEach((data) => {
    const actividadAcademica = data.actividadAcademica;
    if (actividadAcademica) {
      actividadAcademicaData.push(actividadAcademica);
      //console.log(`moduloooo: ${actividadAcademica}`)
    }
  });
  sessionStorage.setItem('actividadAcademicaData', JSON.stringify(actividadAcademicaData));
  //console.log("Datos guardados en sessionStorage:", sessionStorage.getItem('actividadAcademicaData'));
}

useEffect(() => {
  excelData && Object.keys(groupedData).forEach((nombre, index) => {
    groupedData[nombre].forEach(({ dataIndex, arrayIndex }) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1122;
      canvas.height = 793;
      if (excelData[dataIndex]) drawCanvas(canvas, excelData[dataIndex], dataIndex, arrayIndex);
    });
  });
}, [excelData]);

  //{console.log('convertedImages:', convertedImages)}
  return (
    <div className=''>
      <div className='inline-flex w-full justify-center items-center mb-10 p-4 font-bold text-2xl bg-[#0060ff] text-white rounded-s-xl'>
        <FaRegImages className='text-4xl mr-2'/>
        <h1 >Cargar imagenes ({numModules})</h1>
      </div>
      <div className='flex justify-center border-b-4 border-[#007aff] image-container relative mb-10 text-white font-mono'>
        <input type='file' accept="image/*" onChange={handleImage} multiple className={`p-4 rounded-xl mb-10 bg-[#0060ff] cursor-pointer hover:scale-110 duration-300 ${imagesLoaded ? 'opacity-50 pointer-events-none' : ''}`} />
      </div>
      {imagesToShow.map((file, index) => (
        <div key={index} className="image-container relative mb-4 flex justify-between items-center">
          {file && (
            <div className='border-2 border-[#007aff] py-3 w-full mr-10 rounded-lg font-bold'>
              <p className='ml-2'>{file.name}</p>
            </div>
          )}
          {/* <p className="text-gray-500">ID: {index >= numModules ? index - numModules : index}</p> */}
          {imageTexts[index] && <p className="absolute top-80 left-80 text-yellow-400 bg-black bg-opacity-75 p-1 rounded-md">{imageTexts[index]}</p>}
        </div>
      ))}
      {/* <p className=''>Archivos de imagenes mostrados: {numModules}</p> */}

      {/* <div className="drawn-image-list-container">
        <h2>Imágenes Dibujadas</h2>
        <div className="drawn-image-list">
        {excelData && Object.keys(groupedData).map((nombre, index, email) => (
          <div key={index} className="drawn-image-item">
          <h3 className='text-green-600'>{nombre}</h3>
          {excelData && excelData[groupedData[nombre][0].dataIndex]?.email && (
            <p className='text-blue-500'>Email: {excelData[groupedData[nombre][0].dataIndex]?.email[0]}</p>
          )}
          {groupedData[nombre].map(({ dataIndex, arrayIndex }, subIndex) => (
            <div key={subIndex}>
            <canvas ref={(canvas) => {
              if (canvas && excelData[dataIndex]) drawCanvas(canvas, excelData[dataIndex], dataIndex, arrayIndex);
            }} width={1122} height={793} style={{ width: '1122px', height: '793px' }} className=''/>
            <p>{nombre}</p>
            ---------------------------------------------------------------------------------------------------------------------
            </div>
          ))}
          </div>
        ))}
        </div>
      </div> */}
    <button onClick={handleDeleteAllImages} className='inline-flex justify-center items-center mt-5 mb-5 p-3 bg-red-600 text-white rounded-lg uppercase font-extrabold text-xl hover:scale-110 duration-300'>
      <BsImages className='text-3xl mr-2'/>
      <h1>Nuevo diseño</h1>
    </button>
    </div>
  );
};

export default ImageUploader;