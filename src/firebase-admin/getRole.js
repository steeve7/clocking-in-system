const admin = require("firebase-admin");

const serviceAccount = require("./smart-clocking-system-firebase-adminsdk-xxxx.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function getUserRole(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    console.log("Custom Claims:", user.customClaims);
  } catch (error) {
    console.error("Error fetching user claims:", error);
  }
}

// Replace with your user's UID
getUserRole("oaqybCFgA8Qe7VfeLz01hKMvsMM2");
