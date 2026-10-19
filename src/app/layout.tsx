import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });
const sans = IBM_Plex_Sans({ subsets: ['latin', 'greek'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'SITREP — Global situation report',
  description: 'Live world news, a 3D event globe, AI briefings and prediction markets in one connected workspace.',
};
export const viewport: Viewport = { themeColor: '#05070a', width: 'device-width', initialScale: 1 };

export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
  return <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}><body>{children}</body></html>;
}
