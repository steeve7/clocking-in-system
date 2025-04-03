"use client";
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { auth, db, storage } from "@/lib/firebase";
import { doc, updateDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function FaceDetection() {
const videoRef = useRef(null);
const canvasRef = useRef(null);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [loading, setLoading] = useState(false);
const router = useRouter();

useEffect(() => {
  loadModels();
  startCamera();
}, []);

const loadModels = async () => {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  ]);
  // console.log(" Face API models loaded.");
};

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  } catch (error) {
    // console.error(" Camera access error:", error);
    setError("Please allow camera access.");
  }
};

const stopCamera = () => {
  if (videoRef.current && videoRef.current.srcObject) {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
  }
};

const captureFace = async () => {
  setLoading(true);
  setError("");

  if (!videoRef.current || !auth.currentUser) {
    setError("Camera or authentication error.");
    setLoading(false);
    return;
  }

  // Detect face
  const detection = await faceapi
    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    setError("No face detected. Try again.");
    setLoading(false);
    return;
  }

  setSuccess("Face detected!");

  // Draw a square around the face
  drawFaceBox(detection);

  // Convert face descriptor to array
  const faceDescriptor = Array.from(detection.descriptor);

  // Get current user
  const user = auth.currentUser;
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    setError("User data not found.");
    setLoading(false);
    return;
  }

  const { role } = userDoc.data();

  // Check if the face is already registered to a different user role
  const usersCollection = collection(db, "users");
  const querySnapshot = await getDocs(usersCollection);

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    if (data.faceDescriptor) {
      const existingFaceDescriptor = new Float32Array(data.faceDescriptor);
      const distance = faceapi.euclideanDistance(
        existingFaceDescriptor,
        new Float32Array(faceDescriptor)
      );

      if (distance < 0.5) {
        // Check if face belongs to the current user
        if (doc.id !== user.uid) {
          setError(
            "Face does not belong to this account. Please log in with the correct account."
          );
          setLoading(false);
          return;
        }

        // Face matches the correct account
          setTimeout(() => {
            setSuccess("Face registered successfully!");
          }, 1000);
        stopCamera();
        setTimeout(() => router.push("/dashboard"), 1500);
        setLoading(false);
        return;
      }
    }
  }

  // Capture face image
  const canvas = document.createElement("canvas");
  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

  // Convert to Blob
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg")
  );

  // Upload face image
  const storageRef = ref(storage, `profile_pictures/${user.uid}`);
  await uploadBytes(storageRef, blob);
  const imageUrl = await getDownloadURL(storageRef);

  // console.log("Face image uploaded:", imageUrl);

  // Update Firestore with face data
  await updateDoc(userRef, {
    faceDescriptor,
    faceImage: imageUrl,
  });

  setTimeout(()=> {
    setSuccess("Face registered successfully!");
  }, 1000)
  // If face is not found, register it
  

  // console.log(" Face data stored in Firestore!");

  stopCamera(); // Turn off camera
  setTimeout(() => router.push("/dashboard"), 1500);
  setLoading(false);
};

// Function to draw a square around the detected face
const drawFaceBox = (detection) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  if (!canvas || !ctx) return;

  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Get face box coordinates
  const { x, y, width, height } = detection.detection.box;

  // Draw square around face
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);
};


  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold mb-4">Face Detection</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-orange-500 text-[20px]">{success}</p>}
      <video ref={videoRef} autoPlay className="border rounded-lg mb-4" />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button
        onClick={captureFace}
        className="bg-blue-500 text-white py-2 px-4 rounded-md"
        disabled={loading}
      >
        {loading ? "Capturing..." : "Capture Face"}
      </button>
    </div>
  );
}