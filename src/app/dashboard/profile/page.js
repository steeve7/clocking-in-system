'use client'

import React, {useEffect, useState} from 'react';
import { LuUserRound } from "react-icons/lu";
import { BiLogoFacebook } from "react-icons/bi";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";


export default function page() {
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserrole] = useState("");
    const [user, setUser] = useState(null);
    const router = useRouter

   useEffect(() => {
     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
       if (!currentUser) {
         router.replace("/Login"); // Redirect immediately
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
           setUserrole(userData.role || "")
         }
       } catch (error) {
         console.error("Error fetching user data:", error);
       }

       setLoading(false);
     });

     return () => unsubscribe();
   }, [router]);

   if(!user){
    return <p>Loading..</p>
   }

  return (
    <div className="bg-white md:h-[120vh] h-[190vh] w-full rounded-2xl md:px-10 px-5 py-10">
      <h2 className="text-black font-bold font-avenir">Profile</h2>
      <div className="border border-gray-300 mt-5 rounded-2xl flex md:flex-row flex-col justify-between items-center px-10 py-10">
        <div className="flex md:flex-row flex-col gap-6 items-center md:mb-0 mb-5">
          <span className="bg-gray-400 rounded-full px-6 py-6">
            <LuUserRound />
          </span>
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
          <span className="flex flex-row items-center cursor-pointer justify-center font-work gap-2 text-black border border-gray-300 py-3 px-3 rounded-full">
            <MdOutlineModeEditOutline />
            Edit
          </span>
        </div>
      </div>
      <div className="border border-gray-300 mt-5 rounded-2xl md:px-10 px-3 py-10">
        <div className="flex flex-row justify-between items-center">
          <h2 className="font-bold text-black font-avenir">Personal information</h2>
          <span className="text-black font-work hidden cursor-pointer border border-gray-300 px-3 py-3 rounded-full md:flex flex-row items-center justify-center gap-2">
            <MdOutlineModeEditOutline />
            Edit
          </span>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex md:flex-row flex-col md:items-center items-start mt-5 gap-10">
            <div className="">
              <h2 className="font-bold text-black font-avenir">First Name</h2>
              <p className="font-medium text-black font-workk">{userName}</p>
            </div>
            <div>
              <h2 className="font-bold text-black font-avenir">Email address</h2>
              <p className="font-medium text-black font-work">
                {userEmail}
              </p>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-black font-avenir">Role</h2>
            <p className="font-medium text-black font-work">{userRole}</p>
          </div>
          <span className="text-black cursor-pointer font-work border md:hidden border-gray-300 px-3 py-3 rounded-full flex flex-row items-center justify-center gap-2">
            <MdOutlineModeEditOutline />
            Edit
          </span>
        </div>
      </div>
      <div className="border border-gray-300 mt-5 rounded-2xl px-10 py-5">
        <div className="flex flex-row justify-between items-center md:mb-0 mb-5">
          <h2 className="font-bold text-black font-avenir">Address</h2>
          <span className="text-black font-work cursor-pointer border border-gray-300 px-3 py-3 rounded-full hidden md:flex flex-row items-center justify-center gap-2">
            <MdOutlineModeEditOutline />
            Edit
          </span>
        </div>
        <div>
          <h2 className="font-bold text-black font-avenir">Country</h2>
          <p className="font-medium text-black font-work">nigeria</p>
        </div>
        <span className="text-black mt-5 font-work md:mt-0 md:hidden cursor-pointer border border-gray-300 px-3 py-3 rounded-full flex flex-row items-center justify-center gap-2">
          <MdOutlineModeEditOutline />
          Edit
        </span>
      </div>
    </div>
  );
}
