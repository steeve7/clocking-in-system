"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { MdKeyboardArrowRight } from "react-icons/md";
import Link from "next/link";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;
  const [check, setCheck] = useState(false)
  const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

  useEffect(() => {
    if (!currentUser) return;
    fetchUsers();
  }, [currentUser]);

  async function fetchUsers() {
    try {
      const userQuery = collection(db, "users");
      const querySnapshot = await getDocs(userQuery);
      const userData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userData.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.lastAttendance === today, // Active only if attendance was marked today
          lastAttendance: data.lastAttendance || "",
        });
      });

      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAttendance(userId) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        lastAttendance: today,
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: true, lastAttendance: today } : user
        )
      );
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  }

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
                <th className="p-3 text-black font-avenir font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border bg-white">
                  <td className="p-3 text-black font-work font-normal">
                    {user.name}
                  </td>
                  <td className="p-3  text-black truncate max-w-xs font-work font-normal">
                    {user.email}
                  </td>
                  <td className="p-3 text-black font-work font-normal">
                    {user.role}
                  </td>
                  <td className="p-3  text-black font-work font-normal">
                    {user.lastAttendance || "Never"}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={user.status}
                      onChange={() => markAttendance(user.id)}
                      disabled={user.status}
                      className="w-5 h-5 text-black"
                      onClick={() => setCheck(!check)}
                    />
                    <span className="ml-2 text-black">
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
