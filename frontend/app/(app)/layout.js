"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { LanguageProvider } from "../../context/LanguageContext";
import { Sidebar } from "../../components/Sidebar";
import { MobileBottomNav } from "../../components/MobileBottomNav";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Sidebar />
        <div className="lg:ml-64 min-h-screen mobile-page">
          {children}
        </div>
        <MobileBottomNav />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="mt-14 sm:mt-0"
        />
      </div>
    </LanguageProvider>
  );
}
