'use client';
import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FaSignInAlt } from "react-icons/fa";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("")
  const router = useRouter();

const today = new Date().toISOString().split("T")[0];

async function handleLogin(e) {
  e.preventDefault();
  setError("");

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Fetch user role
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role?.toLowerCase(); // Normalize to lowercase

      // ✅ Auto-mark attendance
      await updateDoc(userDocRef, {
        attendance: arrayUnion({
          date: today,
          status: "Active",
          timestamp: new Date(),
        }),
      });

      // ✅ Redirect based on role
      if (role === "admin") {
        setSuccess("Login successfully");
        router.push("/admin");
      } else if (role === "employee" || role === "manager") {
        setSuccess("Login successfully");
        router.push("/faceDetection");
      } else {
        setError("Unauthorized role.");
      }
    } else {
      setError("User data not found.");
    }
  } catch (error) {
    console.error("Login Error:", error);
    setError("Invalid email or password.");
  }
}
   return (
     <div>
       <div className="contain py-16">
         <div className="max-w-lg mx-auto shadow px-6 py-7 rounded overflow-hidden">
           {error && <p style={{ color: "red" }}>{error}</p>}
           {success && <p className="text-orange-500">{success}</p>}
           <h2 className="text-2xl uppercase font-medium mb-1 font-Euclid">
             Login
           </h2>
           <p className="text-gray-600 mb-6 text-sm font-normal font-Poppins">
             Welcome! So good to have you back!
           </p>
           <form autoComplete="off" onSubmit={handleLogin}>
             <p className="text-red-500"></p>
             <div className="space-y-2">
               <div>
                 <label
                   htmlFor="email"
                   className="text-gray-600 mb-2 block font-Euclid font-medium"
                 >
                   Email address
                 </label>
                 <input
                   type="email"
                   name="email"
                   id="email"
                   className="block w-full border border-gray-300 px-4 py-3 text-gray-600 text-sm rounded focus:ring-0 focus:border-teal-500 placeholder-gray-400 placeholder:font-normal placeholder:font-Poppins"
                   placeholder="Email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                 />
               </div>
             </div>
             <div className="space-y-2 mt-5">
               <div>
                 <label
                   htmlFor="password"
                   className="text-gray-600 mb-2 block font-medium font-Euclid"
                 >
                   Password
                 </label>
                 <div className="relative">
                   <input
                     type="password"
                     name="password"
                     id="password"
                     className="block w-full border border-gray-300 px-4 py-3 text-gray-600 text-sm rounded focus:ring-0 focus:border-teal-500 placeholder-gray-400 placeholder:font-normal placeholder:font-Poppins"
                     placeholder="Password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                   />
                   <div className="cursor-pointer absolute inset-y-0 right-0 flex items-center px-8 text-gray-600 border-l border-gray-300">
                     <svg
                       xmlns="http://www.w3.org/2000/svg"
                       fill="none"
                       viewBox="0 0 24 24"
                       strokeWidth="1.5"
                       stroke="currentColor"
                       className="w-5 h-5"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                       ></path>
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                       ></path>
                     </svg>
                   </div>
                 </div>
               </div>
             </div>
             <div className="mt-5 flex flex-row justify-center items-center gap-2 py-2 px-2 w-full rounded-lg bg-gray-500">
               <FaSignInAlt color="white" />
               <button className="text-white font-normal font-Poppins">
                 Login
               </button>
             </div>
           </form>
         </div>
       </div>
     </div>
   );
};
