
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

// Pages
import Home from "./pages/Home";
import Profiles from "./pages/Profiles";
import ProfileDetails from "./pages/ProfileDetails";
import NotFound from "./pages/NotFound";

// Context
import { ProfileProvider } from "./context/ProfileContext";
import { BarcodeProvider } from "./context/BarcodeContext";

const queryClient = new QueryClient();

const App = () => {
  // Set the viewport height for mobile
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    
    return () => window.removeEventListener('resize', setVH);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <BarcodeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profiles" element={<Profiles />} />
                  <Route path="/profiles/:id" element={<ProfileDetails />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </BarcodeProvider>
      </ProfileProvider>
    </QueryClientProvider>
  );
};

export default App;
