import React from 'react'
import Link from 'next/link';
import { FaUser } from "react-icons/fa";

export default function Hero() {
  return (
    <header className="flex lg:flex-row flex-col justify-center items-center w-full lg:px-20 px-10 py-10 bg-black h-[100vh]">
      <div className="flex flex-col md:justify-start justify-center gap-8">
        <h1 className="font-Marhey font-medium text-center xl:text-[70px] text-[50px] text-white leading-[60px]">
          SmartFace Check-in
        </h1>
        <p className="font-Montserrat font-medium text-center lg:text-[20px] md:text-[15px] text-[12px] text-white">
          A smart clocking-in system using computer vision for face detection
          and recognition
        </p>
      </div>

      <div className="flex flex-col justify-center items-center w-full gap-10 lg:mt-0 mt-10">
        <img
          src="/images/home.svg"
          alt="detect_image"
          className="lg:w-[482px] w-full rounded-[5px]"
        />
        <div className="flex flex-row items-center gap-2 border bg-white border-white text-black rounded-[5px] px-4 py-2 hover:transition ease-in-out">
          <FaUser />
          <Link href="/Login" className="font-Montserrat font-bold text-[16px]">
            Sign-In
          </Link>
        </div>
      </div>
    </header>
  );
}
