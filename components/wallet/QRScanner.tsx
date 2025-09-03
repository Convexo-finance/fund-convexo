import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

interface QRScannerProps {
  onScan: (address: string) => void;
  onClose: () => void;
}

const QRScannerTailwind: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result) {
      // Check if the result is a valid Ethereum address
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      
      if (ethAddressRegex.test(result?.text)) {
        onScan(result.text);
      } else {
        setError('Invalid Ethereum address QR code. Please scan a valid wallet address.');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError('Error accessing camera. Please make sure you have granted camera permissions.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="w-11/12 max-w-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center bg-gray-900 p-3">
          <h3 className="text-white text-lg font-medium m-0">Scan Wallet QR Code</h3>
          <button 
            onClick={onClose} 
            className="bg-transparent border-none text-white text-2xl cursor-pointer hover:opacity-70"
          >
            ×
          </button>
        </div>
        
        <div className="relative w-full pt-[100%] overflow-hidden">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={handleScan}
            scanDelay={500}
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-blue-500 rounded-lg pointer-events-none shadow-[0_0_0_2000px_rgba(0,0,0,0.3)]"></div>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 text-center text-sm">
            {error}
          </div>
        )}
        
        <p className="text-center p-4 text-sm text-gray-600 dark:text-gray-300 m-0">
          Point your camera at a QR code of an Ethereum wallet address
        </p>
      </div>
    </div>
  );
};

export default QRScannerTailwind; 