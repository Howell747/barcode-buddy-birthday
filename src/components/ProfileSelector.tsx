
import React from 'react';
import { useProfiles, Profile } from '@/context/ProfileContext';
import { useBarcodes } from '@/context/BarcodeContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProfileSelectorProps {
  onSelectProfile?: (profile: Profile) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onSelectProfile }) => {
  const { profiles, addProfile } = useProfiles();
  const { currentBarcode, setCurrentBarcode } = useBarcodes();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddProfile = () => {
    const name = prompt('Enter profile name:');
    if (name?.trim()) {
      addProfile(name.trim());
      toast({
        title: 'Profile Added',
        description: `${name} has been added as a new profile.`,
      });
    }
  };

  const handleProfileClick = (profile: Profile) => {
    if (currentBarcode) {
      if (onSelectProfile) {
        onSelectProfile(profile);
      }
    } else {
      navigate(`/profiles/${profile.id}`);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-medium mb-2">
          {currentBarcode ? 'Select a Profile' : 'Profiles'}
        </h2>
        {currentBarcode && (
          <p className="text-muted-foreground">
            Choose who this item is for
          </p>
        )}
      </div>
      
      <motion.div 
        className="grid grid-cols-1 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {profiles.map((profile) => (
          <motion.div key={profile.id} variants={item}>
            <Card 
              className={cn(
                "transition-all duration-300 hover:scale-102 cursor-pointer glass-card",
                currentBarcode ? "border-primary/40 hover:border-primary" : ""
              )}
              onClick={() => handleProfileClick(profile)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <span>{profile.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to {currentBarcode ? 'add item to this profile' : 'view items'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        <motion.div variants={item}>
          <Button 
            variant="outline" 
            className="w-full py-6 border-dashed border-2 hover:border-primary hover:bg-primary/5"
            onClick={handleAddProfile}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Profile
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileSelector;
