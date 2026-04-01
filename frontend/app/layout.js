import './globals.css'
import { AuthProvider } from '../context/AuthContext'

export const metadata = {
  title: "Vedic Astro Bot (Free MVP)",
  description: "Telegram + Web Vedic astrology bot starter (free tiers)",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#4F46E5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
