
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  addItem: (item: Omit<BarcodeItem, 'id' | 'dateAdded'>) => Promise<BarcodeItem | null>;
  deleteItem: (id: string) => Promise<void>;
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
  const { toast } = useToast();

  // Load items from Supabase on initial render
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from('barcode_items')
          .select('*')
          .order('date_added', { ascending: false });
        
        if (error) {
          console.error('Error fetching barcode items:', error);
          toast({
            title: 'Failed to load items',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        
        if (data) {
          const formattedItems: BarcodeItem[] = data.map(item => ({
            id: item.id,
            profileId: item.profile_id,
            barcode: item.barcode,
            productName: item.product_name,
            productImage: item.product_image,
            description: item.description,
            price: item.price,
            retailer: item.retailer,
            dateAdded: item.date_added,
          }));
          setItems(formattedItems);
        }
      } catch (error) {
        console.error('Error fetching barcode items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [toast]);

  const addItem = async (item: Omit<BarcodeItem, 'id' | 'dateAdded'>): Promise<BarcodeItem | null> => {
    try {
      const { data, error } = await supabase
        .from('barcode_items')
        .insert([{
          profile_id: item.profileId,
          barcode: item.barcode,
          product_name: item.productName,
          product_image: item.productImage,
          description: item.description,
          price: item.price,
          retailer: item.retailer,
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding barcode item:', error);
        toast({
          title: 'Failed to add item',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
      
      if (data) {
        const newItem: BarcodeItem = {
          id: data.id,
          profileId: data.profile_id,
          barcode: data.barcode,
          productName: data.product_name,
          productImage: data.product_image,
          description: data.description,
          price: data.price,
          retailer: data.retailer,
          dateAdded: data.date_added,
        };
        setItems([newItem, ...items]);
        return newItem;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding barcode item:', error);
      return null;
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('barcode_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting barcode item:', error);
        toast({
          title: 'Failed to delete item',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting barcode item:', error);
    }
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
