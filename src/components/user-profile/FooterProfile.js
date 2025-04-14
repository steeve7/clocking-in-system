'use client'
import React, {useState, useEffect} from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function FooterProfile({ adddress, countrry, statee, zipCode }) {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const router = useRouter();

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
          setLocation(countrry || userData.location || "");
          setAddress(adddress || userData.address || "");
          setState(statee || userData.state || "");
          setZip(zipCode || userData.zip || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    });

    return () => unsubscribe();
  }, [router, adddress, countrry, statee, zipCode]);

  if (!user) {
    return <p>Loading..</p>;
  }
  return (
    <div>
      <div className="border border-gray-300 mt-5 rounded-2xl px-10 py-5">
        <div className="flex flex-row justify-between items-center md:mb-0 mb-5">
          <h2 className="font-bold text-black font-avenir">Address</h2>
        </div>
        <div className="flex flex-col gap-2 mt-5">
          <div className="flex flex-row gap-10">
            <div>
              <h2 className="font-bold text-black font-avenir">
                Country / Region
              </h2>
              <p className="font-medium text-black font-work">{location}</p>
            </div>
            <div>
              <h2 className="font-bold text-black font-avenir">
                Address / Street
              </h2>
              <p className="font-medium text-black font-work">{address}</p>
            </div>
          </div>
          <div className="flex flex-row gap-10 mt-5">
            <div>
              <h2 className="font-bold text-black font-avenir">
                State / Province
              </h2>
              <p className="font-medium text-black font-work">{state}</p>
            </div>
            <div>
              <h2 className="font-bold text-black font-avenir">Zipcode</h2>
              <p className="font-medium text-black font-work">{zip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
