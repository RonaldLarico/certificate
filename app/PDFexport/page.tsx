import React from 'react';

interface PDFexportProps {
  drawnImagesList: JSX.Element[]; // Tipo de la lista de imágenes dibujadas
}

const PDFexport: React.FC<PDFexportProps> = ({ drawnImagesList }) => {
  return (
    <div>
      <h2>Imágenes Dibujadas en PDF</h2>
      <div className="pdf-image-list">
        {drawnImagesList && drawnImagesList.map((image, index) => (
          <div key={index} className="pdf-image-item">
            {image}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFexport;
