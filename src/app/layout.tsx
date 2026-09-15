import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'SITREP — Command Center',
  description: 'Global reporting, regional signals and prediction markets in one connected workspace.',
};
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}

