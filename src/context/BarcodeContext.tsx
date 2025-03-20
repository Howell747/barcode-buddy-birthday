
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BarcodeItem {
  id: string;
  profileId: string;
  barcode: string;
  productName: string;
  productImage?: string;
  description?: string;
  price?: string;
  retailer?: string;
  dateAdded: string;
}

interface BarcodeContextType {
  items: BarcodeItem[];
  addItem: (item: Omit<BarcodeItem, 'id' | 'dateAdded'>) => void;
  deleteItem: (id: string) => void;
  getItemsByProfileId: (profileId: string) => BarcodeItem[];
  getItemById: (id: string) => BarcodeItem | undefined;
  loading: boolean;
  setCurrentBarcode: (barcode: string | null) => void;
  currentBarcode: string | null;
}

const BarcodeContext = createContext<BarcodeContextType | undefined>(undefined);

export const useBarcodes = () => {
  const context = useContext(BarcodeContext);
  if (!context) {
    throw new Error('useBarcodes must be used within a BarcodeProvider');
  }
  return context;
};

export const BarcodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<BarcodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBarcode, setCurrentBarcode] = useState<string | null>(null);

  // Load items from localStorage on initial render
  useEffect(() => {
    const storedItems = localStorage.getItem('barcodeItems');
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    } else {
      // Add some demo items for demonstration purposes
      const demoItems: BarcodeItem[] = [
        {
          id: '1',
          profileId: '1',
          barcode: '9780735211292',
          productName: 'Atomic Habits',
          productImage: 'https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg',
          description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
          price: '$11.98',
          retailer: 'Amazon',
          dateAdded: new Date().toISOString(),
        },
        {
          id: '2',
          profileId: '2',
          barcode: '5060624582615',
          productName: 'LEGO Star Wars Set',
          productImage: 'https://m.media-amazon.com/images/I/81wId1U0gnL._AC_SL1500_.jpg',
          description: 'Building set with popular Star Wars character',
          price: '$19.99',
          retailer: 'Target',
          dateAdded: new Date().toISOString(),
        },
      ];
      setItems(demoItems);
      localStorage.setItem('barcodeItems', JSON.stringify(demoItems));
    }
    setLoading(false);
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('barcodeItems', JSON.stringify(items));
    }
  }, [items, loading]);

  const addItem = (item: Omit<BarcodeItem, 'id' | 'dateAdded'>) => {
    const newItem: BarcodeItem = {
      ...item,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    };
    setItems([...items, newItem]);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const getItemsByProfileId = (profileId: string) => {
    return items.filter((item) => item.profileId === profileId);
  };

  const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
  };

  const value = {
    items,
    addItem,
    deleteItem,
    getItemsByProfileId,
    getItemById,
    loading,
    currentBarcode,
    setCurrentBarcode,
  };

  return <BarcodeContext.Provider value={value}>{children}</BarcodeContext.Provider>;
};
