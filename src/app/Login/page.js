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
  // const [localIP, setLocalIP] = useState("");
  const router = useRouter();

  // useEffect(() => {
  //   const getLocalIP = async () => {
  //     const pc = new RTCPeerConnection({ iceServers: [] });
  //     pc.createDataChannel("");
  //     pc.onicecandidate = (event) => {
  //       if (event.candidate) {
  //         const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
  //         const ipMatch = event.candidate.candidate.match(ipRegex);
  //         if (ipMatch) {
  //           setLocalIP(ipMatch[1]);
  //           pc.close();
  //         }
  //       }
  //     };
  //     await pc.createOffer().then((offer) => pc.setLocalDescription(offer));
  //   };

  //   getLocalIP();
  // }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess("");

    // const allowedIPs = ["172.20.10.1"]; // Replace with your allowed local IPs

    // if (!allowedIPs.includes(localIP)) {
    //   setError("Access Denied! Connect to the required network.");
    //   return;
    // }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role?.toLowerCase();

        await updateDoc(userDocRef, {
          attendance: arrayUnion({
            date: new Date().toISOString().split("T")[0],
            status: "Active",
            timestamp: new Date(),
          }),
        });

        setSuccess("Login successful");
        setLoading(false);
        if (role === "admin") {
          router.push("/admin");
        } else if (role === "employee" || role === "manager") {
          setLoading(false);

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
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 w-full">
          <div className="flex justify-center items-center">
            <h1 className="font-Euclid font-bold text-[30px] text-blue-500">SmartFace Check-In</h1>
          </div>
          <div className="mt-12 flex flex-col items-center">
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p className="text-orange-500">{success}</p>}
            <div className="w-full flex-1 mt-8">
              <form className="mx-auto max-w-xs" onSubmit={handleLogin}>
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
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
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
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
        <div className="flex-1 bg-green-100 text-center hidden md:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/background.svg')" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
