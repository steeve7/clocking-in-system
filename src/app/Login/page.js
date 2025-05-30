"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  
  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setLoading(true);
  //   setSuccess("");


  //   try {
  //     const userCredential = await signInWithEmailAndPassword(
  //       auth,
  //       email,
  //       password
  //     );
  //     const user = userCredential.user;

  //     const userDocRef = doc(db, "users", user.uid);
  //     const userDoc = await getDoc(userDocRef);

  //     if (userDoc.exists()) {
  //       const userData = userDoc.data();
  //       const role = userData.role?.toLowerCase();

  //       await updateDoc(userDocRef, {
  //         attendance: arrayUnion({
  //           date: new Date().toISOString().split("T")[0],
  //           status: "Active",
  //           timestamp: new Date(),
  //         }),
  //       });

  //       setSuccess("Sign-In successfully");
  //       setEmail("");
  //       setPassword("");
  //       setLoading(false);
  //       if (role === "admin") {
  //         router.push("/admin");
  //       } else if (role === "employee" || role === "manager") {
  //         setLoading(false);

  //         router.push("/faceDetection");
  //       } else {
  //         setError("Unauthorized role.");
  //       }
  //     } else {
  //       setError("User data not found.");
  //     }
  //   } catch (error) {
  //     console.error("Login Error:", error);
  //     setError("Invalid email or password.");
  //   }
  // };

  function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  function toRad(value) {
    return (value * Math.PI) / 180;
  }

  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  setSuccess("");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      setError("User not found.");
      setLoading(false);
      return;
    }

    const userData = userDoc.data();
    const role = userData.role?.toLowerCase();

    if (role === "admin") {
      setSuccess("Admin login successful.");
      router.push("/admin");
      return;
    }

    // Geolocation required for employees and managers
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        const allowedLat = parseFloat(userData.allowedLatitude);
        const allowedLng = parseFloat(userData.allowedLongitude);

        if (!allowedLat || !allowedLng) {
          setError("No assigned location found. Contact your admin.");
          setLoading(false);
          return;
        }

        const distance = getDistanceInMeters(currentLat, currentLng, allowedLat, allowedLng);

        if (distance > 200) {
          setError("Login denied: not within your assigned work location.");
          setLoading(false);
          return;
        }

        // Mark attendance if login is valid
        await updateDoc(userDocRef, {
          attendance: arrayUnion({
            date: new Date().toISOString().split("T")[0],
            status: "Active",
            timestamp: new Date(),
          }),
        });

        setSuccess("Login successful!");
        setEmail("");
        setPassword("");
        setLoading(false);

        if (role === "manager" || role === "employee") {
          router.push("/faceDetection");
        } else {
          setError("Unauthorized role.");
        }
      },
      (geoError) => {
        setError("Geolocation error: " + geoError.message);
        setLoading(false);
      }
    );
  } catch (error) {
    console.error("Login Error:", error);
    setError("Invalid email or password.");
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-black flex flex-row items-center">
      {/* Left: Form Section */}
      <div className="flex-1 p-6 sm:p-12 flex flex-col justify-center">
        <div className="flex justify-center items-center">
          <h1 className="font-Marhey font-medium text-center text-[50px] text-white leading-[50px] xl:w-1/2 w-full">
            SmartFace Check-in
          </h1>
        </div>
        <div className="mt-5 flex flex-col items-center">
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p className="text-orange-500">{success}</p>}
          <div className="xl:w-[70%] w-full flex-1 mt-8 bg-white py-20 px-8 rounded-lg">
            <form className="mx-auto max-w-xs" onSubmit={handleLogin}>
              <input
                className="w-full px-8 py-4 rounded-lg font-Montserrat font-medium bg-[#D8D7D7] border border-gray-200 placeholder:font-Montserrat placeholder-[#747373] text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  className="w-full px-8 py-4 rounded-lg font-Montserrat font-medium bg-[#D8D7D7] border border-gray-200 placeholder:font-Montserrat placeholder-[#747373] text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute inset-y-0 right-0 flex items-center mt-5 justify-center px-8 text-gray-600"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </div>
              </div>

              <button
                className={`mt-5 tracking-wide gap-2 cursor-pointer font-semibold text-white w-full py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none ${
                  loading ? "bg-black cursor-not-allowed" : "bg-black"
                }`}
                disabled={loading}
              >
                <FaSignInAlt color="white" />
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right: Fixed Size Image */}
      <div className="hidden lg:block xl:w-[610px] h-[606px]">
        <img
          src="/images/login.svg"
          alt="detect_image"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
