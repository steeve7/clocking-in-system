"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FaRegCalendarXmark } from "react-icons/fa6";
import { VscFolderActive } from "react-icons/vsc";
import { ref, getDownloadURL, getStorage } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function Analysis() {
   const router = useRouter();
  const [users, setUsers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({
    presentUsers: [],
    absentUsers: [],
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [role, setRole] = useState("");
  const storage = getStorage();

useEffect(() => {
  async function fetchUserRole() {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const fetchedRole = userDoc.data().role.toLowerCase(); //  Normalize to lowercase
        console.log("Fetched Role:", fetchedRole); // Debugging log
        setRole(fetchedRole);

        if (fetchedRole !== "manager") {
          router.push("/dashboard"); // Redirect non-managers
        }
      }
    }
  }
  fetchUserRole();
}, [router]);


  useEffect(() => {
    if (role === "manager") {
      fetchUsers();
    }
  }, [role]);

 async function fetchUsers() {
   try {
     const userQuery = collection(db, "users");
     const querySnapshot = await getDocs(userQuery);
     let userData = [];

     for (const docSnap of querySnapshot.docs) {
       const data = docSnap.data();
       let imageUrl = data.faceImage || ""; // Default to stored face image

       if (!imageUrl) {
         try {
           const storageRef = ref(storage, `profile_pictures/${docSnap.id}`);
           imageUrl = await getDownloadURL(storageRef); // Await inside async function
         } catch (storageError) {
           console.warn(`No profile image found for ${data.name}`);
           imageUrl = ""; // Handle missing images gracefully
         }
       }

       userData.push({
         id: docSnap.id,
         name: data.name,
         email: data.email,
         role: data.role,
         attendance: data.attendance || [],
         faceImage: imageUrl, // Add image URL to user data
       });
     }

     setUsers(userData);
   } catch (error) {
     console.error("Error fetching users:", error);
   }
 }


  function getAttendanceForDate(date) {
    let presentUsers = [];
    let absentUsers = [];

    users?.forEach((user) => {
      const wasPresent = user.attendance?.some(
        (record) => record.date === date
      );
      if (wasPresent) {
        presentUsers.push(user);
      } else {
        absentUsers.push(user);
      }
    });

    return { presentUsers, absentUsers };
  }

  useEffect(() => {
    if (users.length > 0) {
      const attendance = getAttendanceForDate(selectedDate);
      setAttendanceRecords(attendance);
    }
  }, [users, selectedDate]);

  if (role !== "manager") {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex md:flex-row flex-col justify-between md:items-center items-start mb-3">
        <h1 className="font-bold text-center md:mb-0 mb-2 text-black font-avenir">
          Attendance Analysis
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
            href={"/analysis"}
            className="font-avenir text-black font-medium"
          >
            Attendance Analysis
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 grid-cols-1 gap-4 text-center">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-Euclid font-bold text-black flex flex-row gap-2 items-center justify-center">
            <FaUser /> Total Users
          </h2>
          <p className="text-xl text-black font-normal font-Poppins">
            {users.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-Euclid font-bold text-black flex flex-row gap-2 items-center justify-center">
            <VscFolderActive /> Active Users
          </h2>
          <p className="text-xl text-black font-normal font-Poppins">
            {attendanceRecords.presentUsers?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <h2 className="text-lg font-bold font-Euclid text-black flex flex-row gap-2 items-center justify-center">
            <FaRegCalendarXmark /> Inactive Users
          </h2>
          <p className="text-xl text-black font-normal font-Poppins">
            {attendanceRecords.absentUsers?.length || 0}
          </p>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex flex-col items-start my-10">
        <label className="text-black font-medium font-Euclid">
          Select Date:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded-md mt-5 shadow-md font-Poppins font-normal"
        />
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto rounded-2xl border border-grey-300">
        <table className="min-w-full border-collapse rounded-2xl shadow-md">
        <thead className="bg-white">
          <tr className="text-left border">
            <th className="p-3 text-black font-avenir font-medium">User</th>
            <th className="p-3 text-black font-avenir font-medium">Email</th>
            <th className="p-3 text-black font-avenir font-medium">Status</th>
            <th className="p-3 text-black font-avenir font-medium">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isPresent = attendanceRecords.presentUsers.some(
              (u) => u.id === user.id
            );
            return (
              <tr key={user.id} className=" bg-white">
                <td className="p-3 text-black font-work font-normal flex items-center">
                  {user.faceImage ? (
                    <img
                      src={user.faceImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <span className="profile-placeholder font-normal font-work mr-2">
                      No Image{" "}
                    </span>
                  )}
                  {user.name}
                </td>
                <td className="p-3  text-black truncate max-w-xs font-work font-normal">
                  {user.email}
                </td>
                <td
                  className={`p-3 font-normal font-work ${
                    isPresent ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPresent ? "Present" : "Absent"}
                </td>
                <td className="p-3 text-black font-normal font-work">
                  {user.role}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      
    </div>
  );
}
