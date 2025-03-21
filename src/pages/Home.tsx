
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight, Gift, Info, ShieldAlert } from 'lucide-react';
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
            className="mt-6 w-full max-w-md bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start">
              <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Camera permissions can be tricky on mobile web browsers. If the scanner doesn't work, try using a different browser or check your browser settings.
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-amber-600 dark:text-amber-400 p-0 h-auto ml-1"
                  onClick={() => setShowInfoDialog(true)}
                >
                  Learn more
                </Button>
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-4 w-full max-w-md"
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
                This app needs camera permission to scan barcodes. Web apps face more restrictions than native apps. Here are some troubleshooting tips:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-2">
                <li>Make sure you've allowed camera access in your browser settings</li>
                <li>Check that no other app is currently using your camera</li>
                <li><strong>Try a different browser</strong> - Safari can be more restrictive than Chrome</li>
                <li>For iOS, make sure your browser has camera permissions in Settings</li>
                <li>Ensure you're on a secure connection (https)</li>
                <li>Try refreshing the page and clicking the Start Camera button again</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
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
