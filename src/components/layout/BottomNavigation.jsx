// BottomNavigation.jsx
// شريط التنقل السفلي

import { NavLink } from "react-router-dom";
import { FaBook, FaBookOpen, FaMedal, FaRegStickyNote } from "react-icons/fa";
import { HiOutlineViewBoards } from "react-icons/hi";

const navs = [
  { to: "/phases", icon: HiOutlineViewBoards, label: "المراحل" },
  { to: "/notebook", icon: FaRegStickyNote, label: "الملاحظات" },
  { to: "/journal", icon: FaBookOpen, label: "المدونة" },
  { to: "/achievements", icon: FaMedal, label: "الإنجازات" },
];

export default function BottomNavigation() {
  console.log("BottomNavigation rendering");
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg flex justify-around items-center h-16 z-50 md:hidden backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      {navs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
              isActive 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                : "text-gray-600 dark:text-gray-300"
            }`
          }
          aria-label={label}
        >
          {({ isActive }) => (
            <>
              <div className={`rounded-full p-2 transition-all duration-200 active:scale-95 ${
                isActive 
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-1 font-semibold transition-colors duration-200 ${
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-700 dark:text-gray-300"
              }`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
