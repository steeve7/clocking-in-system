"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { MdKeyboardArrowRight } from "react-icons/md";
import Link from "next/link";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("")
  const currentUser = auth.currentUser;
  const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const storage = getStorage();

  // Fetch current user's role when component mounts
  useEffect(() => {
    if (!currentUser) return;
    fetchUserRole();
  }, [currentUser]);

  async function fetchUserRole() {
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setCurrentUserRole(userDoc.data().role); // ✅ Store role in state
      } else {
        setCurrentUserRole("Employee"); // Default role
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  }


   useEffect(() => {
     if (currentUserRole) {
       fetchUsers();
     }
   }, [currentUserRole]);

  async function fetchUsers() {
    try {
      const userQuery = collection(db, "users");
      const querySnapshot = await getDocs(userQuery);
      let userData = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const lastAttendanceRecord =
          data.attendance?.[data.attendance.length - 1] || {};

        let imageUrl = data.faceImage || ""; // Use Firestore image if available

        // If no image in Firestore, try fetching from Firebase Storage
        if (!imageUrl) {
          try {
            const storageRef = ref(storage, `profile_pictures/${doc.id}`);
            imageUrl = await getDownloadURL(storageRef);
          } catch (storageError) {
            console.warn(`No profile image found for ${data.name}`);
          }
        }

        userData.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: lastAttendanceRecord?.date === today, // Active only if attendance was marked today
          lastAttendance: lastAttendanceRecord?.date || "No records",
          faceImage: imageUrl, // Store each user’s image correctly
        });
      }

       // Filter users based on role
      if (currentUserRole !== "Manager") {
        userData = userData.filter((user) => user.id === currentUser.uid);
      }

      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
    console.log("Fetching Users for Role:", currentUserRole);
  }

  async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setSuccess("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user.");
    }
  }

  if (loading)
    return (
      <p className="text-black font-work font-bold">
        Loading attendance records...
      </p>
    );

    {error && <p className="text-red-500 font-work font-bold">{error}</p>}
    {success && <p className="text-red-500 font-work font-bold"> User Deleted successfully!</p>}

  return (
    <div className="p-6">
      <div className="flex md:flex-row flex-col justify-between md:items-center items-start mb-3">
        <h1 className="font-bold text-center md:mb-0 mb-2 text-black font-avenir">
          Attendance Table
        </h1>
        <div className="flex flex-row gap-2 items-center">
          <Link
            href={"/dashboard"}
            className="font-avenir text-black font-medium"
          >
            Home
          </Link>
          <MdKeyboardArrowRight color="black" />
          <Link
            href={"/attendance"}
            className="font-avenir text-black font-medium"
          >
            Attendance Table
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-grey-300">
          <table className="min-w-full border-collapse">
            <thead className="bg-white">
              <tr className="text-left">
                <th className="p-3 text-black font-avenir font-medium">User</th>
                <th className="p-3 text-black font-avenir font-medium">
                  Email
                </th>
                <th className="p-3 text-black font-avenir font-medium">Role</th>
                <th className="p-3 text-black font-avenir font-medium">
                  Last Attendance
                </th>
                <th className="p-3 text-black font-avenir font-medium">Date</th>
                {currentUserRole && currentUserRole === "Manager" && (
                  <th className="p-3 text-black font-avenir font-medium">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border bg-white">
                  <td className="p-3 text-black font-work font-normal flex items-center">
                    {user.faceImage ? (
                      <img
                        src={user.faceImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <span className="profile-placeholder">
                        Loading Image...
                      </span>
                    )}
                    {user.name}
                  </td>
                  <td className="p-3  text-black truncate max-w-xs font-work font-normal">
                    {user.email}
                  </td>
                  <td className="p-3 text-black font-work font-normal">
                    {user.role}
                  </td>
                  <td className="text-black font-work font-normal">
                    {user.status ? "✅ Present" : "❌ Absent"}
                  </td>
                  <td className="p-3  text-black font-work font-normal">
                    {user.lastAttendance || "Never"}
                  </td>
                  {currentUserRole && currentUserRole === "Manager" && (
                    <td className="p-3 text-black font-work font-normal">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-white bg-red-500 px-3 py-1 rounded-md"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
