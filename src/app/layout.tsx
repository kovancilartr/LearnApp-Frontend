import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/providers/toast-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LearnApp - Remote Education Platform",
  description: "A comprehensive remote education platform for online learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                {children}
                <ToastProvider />
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
