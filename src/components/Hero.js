import React from 'react'
import Link from 'next/link';
import { FaUser } from "react-icons/fa";

export default function Hero() {
  return (
    <header className="w-full lg:px-20 px-10 py-10 bg-blue-500 h-[100vh]">
      <div className="flex justify-between md:flex-row flex-col gap-10">
        <div className='flex md:justify-start justify-center'>
          <h1 className="font-roboto font-bold text-[20px] text-white">Test Project</h1>
        </div>
        <div className="flex flex-row justify-center items-center gap-4">
          <div className="flex flex-row items-center gap-2 border bg-white border-white text-blue-900 rounded-xl px-2 py-2 hover:transition ease-in-out">
            <FaUser />
            <Link href="/Login" className="font-roboto font-bold text-[20px]">
              Sign-In
            </Link>
          </div>
        </div>
      </div>

      <div className="flex lg:flex-row flex-col justify-center items-center py-20 w-full gap-10">
      <div className='lg:w-2/3 w-full'>
      <p className="font-roboto font-bold lg:text-[50px] md:text-[30px] text-[20px] text-white">
          A smart clocking-in system using computer vision for face detection
          and recognition
        </p>
      </div>
        
        <img
          src="/images/th.jpg"
          alt="detect_image"
          className="lg:w-1/2 w-full rounded-2xl"
        />
      </div>
    </header>
  );
}
