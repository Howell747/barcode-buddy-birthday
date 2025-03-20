
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useProfiles } from '@/context/ProfileContext';
import { useBarcodes } from '@/context/BarcodeContext';
import BarcodeProductCard from '@/components/BarcodeProductCard';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Scan, Edit2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProfileById, updateProfile, deleteProfile } = useProfiles();
  const { getItemsByProfileId, deleteItem } = useBarcodes();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const profile = id ? getProfileById(id) : undefined;
  const items = id ? getItemsByProfileId(id) : [];
  
  if (!profile) {
    return (
      <Layout title="Profile Not Found" showBackButton>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-medium mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">The profile you are looking for does not exist.</p>
          <Button onClick={() => navigate('/profiles')}>
            Go Back to Profiles
          </Button>
        </div>
      </Layout>
    );
  }
  
  const handleDeleteProfile = () => {
    if (id) {
      deleteProfile(id);
      toast({
        title: 'Profile Deleted',
        description: `${profile.name}'s profile has been deleted`,
      });
      navigate('/profiles');
    }
  };
  
  const handleStartEditName = () => {
    setNewName(profile.name);
    setIsEditingName(true);
  };
  
  const handleSaveName = () => {
    if (newName.trim() && newName !== profile.name) {
      updateProfile(profile.id, newName);
      toast({
        title: 'Profile Updated',
        description: `Profile name has been updated to ${newName}`,
      });
    }
    setIsEditingName(false);
  };
  
  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    toast({
      title: 'Item Removed',
      description: 'The item has been removed from the wishlist',
    });
  };
  
  const handleScan = () => {
    navigate('/');
  };
  
  return (
    <Layout showBackButton>
      <div className="container max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-xl font-medium"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>Save</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-medium">{profile.name}'s Wishlist</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartEditName}
                  className="h-8 w-8 rounded-full"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-8 w-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-6">
          <Button onClick={handleScan} className="w-full py-6">
            <Scan className="mr-2 h-5 w-5" />
            Scan New Item
          </Button>
        </div>
        
        <AnimatePresence>
          {items.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6"
            >
              {items.map((item) => (
                <BarcodeProductCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteItem} 
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <h3 className="text-lg font-medium mb-2">No Items Yet</h3>
              <p className="text-muted-foreground mb-6">
                Scan a barcode to add items to {profile.name}'s wishlist
              </p>
              <Button onClick={handleScan}>
                <Scan className="mr-2 h-5 w-5" />
                Scan Barcode
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {profile.name}'s profile and all saved items.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProfile} className="bg-red-500 hover:bg-red-600">
                Delete Profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ProfileDetails;
