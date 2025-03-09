"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as faceapi from "face-api.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { BiLogIn } from "react-icons/bi";
import Link from "next/link";

export default function Login() {
const router = useRouter();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [successMessage, setSuccessMessage] = useState("");
const videoRef = useRef(null);

useEffect(() => {
  startCamera();
  // Redirect to dashboard if already logged in
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      router.push("/dashboard");
    }
  });
  return () => unsubscribe();
}, [router]);

async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  ]);
}

// async function startCamera() {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     if (videoRef.current) {
//       videoRef.current.srcObject = stream;
//     }
//   } catch (error) {
//     setError("Camera access denied. Please grant permission.");
//   }
// }

 const startCamera = async () => {
   if (videoRef.current?.srcObject) return; // Avoid re-starting
   try {
     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
     videoRef.current.srcObject = stream;
   } catch (error) {
     setError("Error accessing camera. Please grant permission.");
     console.error("Camera access error:", error);
   }
 };

function stopCamera() {
  if (videoRef.current?.srcObject) {
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  }
}

async function handleFaceLogin() {
  setError("");
  setLoading(true);

  if (!videoRef.current) {
    setError("No video feed detected.");
    setLoading(false);
    return;
  }

  await loadModels();

  // Detect face from camera feed
  const faceDetections = await faceapi
    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!faceDetections) {
    setError("No face detected. Try again.");
    setLoading(false);
    return;
  }

  // Fetch user details from Firestore
  const userQuery = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(userQuery);

  if (querySnapshot.empty) {
    setError("User not found. Please sign up.");
    setLoading(false);
    return;
  }

  const userData = querySnapshot.docs[0].data();
  const storedFaceDescriptor = new Float32Array(userData.faceDescriptor);

  // Compare detected face with stored face
  const distance = faceapi.euclideanDistance(
    faceDetections.descriptor,
    storedFaceDescriptor
  );

  if (distance > 0.6) {
    setError("Face does not match. Access denied.");
    setLoading(false);
    return;
  }

  // Authenticate with Firebase
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    setSuccessMessage("Sign-in Successfully!")
    stopCamera();
    router.push("/dashboard");
  } catch (err) {
    setError("Invalid email or password.");
  }

  setLoading(false);
}


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex lg:flex-row flex-col justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-bold text-center font-roboto px-10">
              Sign-in with Face Recognition
            </h1>
            <div className="w-full flex-1 mt-8">
              <div className="mx-auto max-w-xs">
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
                  onClick={handleFaceLogin}
                  disabled={loading}
                  className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex flex-row gap-2 items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <BiLogIn />
                  {loading ? "Processing..." : "Login with Face"}
                </button>
                <div className="flex flex-col justify-center items-center mt-5 w-full">
                  <p>Don't have an account?</p>
                  <Link
                    href={"/SignUp"}
                    className="mt-5 tracking-wide font-semibold text-blue-200 transition-all duration-300 ease-in-out"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show video feed only if client-side */}
        <div className="flex-1 bg-indigo-100 flex">
          <div className="m-12 xl:m-16 w-full">
            {error && (
              <p className="text-red-500 font-roboto font-bold mb-3 w-full">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="text-green-500 font-roboto font-bold w-full">
                {successMessage}
              </p>
            )}
            <video
              ref={videoRef}
              autoPlay
              muted
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
