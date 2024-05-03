import React, { useState, useEffect } from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ onClose, children }: ModalProps) => {
  return (
    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center bg-gray-800 bg-opacity-75 backdrop-blur-sm">
      <div className="relative p mt-20">
        <button onClick={onClose} className="absolute top-0 right-0 m-4 px-4 py-1 text-xl font-bold text-white bg-red-500 rounded-xl">X</button>
        <div className=''>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
