import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { RegionProvider } from '@/contexts/region-context';
import { ThemeProvider } from "next-themes";


export const metadata: Metadata = {
  title: 'AnydayTool - Family Finance Forecaster',
  description: 'Your personal finance and family management assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <RegionProvider>
            <FirebaseClientProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </FirebaseClientProvider>
          </RegionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
