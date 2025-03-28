"use client";
import React, { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    location: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

 const handleSignUp = async (e) => {
   e.preventDefault();
   setError("");
   setLoading(true);

   const { name, email, password, role, location } = userData; // ✅ Extract values from userData

   try {
     // Create user in Firebase Auth
     const userCredential = await createUserWithEmailAndPassword(
       auth,
       email,
       password
     );
     const user = userCredential.user;

     // Determine role (Admin if using a special email)
     let userRole = role || "Employee"; // Default role is Employee

     if (email === "admin@chidindu.com") {
       userRole = "Admin";
     }

     // Update profile with the user's display name
     await updateProfile(user, { displayName: name });

     // Store user in Firestore
     await setDoc(doc(db, "users", user.uid), {
       name,
       email,
       role: userRole,
       location,
       createdAt: serverTimestamp(),
       faceDescriptor: null, // Placeholder for face recognition data
     });

     setLoading(false);
     router.push("/dashboard"); // Redirect after successful signup
   } catch (error) {
     console.error("Signup Error:", error.message);
     setError(error.message || "Failed to create account.");
     setLoading(false);
   }
 };


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          Create an Account
        </h2>

        <form onSubmit={handleSignUp}>
          {/* Name Input */}
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-3"
          />

          {/* Email Input */}
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-3"
          />

          {/* Password Input */}
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-3"
          />

          {/* Role Selection (Added Admin) */}
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-3"
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
          </select>

          {/* Location Input */}
          <input
            type="text"
            name="location"
            value={userData.location}
            onChange={handleChange}
            placeholder="Location (e.g., New York)"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
          />

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          {/* Signup Button with Loading State */}
          <button
            type="submit"
            className={`w-full text-white py-2 rounded-md transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Redirect to Login */}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
