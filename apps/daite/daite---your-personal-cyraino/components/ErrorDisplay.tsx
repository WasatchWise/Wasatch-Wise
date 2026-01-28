
import React from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative shadow-md" role="alert">
      <div className="flex items-center">
        <AlertTriangleIcon className="w-6 h-6 mr-3 text-red-400" />
        <div>
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{message}</span>
        </div>
      </div>
    </div>
  );
};
