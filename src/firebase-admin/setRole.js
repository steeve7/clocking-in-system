require("dotenv").config();
console.log(
  "GOOGLE_APPLICATION_CREDENTIALS:",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);

const admin = require("firebase-admin");

// Load service account key file (Ensure the correct filename)
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setManagerRole(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { role: "manager" });
    console.log(` Manager role assigned to ${uid}`);
  } catch (error) {
    console.error(" Error assigning role:", error);
  }
}

// Replace with the actual Firebase UID of the user you want to make a manager
const userId = "oaqybCFgA8Qe7VfeLz01hKMvsMM2"; // Your user's UID

// Execute the function properly
setManagerRole(userId);
