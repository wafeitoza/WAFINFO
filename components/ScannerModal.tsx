import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (text: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (isOpen && videoRef.current) {
      setError(null);
      const startScanner = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            codeReader.current.decodeFromStream(stream, videoRef.current, (result, err) => {
              if (result) {
                onScanSuccess(result.getText());
              }
              // We will intentionally ignore errors here. 'NotFoundException' is thrown
              // on every frame where a code is not found, which floods the console.
              // Other errors (e.g., checksum errors) are also transient and the scanner
              // should just continue trying to read. The user will only see an error
              // if camera access fails, which is handled in the catch block below.
            });
          }
        } catch (err) {
          console.error('Camera access error:', err);
          setError('Não foi possível acessar a câmera. Verifique as permissões do seu navegador.');
        }
      };
      startScanner();
    }

    return () => {
      // The reset() method causes a crash with the current library version.
      // The stream cleanup below is sufficient to release the camera.
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md text-center relative">
        <h2 className="text-xl font-bold mb-4">Escanear Código</h2>
        <p className="text-gray-600 mb-4">Aponte a câmera para um código de barras ou QR code.</p>
        <div className="relative w-full aspect-square bg-gray-200 rounded-md overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-4 border-white/50 rounded-md pointer-events-none"></div>
        </div>
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-gray-100 text-black font-semibold rounded-lg shadow-sm hover:shadow-md active:shadow-inner transition-all duration-150 ease-in-out"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ScannerModal;