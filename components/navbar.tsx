'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Menu, X, BarChart2, Home, Settings, LogIn, User, LogOut, History, Calculator } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Predictions', href: '/predictions', icon: BarChart2 },
    { name: 'History', href: '/predictions/history', icon: History, protected: true },
    { name: 'Settings', href: '/settings', icon: Settings, protected: true },
  ];

  const isActive = (path: string) => pathname === path;

  // Filter navigation items based on authentication status
  const filteredNavigation = navigation.filter(item => 
    !item.protected || (item.protected && user)
  );

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BarChart2 className="h-6 w-6" />
              <span className="text-xl font-bold">RockBlast AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            <ModeToggle />
            
            <Link href="/tools/cost-calculator">
              <Button variant="ghost">
                <Calculator className="h-4 w-4 mr-2" />
                Cost Calculator
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleSignIn}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <ModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 p-2 rounded-md hover:bg-accent"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            <Link href="/tools/cost-calculator">
              <Button variant="ghost" className="w-full mt-4">
                <Calculator className="h-4 w-4 mr-2" />
                Cost Calculator
              </Button>
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => {
                  handleSignIn();
                  setIsOpen(false);
                }}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}