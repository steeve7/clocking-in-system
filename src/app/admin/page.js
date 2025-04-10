'use client'
import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AdminProfile from "@/components/admin-profile/AdminProfile";

export default function page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      });
    };

    checkAdmin();
  }, []);

  if (loading) return <p className="flex justify-center items-center font-Poppins text-black py-20">Loading...</p>;

 return isAdmin ? (
   <AdminProfile />
 ) : (
   <p className="flex justify-center items-center font-Poppins text-black py-20">
     Access Denied
   </p>
 );

}
