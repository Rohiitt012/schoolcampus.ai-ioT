import { Outfit } from 'next/font/google';
import './globals.css';
import 'flatpickr/dist/flatpickr.css';
import { ClientProviders } from '@/context/ClientProviders';

const outfit = Outfit({
  subsets: ['latin'],
});

export const metadata = {
  title: 'Smart School IoT & AI Platform',
  description: 'Enterprise IoT & AI Platform for School Attendance, GPS Bus Tracking, Smart Alerts & Role Portals',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
