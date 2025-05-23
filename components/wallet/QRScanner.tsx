import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

interface QRScannerProps {
  onScan: (address: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
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
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <h3>Scan Wallet QR Code</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="qr-reader">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={handleScan}
            scanDelay={500}
          />
          <div className="scan-area"></div>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        <p className="scanner-help">Point your camera at a QR code of an Ethereum wallet address</p>
      </div>
      
      <style jsx>{`
        .qr-scanner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .qr-scanner-container {
          width: 90%;
          max-width: 350px;
          background-color: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        
        .qr-scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: var(--header-bg);
          color: white;
        }
        
        .qr-scanner-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        .qr-reader {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 100%;
          overflow: hidden;
        }
        
        .qr-reader > div {
          position: absolute !important;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .scan-area {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70%;
          height: 70%;
          border: 2px solid var(--primary-color);
          border-radius: 12px;
          box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.3);
          pointer-events: none;
        }
        
        .scanner-help {
          text-align: center;
          padding: 16px;
          color: var(--text-color);
          font-size: 0.9rem;
          margin: 0;
        }
        
        .error-message {
          background-color: rgba(255, 0, 0, 0.1);
          color: #ff3333;
          padding: 10px 16px;
          margin: 0;
          text-align: center;
          font-size: 0.9rem;
        }
        
        @media (max-width: 480px) {
          .qr-scanner-container {
            width: 95%;
          }
          
          .qr-scanner-header h3 {
            font-size: 1rem;
          }
          
          .scanner-help {
            font-size: 0.8rem;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default QRScanner; 