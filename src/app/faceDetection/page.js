"use client";
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { auth, db, storage } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function FaceDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await loadModels();
      await startCamera();
    };
    init();
    return stopCamera; // cleanup on unmount
  }, []);

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onplay = () => {
          detectionIntervalRef.current = setInterval(async () => {
            if (!videoRef.current) return;

            const detections = await faceapi
              .detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
              )
              .withFaceLandmarks()
              .withFaceDescriptors();

            drawFaceBoxes(detections);
          }, 100);
        };
      }
    } catch (err) {
      setError("Please allow camera access.");
    }
  };

  const stopCamera = () => {
    // Stop the video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    // Clear detection loop
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    // Clear the canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const captureFace = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const user = auth.currentUser;
    if (!user || !videoRef.current) {
      setError("Authentication or camera error.");
      setLoading(false);
      return;
    }

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setError("No face detected. Try again.");
      setLoading(false);
      return;
    }

    drawFaceBoxes([detection]);

    const descriptorArray = Array.from(new Float32Array(detection.descriptor));
    const currentUserRef = doc(db, "users", user.uid);
    const currentUserSnap = await getDoc(currentUserRef);

    if (!currentUserSnap.exists()) {
      setError("User not found in the database.");
      setLoading(false);
      return;
    }

    const currentUserData = currentUserSnap.data();

    // 1. Face already stored for this user
    if (currentUserData.faceDescriptor) {
      const stored = new Float32Array(currentUserData.faceDescriptor);
      const distance = faceapi.euclideanDistance(stored, detection.descriptor);

      if (distance < 0.5) {
        setSuccess("Face matched. Access granted.");
        stopCamera();
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setError("Face does not belong to this account.");
      }

      setLoading(false);
      return;
    }

    // 2. Face is new, check others
    const allUsersSnap = await getDocs(collection(db, "users"));
    for (const docSnap of allUsersSnap.docs) {
      if (docSnap.id === user.uid) continue;

      const data = docSnap.data();
      if (data.faceDescriptor) {
        const existingDescriptor = new Float32Array(data.faceDescriptor);
        const distance = faceapi.euclideanDistance(
          existingDescriptor,
          detection.descriptor
        );

        if (distance < 0.5) {
          setError("This face is already registered with another account.");
          setLoading(false);
          return;
        }
      }
    }

    // 3. Save this new face to current user
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

    const imageRef = ref(storage, `profile_pictures/${user.uid}`);
    await uploadBytes(imageRef, blob);
    const imageUrl = await getDownloadURL(imageRef);

    await updateDoc(currentUserRef, {
      faceDescriptor: descriptorArray,
      faceImage: imageUrl,
    });

    setSuccess("Face registered successfully.");
    stopCamera();
    setTimeout(() => router.push("/dashboard"), 1500);
    setLoading(false);
  };

  const drawFaceBoxes = (detections) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((det) => {
      const { x, y, width, height } = det.detection.box;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
    });
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold mb-4">Face Detection</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500 text-[18px]">{success}</p>}
      <div className="relative">
        <video ref={videoRef} autoPlay muted className="rounded-md" />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
        />
      </div>
      <button
        onClick={captureFace}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        disabled={loading}
      >
        {loading ? "Processing..." : "Capture Face"}
      </button>
    </div>
  );
}
