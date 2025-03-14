"use client";
import { MdClose } from "react-icons/md";
import { FaUser, FaCalendarCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const router = useRouter()

    const handleMenuClick = (menuName) => {
     setIsSidebarOpen(false);

      if (menuName === "Attendance") {
        router.push("/dashboard/attendance"); // Navigate to "dashboard/attendance"
      } else if (menuName === "User Profile") {
        router.push("/dashboard/profile");
      }
    };

    // if (menuName === "User Profile" && userData.role === "manager") {
    //   router.push("/dashboard/profile");
    // } else {
    //   router.push("/user-dashboard/profile");
    // }



  return (
    <div
      className={`w-full md:w-[20rem] bg-white text-black z-20 p-4 h-full absolute md:relative transition-transform duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex gap-2 justify-between flex-row items-center pl-4">
        <h2 className="text-xl py-4 font-bold font-avenir">Test Project</h2>
        <MdClose
          className="block md:hidden cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
          size={20}
        />
      </div>

      <div className="mt-6 space-y-2 pl-4">
        <span className="font-work">Menu</span>
        {[
          { name: "User Profile", icon: <FaUser size={15} /> },
          { name: "Attendance", icon: <FaCalendarCheck size={20} /> },
        ].map((menu) => (
          <div
            key={menu.name}
            onClick={() => handleMenuClick(menu.name)}
            className="flex items-start gap-2 p-2 pl-4 cursor-pointer rounded-md hover:bg-black hover:text-white"
          >
            <p>{menu.icon}</p>
            <p className="font-medium font-avenir">{menu.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
