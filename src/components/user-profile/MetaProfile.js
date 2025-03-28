'use client'
import React, {useState, useEffect} from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { BiLogoFacebook } from "react-icons/bi";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function MetaProfile({setModal}) {
        const [userName, setUserName] = useState("")
        const [userRole, setUserrole] = useState("");
        const [user, setUser] = useState(null);
        const [faceImage, setFaceImage] = useState("");
        const router = useRouter;

        useEffect(() => {
          const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
              router.push("/login"); // Redirect immediately
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
                setUserrole(userData.role || "");

                if (userData.faceImage) {
                  setFaceImage(userData.faceImage);
                } else {
                  // If no image in Firestore, try fetching from Firebase Storage
                  const storageRef = ref(
                    storage,
                    `profile_pictures/${currentUser.uid}`
                  );
                  try {
                    const url = await getDownloadURL(storageRef);
                    setFaceImage(url);
                  } catch (storageError) {
                    console.warn("No profile image found in Storage.");
                    setFaceImage(""); // Set to empty if no image is found
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }

            // setLoading(false);
          });

          return () => unsubscribe();
        }, [router]);

        if (!user) {
          return <p>Loading..</p>;
        }

   return (
     <div>
       <div
         className="border border-gray-300 mt-5 rounded-2xl flex md:flex-row flex-col justify-between items-center px-10 py-10"
       >
         <div className="flex md:flex-row flex-col gap-6 items-center md:mb-0 mb-5">
           {faceImage ? (
             <img
               src={faceImage}
               alt="Profile"
               className="w-20 h-20 rounded-full"
             />
           ) : (
             <div className="profile-placeholder">Loading Image...</div>
           )}
           <div className="flex flex-col md:items-start items-center">
             <h2 className="text-black font-bold font-avenir">{userName}</h2>
             <p className="text-black font-medium font-work">{userRole}</p>
           </div>
         </div>
         <div className="flex md:flex-row flex-col gap-4">
           <div className="flex flex-row items-center gap-2">
             <span className="border border-gray-300 px-3 py-3 text-black rounded-full font-work">
               <BiLogoFacebook size={20} />
             </span>
             <span className="border border-gray-300 px-3 py-3 text-black rounded-full font-work">
               <FaLinkedinIn size={20} />
             </span>
             <span className="border border-gray-300 px-3 py-3 text-black rounded-full font-work">
               <FaXTwitter size={20} />
             </span>
           </div>
           <span
             onClick={() => setModal(true)}
             className="flex flex-row items-center cursor-pointer justify-center font-work gap-2 text-black border border-gray-300 py-3 px-3 rounded-full"
           >
             <MdOutlineModeEditOutline />
             Edit
           </span>
         </div>
       </div>
     </div>
   );
}
