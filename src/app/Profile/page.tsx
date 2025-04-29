"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Select } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface ProfileData {
  email: string;
  phone: string;
  businessName: string;
  profileImage?: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [phoneCode, setPhoneCode] = useState<string>("+966");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const userEmail = "mike@example.com";

  useEffect(() => {
    axios
      .get(`/api/profile/${userEmail}`)
      .then((response) => {
        const { phone, ...rest } = response.data;
        const [code, number] = phone.includes("-")
          ? phone.split("-")
          : ["+966", phone];
        setPhoneCode(code);
        setPhoneNumber(number);
        setProfile({ phone, ...rest });
      })
      .catch((err) => {
        console.error("❌ Error fetching user data:", err);
      });
  }, []);

  const handleSave = async () => {
    try {
      const updatedProfile = { ...profile, phone: `${phoneCode}-${phoneNumber}` };
      const response = await axios.put(`/api/profile/${userEmail}`, updatedProfile);
      alert("Profile updated successfully!");
      setProfile(response.data);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-800 to-purple-500 text-white font-[Poppins]">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-900 text-white p-6 min-h-screen shadow-lg">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <ul className="mt-4 space-y-2">
          <li>
            <a href="#" className="block hover:text-green-400">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-green-400">
              Sales Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-green-400">
              Reviews
            </a>
          </li>
          <li>
            <a href="#" className="block hover:text-green-400">
              Recommendations
            </a>
          </li>
        </ul>
      </aside>

      {/* Profile Section */}
      <main className="flex-1 flex flex-col items-center p-10 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900">
        {/* Profile Header */}
        <div className="w-full max-w-3xl flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-purple-700">Edit Profile</h2>
          {profile?.profileImage ? (
            <Image
              src={profile.profileImage}
              alt="Profile"
              width={56}
              height={56}
              className="rounded-full border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
              🔵
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-3xl text-gray-800">
          <h3 className="text-xl font-semibold mb-2">Update Your Profile</h3>
          {/* Business Name */}
          <div className="mb-5">
            <label className="block font-medium mb-1 flex items-center">
              Business Name <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={profile?.businessName || ""}
              onChange={(e) =>
                setProfile((prev) =>
                  prev ? { ...prev, businessName: e.target.value } : null
                )
              }
              className="w-full border p-4 rounded-lg text-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your business name"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block font-medium mb-1 flex items-center">
              Email <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              value={profile?.email || ""}
              className="w-full border p-4 rounded-lg text-lg bg-gray-100"
              readOnly
            />
          </div>

          {/* Phone Number */}
          <div className="mb-5">
            <label className="block font-medium mb-1 flex items-center">
              Phone Number <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-2">
              <Select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="border p-4 rounded-lg w-44 h-[56px] text-lg bg-white appearance-none"
                icon={<ChevronDownIcon />}
              >
                <option value="+966">KSA (+966)</option>
                <option value="+971">UAE (+971)</option>
                <option value="+1">USA (+1)</option>
                <option value="+44">UK (+44)</option>
              </Select>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="border p-4 rounded-lg flex-1 h-[56px] text-lg focus:ring-2 focus:ring-purple-500 appearance-none"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="mt-6">
            <button
              className="w-full bg-purple-700 text-white py-4 rounded-lg hover:bg-purple-900 transition"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-10 border border-red-500 p-5 rounded-lg bg-red-50 w-full max-w-3xl">
          <h3 className="text-xl font-bold text-red-600">Danger Zone</h3>
          <p className="text-gray-600 mt-2">
            If you delete your account, all your information will be permanently
            removed.
          </p>
          <button
            className="mt-4 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600"
            onClick={() => confirm("Are you sure?") && alert("Account deleted")}
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;