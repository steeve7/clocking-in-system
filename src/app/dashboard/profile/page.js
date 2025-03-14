'use client'
import React, {useState} from 'react';
import MetaProfile from '@/components/user-profile/MetaProfile';
import UserProfile from '@/components/user-profile/UserProfile';
import FooterProfile from '@/components/user-profile/FooterProfile';
import MetaModal from '@/components/ui/MetaModal';
import {MdClose} from 'react-icons/md'


export default function page() {
   const [modal, setModal] = useState(false);

          const closeModal = () => {
            setModal(false);
          };
  
  return (
    <div>
      <div
        className={`bg-white md:h-[120vh] h-[190vh] w-full rounded-2xl md:px-10 px-5 py-10 ${
          modal ? "blur-md" : ""
        }`}
      >
        <h2 className="text-black font-bold font-avenir">Profile</h2>
        <MetaProfile setModal={setModal} />
        <UserProfile />
        <FooterProfile />
      </div>

      <MetaModal open={modal} close={closeModal}>
        <div className="no-scrollbar relative mt-[-45rem] m-auto w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
          <div className='flex justify-between items-center'>
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <MdClose color="white" size={30} onClick={closeModal} className='cursor-pointer'/>
          </div>
            
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Facebook
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      X.com
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Linkedin
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Email Address
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Role
                    </label>
                    <input
                      type="email"
                      defaultValue=""
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Home Address
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Country
                    </label>
                    <input
                      type="text"
                      defaultValue=""
                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <button
                size="sm"
                variant="outline"
                onClick={closeModal}
                className="border border-gray-400 px-4 py-4 rounded-2xl"
              >
                Close
              </button>
              <button
                size="sm"
                className="bg-green-500 text-white px-4 py-4 rounded-2xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </MetaModal>
    </div>
  );
}
