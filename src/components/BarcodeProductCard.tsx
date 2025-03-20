
import React from 'react';
import { BarcodeItem } from '@/context/BarcodeContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface BarcodeProductCardProps {
  item: BarcodeItem;
  onDelete: (id: string) => void;
}

const BarcodeProductCard: React.FC<BarcodeProductCardProps> = ({ item, onDelete }) => {
  const formattedDate = formatDistanceToNow(new Date(item.dateAdded), { addSuffix: true });
  
  const googleProductUrl = `https://www.google.com/search?q=${encodeURIComponent(item.productName)}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="overflow-hidden glass-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="line-clamp-2">{item.productName}</CardTitle>
              <CardDescription>
                {item.barcode} 
                {item.retailer && <span> • {item.retailer}</span>}
              </CardDescription>
            </div>
            {item.price && (
              <div className="text-lg font-medium text-primary">{item.price}</div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          {item.productImage && (
            <div className="relative h-48 mb-3 overflow-hidden rounded-md">
              <img 
                src={item.productImage} 
                alt={item.productName}
                className="w-full h-full object-contain bg-white/60 dark:bg-gray-800/60 transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          
          {item.description && (
            <p className="text-muted-foreground mb-4 line-clamp-3">{item.description}</p>
          )}
          
          <div className="text-xs text-muted-foreground">
            Added {formattedDate}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="destructive" 
            size="sm"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(googleProductUrl, '_blank')}
            className="border-primary/20 text-primary"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Find Online
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BarcodeProductCard;
