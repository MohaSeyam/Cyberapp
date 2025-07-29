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
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-dark-background border-t border-light-border dark:border-dark-border shadow-lg flex justify-around items-center h-16 z-50 md:hidden">
      {navs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full transition relative ${isActive ? "bg-blue-50 dark:bg-slate-800" : ""}`
          }
          aria-label={label}
        >
          {({ isActive }) => (
            <span className={`rounded-full p-2 transition ${isActive ? "bg-blue-100 dark:bg-blue-900 text-blue-600" : "text-slate-600"}`}>
              <Icon className="w-6 h-6 mx-auto" />
            </span>
          )}
          <span className="text-xs mt-1">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
