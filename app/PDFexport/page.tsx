import React from 'react';

interface PDFexportProps {
  drawnImagesList: JSX.Element[]; // Tipo de la lista de imágenes dibujadas
}

const PDFexport: React.FC<PDFexportProps> = ({ drawnImagesList }) => {
  console.log("drawnImagesList en PDFexport:", drawnImagesList);
  
  return (
    <div>
      <h2 className="text-yellow-500">Imágenes Dibujadas en PDF</h2>
      <div className="pdf-image-list">
        {drawnImagesList && drawnImagesList.length > 0 ? (
          drawnImagesList.map((image, index) => (
            <div key={index} className="pdf-image-item">
              {image}
            </div>
          ))
        ) : (
          <p>No se encontraron imágenes dibujadas</p>
        )}
      </div>
    </div>
  );
};

export default PDFexport;
