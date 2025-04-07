"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { MdKeyboardArrowRight } from "react-icons/md";
import Link from "next/link";

export default function Attendance() {
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [currentUserRole, setCurrentUserRole] = useState(null);
const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0]
);

const currentUser = auth.currentUser;
const storage = getStorage();

// Get current user role
useEffect(() => {
  if (currentUser) {
    fetchUserRole();
  }
}, [currentUser]);

async function fetchUserRole() {
  if (!currentUser) return;

  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists()) {
      setCurrentUserRole(userDoc.data().role);
    } else {
      setCurrentUserRole("Employee");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    setError("Error fetching user role");
  }
}

// Fetch users when role or selectedDate changes
useEffect(() => {
  if (currentUserRole) {
    fetchUsers();
  }
}, [currentUserRole, selectedDate]);

// Fetch users with role-based attendance logic
async function fetchUsers() {
  setLoading(true);
  try {
    if (!currentUser || !currentUserRole) return;

    const userQuery = collection(db, "users");
    const querySnapshot = await getDocs(userQuery);
    let userData = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const attendanceRecords = Array.isArray(data.attendance) ? data.attendance : [];

      const todayDate = new Date().toISOString().split("T")[0];
      let status = "";
      let lastAttendanceDate = "No record";
      let lastAttendanceTime = "N/A";

      const isViewingToday = selectedDate === todayDate;
      const isSelf = docSnap.id === currentUser.uid;

    // Use selected date if not today and the user is the employee
    if (!isViewingToday && currentUserRole === "Employee" && isSelf) {
      const selectedRecord = attendanceRecords.find(record => record.date === selectedDate);
      status = selectedRecord ? "✅ Present" : "❌ Absent";
      lastAttendanceDate = selectedRecord?.date || "No record";
      lastAttendanceTime = selectedRecord?.time || "N/A";
    } else {
      // Use today’s record
      const todayRecord = attendanceRecords.find(record => record.date === todayDate);
      const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestRecord = sortedRecords[0];

      status = todayRecord ? "✅ Present" : "❌ Absent";
      lastAttendanceDate = latestRecord?.date || "No record";
      lastAttendanceTime = todayRecord?.time || "N/A";
    }


      // Load face image if missing
      let imageUrl = data.faceImage || "";
      if (!imageUrl) {
        try {
          const storageRef = ref(storage, `profile_pictures/${docSnap.id}`);
          imageUrl = await getDownloadURL(storageRef);
        } catch (e) {
          console.warn(`No profile image found for ${data.name}`);
        }
      }

      const userEntry = {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        role: data.role,
        lastAttendance: lastAttendanceDate,
        lastAttendanceTime: lastAttendanceTime,
        faceImage: imageUrl,
        status: status,
      };

      // Show all to manager or just self to employee
      if (docSnap.id === currentUser.uid || currentUserRole === "Manager") {
        userData.push(userEntry);
      }
    }

    setUsers(userData);
  } catch (error) {
    console.error("Error fetching users:", error);
    setError("Error fetching users");
  } finally {
    setLoading(false);
  }
}

// Manager auto-mark attendance on login
useEffect(() => {
  if (currentUser && currentUserRole === "Manager") {
    markAttendance(currentUser.uid);
  }
}, [currentUser, currentUserRole]);

// Employee attendance check on login
useEffect(() => {
  if (currentUser && currentUserRole === "Employee") {
    checkAndMarkAttendance(currentUser.uid);
  }
}, [currentUser, currentUserRole]);

// Attendance logic for both roles
async function markAttendance(userId) {
  const now = new Date();
  const currentTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const todayDate = now.toISOString().split("T")[0];

  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      let attendanceRecords = userDoc.data().attendance || [];

      const todayIndex = attendanceRecords.findIndex(record => record.date === todayDate);

      if (todayIndex === -1) {
        attendanceRecords.push({ date: todayDate, time: currentTime });
      } else {
        // Ensure we don't overwrite first check-in time
        if (!attendanceRecords[todayIndex].time) {
          attendanceRecords[todayIndex].time = currentTime;
        }
      }

      await setDoc(userRef, { attendance: attendanceRecords }, { merge: true });
      setSuccess("Attendance marked successfully");
      fetchUsers(); // Refresh
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    setError("Error marking attendance");
  }
}

// Check and mark for employee if not already marked
async function checkAndMarkAttendance(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      let attendanceRecords = userDoc.data().attendance || [];
      const todayDate = new Date().toISOString().split("T")[0];
      const todayRecord = attendanceRecords.find(record => record.date === todayDate);

      if (!todayRecord) {
        console.log("User has NOT marked attendance today. Marking now...");
        await markAttendance(userId);
      } else {
        console.log("User has already marked attendance today:", todayRecord);
        fetchUsers();
      }
    }
  } catch (error) {
    console.error("Error checking attendance:", error);
    setError("Error checking attendance");
  }
}

   async function deleteUser(userId) {
     if (!confirm("Are you sure you want to delete this user?")) return;

     try {
       await deleteDoc(doc(db, "users", userId));
       setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
       setSuccess("User deleted successfully!");
     } catch (error) {
       setError("Error deleting user:", error);
       setError("Failed to delete user.");
     }
   }

  if (loading)
    return (
      <p className="text-black font-work font-bold">
        Loading attendance records...
      </p>
    );

  return (
    <div className="w-full">
      {/* Date Picker for Employees */}
      {currentUserRole === "Employee" && (
        <div className="mb-4 flex flex-col justify-start items-start ">
          <label
            htmlFor="attendanceDate"
            className="font-bold text-black font-avenir mb-3"
          >
            Check attendance
          </label>
          <input
            type="date"
            id="attendanceDate"
            className="border p-2 rounded-md"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      )}
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
          {error && <p className="text-red-500 font-work font-bold">{error}</p>}
          {success && (
            <p className="text-red-500 font-work font-bold">{success}</p>
          )}
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
                <th className="p-3 text-black font-avenir font-medium">Time</th>
                {currentUserRole === "Manager" && (
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
                      "No Image"
                    )}
                    {user.name}
                  </td>
                  <td className="p-3 text-black font-work font-normal">
                    {user.email}
                  </td>
                  <td className="p-3 text-black font-work font-normal">
                    {user.role}
                  </td>
                  <td className="p-3 text-black font-work font-normal">
                    {user.status}
                  </td>
                  <td className="p-3 text-black font-work font-normal">
                    {user.lastAttendance}
                  </td>
                  <td className="p-3 text-black font-work font-normal">
                    {user.lastAttendanceTime}
                  </td>
                  {currentUserRole === "Manager" && (
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