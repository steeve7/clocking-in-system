"use client";
import { MdMenu } from "react-icons/md";
import { LuSearch } from "react-icons/lu";
import { FaUserEdit, FaSupple, FaSignOutAlt } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header({ setIsSidebarOpen }) {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [loading, setLoading] = useState(true); // change default to true
  const [loadingAuth, setLoadingAuth] = useState(true); // New state to track auth check
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace("/Login"); // Redirect immediately
        return;
      }

      setUser(currentUser);
      setLoadingAuth(false); // Auth check is done

      // Fetch user details from Firestore
      try {
        const userRef = collection(db, "users");
        const q = query(userRef, where("uid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserName(userData.name || ""); // Ensure userData.name is a string
          setUserEmail(userData.email || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (!user && !loadingAuth) {
    router.replace("/Login");
    return null; // Prevent any rendering
  }

  // Prevent rendering while checking authentication
  if (loadingAuth) {
    return <p>Loading authentication...</p>;
  }

  // Prevent rendering while fetching user data
  if (loading) {
    return <p>Loading user data...</p>;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/Login");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };
  return (
    <div className="flex items-center justify-between p-6 bg-white shadow-md w-full z-10">
      {/* Menu Button */}
      <MdMenu
        className="block md:hidden text-2xl cursor-pointer md:mr-0 mr-5"
        color="black"
        onClick={() => setIsSidebarOpen(true)}
      />
      <div className="order-2 relative ml-5 md:ml-0">
        <div
          className="flex flex-row items-center"
          onClick={() => setDropdown(!dropdown)}
        >
          <h2 className="text-lg font-avenir font-medium md:flex flex-row items-center gap-2 text-black cursor-pointer hidden">
            Welcome {userName}!
          </h2>
          <MdOutlineKeyboardArrowDown color="black" className="cursor-pointer" />
        </div>

        <div
          className={`bg-white absolute z-50 w-[250px] rounded-lg shadow-lg right-5 mt-10 px-5 py-5 ${
            dropdown ? "" : "hidden"
          }`}
        >
          <div className="flex flex-col gap-2 items-start">
            <h2 className="font-medium text-black font-avenir">{userName}</h2>
            <p className="font-medium text-gray-700 font-work">{userEmail}</p>
          </div>
          <div className="flex flex-col items-start gap-6 mt-5 md:pl-5">
            <Link
              href={"/dashboard/profile"}
              className="font-work font-medium text-black flex flex-row items-center gap-2"
              onClick={() => setDropdown(false)}
            >
              <FaUserEdit />
              Edit Profile
            </Link>
          </div>
          <div className="w-full border border-black mt-5" />
          <div className="flex flex-row items-center gap-2 mt-5">
            <FaSignOutAlt color="black" />
            <button className="text-black font-work" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative md:w-[40%] w-full order-1 ">
        <LuSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          className="bg-white outline-none w-full pl-10 p-2 rounded-md border border-gray-300 placeholder:font-work"
          placeholder="Search..."
        />
      </div>
    </div>
  );
}
