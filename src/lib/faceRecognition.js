"use client"; // Ensure this runs only in the client

import { FaceMesh } from "@mediapipe/face_mesh";
import * as tf from "@tensorflow/tfjs"; // Import TensorFlow globally for consistency
let model = null; // Store the model instance globally

// Dynamically load the model only on the client side

export async function loadModel() {
  if (typeof window === "undefined") return null; // Prevent execution on the server

  console.log("Loading face detection model...");

  const faceLandmarksDetection = await import(
    "@tensorflow-models/face-landmarks-detection"
  );

  if (!model) {
    model = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      { runtime: "tfjs" }
    );
    console.log("Face detection model loaded successfully!");
  }
``
  return model;
}

// Function to start the user's camera
export async function startCamera(videoElement) {
  try {
    if (typeof window === "undefined") return;
    if (!videoElement) throw new Error("Video element not found");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    console.log("Camera started successfully");
  } catch (error) {
    console.error("Error accessing the camera:", error);
  }
}

// Function to detect a face from the video feed
export async function detectFace(videoElement) {
  if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
    console.error("Invalid video element:", videoElement);
    return null;
  }

  if (videoElement.readyState < 2) {
    console.error("Video frame not ready yet.");
    return null;
  }

  try {
    // Load the pre-trained face recognition model
    const model = await tf.loadGraphModel("path/to/your/facemodel");

    // Create a canvas to capture the video frame
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert the image to a tensor
    const imageTensor = tf.browser.fromPixels(canvas).toFloat().expandDims(0);

    // Get face embeddings from the model
    const faceEmbedding = model.predict(imageTensor);

    // Convert tensor to Float32Array
    const embeddingArray = faceEmbedding.dataSync();
    faceEmbedding.dispose(); // Free memory after extracting data
    imageTensor.dispose(); // Dispose input tensor

    if (!embeddingArray || embeddingArray.length === 0) {
      console.error("Failed to extract face embeddings.");
      return null;
    }

    console.log("Extracted Float32Array:", embeddingArray);

    // 🔹 Store only a subset of the embedding data to reduce storage size
    const compressedEmbedding = embeddingArray.slice(0, 100); // Take only first 100 values

    // 🔹 Convert to Base64 for storage
    const base64Embedding = btoa(
      String.fromCharCode(
        ...new Uint8Array(new Float32Array(compressedEmbedding).buffer)
      )
    );

    console.log("Flattened and compressed face data:", base64Embedding);

    return base64Embedding;
  } catch (error) {
    console.error("Error detecting face:", error);
    return null;
  }
}




// Compare two sets of facial keypoints
export function compareFaces(detectedEmbedding, storedEmbedding) {
  if (!detectedEmbedding || !storedEmbedding) {
    console.error("Invalid embeddings provided for comparison.");
    return null;
  }

  const detectedTensor = tf.tensor(detectedEmbedding);
  const storedTensor = tf.tensor(storedEmbedding);

  const similarity = tf.losses.cosineDistance(detectedTensor, storedTensor, 0);
  detectedTensor.dispose();
  storedTensor.dispose();

  return similarity.dataSync()[0];
}
