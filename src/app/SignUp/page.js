"use client";
import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { db, auth, storage } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { BiLogIn } from "react-icons/bi";
import { useRouter } from "next/navigation";
import emailjs from "@emailjs/browser";


export default function SignUp() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    location: "",
    signupDate: new Date().toISOString().split("T")[0], // Default to today's date
    
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelsLoaded = useRef(false);
  const detectionInterval = useRef(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const router = useRouter();
  emailjs.init("abh7mLjaQox8Fuece");

  useEffect(() => {
    loadModels();
    startCamera();

    const handleBackButton = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
      stopCamera(); // Cleanup camera when component unmounts
    };
  }, []);

 useEffect(() => {
   if (!videoRef.current) return;

   const checkVideoReady = () => {
     if (videoRef.current.readyState >= 2) {
       console.log("Video is ready, starting face detection...");
       const canvas = canvasRef.current;
       if (!canvas) return;

       faceapi.matchDimensions(canvas, { width: 800, height: 800 });

       detectionInterval.current = setInterval(async () => {
         if (!videoRef.current) return;
         try {
           const detections = await faceapi
             .detectAllFaces(
               videoRef.current,
               new faceapi.TinyFaceDetectorOptions()
             )
             .withFaceLandmarks()
             .withFaceDescriptors();

           const resizedDetections = faceapi.resizeResults(detections, {
             width: 800,
             height: 800,
           });

           const ctx = canvas.getContext("2d");
           ctx.clearRect(0, 0, canvas.width, canvas.height);
           faceapi.draw.drawDetections(canvas, resizedDetections);
         } catch (error) {
           console.error("Face detection error:", error);
         }
       }, 500);
     } else {
       setTimeout(checkVideoReady, 500);
     }
   };

   checkVideoReady();

   return () => clearInterval(detectionInterval.current); // Cleanup interval on unmount
 }, []);

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


  
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };


  // Load face-api.js models
  const loadModels = async () => {
    if (!modelsLoaded.current) {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      modelsLoaded.current = true;
      console.log("Face API models loaded.");
    }
  };

  // Handle form input change 
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Capture face and store user data
const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // Check if models are loaded before proceeding
    if (!modelsLoaded.current) {
      setError("Face detection models are still loading. Please wait.");
      setLoading(false);
      return;
    }

    // Validate user input
    if (
      !userData.name ||
      !userData.email ||
      !userData.password ||
      !userData.role ||
      !userData.location ||
      !userData.signupDate
    ) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (userData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    // Check if camera is accessible
    if (!videoRef.current) {
      setError("Camera not accessible.");
      setLoading(false);
      return;
    }

    // Detect face before proceeding with signup
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      setError("No face detected. Try again.");
      setLoading(false);
      return;
    }

    const newFaceDescriptor = Array.from(detections.descriptor);

    // Check if face is already registered before creating Firebase account
    const usersSnapshot = await getDocs(collection(db, "users"));
    for (const doc of usersSnapshot.docs) {
      const storedDescriptor = doc.data().faceDescriptor;
      if (storedDescriptor && storedDescriptor.length > 0) {
        const distance = faceapi.euclideanDistance(
          newFaceDescriptor,
          storedDescriptor
        );
        if (distance < 0.5) {
          setError("This face is already registered. Please login!");
          setLoading(false);
          return;
        }
      }
    }

    // If face is unique, proceed with Firebase signup
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email.trim(),
      userData.password
    );
    const user = userCredential.user;

    // Update user profile with name
    await updateProfile(user, { displayName: userData.name.trim() });

    // Capture Face Image
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert Image to Blob
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    // Upload Image to Firebase Storage
    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(storageRef);

    

    // Store user details in Firestore

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: userData.name.trim(),
      email: user.email,
      role: userData.role,
      location: userData.location,
      signupDate: new Date().toISOString(),
      faceDescriptor: newFaceDescriptor.length ? newFaceDescriptor : null,
      faceImage: imageUrl,
      attendance: [
        {
          date: new Date().toISOString().split("T")[0], // Store today’s date
          status: "Active",
          timestamp: new Date().toISOString(), // Capture signup time
        },
      ],
      createdAt: serverTimestamp(), // ✅ Firestore allows serverTimestamp() here
    });

    console.log("User successfully stored!");
    setSuccessMessage("Signup successful!");

    // Send Email Notification**
    const templateParams = {
      to_email: userData.email.trim(), //  Send email to the user who signed up
      name: userData.name,
      role: userData.role,
      location: userData.location,
      signupDate: new Date().toISOString().split("T")[0],
    };

    emailjs
      .send(
        "service_sm5r8fj", // Your actual Service ID
        "template_x1l88yh", // Your actual Template ID
        templateParams, // Pass the correct object here
        "abh7mLjaQox8Fuece" // Your Public Key
      )
      .then((response) => {
        console.log(" Email sent successfully to:", userData.email);
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    //  Fetch role from Firestore immediately after signup**
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const fetchedRole = userDoc.data().role;
      console.log("Fetched Role After Signup:", fetchedRole);
      setCurrentUserRole(fetchedRole); // ✅ set global state
    } else {
      console.log("User role not found in Firestore.");
    }

    console.log("User UID:", user.uid);
    console.log("Current User Role:", currentUserRole);

    // Clear input fields
    setUserData({
      name: "",
      email: "",
      password: "",
      role: "",
      location: "",
      signupDate: new Date().toISOString().split("T")[0],
    });

    // Stop camera before redirecting
    stopCamera();

    // Redirect to Dashboard
    router.push("/dashboard");
  } catch (error) {
    console.error("Signup error:", error);
    setError(`Error adding user: ${error.message}`);
  }

  setLoading(false);
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
              <form className="mx-auto max-w-xs" onSubmit={handleSignup}>
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                />
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                />
                <div className="flex flex-row items-center gap-4">
                  <input
                    className="md:w-[50%] w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    value={userData.password}
                    placeholder="Password"
                    required
                  />
                  <select
                    name="role"
                    onChange={handleChange}
                    value={userData.role}
                    style={{
                      WebkitAppearance: "none", // Remove arrow in Safari & Chrome
                      MozAppearance: "none", // Remove arrow in Firefox
                      appearance: "none", // Remove arrow in modern browsers
                    }}
                    className="md:w-[50%] w-full px-8 py-4 pr-5 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  >
                    <option value="Select">Select</option>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div className="flex md:flex-row flex-col items-center gap-2">
                  <input
                    className="md:w-[50%] w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    type="text"
                    name="location"
                    onChange={handleChange}
                    value={userData.location}
                    placeholder="Location"
                    required
                  />

                  <input
                    className="md:w-[50%] w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    type="date"
                    name="signupDate"
                    onChange={handleChange}
                    value={userData.signupDate}
                    placeholder="Date"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex flex-row gap-2 items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <BiLogIn />
                  {loading ? "Processing..." : "Sign Up"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-indigo-100 flex">
          <div className="m-12 xl:m-16">
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
              playsInline
              width="800"
              height="800"
              className="rounded-2xl"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
