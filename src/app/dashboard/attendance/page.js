"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import {
  collection,
  onSnapshot,
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

  // Get user role
  useEffect(() => {
    if (currentUser) {
      fetchUserRole();
    }
  }, [currentUser]);

  async function fetchUserRole() {
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

  
  // Real-time listener for users
// useEffect(() => {
//   if (currentUserRole) {
//     const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
//       const todayDate = new Date().toISOString().split("T")[0];

//       const userData = snapshot.docs.map((docSnap) => {
//         const data = docSnap.data();
//         const attendanceRecords = Array.isArray(data.attendance)
//           ? data.attendance
//           : [];

//         const selectedRecord = attendanceRecords.find(
//           (record) => record.date === selectedDate
//         );

//         const sortedRecords = [...attendanceRecords].sort(
//           (a, b) => new Date(b.date) - new Date(a.date)
//         );
//         const latestRecord = sortedRecords[0];

//         // 🔧 Pull fullName strictly from user doc
//         const fullNameFromUser = data.fullName || data.name || "No Name";

//         // Prefer attendance name only if user doc name is missing
//         const fullName =
//           fullNameFromUser !== "No Name"
//             ? fullNameFromUser
//             : selectedRecord?.fullName ||
//               latestRecord?.fullName ||
//               "Unknown";

//         // Time and date
//         let lastAttendanceTime = "N/A";
//         if (selectedRecord && selectedRecord.time) {
//           lastAttendanceTime = selectedRecord.time;
//         } else if (latestRecord && latestRecord.time) {
//           lastAttendanceTime = latestRecord.time;
//         }
//         const lastAttendanceDate = selectedRecord?.date || latestRecord?.date || "No record";

//         const status = selectedRecord ? "✅ Present" : "❌ Absent";

//         return {
//           id: docSnap.id,
//           name: fullName,
//           email: data.email || "",
//           role: data.role || "Employee",
//           faceImage: data.faceImage || "",
//           lastAttendance: lastAttendanceDate,
//           lastAttendanceTime: lastAttendanceTime,
//           status: status,
//         };
//       });

//       // Only allow manager to see all, else show self
//       setUsers(
//         userData.filter(
//           (user) =>
//             user.id === currentUser.uid || currentUserRole === "Manager"
//         )
//       );
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }
// }, [currentUserRole, selectedDate]);

// useEffect(() => {
//   if (currentUserRole) {
//     const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
//       const userData = snapshot.docs.map((docSnap) => {
//         const data = docSnap.data();
//         const attendanceRecords = Array.isArray(data.attendance)
//           ? data.attendance
//           : [];

//         const selectedRecord = attendanceRecords.find(
//           (record) => record.date === selectedDate
//         );

//         const sortedRecords = [...attendanceRecords].sort(
//           (a, b) => new Date(b.date) - new Date(a.date)
//         );
//         const latestRecord = sortedRecords[0];

//         const fullNameFromUser = data.fullName || data.name || "No Name";

//         const fullName =
//           fullNameFromUser !== "No Name"
//             ? fullNameFromUser
//             : selectedRecord?.fullName ||
//               latestRecord?.fullName ||
//               "Unknown";

//         let lastAttendanceTime = "N/A";
//         if (selectedRecord && selectedRecord.time) {
//           lastAttendanceTime = selectedRecord.time;
//         } else if (latestRecord && latestRecord.time) {
//           lastAttendanceTime = latestRecord.time;
//         }
//         const lastAttendanceDate =
//           selectedRecord?.date || latestRecord?.date || "No record";

//         const status = selectedRecord ? "✅ Present" : "❌ Absent";

//         return {
//           id: docSnap.id,
//           name: fullName,
//           email: data.email || "",
//           role: data.role || "Employee",
//           faceImage: data.faceImage || "",
//           lastAttendance: lastAttendanceDate,
//           lastAttendanceTime: lastAttendanceTime,
//           status: status,
//         };
//       });

//       // Properly show all users for manager
//       if (currentUserRole === "Manager") {
//         setUsers(userData); // show all users
//       } else {
//         setUsers(userData.filter((user) => user.id === currentUser.uid));
//       }

//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }
// }, [currentUserRole, selectedDate]);

useEffect(() => {
  if (currentUserRole) {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userData = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const attendanceRecords = Array.isArray(data.attendance)
          ? data.attendance
          : [];

        const selectedRecord = attendanceRecords.find(
          (record) => record.date === selectedDate
        );

        const sortedRecords = [...attendanceRecords].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const latestRecord = sortedRecords[0];

        const fullNameFromUser = data.fullName || data.name || "No Name";

        const fullName =
          fullNameFromUser !== "No Name"
            ? fullNameFromUser
            : selectedRecord?.fullName ||
              latestRecord?.fullName ||
              "Unknown";

        let lastAttendanceTime = "N/A";
        let lastAttendanceDate = "No record";
        let status = "❌ Absent";

        if (currentUserRole === "Employee") {
          // Employee: only show selected date
          if (selectedRecord) {
            lastAttendanceTime = selectedRecord.time || "N/A";
            lastAttendanceDate = selectedRecord.date || "No record";
            status = "✅ Present";
          }
        } else {
          // Manager: use selected if available, fallback to latest
          if (selectedRecord) {
            lastAttendanceTime = selectedRecord.time || "N/A";
            lastAttendanceDate = selectedRecord.date || "No record";
            status = "✅ Present";
          } else if (latestRecord) {
            lastAttendanceTime = latestRecord.time || "N/A";
            lastAttendanceDate = latestRecord.date || "No record";
            status = "✅ Present";
          }
        }

        return {
          id: docSnap.id,
          name: fullName,
          email: data.email || "",
          role: data.role || "Employee",
          faceImage: data.faceImage || "",
          lastAttendance: lastAttendanceDate,
          lastAttendanceTime: lastAttendanceTime,
          status: status,
        };
      });

      if (currentUserRole === "Manager") {
        setUsers(userData);
      } else {
        setUsers(userData.filter((user) => user.id === currentUser.uid));
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }
}, [currentUserRole, selectedDate]);


  useEffect(() => {
    if (currentUser && currentUserRole === "Manager") {
      markAttendance(currentUser.uid);
    }
    if (currentUser && currentUserRole === "Employee") {
      checkAndMarkAttendance(currentUser.uid);
    }
  }, [currentUser, currentUserRole]);

  // async function markAttendance(userId) {
  //   const now = new Date();
  //   const currentTime = now.toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });
  //   const todayDate = now.toISOString().split("T")[0];

  //   try {
  //     const userRef = doc(db, "users", userId);
  //     const userDoc = await getDoc(userRef);

  //     if (userDoc.exists()) {
  //       let attendanceRecords = userDoc.data().attendance || [];

  //       const todayIndex = attendanceRecords.findIndex(
  //         (record) => record.date === todayDate
  //       );

  //       if (todayIndex === -1) {
  //         attendanceRecords.push({ date: todayDate, time: currentTime });
  //       } else if (!attendanceRecords[todayIndex].time) {
  //         attendanceRecords[todayIndex].time = currentTime;
  //       }

  //       await setDoc(
  //         userRef,
  //         { attendance: attendanceRecords },
  //         { merge: true }
  //       );
  //       setSuccess("Attendance marked successfully");
  //     }
  //   } catch (error) {
  //     console.error("Error marking attendance:", error);
  //     setError("Error marking attendance");
  //   }
  // }

  // async function markAttendance(userId) {
  //   const now = new Date();
  //   const currentTime = now.toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });
  //   const todayDate = now.toISOString().split("T")[0];

  //   try {
  //     const userRef = doc(db, "users", userId);
  //     const userDoc = await getDoc(userRef);

  //     if (userDoc.exists()) {
  //       let attendanceRecords = userDoc.data().attendance || [];
  //       const fullName = userDoc.data().fullName || "Unknown"; // get fullName

  //       const todayIndex = attendanceRecords.findIndex(
  //         (record) => record.date === todayDate
  //       );

  //       if (todayIndex === -1) {
  //         // create new record with name
  //         attendanceRecords.push({
  //           date: todayDate,
  //           time: currentTime,
  //           fullName: fullName,
  //         });
  //       } else if (!attendanceRecords[todayIndex].time) {
  //         // update time if record exists
  //         attendanceRecords[todayIndex].time = currentTime;
  //         attendanceRecords[todayIndex].fullName = fullName; // ensure name is there
  //       }

  //       await setDoc(
  //         userRef,
  //         { attendance: attendanceRecords },
  //         { merge: true }
  //       );
  //       setSuccess("Attendance marked successfully");
  //     }
  //   } catch (error) {
  //     console.error("Error marking attendance:", error);
  //     setError("Error marking attendance");
  //   }
  // }

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
      const fullName = userDoc.data().fullName || "Unknown"; // ensure fullName is captured

      const todayIndex = attendanceRecords.findIndex(
        (record) => record.date === todayDate
      );

      if (todayIndex === -1) {
        // Create new record with name and time
        attendanceRecords.push({
          date: todayDate,
          time: currentTime,
          fullName: fullName,
        });
      } else if (!attendanceRecords[todayIndex].time) {
        // Update time if record exists
        attendanceRecords[todayIndex].time = currentTime;
        attendanceRecords[todayIndex].fullName = fullName; // ensure name is there
      }

      await setDoc(
        userRef,
        { attendance: attendanceRecords },
        { merge: true }
      );
      setSuccess("Attendance marked successfully");
    }
  } catch (error) {
    console.error("Error marking attendance:", error);
    setError("Error marking attendance");
  }
}


  // async function checkAndMarkAttendance(userId) {
  //   try {
  //     const userRef = doc(db, "users", userId);
  //     const userDoc = await getDoc(userRef);

  //     if (userDoc.exists()) {
  //       let attendanceRecords = userDoc.data().attendance || [];
  //       const todayDate = new Date().toISOString().split("T")[0];
  //       const todayRecord = attendanceRecords.find(
  //         (record) => record.date === todayDate
  //       );

  //       if (!todayRecord) {
  //         await markAttendance(userId);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error checking attendance:", error);
  //     setError("Error checking attendance");
  //   }
  // }

  async function checkAndMarkAttendance(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      let attendanceRecords = userDoc.data().attendance || [];
      const todayDate = new Date().toISOString().split("T")[0];
      const todayRecord = attendanceRecords.find(
        (record) => record.date === todayDate
      );

      const fullName = userDoc.data().fullName || "Unknown";

      // If record is missing or fullName isn't present, fix it
      if (!todayRecord || !todayRecord.fullName) {
        await markAttendance(userId);
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
    // console.log("Current user role:", currentUserRole);  // Debugging log
    await deleteDoc(doc(db, "users", userId));
    setSuccess("User deleted successfully!");
  } catch (error) {
    console.error("Failed to delete user:", error);
    setError("Failed to delete user.");
  }
}

  if (loading) {
    return (
      <p className="text-black font-work font-bold">
        Loading attendance records...
      </p>
    );
  }

  return (
    <div className="w-full">
      {currentUserRole === "Employee" && (
        <div className="mb-4 flex flex-col justify-start items-start">
          <label
            htmlFor="attendanceDate"
            className="font-bold text-black font-avenir mb-3"
          >
            Check attendance
          </label>
          <input
            type="date"
            id="attendanceDate"
            className="border p-2 rounded-md cursor-pointer"
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
            href="/dashboard"
            className="font-avenir text-black font-medium"
          >
            Home
          </Link>
          <MdKeyboardArrowRight color="black" />
          <Link
            href="/attendance"
            className="font-avenir text-black font-medium"
          >
            Attendance Table
          </Link>
        </div>
      </div>

      {error && <p className="text-red-500 font-work font-bold">{error}</p>}
      {success && (
        <p className="text-green-600 font-work font-bold">{success}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-grey-300">
        <table className="min-w-full border-collapse">
          <thead className="bg-white">
            <tr className="text-left">
              <th className="p-3 text-black font-avenir font-medium">Full Name</th>
              <th className="p-3 text-black font-avenir font-medium">Email</th>
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
    </div>
  );
}
