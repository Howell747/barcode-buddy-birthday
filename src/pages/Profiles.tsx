
import React from 'react';
import Layout from '@/components/Layout';
import ProfileSelector from '@/components/ProfileSelector';
import { useBarcodes } from '@/context/BarcodeContext';
import ProductForm from '@/components/ProductForm';

const Profiles: React.FC = () => {
  const { currentBarcode } = useBarcodes();
  
  return (
    <Layout 
      title={currentBarcode ? "Select Profile" : "Profiles"} 
      showBackButton
    >
      <div className="flex flex-col items-center">
        {currentBarcode ? (
          <div className="w-full max-w-md">
            <ProductForm barcode={currentBarcode} />
          </div>
        ) : (
          <ProfileSelector />
        )}
      </div>
    </Layout>
  );
};

export default Profiles;
