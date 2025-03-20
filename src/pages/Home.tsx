
import React from 'react';
import Layout from '@/components/Layout';
import BarcodeScanner from '@/components/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  return (
    <Layout title="Barcode Buddy" padding={false}>
      <div className="flex flex-col items-center min-h-[calc(100vh-4rem)]">
        <div className="w-full bg-gradient-to-b from-primary/5 to-transparent pb-10 pt-4 px-4 text-center">
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
    </Layout>
  );
};

export default Home;
