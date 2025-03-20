
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
}

interface ProfileContextType {
  profiles: Profile[];
  addProfile: (name: string) => void;
  updateProfile: (id: string, name: string) => void;
  deleteProfile: (id: string) => void;
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

  // Load profiles from localStorage on initial render
  useEffect(() => {
    const storedProfiles = localStorage.getItem('profiles');
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    } else {
      // Set some default profiles for demonstration purposes
      const defaultProfiles: Profile[] = [
        { id: '1', name: 'Emma', createdAt: new Date().toISOString() },
        { id: '2', name: 'Noah', createdAt: new Date().toISOString() },
      ];
      setProfiles(defaultProfiles);
      localStorage.setItem('profiles', JSON.stringify(defaultProfiles));
    }
    setLoading(false);
  }, []);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('profiles', JSON.stringify(profiles));
    }
  }, [profiles, loading]);

  const addProfile = (name: string) => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
    };
    setProfiles([...profiles, newProfile]);
  };

  const updateProfile = (id: string, name: string) => {
    setProfiles(
      profiles.map((profile) =>
        profile.id === id ? { ...profile, name } : profile
      )
    );
  };

  const deleteProfile = (id: string) => {
    setProfiles(profiles.filter((profile) => profile.id !== id));
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
