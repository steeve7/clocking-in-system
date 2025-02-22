"use client";

import { useState, useRef, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import { auth } from "@/lib/firebase";
import { detectFace, loadModel, compareFaces } from "@/lib/faceRecognition";
import { getUserFaceData } from "@/lib/firebase"; // Function to fetch stored face data
import {BiLogIn} from 'react-icons/bi'
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null); // Store camera stream
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/Dashboard");
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [router]);
  
  useEffect(() => {
    async function setupCamera() {
      try {
        await loadModel(); // Ensure model is loaded first

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream; // Save the stream to stop it later if needed
        }
      } catch (error) {
        setError("Error accessing camera...", + error.message);
      }
    }

    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

 const handleLogin = async (e) => {
   e.preventDefault();
   setError("Look at the camera...");

   try {

     // Detect face from video
     const detectedFace = await detectFace(videoRef.current);
     if (!detectedFace) {
       setError("Face not detected! Try again.");
       return;
     }

     // Log in user first before accessing `user.uid`
     const userCredential = await signInWithEmailAndPassword(
       auth,
       email,
       password
     );
     const user = userCredential.user; // Now user is defined

     // Now it's safe to get stored face data
     const storedFace = await getUserFaceData(user.uid);
     if (!storedFace) {
       setError("No face data found. Please register your face first.");
       return;
     }

     // Compare detected face with stored face
     const isMatch = compareFaces(detectedFace, storedFace);
     if (!isMatch) {
       setError("Face does not match. Access denied!");
       return;
     }

     setError("Login successful! Face matched.");

     // Stop the camera before redirecting
     if (streamRef.current) {
       streamRef.current.getTracks().forEach((track) => track.stop());
     }

     // Clear input fields
     setEmail("");
     setPassword("");

     // Redirect to Dashboard
     setTimeout(() => {
       router.push("/Dashboard");
     }, 1000);
   } catch (error) {
     setError(error.message);
   }
 };


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex lg:flex-row flex-col justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-bold text-center font-roboto px-10">
              Sign-in with Face Recognition
            </h1>
            <div className="w-full flex-1 mt-8">
              <form className="mx-auto max-w-xs" onSubmit={handleLogin}>
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="submit"
                  className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex flex-row gap-2 items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <BiLogIn />
                  Sign-In
                </button>
                <p className="flex justify-center items-center font-roboto font-medium mt-5">
                  OR
                </p>
                <Link
                  href={"/signUp"}
                  className="mt-5 tracking-wide font-semibold bg-orange-500 text-gray-100 w-full py-4 rounded-lg hover:bg-orange-700 transition-all duration-300 ease-in-out flex flex-row gap-2 items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <BiLogIn />
                  Sign-Up
                </Link>
              </form>
            </div>
          </div>
        </div>

        {/* Show video feed only if client-side */}
        <div className="flex-1 bg-indigo-100 flex">
          <div className="m-12 xl:m-16 w-full">
          {error && (
            <p className="bg-red-500 text-white font-roboto font-bold px-2 py-2 mb-3 rounded-2xl md:w-1/2 w-full">
              {error}
            </p>
          )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              width="800"
              height="800"
              className="rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
