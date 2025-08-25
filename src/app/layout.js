import "./globals.css";
import { ThemeModeScript } from "flowbite-react";
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from "@/context/AuthContext";
import Navbar from '@/components/Navbar'


export const metadata = {
  title: "Tether Read",
  description: "A simple way to syncronize your reading across devices",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <ThemeModeScript />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
