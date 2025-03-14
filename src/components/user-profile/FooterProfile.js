'use client'
import React, {useState, useEffect} from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function FooterProfile() {
            const [user, setUser] = useState(null);
            const [location, setLocation] = useState("")
            const router = useRouter;

            useEffect(() => {
              const unsubscribe = onAuthStateChanged(
                auth,
                async (currentUser) => {
                  if (!currentUser) {
                    router.push("/Login"); // Redirect immediately
                    return;
                  }

                  setUser(currentUser);
                  //  setLoadingAuth(false); // Auth check is done

                  // Fetch user details from Firestore
                  try {
                    const userRef = collection(db, "users");
                    const q = query(
                      userRef,
                      where("uid", "==", currentUser.uid)
                    );
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                      const userData = querySnapshot.docs[0].data();
                      setLocation(userData.location || "");
                    }
                  } catch (error) {
                    console.error("Error fetching user data:", error);
                  }
                }
              );

              return () => unsubscribe();
            }, [router]);

            if (!user) {
              return <p>Loading..</p>;
            }
  return (
    <div>
      <div className="border border-gray-300 mt-5 rounded-2xl px-10 py-5">
              <div className="flex flex-row justify-between items-center md:mb-0 mb-5">
                <h2 className="font-bold text-black font-avenir">Address</h2>
                
              </div>
              <div>
                <h2 className="font-bold text-black font-avenir">Country</h2>
                <p className="font-medium text-black font-work">{location}</p>
              </div>
              
            </div>
    </div>
  )
}
