// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
 
});

export const metadata: Metadata = {
  title: "SIRIUS REGENERATIVE",
  description: "Portal de Proveedores Contratistas SIRIUS REGENERATIVE",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
      <AuthProvider>
        {children}
        </AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            success: {
              style: {
                background: '#10B981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
              },
            },
          }}
        />
        </body>
    </html>
  );
}