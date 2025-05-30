"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
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
    allowedLatitude: "",
    allowedLongitude: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedMessage = localStorage.getItem("successMessage");
    if (storedMessage) {
      setSuccess(storedMessage);
      localStorage.removeItem("successMessage");
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      role,
      location,
      address,
      state,
      zip,
      allowedLatitude,
      allowedLongitude,
    } = userData;

    if (!name || !email || !password || !role || !location || !address || !state || !zip || !allowedLatitude || !allowedLongitude) {
      setError("All fields including coordinates are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const currentAdmin = auth.currentUser;
    const adminEmail = currentAdmin?.email;
    const adminPassword = prompt("Please enter your admin password to stay logged in:");
    if (!adminPassword) {
      setError("Admin authentication required.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name.trim() });

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name.trim(),
          email: user.email,
          role,
          location,
          address,
          state,
          zip,
          createdAt: serverTimestamp(),
          geolocation: { lat: latitude, lng: longitude },
          allowedLatitude: parseFloat(allowedLatitude),
          allowedLongitude: parseFloat(allowedLongitude),
        });

        setSuccess("User Created Successfully!");
        setError("");
        localStorage.setItem("successMessage", "User Created Successfully!");

        setTimeout(async () => {
          await signOut(auth);
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        }, 3000);

        emailjs.send(
          "service_sm5r8fj",
          "template_x1l88yh",
          {
            to_email: email.trim(),
            name,
            role,
            password,
            location,
            createdAt: serverTimestamp(),
          },
          "abh7mLjaQox8Fuece"
        );

        setUserData({
          name: "",
          email: "",
          password: "",
          role: "",
          location: "",
          address: "",
          state: "",
          zip: "",
          allowedLatitude: "",
          allowedLongitude: "",
        });
      } catch (error) {
        setError("Error creating user: " + error.message);
        setSuccess("");
      }
    });
  };

  return (
    <div className="min-h-screen p-6 bg-black flex items-center justify-center">
      <div className="container max-w-screen-lg mx-auto">
        <div>
          <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
              <div className="text-gray-600">
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && (
                  <p className="text-orange-500 text-2xl py-3">{success}</p>
                )}
                <p className="font-Marhey font-medium text-center text-[50px] leading-[50px] text-[#1e1e1e]">
                  {" "}
                  SmartFace Check-in
                </p>
                <p className="font-Montserrat font-medium text-base text-center">
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
                      className="font-Montserrat font-medium text-black"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      placeholder="Full Name"
                      className="h-10 border mt-1 outline-none px-4 w-full rounded-lg font-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      value={userData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="email"
                      className="font-Montserrat font-medium text-black"
                    >
                      Email Address
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      className="h-10 border mt-1 outline-none rounded-lg px-4 w-full font-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      value={userData.email}
                      onChange={handleChange}
                      required
                      placeholder="email@domain.com"
                    />
                  </div>

                  <div className="md:col-span-2 mt-5">
                    <label
                      htmlFor="address"
                      className="font-Montserrat font-medium text-black"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="address"
                      className="h-10 border mt-1 outline-none rounded-lg px-4 w-full font-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      value={userData.password}
                      onChange={handleChange}
                      required
                      placeholder="Password"
                    />
                  </div>
                  <div className="md:col-span-2 mt-5">
                    <label
                      htmlFor="address"
                      className="font-Montserrat font-medium text-black"
                    >
                      Role
                    </label>
                    <select
                      name="role"
                      value={userData.role}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg mb-2 font-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                    >
                      <option value="">Select Role</option>
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 mt-5">
                    <label
                      htmlFor="address"
                      className="font-Montserrat font-medium text-black"
                    >
                      Address / Street
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      className="h-10 border mt-1 outline-none rounded-lg px-4 w-full font-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      value={userData.address}
                      onChange={handleChange}
                      required
                      placeholder="Address / Street"
                    />
                  </div>

                  <div className="md:col-span-2 mt-5">
                    <label
                      htmlFor="country"
                      className="font-Montserrat font-medium text-black"
                    >
                      Country / region
                    </label>
                    <input
                      name="location"
                      id="country"
                      placeholder="Country"
                      className="transition-all outline-none flex items-center h-10 border mt-1 rounded-lg px-4 w-fullfont-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      value={userData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-2 mt-5">
                    <label
                      htmlFor="state"
                      className="font-Montserrat font-medium text-black"
                    >
                      State / province
                    </label>
                    <input
                      type="text"
                      name="state"
                      id="state"
                      placeholder="State"
                      className="transition-all outline-none flex items-center h-10 border mt-1 rounded-lg px-4 w-fullfont-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      value={userData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-1 mt-5">
                    <label
                      htmlFor="zipcode"
                      className="font-Montserrat font-medium text-black"
                    >
                      Zipcode
                    </label>
                    <input
                      type="text"
                      name="zip"
                      id="zipcode"
                      className="transition-all outline-none flex items-center h-10 border mt-1 rounded-lg px-4 w-fullfont-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      placeholder="ZipCode"
                      value={userData.zip}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Latitude */}
                  <div className="md:col-span-3">
                    <label
                      htmlFor="allowedLatitude"
                      className="font-Montserrat font-medium text-black"
                    >
                      Allowed Latitude
                    </label>
                    <input
                      type="text"
                      name="allowedLatitude"
                      id="allowedLatitude"
                      value={userData.allowedLatitude}
                      onChange={handleChange}
                      placeholder="e.g. 37.7749"
                      className="h-10 border mt-1 outline-none rounded-lg px-4 w-full font-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      required
                    />
                  </div>

                  {/* Longitude */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="allowedLongitude"
                      className="font-Montserrat font-medium text-black"
                    >
                      Allowed Longitude
                    </label>
                    <input
                      type="text"
                      name="allowedLongitude"
                      id="allowedLongitude"
                      value={userData.allowedLongitude}
                      onChange={handleChange}
                      placeholder="e.g. -122.4194"
                      className="h-10 border mt-1 rounded-lg outline-none px-4 w-full font-Montserrat font-medium bg-[#D8D7D7] border-gray-200 placeholder:font-Montserrat placeholder-[#747373]"
                      required
                    />
                  </div>

                  <div className="md:col-span-5 text-right">
                    <div className="inline-flex items-end mt-5">
                      <button className="bg-black text-white font-Montserrat font-medium py-2 px-4 rounded">
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
