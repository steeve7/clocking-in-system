"use client";
import { RiArrowDropRightLine } from "react-icons/ri";
import { MdClose } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const router = useRouter();

    const handleMenuClick = (menuName) => {
    if (menuName === "Attendance") {
      router.push("/desktop/attendance"); // Navigate to "dashboard/attendance"
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/Login");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <div
      className={`w-full md:w-[20rem] bg-white text-black p-4 md:h-full absolute md:relative transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex gap-2 items-center pl-4">
        <img src="/images/th.jpg" alt="logo" className="w-10" />
        <h2 className="text-2xl py-4 font-bold">Test Project</h2>
        <MdClose
          className="block md:hidden text-2xl cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="mt-6 space-y-2">
        {[{ name: "Attendance", icon: <FaUserEdit size={20} /> }].map(
          (menu) => (
            <div
              key={menu.name}
              onClick={() => handleMenuClick(menu.name)}
              className="flex items-center gap-2 p-2 pl-4 cursor-pointer rounded-md hover:bg-black hover:text-white"
            >
              <p>{menu.icon}</p>
              <p className="font-medium">{menu.name}</p>
              <RiArrowDropRightLine size={30} />
            </div>
          )
        )}
      </div>

      {/* Logout Button */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-red-700 w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
