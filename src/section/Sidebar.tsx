import { LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
  { name: "Analytics", path: "/analytics", icon: <LayoutDashboard /> },
  { name: "Users", path: "/users", icon: <LayoutDashboard /> },
  { name: "Settings", path: "/settings", icon: <LayoutDashboard /> },
    { name: "Users", path: "/users", icon: <LayoutDashboard /> },

  
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative hidden h-screen md:block transition-all duration-300 ${isOpen ? "w-64" : "w-16"} bg-green-200 h-screen shadow-lg`}>
      {/* Logo or Title */}
      <div className=" font-bold text-xl  text-green-800 h-18 p-4">
        {isOpen ? "MyApp" : "MA"}
      </div>

      {/* Sidebar Menu */}
      <div className="flex flex-col gap-2 px-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-green-900 hover:bg-green-300 transition-all duration-200 ${
                isActive ? "bg-green-400 font-semibold" : ""
              }`}
            >
              {item.icon}
              <span className={`${isOpen ? "block" : "hidden"} transition-all duration-300`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* Toggle Button - Chevron */}
      <button
        onClick={toggleSidebar}
        className={`
          absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 bg-white border border-green-500 rounded-full p-1.5 shadow-md
          ${isOpen ? "-right-4" : "-right-3"}
        `}
      >
        {isOpen ? (
          <ChevronLeft className="text-green-700" size={20} />
        ) : (
          <ChevronRight className="text-green-700" size={20} />
        )}
      </button>
    </div>
  );
};

export default Sidebar;
