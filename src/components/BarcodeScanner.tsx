
import React, { useState, useRef } from 'react';
import { BrowserBarcodeReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2, FileText } from 'lucide-react';
import { useBarcodes } from '@/context/BarcodeContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

interface BarcodeScannerProps {
  onSuccess?: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processedResults, setProcessedResults] = useState<{ file: string, barcode: string | null }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setCurrentBarcode } = useBarcodes();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      setErrorMessage(null);
      const newFiles = Array.from(fileList);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setProcessedResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImages = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select at least one image to process');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessedResults([]);

    try {
      const codeReader = new BrowserBarcodeReader();
      const results: { file: string, barcode: string | null }[] = [];

      for (const file of selectedFiles) {
        try {
          const imageUrl = URL.createObjectURL(file);
          const result = await codeReader.decodeFromImageUrl(imageUrl);
          
          results.push({
            file: file.name,
            barcode: result ? result.getText() : null
          });
          
          // Clean up the URL
          URL.revokeObjectURL(imageUrl);
          
          // If this is the first valid barcode and there's only one file, handle it immediately
          if (result && selectedFiles.length === 1) {
            handleBarcodeDetected(result.getText());
            return;
          }
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          results.push({
            file: file.name,
            barcode: null
          });
        }
      }

      setProcessedResults(results);
      
      // Find the first valid barcode
      const firstValidResult = results.find(r => r.barcode !== null);
      if (firstValidResult && firstValidResult.barcode) {
        toast({
          title: "Barcode Detected",
          description: `Found barcode in ${firstValidResult.file}`,
        });
      } else {
        toast({
          title: "No Barcodes Found",
          description: "No valid barcodes were found in the uploaded images",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing images:', error);
      setErrorMessage('Error processing images. Please try again with different files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    setCurrentBarcode(barcode);
    if (onSuccess) {
      onSuccess(barcode);
    } else {
      toast({
        title: "Barcode Detected",
        description: `Detected barcode: ${barcode}`,
      });
      navigate('/profiles');
    }
  };

  const useBarcode = (barcode: string) => {
    handleBarcodeDetected(barcode);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-md rounded-2xl shadow-lg overflow-hidden glass-card p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isProcessing}
              size="lg"
              className="w-full py-6"
            >
              <Upload className="h-5 w-5 mr-2" />
              Select Images
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Upload images containing barcodes
            </p>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAll}
                  disabled={isProcessing}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-card/50 p-2">
                {selectedFiles.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50 text-sm"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate max-w-[180px]">{file.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => removeFile(index)}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {processedResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Results</h3>
              <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-card/50 p-2">
                {processedResults.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50 text-sm"
                  >
                    <div className="truncate max-w-[180px]">
                      {result.file} - {result.barcode ? 
                        <span className="text-primary font-medium">{result.barcode}</span> : 
                        <span className="text-muted-foreground">No barcode found</span>
                      }
                    </div>
                    {result.barcode && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => useBarcode(result.barcode!)}
                        className="ml-2"
                      >
                        Use
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedFiles.length > 0 && (
            <Button 
              onClick={processImages} 
              className="mt-2"
              disabled={isProcessing || selectedFiles.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Images'
              )}
            </Button>
          )}
          
          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
