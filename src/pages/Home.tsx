
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight, Gift, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Home: React.FC = () => {
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  return (
    <Layout title="Barcode Buddy" padding={false}>
      <div className="flex flex-col items-center min-h-[calc(100vh-4rem)]">
        <div className="w-full bg-gradient-to-b from-primary/5 to-transparent pb-10 pt-4 px-4 text-center relative">
          <div className="container max-w-md mx-auto">
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-medium mb-3">Barcode Buddy</h1>
              <p className="text-muted-foreground">
                Scan a barcode to save gift ideas for your loved ones
              </p>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4"
                onClick={() => setShowInfoDialog(true)}
              >
                <Info className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center w-full px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BarcodeScanner />
          
          <motion.div 
            className="mt-8 w-full max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/profiles">
              <Button 
                variant="outline" 
                className="w-full justify-between py-6 glass-card hover:bg-primary/5"
              >
                <div className="flex items-center">
                  <Gift className="mr-2 h-5 w-5 text-primary" />
                  <span>View Saved Gift Ideas</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Camera Permission Help</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">
                This app needs camera permission to scan barcodes. On some mobile devices, you may need to:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>Make sure you've allowed camera access in your browser settings</li>
                <li>Check that no other app is currently using your camera</li>
                <li>Try using a different browser if issues persist</li>
                <li>For iOS, make sure your browser has camera permissions in Settings</li>
              </ul>
              <p>
                The camera will only be used while scanning and never records or stores any video.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Home;
