'use client'
import React, {useState, useEffect} from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function UserProfile() {
        const [userName, setUserName] = useState("");
        const [userEmail, setUserEmail] = useState("");
        const [userRole, setUserrole] = useState("");
        const [user, setUser] = useState(null);
        const router = useRouter;

        useEffect(() => {
          const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
              router.push("/Login"); // Redirect immediately
              return;
            }

            setUser(currentUser);
            //  setLoadingAuth(false); // Auth check is done

            // Fetch user details from Firestore
            try {
              const userRef = collection(db, "users");
              const q = query(userRef, where("uid", "==", currentUser.uid));
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                setUserName(userData.name || ""); // Ensure userData.name is a string
                setUserEmail(userData.email || "");
                setUserrole(userData.role || "");
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }

          });

          return () => unsubscribe();
        }, [router]);

        if (!user) {
          return <p>Loading..</p>;
        }
  return (
    <div>
      <div className="border border-gray-300 mt-5 rounded-2xl md:px-10 px-3 py-10">
              <div className="flex flex-row justify-between items-center">
                <h2 className="font-bold text-black font-avenir">
                  Personal information
                </h2>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex md:flex-row flex-col md:items-center items-start mt-5 gap-10">
                  <div className="">
                    <h2 className="font-bold text-black font-avenir">Full Name</h2>
                    <p className="font-medium text-black font-workk">{userName}</p>
                  </div>
                  <div>
                    <h2 className="font-bold text-black font-avenir">
                      Email address
                    </h2>
                    <p className="font-medium text-black font-work">{userEmail}</p>
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-black font-avenir">Role</h2>
                  <p className="font-medium text-black font-work">{userRole}</p>
                </div>
              </div>
            </div>
    </div>
  )
}
