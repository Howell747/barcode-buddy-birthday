
import React, { useRef, useState, useEffect } from 'react';
import { BrowserBarcodeReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw } from 'lucide-react';
import { useBarcodes } from '@/context/BarcodeContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setCurrentBarcode } = useBarcodes();
  const navigate = useNavigate();
  const { toast } = useToast();

  const startCamera = async () => {
    setIsLoading(true);
    setPermissionDenied(false);
    setErrorMessage(null);
    
    try {
      if (streamRef.current) {
        stopCamera();
      }

      console.log('Checking camera availability...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not available in your browser');
      }

      // Request permission with explicit constraints for mobile
      const constraints = {
        audio: false,
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log('Requesting camera with constraints:', constraints);
      
      // First check if we have permissions
      try {
        // Force permission prompt by requesting permissions
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        console.log('Camera permission granted, setting up video stream');
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
                  setErrorMessage('Could not start video playback.');
                });
            }
          };
        }
      } catch (error: any) {
        console.error('Camera access error:', error);
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          console.log('Permission explicitly denied');
          setPermissionDenied(true);
          setErrorMessage('Camera access was denied. Please allow camera access in your browser settings.');
        } else if (error.name === 'NotFoundError') {
          setErrorMessage('No camera found on your device.');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setErrorMessage('Your camera is already in use by another application.');
        } else if (error.name === 'OverconstrainedError') {
          // Try again with less constraints
          console.log('Camera constraints too strict, trying simpler constraints');
          const simpleConstraints = {
            video: { facingMode }
          };
          
          try {
            const stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
            streamRef.current = stream;
            
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => {
                if (videoRef.current) {
                  videoRef.current.play()
                    .then(() => {
                      setIsCameraActive(true);
                      startScanning();
                      console.log('Camera started with simple constraints');
                    })
                    .catch(err => {
                      console.error('Error playing video with simple constraints:', err);
                      setErrorMessage('Could not start video playback.');
                    });
                }
              };
            }
          } catch (simpleError: any) {
            setErrorMessage(`Camera error: ${simpleError.message || 'Could not access camera with simple settings'}`);
          }
        } else {
          setErrorMessage(`Camera error: ${error.message || 'Unknown camera error'}`);
        }
      }
    } catch (error: any) {
      console.error('General camera error:', error);
      setErrorMessage(error.message || 'Could not access camera.');
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

  // Helper function to determine explanation text
  const getStatusText = () => {
    if (permissionDenied) {
      return 'Camera permission denied. You need to allow camera access in your browser settings to use this feature.';
    }
    if (errorMessage) {
      return errorMessage;
    }
    return 'Point your camera at a barcode to scan it';
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl shadow-lg overflow-hidden glass-card">
        {!isCameraActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 backdrop-blur-sm p-4">
            <Button 
              onClick={startCamera} 
              disabled={isLoading}
              size="lg"
              className="bg-primary/90 hover:bg-primary px-6 py-6 rounded-full shadow-lg animate-pulse-light mb-4"
            >
              <Camera className="h-8 w-8" />
              <span className="ml-2 text-lg">{isLoading ? 'Starting...' : 'Start Camera'}</span>
            </Button>
            
            {(permissionDenied || errorMessage) && (
              <Alert variant="destructive" className="mt-4 max-w-xs mx-auto bg-background/80 backdrop-blur-sm">
                <AlertTitle>Camera Issue</AlertTitle>
                <AlertDescription className="text-sm">
                  {getStatusText()}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <>
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
            
            <div className="absolute bottom-4 left-0 right-0 text-center z-10">
              <div className="inline-block bg-background/70 backdrop-blur-md py-2 px-4 rounded-full text-sm">
                {getStatusText()}
              </div>
            </div>
          </>
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
