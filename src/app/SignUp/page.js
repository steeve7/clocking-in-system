"use client";

import { useState, useRef, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { registerUserFace } from "@/lib/firebase";
import { detectFace, loadModel, startCamera } from "@/lib/faceRecognition";
import { BiLogIn } from "react-icons/bi";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const videoRef = useRef(null);
  const router = useRouter();
  const [error, setError] = useState("");

  // Redirect already logged-in users to /Dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/Dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (videoRef.current) {
      loadModel();
      startCamera(videoRef.current);
    }
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("Look at the camera...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (!videoRef.current || !videoRef.current.srcObject) {
        setError("Camera is not active. Please allow access and try again.");
        return;
      }

      const faceData = await detectFace(videoRef.current);
      if (!faceData) {
        setError("Face not detected! Try again.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await registerUserFace(user.uid, faceData);

      setError("Sign-up successful! Face detected!");
      // Stop the camera before redirecting
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop()); // Stop all video tracks
        videoRef.current.srcObject = null; // Clear the video source
      }
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
              Sign-Up with Face Recognition
            </h1>
            <div className="w-full flex-1 mt-8">
              <form className="mx-auto max-w-xs" onSubmit={handleSignUp}>
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
                  Sign-Up
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-indigo-100 flex">
          <div className="m-12 xl:m-16">
            {error && (
              <p className="bg-red-500 text-white font-roboto font-bold px-2 py-2 mb-5 rounded-2xl md:w-1/2 w-full">
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
