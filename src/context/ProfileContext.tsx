
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
}

interface ProfileContextType {
  profiles: Profile[];
  addProfile: (name: string) => Promise<Profile | null>;
  updateProfile: (id: string, name: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  getProfileById: (id: string) => Profile | undefined;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load profiles from Supabase on initial render
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching profiles:', error);
          toast({
            title: 'Failed to load profiles',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        
        if (data) {
          const formattedProfiles: Profile[] = data.map(profile => ({
            id: profile.id,
            name: profile.name,
            createdAt: profile.created_at,
          }));
          setProfiles(formattedProfiles);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [toast]);

  const addProfile = async (name: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding profile:', error);
        toast({
          title: 'Failed to add profile',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
      
      if (data) {
        const newProfile: Profile = {
          id: data.id,
          name: data.name,
          createdAt: data.created_at,
        };
        setProfiles([newProfile, ...profiles]);
        return newProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding profile:', error);
      return null;
    }
  };

  const updateProfile = async (id: string, name: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: 'Failed to update profile',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      setProfiles(
        profiles.map((profile) =>
          profile.id === id ? { ...profile, name } : profile
        )
      );
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const deleteProfile = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting profile:', error);
        toast({
          title: 'Failed to delete profile',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      setProfiles(profiles.filter((profile) => profile.id !== id));
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const getProfileById = (id: string) => {
    return profiles.find((profile) => profile.id === id);
  };

  const value = {
    profiles,
    addProfile,
    updateProfile,
    deleteProfile,
    getProfileById,
    loading,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
