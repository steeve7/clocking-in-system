"use client";
import React, { useState } from "react";
import { auth, db } from "@/lib/firebase"; // Import Firebase auth & Firestore
import {
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AdminProfile() {
     const [name, setName] = useState("");
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [location, setLocation] = useState("");
     const [address, setAddress] = useState("");
     const [state, setState] = useState("");
     const [zip, setZip] = useState("");
     const [role, setRole] = useState("");
     const [error, setError] = useState("");
     const [success, setSuccess] = useState("");

     const handleCreateUser = async (e) => {
       e.preventDefault();

       // Store the current admin's credentials
       const currentAdmin = auth.currentUser;
       const adminEmail = currentAdmin?.email;
       const adminPassword = prompt(
         "Please enter your admin password to stay logged in:"
       );

       if (!adminPassword) {
         setError("Admin authentication required.");
         return;
       }

       try {
         // Create the new user but DO NOT sign them in
         const tempAuth = getAuth();
         const userCredential = await createUserWithEmailAndPassword(
           tempAuth,
           email,
           password
         );
         const user = userCredential.user;

         // Store additional user details in Firestore
         await setDoc(doc(db, "users", user.uid), {
           name,
           email,
           location,
           role,
           address,
           state,
           zip,
           createdAt: serverTimestamp(),
         });

         // Sign out the temporary user to prevent access issues
         await signOut(tempAuth);

         // Re-authenticate the admin user
         await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

         setSuccess("User created successfully! Admin session restored.");
         setName("");
         setEmail("");
         setPassword("");
         setLocation("");
         setRole("");
         setAddress("");
         setState("");
         setZip("");
       } catch (error) {
         setError("Error creating user: " + error.message);
       }
     };

   return (
     <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
       <div className="container max-w-screen-lg mx-auto">
         <div>
           <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
             <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
               <div className="text-gray-600">
                 {error && <p style={{ color: "red" }}>{error}</p>}
                 {success && <p className="text-orange-500">{success}</p>}
                 <p className="font-medium text-lg font-Euclid">Admin Page</p>
                 <p className="font-normal text-base font-Poppins">
                   Please fill out all the fields.
                 </p>
               </div>

               <div className="lg:col-span-2">
                 <form
                   className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5"
                   onSubmit={handleCreateUser}
                 >
                   <div className="md:col-span-2">
                     <label
                       htmlFor="full_name"
                       className="font-medium font-Euclid text-black"
                     >
                       Full Name
                     </label>
                     <input
                       type="text"
                       name="full_name"
                       id="full_name"
                       placeholder="Full Name"
                       className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required
                     />
                   </div>

                   <div className="md:col-span-2">
                     <label
                       htmlFor="email"
                       className="font-medium font-Euclid text-black"
                     >
                       Email Address
                     </label>
                     <input
                       type="text"
                       name="email"
                       id="email"
                       className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       placeholder="email@domain.com"
                     />
                   </div>

                   <div className="md:col-span-2 mt-5">
                     <label
                       htmlFor="address"
                       className="font-medium font-Euclid text-black"
                     >
                       Password
                     </label>
                     <input
                       type="password"
                       name="address"
                       id="address"
                       className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       placeholder="Password"
                     />
                   </div>
                   <div className="md:col-span-2 mt-5">
                     <label
                       htmlFor="address"
                       className="font-medium font-Euclid text-black"
                     >
                       Role
                     </label>
                     <select
                       name="role"
                       value={role}
                       onChange={(e) => setRole(e.target.value)}
                       required
                       className="w-full px-4 py-2 border rounded-md mb-2"
                     >
                       <option value="">Select Role</option>
                       <option value="Employee">Employee</option>
                       <option value="Manager">Manager</option>
                       <option value="admin">Admin</option>
                     </select>
                   </div>

                   <div className="md:col-span-2 mt-5">
                     <label
                       htmlFor="address"
                       className="font-medium font-Euclid text-black"
                     >
                       Address / Street
                     </label>
                     <input
                       type="text"
                       name="address"
                       id="address"
                       className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                       value={address}
                       onChange={(e) => setAddress(e.target.value)}
                       required
                       placeholder="Address / Street"
                     />
                   </div>

                   <div className="md:col-span-2 mt-5">
                     <label
                       htmlFor="country"
                       className="font-medium font-Euclid text-black"
                     >
                       Country / region
                     </label>
                     <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                       <input
                         name="country"
                         id="country"
                         placeholder="Country"
                         className="px-4 appearance-none outline-none w-full bg-transparent placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                         value={location}
                         onChange={(e) => setLocation(e.target.value)}
                         required
                       />
                       <button
                         tabIndex="-1"
                         className="cursor-pointer outline-none focus:outline-none transition-all text-gray-300 hover:text-red-600"
                       >
                         <svg
                           className="w-4 h-4 mx-2 fill-current"
                           xmlns="http://www.w3.org/2000/svg"
                           viewBox="0 0 24 24"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                         >
                           <line x1="18" y1="6" x2="6" y2="18"></line>
                           <line x1="6" y1="6" x2="18" y2="18"></line>
                         </svg>
                       </button>
                       <button
                         tabIndex="-1"
                         htmlFor="show_more"
                         className="cursor-pointer outline-none focus:outline-none border-l border-gray-200 transition-all text-gray-300 hover:text-blue-600"
                       >
                         <svg
                           className="w-4 h-4 mx-2 fill-current"
                           xmlns="http://www.w3.org/2000/svg"
                           viewBox="0 0 24 24"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                         >
                           <polyline points="18 15 12 9 6 15"></polyline>
                         </svg>
                       </button>
                     </div>
                   </div>

                   <div className="md:col-span-2 mt-5">
                     <label
                       htmlFor="state"
                       className="font-medium font-Euclid text-black"
                     >
                       State / province
                     </label>
                     <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                       <input
                         name="state"
                         id="state"
                         placeholder="State"
                         className="px-4 appearance-none outline-none placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins w-full bg-transparent"
                         value={state}
                         onChange={(e) => setState(e.target.value)}
                         required
                       />
                       <button
                         tabIndex="-1"
                         className="cursor-pointer outline-none focus:outline-none transition-all text-gray-300 hover:text-red-600"
                       >
                         <svg
                           className="w-4 h-4 mx-2 fill-current"
                           xmlns="http://www.w3.org/2000/svg"
                           viewBox="0 0 24 24"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                         >
                           <line x1="18" y1="6" x2="6" y2="18"></line>
                           <line x1="6" y1="6" x2="18" y2="18"></line>
                         </svg>
                       </button>
                       <button
                         tabIndex="-1"
                         htmlFor="show_more"
                         className="cursor-pointer outline-none focus:outline-none border-l border-gray-200 transition-all text-gray-300 hover:text-blue-600"
                       >
                         <svg
                           className="w-4 h-4 mx-2 fill-current"
                           xmlns="http://www.w3.org/2000/svg"
                           viewBox="0 0 24 24"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                         >
                           <polyline points="18 15 12 9 6 15"></polyline>
                         </svg>
                       </button>
                     </div>
                   </div>

                   <div className="md:col-span-1 mt-5">
                     <label
                       htmlFor="zipcode"
                       className="font-medium font-Euclid text-black"
                     >
                       Zipcode
                     </label>
                     <input
                       type="text"
                       name="zipcode"
                       id="zipcode"
                       className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50 placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                       placeholder="ZipCode"
                       value={zip}
                       onChange={(e) => setZip(e.target.value)}
                       required
                     />
                   </div>

                   <div className="md:col-span-5 text-right">
                     <div className="inline-flex items-end mt-5">
                       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                         Submit
                       </button>
                     </div>
                   </div>
                 </form>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
};
