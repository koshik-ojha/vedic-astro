import './globals.css'
import { AuthProvider } from '../context/AuthContext'

export const metadata = {
  title: "Vedic Astro Bot (Free MVP)",
  description: "Telegram + Web Vedic astrology bot starter (free tiers)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
