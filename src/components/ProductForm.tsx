
import React, { useState, useEffect } from 'react';
import { useBarcodes, BarcodeItem } from '@/context/BarcodeContext';
import { useProfiles, Profile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  barcode: string;
  profileId?: string;
}

// Mocked API for now - this would be replaced with a real API
const fetchProductDetails = async (barcode: string): Promise<Partial<BarcodeItem>> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // This is a mock - in a real app, you'd call a barcode lookup API
  if (barcode === '9780735211292') {
    return {
      barcode,
      productName: 'Atomic Habits',
      productImage: 'https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg',
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
      price: '$11.98',
      retailer: 'Amazon',
    };
  } else if (barcode === '5060624582615') {
    return {
      barcode,
      productName: 'LEGO Star Wars Set',
      productImage: 'https://m.media-amazon.com/images/I/81wId1U0gnL._AC_SL1500_.jpg',
      description: 'Building set with popular Star Wars character',
      price: '$19.99',
      retailer: 'Target',
    };
  }
  
  // Default fallback for unknown barcodes
  return {
    barcode,
    productName: 'Unknown Product',
    description: 'No details available for this barcode',
  };
};

const ProductForm: React.FC<ProductFormProps> = ({ barcode, profileId }) => {
  const [product, setProduct] = useState<Partial<BarcodeItem>>({
    barcode,
    productName: '',
    description: '',
    price: '',
    retailer: '',
    productImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  
  const { addItem, setCurrentBarcode } = useBarcodes();
  const { profiles, getProfileById } = useProfiles();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setLoading(true);
        const details = await fetchProductDetails(barcode);
        setProduct(prev => ({ ...prev, ...details }));
        
        if (profileId) {
          const profile = getProfileById(profileId);
          if (profile) {
            setSelectedProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch product details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProductDetails();
  }, [barcode, profileId, getProfileById, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.productName) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a product name',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedProfile) {
      toast({
        title: 'Missing Information',
        description: 'Please select a profile',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const newItem = await addItem({
        barcode: product.barcode || '',
        productName: product.productName || 'Unknown Product',
        description: product.description,
        price: product.price,
        retailer: product.retailer,
        productImage: product.productImage,
        profileId: selectedProfile.id,
      });
      
      if (newItem) {
        toast({
          title: 'Product Saved',
          description: `"${product.productName}" has been saved to ${selectedProfile.name}'s wish list`,
        });
        
        setCurrentBarcode(null);
        navigate(`/profiles/${selectedProfile.id}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Save Failed',
        description: 'There was an error saving the product',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
  };
  
  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Loading Product Details</CardTitle>
          <CardDescription>Retrieving information for barcode {barcode}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto glass-card animate-scale-in">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            {selectedProfile 
              ? `Adding to ${selectedProfile.name}'s wish list`
              : 'Review product information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.productImage && (
            <div className="mb-4 rounded-md overflow-hidden bg-white/50 border border-border">
              <img 
                src={product.productImage} 
                alt={product.productName} 
                className="w-full h-48 object-contain" 
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              name="productName"
              value={product.productName}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                value={product.price}
                onChange={handleChange}
                placeholder="$0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retailer">Retailer</Label>
              <Input
                id="retailer"
                name="retailer"
                value={product.retailer}
                onChange={handleChange}
                placeholder="Store name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              name="barcode"
              value={product.barcode}
              readOnly
              className="bg-muted/50"
            />
          </div>
          
          {!selectedProfile && (
            <div className="py-2">
              <Label>Select Profile</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {profiles.map((profile) => (
                  <Button
                    key={profile.id}
                    type="button"
                    variant={selectedProfile?.id === profile.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleProfileSelect(profile)}
                  >
                    {profile.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setCurrentBarcode(null);
              navigate(-1);
            }}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={!selectedProfile || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Product'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProductForm;
