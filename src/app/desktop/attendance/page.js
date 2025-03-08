"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

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
      <h1 className="text-3xl font-bold text-center mb-6 text-black">Attendance Tracking</h1>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-400">
              <tr className="text-left">
                <th className="p-3 border text-white">User</th>
                <th className="p-3 border text-white">Email</th>
                <th className="p-3 border text-white">Role</th>
                <th className="p-3 border text-white">Last Attendance</th>
                <th className="p-3 border text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border">
                  <td className="p-3 border text-black">{user.name}</td>
                  <td className="p-3 border text-black">{user.email}</td>
                  <td className="p-3 border text-black">{user.role}</td>
                  <td className="p-3 border text-black">{user.lastAttendance || "Never"}</td>
                  <td className="p-3 border text-center">
                  {check ? 
                    <input
                      type="checkbox"
                      checked={user.status}
                      onChange={() => markAttendance(user.id)}
                      disabled={user.status}
                      className="w-5 h-5 text-black"
                      onClick={() => setCheck(!check)}
                    />
                    :
                    <span className="ml-2 text-black">{user.status ? "Active" : "Inactive"}</span>
                  } 
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
