'use client'
import React, {useState, useEffect} from 'react';
import MetaProfile from '@/components/user-profile/MetaProfile';
import UserProfile from '@/components/user-profile/UserProfile';
import FooterProfile from '@/components/user-profile/FooterProfile';
import MetaModal from '@/components/ui/MetaModal';
import {MdClose} from 'react-icons/md'
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";


export default function page() {
   const [modal, setModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [adddress, setAdddress] = useState("");
  const [countrry, setCountrry] = useState("");
  const [statee, setStatee] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("")


  const closeModal = () => {
    setModal(false);
  };

  useEffect(() => {
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setFullName(userData.fullName || "");
        setAdddress(userData.adddress || "");
        setCountrry(userData.countrry || "");
        setStatee(userData.statee || "");
        setZipCode(userData.zipCode || "");
      }
    } catch (err) {
      setError("Error fetching user data:", err);
    }
  };

  fetchUserData();
}, []);

  const handleSave = async (e) => {
    e.preventDefault(); // prevent form submission
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      console.log({ fullName, adddress, countrry, statee, zipCode });
      await updateDoc(userRef, {
        fullName,
        adddress,
        countrry,
        statee,
        zipCode,
      });

      // Fetch the updated user data
      const updatedSnapshot = await getDoc(userRef);
      const updatedData = updatedSnapshot.data();

      // Update state with new values
      setFullName(updatedData.fullName || "");
      setAdddress(updatedData.adddress || "");
      setCountrry(updatedData.countrry || "");
      setStatee(updatedData.statee || "");
      setZipCode(updatedData.zipCode || "");

      setSuccess("Profile updated successfully!");
      setError("");

      closeModal();
    } catch (err) {
      console.error("Error updating Firestore:", err);
      setError("Failed to update profile.");
      setSuccess("");
    }
  };
  
  return (
    <div>
      <div
        className={`bg-white md:h-[120vh] h-[120vh] w-full rounded-2xl md:px-10 px-5 py-10 ${
          modal ? "blur-md" : ""
        }`}
      >
        <h2 className="text-black font-bold font-avenir">Profile</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p className="text-orange-500">{success}</p>}
        <MetaProfile setModal={setModal} fullName={fullName} />
        <UserProfile fullName={fullName} />
        <FooterProfile
          adddress={adddress}
          countrry={countrry}
          statee={statee}
          zipCode={zipCode}
        />
      </div>

      <MetaModal open={modal} close={closeModal}>
        <div className="relative md:mt-[-45rem] mt-[-50rem] m-auto w-full max-w-[700px] rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <div className="flex justify-between items-center">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Personal Information
              </h4>
              <MdClose
                color="white"
                size={30}
                onClick={closeModal}
                className="cursor-pointer"
              />
            </div>

            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="md:h-[450px] h-[600px] px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>
              </div>
              <form className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Address / Street
                  </label>
                  <input
                    type="text"
                    value={adddress}
                    onChange={(e) => setAdddress(e.target.value)}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Country / region
                  </label>
                  <input
                    type="text"
                    value={countrry}
                    onChange={(e) => setCountrry(e.target.value)}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    State / province
                  </label>
                  <input
                    type="text"
                    value={statee}
                    onChange={(e) => setStatee(e.target.value)}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    zip Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="flex items-center justify-start gap-3 px-2 mt-6">
                  <button
                    size="sm"
                    variant="outline"
                    onClick={closeModal}
                    className="border border-gray-400 px-2 py-2 rounded-2xl text-white w-32"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSave}
                    type="submit"
                    size="sm"
                    className="bg-green-500 text-white px-2 py-2 rounded-2xl md:w-32 w-60 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </MetaModal>
    </div>
  );
}
