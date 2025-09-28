import React, { useState, useRef } from 'react';
import Button from '../wallet/shared/Button';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = async () => {
    setScanning(true);
    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Camera access denied or not available');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  // Simple manual input as fallback
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = () => {
    if (manualInput) {
      onScan(manualInput);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📷 Scan QR Code
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {!scanning ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-2xl">📷</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Scan a QR code to automatically fill the recipient address
              </p>
              <Button onClick={startScanning} variant="primary" className="w-full">
                📷 Start Camera
              </Button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Or enter manually:
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0x... or paste QR data"
                />
                <Button
                  onClick={handleManualSubmit}
                  variant="outline"
                  size="small"
                  disabled={!manualInput}
                >
                  ✓
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 dark:text-red-400 text-2xl">❌</span>
                </div>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={handleClose} variant="outline">
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full rounded-lg"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="flex space-x-3">
                  <Button onClick={stopScanning} variant="outline" className="flex-1">
                    Stop Scanning
                  </Button>
                  <Button
                    onClick={() => {
                      // Simple fallback - in production you'd use a proper QR scanning library
                      const mockAddress = '0x1234567890123456789012345678901234567890';
                      onScan(mockAddress);
                      handleClose();
                    }}
                    variant="primary"
                    className="flex-1"
                  >
                    Use Demo Address
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Note:</strong> QR scanner will detect wallet addresses and payment requests. 
            For production, integrate with a dedicated QR scanning library.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
