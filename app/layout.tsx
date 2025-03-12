import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/navbar';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '@/hooks/useToast';
import type { Metadata } from 'next'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rock Blasting Prediction',
  description: 'Advanced rock blasting prediction system using machine learning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="min-h-screen bg-background">
              <Navbar />
              <div className="h-16"></div>  {/* Spacer to prevent content from hiding under navbar */}
              <main className="container mx-auto px-4 py-6">
                {children}
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}