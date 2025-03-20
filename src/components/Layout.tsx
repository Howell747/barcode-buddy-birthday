
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  padding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBackButton = false,
  padding = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/70 border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {title && (
              <h1 className="text-xl font-medium">{title}</h1>
            )}
          </div>
          
          <nav className="flex items-center space-x-1">
            <Link to="/">
              <Button
                variant={location.pathname === '/' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/profiles">
              <Button
                variant={location.pathname.includes('/profiles') ? 'secondary' : 'ghost'}
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <UserCircle className="h-5 w-5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className={`flex-1 ${padding ? 'container mx-auto px-4 py-6' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
