import { LayoutDashboard, ChevronLeft, ChevronRight, Leaf } from "lucide-react"
import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
  { name: "Student", path: "/student", icon: <LayoutDashboard /> },
  { name: "Exam", path: "/users", icon: <LayoutDashboard /> },
  
]

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <div
      className={`relative hidden md:block transition-all duration-500 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      } bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 h-screen shadow-xl border-r border-green-200/30 backdrop-blur-md`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-4 px-4 relative transition-all duration-500 bg-amber-300 "  >
        <div className="flex items-center gap-2 transition-all duration-300">
          <Leaf
            className={`text-green-600 transition-transform duration-500 ${
              isOpen ? "scale-110" : "scale-100"
            }`}
          />
          <span
            className={`text-2xl font-extrabold text-green-800 transition-all duration-300 origin-left ${
              isOpen
                ? "opacity-100 scale-100 ml-2"
                : "opacity-0 scale-0 ml-0 w-0"
            }`}
          >
            Grass
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-2 px-3 mt-4">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={index}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-green-900 font-medium hover:bg-green-200/60 transition-all duration-300
              ${isActive ? "bg-green-300/70 shadow-inner ring-1 ring-green-500" : ""}
              `}
            >
              <span className="text-green-600">{item.icon}</span>
              <span
                className={`transition-all duration-300 ${
                  isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
                } origin-left`}
              >
                {item.name}
              </span>
            </NavLink>
          )
        })}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`absolute top-1/2 -translate-y-1/2 transform transition-all duration-300 bg-white border border-green-400 rounded-full p-1.5 shadow-lg z-10
        ${isOpen ? "-right-4" : "-right-3"}
      `}
      >
        {isOpen ? (
          <ChevronLeft className="text-green-700" size={20} />
        ) : (
          <ChevronRight className="text-green-700" size={20} />
        )}
      </button>

      {/* Decorative blur bubbles */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-300/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl animate-pulse delay-500" />
    </div>
  )
}

export default Sidebar
