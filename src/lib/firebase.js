
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
