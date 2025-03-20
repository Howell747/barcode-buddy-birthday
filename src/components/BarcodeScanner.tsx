
import React, { useRef, useState, useEffect } from 'react';
import { BrowserBarcodeReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw } from 'lucide-react';
import { useBarcodes } from '@/context/BarcodeContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface BarcodeScannerProps {
  onSuccess?: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { setCurrentBarcode } = useBarcodes();
  const navigate = useNavigate();
  const { toast } = useToast();

  const startCamera = async () => {
    setIsLoading(true);
    setPermissionDenied(false);
    
    try {
      if (streamRef.current) {
        stopCamera();
      }

      // Request permission first on iOS devices to prevent issues
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
          video: { 
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        console.log('Requesting camera with constraints:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  setIsCameraActive(true);
                  startScanning();
                  console.log('Camera started successfully');
                })
                .catch(err => {
                  console.error('Error playing video:', err);
                  toast({
                    title: "Camera Error",
                    description: "Could not start video playback.",
                    variant: "destructive"
                  });
                });
            }
          };
        }
      } else {
        console.error('getUserMedia not supported in this browser');
        toast({
          title: "Not Supported",
          description: "Camera access is not supported in this browser.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      // Handle permission denied specifically
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        toast({
          title: "Permission Denied",
          description: "Camera access was denied. Please allow camera access in your browser settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Camera Error",
          description: error.message || "Could not access camera.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    console.log('Camera stopped');
  };

  const switchCamera = () => {
    setFacingMode(prevMode => prevMode === 'environment' ? 'user' : 'environment');
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      console.log('Starting barcode scanning...');
      const codeReader = new BrowserBarcodeReader();
      await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          console.log('Barcode detected:', result.getText());
          handleBarcodeDetected(result.getText());
          codeReader.reset();
          stopCamera();
        }
        if (error && !(error instanceof TypeError)) {
          // TypeError is expected when the stream ends
          console.error('Barcode scanning error:', error);
        }
      });
    } catch (error) {
      console.error('Error in barcode scanning:', error);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    setCurrentBarcode(barcode);
    if (onSuccess) {
      onSuccess(barcode);
    } else {
      // If no callback is provided, navigate to profiles selection
      toast({
        title: "Barcode Detected",
        description: `Detected barcode: ${barcode}`,
      });
      navigate('/profiles');
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl shadow-lg overflow-hidden glass-card">
        {!isCameraActive ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-sm">
            <Button 
              onClick={startCamera} 
              disabled={isLoading}
              size="lg"
              className="bg-primary/90 hover:bg-primary px-6 py-6 rounded-full shadow-lg animate-pulse-light"
            >
              <Camera className="h-8 w-8" />
              <span className="ml-2 text-lg">{isLoading ? 'Starting...' : 'Start Camera'}</span>
            </Button>
            
            {permissionDenied && (
              <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                <p className="text-destructive text-sm">
                  Camera access denied. Please check your browser settings and grant permission.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={switchCamera}
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/70 backdrop-blur-md hover:bg-background/90 shadow-md"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        
        {isCameraActive && (
          <div className="absolute inset-0 border-2 border-primary/30 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-1/3 border-2 border-primary animate-pulse-light rounded-lg"></div>
            </div>
          </div>
        )}
      </div>
      
      {isCameraActive && (
        <Button
          onClick={stopCamera}
          variant="outline"
          className="mt-4 px-6"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export default BarcodeScanner;
