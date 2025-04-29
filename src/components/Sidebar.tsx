"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FiMenu, FiSettings } from "react-icons/fi";
import { useSession } from "next-auth/react";
import Image from "next/image";

const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const businessName =
    (session?.user as { businessName?: string })?.businessName || "Guest";

  return (
    <div
      className={`h-screen p-4 transition-all duration-300 bg-gradient-to-b from-[#5321CA] to-[#1B005C] ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 rounded-lg hover:bg-gray-200"
      >
        <FiMenu size={24} />
      </button>

      <div className="mt-4 flex flex-col items-center">
        <Image
          src="/avatar.png"
          alt="User"
          width={80}
          height={80}
          className="rounded-full"
        />
        {!isCollapsed && (
          <span className="font-semibold mt-2 text-white">{businessName}</span>
        )}
      </div>

      <nav className="mt-8 space-y-2">
        <a
          href="/dashboard/home"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            pathname === "/dashboard/home"
              ? "bg-[#6652D8] text-white font-bold"
              : "text-gray-300"
          }`}
        >
          <Image
            src="/home.svg"
            alt="Home"
            width={28}
            height={28}
            className={`transition-all ${
              pathname === "/dashboard/home"
                ? "filter brightness-0 invert"
                : "opacity-60"
            }`}
          />
          {!isCollapsed && <span>Home</span>}
        </a>

        <a
          href="/dashboard/sales"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            pathname === "/dashboard/sales"
              ? "bg-[#6652D8] text-white font-bold"
              : "text-gray-300"
          }`}
        >
          <Image
            src="/sales.svg"
            alt="Sales Dashboard"
            width={28}
            height={28}
            className={`transition-all ${
              pathname === "/dashboard/sales"
                ? "filter brightness-0 invert"
                : "opacity-60"
            }`}
          />
          {!isCollapsed && <span>Sales Dashboard</span>}
        </a>

        <a
          href="/dashboard/reviews"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            pathname === "/dashboard/reviews"
              ? "bg-[#6652D8] text-white font-bold"
              : "text-gray-300"
          }`}
        >
          <Image
            src="/reviews.svg"
            alt="Reviews Dashboard"
            width={28}
            height={28}
            className={`transition-all ${
              pathname === "/dashboard/reviews"
                ? "filter brightness-0 invert"
                : "opacity-60"
            }`}
          />
          {!isCollapsed && <span>Reviews Dashboard</span>}
        </a>

        <a
          href="/dashboard/recommendations"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            pathname === "/dashboard/recommendations"
              ? "bg-[#6652D8] text-white font-bold"
              : "text-gray-300"
          }`}
        >
          <Image
            src="/recommendations.svg"
            alt="Recommendations"
            width={28}
            height={28}
            className={`transition-all ${
              pathname === "/dashboard/recommendations"
                ? "filter brightness-0 invert"
                : "opacity-60"
            }`}
          />
          {!isCollapsed && <span>Recommendations</span>}
        </a>

        <a
          href="/dashboard/settings"
          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
            pathname === "/dashboard/settings"
              ? "bg-[#6652D8] text-white font-bold"
              : "text-gray-300"
          }`}
        >
          <FiSettings
            size={24}
            className={`${
              pathname === "/dashboard/settings"
                ? "text-white"
                : "text-gray-300 opacity-60"
            }`}
          />
          {!isCollapsed && <span>Settings</span>}
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;