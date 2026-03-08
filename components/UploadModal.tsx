import React from 'react';
import FileUpload from './FileUpload';
import { CloseIcon } from './icons/CloseIcon';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileChange: (file: File) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onFileChange }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 relative max-w-xl w-full m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">ज्ञान का आधार बढ़ाएँ</h2>
          <p className="text-gray-500 mt-1">ज्ञानकोष को बेहतर बनाने के लिए एक पीडीएफ या छवि अपलोड करें।</p>
          <p className="text-gray-500 mt-1">Upload a PDF or an image to enhance the knowledge base.</p>
        </div>
        <FileUpload onFileChange={onFileChange} />
      </div>
    </div>
  );
};

export default UploadModal;