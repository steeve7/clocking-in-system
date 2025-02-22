"use client";
import React, { useState, useEffect } from "react";
import { RiArrowDropRightLine } from "react-icons/ri";
import { MdMenu, MdClose } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import Attendance from "../Dashboard/Attendance/page";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";


export default function Page() {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/Login"); // Redirect if not logged in
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup function
  }, [router]);

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/Login"); // Redirect to login after logout
  } catch (error) {
    setError("Logout Error!", + error.message);
  }
};


  const renderContent = () => {
    switch (selectedMenu) {
      case "Attendance":
        return <Attendance />;
      default:
        return <div className="font-roboto font-medium text-black">Select a menu</div>;
    }
  };

  const handleMenuClick = (menuName) => {
    setSelectedMenu(menuName);
    setIsSidebarOpen(false); // Close the sidebar on menu click
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen">
      {/* Sidebar */}
      <div
        className={`w-full md:w-[20rem] bg-white text-black p-4 md:h-full absolute left-0 z-10 md:relative md:translate-x-0 transition-transform duration-1000 ease-[cubic-bezier(0.4, 0, 0.2, 1)] ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0 "
        } absolute left-0 z-10 md:relative md:translate-x-0`}
      >
        <div className="flex gap-2 items-center pl-4">
          <img src="/images/th.jpg" alt="logo" className="w-10" />
          <h2 className="text-2xl py-4 font-bold font-roboto flex-1">
            Test Project
          </h2>
          {/* Close button for mobile */}
          <MdClose
            className="block md:hidden text-2xl cursor-pointer text-black"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
        <div
          className="flex flex-col justify-between"
          style={{ height: "calc(100vh - 120px)" }}
        >
          {/* Dashboard menu */}
          <div className="mt-6 space-y-2">
            {[{ name: "Attendance", icon: <FaUserEdit size={20} /> }].map(
              (menu) => (
                <div
                  key={menu.name}
                  onClick={() => handleMenuClick(menu.name)}
                  className={`flex items-center justify-start gap-2 p-2 pl-4 cursor-pointer rounded-md ${
                    selectedMenu === menu.name ? "bg-black text-white" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <p
                      style={{
                        filter:
                          selectedMenu === menu.name
                            ? "brightness(0) invert(1)"
                            : "none",
                      }}
                    >
                      {menu.icon}
                    </p>
                    <p className="font-roboto font-medium">{menu.name}</p>
                  </div>
                  <RiArrowDropRightLine
                    size={30}
                    className={`${
                      selectedMenu === menu.name ? "text-white" : "text-black"
                    }`}
                  />
                </div>
              )
            )}
          </div>

          {/* Profile menu */}
          <div className="mt-8">
            <div className="flex items-center justify-center cursor-pointer rounded-md">
              <button
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-red-700 transition w-full"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 bg-gray-100 ${
          isSidebarOpen ? "overflow-hidden" : ""
        }`}
      >
        {/* Header menu */}
        <div className="flex flex-row items-start md:items-center justify-between p-6 gap-4">
          <div className="flex items-center justify-between w-full md:mt-0 mt-2">
            <MdMenu
              className="block md:hidden text-2xl cursor-pointer text-black"
              onClick={() => setIsSidebarOpen(true)}
            />
            <h2 className="font-roboto font-medium md:text-[20px] text-[15px] text-black">
              Hello Welcome!
            </h2>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-60">
              <LuSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500 cursor-pointer" />
              <input
                type="text"
                className="bg-white outline-none w-full pl-10 p-2 rounded-md"
                placeholder="Search..."
              />
            </div>
          </div>
        </div>

        {/* Dynamic content area */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
