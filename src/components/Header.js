"use client";
import { MdMenu } from "react-icons/md";
import { LuSearch } from "react-icons/lu";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Header({ setIsSidebarOpen }) {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
      try {
        const userRef = collection(db, "users");
        const q = query(userRef, where("uid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserName(querySnapshot.docs[0].data().name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center justify-between p-6 bg-white shadow-md">
      {/* Menu Button */}
      <MdMenu className="block md:hidden text-2xl cursor-pointer" onClick={() => setIsSidebarOpen(true)} />

      <h2 className="text-lg font-medium">Welcome {userName}!</h2>

      {/* Search Bar */}
      <div className="relative w-60">
        <LuSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          className="bg-white outline-none w-full pl-10 p-2 rounded-md border border-gray-300"
          placeholder="Search..."
        />
      </div>
    </div>
  );
}
