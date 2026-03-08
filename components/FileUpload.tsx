import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileChange: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileChange]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div
      className={`w-full max-w-lg p-8 border-4 border-dashed rounded-2xl text-center transition-all duration-300 ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-gray-50'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <UploadIcon className="w-16 h-16 text-purple-500" />
        <p className="mt-4 text-xl font-semibold text-gray-700">
          अपनी फ़ाइल यहाँ खींचें और छोड़ें
        </p>
        <p className="mt-2 text-gray-500">या</p>
        <label htmlFor="file-upload" className="mt-2 cursor-pointer px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105">
          फ़ाइल ब्राउज़ करें
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept="application/pdf,image/png,image/jpeg"
          onChange={handleFileSelect}
        />
        <p className="mt-4 text-sm text-gray-400">पीडीएफ या छवि फ़ाइलें</p>
      </div>
    </div>
  );
};

export default FileUpload;