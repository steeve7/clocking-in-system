"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // change default to true
    const [loadingAuth, setLoadingAuth] = useState(true); // New state to track auth check
    const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/Login"); // Redirect immediately
        return;
      }

      setUser(currentUser);
      setLoadingAuth(false); // Auth check is done


      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (!user && !loadingAuth) {
    router.replace("/Login");
    return null; // Prevent any rendering
  }

  // Prevent rendering while checking authentication
  if (loadingAuth) {
    return <p>Loading authentication...</p>;
  }

  // Prevent rendering while fetching user data
  if (loading) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100 w-full">
        {/* Header */}
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        {/* Page Content */}
        <div className="p-6 overflow-x-auto">{children}</div>
      </div>
    </div>
  );
}
