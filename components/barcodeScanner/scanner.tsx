import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
    onDetected: (code: string) => void;
  }

  const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
    const videoRef = useRef(null);
    // const beepSound = useRef(new Audio('/beep.mp3'));

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        codeReader.listVideoInputDevices()
        .then((videoInputDevices) => {
            const deviceId = videoInputDevices[0].deviceId; // use the first available camera
            codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
                if (result) {
                    // beepSound.current.play();
                    onDetected(result.getText());
                } else if (err && err.name !== 'NotFoundException') {
                    console.error(err);
                }
            });
        })
        .catch((err) => {
            console.error(err);
        });

        return () => {
            codeReader.reset();
        };
    }, [onDetected]);

    return <video ref={videoRef} className="w-[300px] h-1 opacity-0" />;
};

export default BarcodeScanner;
