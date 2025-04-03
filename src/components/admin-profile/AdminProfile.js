"use client";
import React, { useState, useEffect} from "react";
import { auth, db } from "@/lib/firebase"; // Import Firebase auth & Firestore
import {
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import emailjs from "@emailjs/browser";

export default function AdminProfile() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    location: "",
    address: "",
    state: "",
    zip: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // useEffect(() => {
  //   if (success) {
  //     const timer = setTimeout(() => setSuccess(""), 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [success]);

  // Handle form input change
   useEffect(() => {
     const storedMessage = localStorage.getItem("successMessage");
     if (storedMessage) {
       setSuccess(storedMessage);
       localStorage.removeItem("successMessage"); // Remove it after showing
     }
   }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
  e.preventDefault();

  if (
    !userData.name ||
    !userData.email ||
    !userData.password ||
    !userData.role ||
    !userData.location ||
    !userData.address ||
    !userData.state ||
    !userData.zip
  ) {
    setError("All fields are required.");
    return;
  }

  if (userData.password.length < 6) {
    setError("Password must be at least 6 characters long.");
    return;
  }

  // Store admin credentials before creating the new user
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
   const userCredential = await createUserWithEmailAndPassword(
     auth,
     userData.email,
     userData.password
   );
   const user = userCredential.user;

   await updateProfile(user, { displayName: userData.name.trim() });

   await setDoc(doc(db, "users", user.uid), {
     uid: user.uid,
     name: userData.name.trim(),
     email: user.email,
     role: userData.role,
     location: userData.location,
     address: userData.address,
     state: userData.state,
     zip: userData.zip,
     createdAt: serverTimestamp(),
   });

   // Update the success state before logging out
   setSuccess("User Created Successfully!");
   setError("");

   // Store success message in local storage (optional)
   localStorage.setItem("successMessage", "User Created Successfully!");

   // Delay logout to allow UI to update
   setTimeout(async () => {
     await signOut(auth);
     console.log("New user logged out");

     await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
     console.log("Admin session restored.");
   }, 3000); // 3s delay to let the success message show on UI

   const templateParams = {
     to_email: userData.email.trim(), //  Send email to the user who signed up
     name: userData.name,
     role: userData.role,
     password: userData.password,
     location: userData.location,
     createdAt: serverTimestamp(),
   };

   emailjs
     .send(
       "service_sm5r8fj", // Your actual Service ID
       "template_x1l88yh", // Your actual Template ID
       templateParams, // Pass the correct object here
       "abh7mLjaQox8Fuece" // Your Public Key
     )
     .then((response) => {
       setSuccess(" Email sent successfully to:", userData.email);
     })
     .catch((error) => {
       setError("Error sending email:", error);
     });

   // Reset form after success
   setUserData({
     name: "",
     email: "",
     password: "",
     role: "",
     location: "",
     address: "",
     state: "",
     zip: "",
   });
 } catch (error) {
   setError("Error creating user: " + error.message);
   setSuccess(""); // Clear success message on error
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
                {success && <p className="text-orange-500 text-2xl">{success}</p>}
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
                      name="name"
                      id="name"
                      placeholder="Full Name"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                      value={userData.name}
                      onChange={handleChange}
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
                      value={userData.email}
                      onChange={handleChange}
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
                      name="password"
                      id="address"
                      className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                      value={userData.password}
                      onChange={handleChange}
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
                      value={userData.role}
                      onChange={handleChange}
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
                      value={userData.address}
                      onChange={handleChange}
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
                        name="location"
                        id="country"
                        placeholder="Country"
                        className="px-4 appearance-none outline-none w-full bg-transparent placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                        value={userData.location}
                        onChange={handleChange}
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
                        value={userData.state}
                        onChange={handleChange}
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
                      name="zip"
                      id="zipcode"
                      className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50 placeholder:text-gray-400 placeholder:font-normal placeholder:font-Poppins"
                      placeholder="ZipCode"
                      value={userData.zip}
                      onChange={handleChange}
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
