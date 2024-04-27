import React from 'react';

interface TextOverlayProps {
  texts: { text: string; x: number; y: number }[];
}

const TextOverlay: React.FC<TextOverlayProps> = ({ texts }) => {
  return (
    <>
      {texts.map(({ text, x, y }, index) => (
        <div
          key={index}
          className="absolute text-white"
          style={{ top: `${y}px`, left: `${x}px`, pointerEvents: 'none' }}
        >
          {text}
        </div>
      ))}
    </>
  );
};

export default TextOverlay;
