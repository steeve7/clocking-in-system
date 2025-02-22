"use client"; // Ensure this runs only in the client

let model = null;

// Dynamically load the model only on the client side
export async function loadModel() {
  if (typeof window === "undefined") return; // Prevent execution on the server

  console.log("Loading face detection model...");

  const tf = await import("@tensorflow/tfjs");
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
}


// Function to start the user's camera
export async function startCamera(videoElement) {
  try {
    if (typeof window === "undefined") return;
    if (!videoElement) throw new Error("Video element not found");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    console.log("Camera started successfully"); // Debugging log
  } catch (error) {
    console.error("Error accessing the camera:", error);
  }
}

// Function to detect a face from the video feed
export async function detectFace(videoElement) {
  try {
    if (typeof window === "undefined" || !videoElement) {
      console.error("Window or video element not available for face detection");
      return null;
    }

    if (!model) {
      console.error("Face model not loaded!");
      return null;
    }

    // Ensure video is ready before running detection
    if (videoElement.readyState < 2) {
      console.warn("Video not ready for face detection");
      return null;
    }

    console.log("Running face detection...");
    const faces = await model.estimateFaces(videoElement);
    console.log("Faces detected:", faces);

    if (!faces || faces.length === 0) {
      console.warn(
        "⚠️ No face detected! Make sure your face is well-lit and visible."
      );
      return null;
    }

    console.log("✅ Face detected successfully!");
    return faces[0].keypoints.map(({ x, y }) => ({ x, y }));
  } catch (error) {
    console.error("❌ Face detection error:", error);
    return null;
  }
}


// Compare two sets of facial keypoints
export function compareFaces(detectedFace, storedFace) {
  if (
    !detectedFace ||
    !storedFace ||
    detectedFace.length !== storedFace.length
  ) {
    console.warn("Face data mismatch or missing!");
    return false;
  }

  let totalDistance = 0;
  const numPoints = detectedFace.length;

  for (let i = 0; i < numPoints; i++) {
    const dx = detectedFace[i].x - storedFace[i].x;
    const dy = detectedFace[i].y - storedFace[i].y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    totalDistance += distance;
  }

  const avgDistance = totalDistance / numPoints;
  console.log("Average distance between face keypoints:", avgDistance);

  // Set a threshold for the average distance.
  // You may need to adjust this value based on your testing conditions.
  // For example, if average distance is less than 40, we consider the faces a match.
  const threshold = 60;

  return avgDistance < threshold;
}



