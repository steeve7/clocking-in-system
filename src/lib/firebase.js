
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCV6FhGIt6gcgCrcqz11dB5DflgexPrOJ8",
  authDomain: "smart-clocking-system.firebaseapp.com",
  projectId: "smart-clocking-system",
  storageBucket: "smart-clocking-system.firebasestorage.app",
  messagingSenderId: "789575873765",
  appId: "1:789575873765:web:f454799a3f1f9f1374d00c",
  measurementId: "G-MTR6EQ8R2R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

// ---------------------------
// Firestore Functions for Face Recognition
// -----

// Save face data during sign-up
// export async function registerUserFace(userId, faceData) {
//   try {
//     const userRef = doc(db, "users", userId);
//     await setDoc(userRef, { faceData });
//     console.log("Face data stored successfully");
//   } catch (error) {
//     console.error("Error storing face data:", error);
//   }
// }

// Get stored face data for authentication
// export async function getUserFaceData(userId) {
//   try {
//     const userRef = doc(db, "users", userId);
//     const userDoc = await getDoc(userRef);
//     if (userDoc.exists()) {
//       return userDoc.data().faceData;
//     } else {
//       console.log("User not found");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching face data:", error);
//     return null;
//   }
// }


//🔹 Explanation:

//registerUserFace(): Stores the detected facial keypoints in Firestore.
//getUserFaceData(): Retrieves the stored face data for authentication.

// export const storeUserFaceEmbedding = async (userId, faceEmbedding) => {
//   try {
//     const userRef = doc(collection(db, "users"), userId);
//     await setDoc(userRef, { faceEmbedding });
//     console.log("Face embeddings stored successfully.");
//   } catch (error) {
//     console.error("Error storing face embeddings:", error);
//   }
// }

{/*export const getUserFaceEmbedding = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().faceEmbedding;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error retrieving face embeddings:", error);
    return null;
  }
};*/}