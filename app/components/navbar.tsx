"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname() // get current path

  const onLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch("/api/logout", { method: "POST" })
      document.cookie = "token=; Max-Age=0; path=/;"
      router.push("/login")
    } finally {
      setLoggingOut(false)
    }
  }

  const onLogin = () => router.push("/login")

  const isLoginPage = pathname === "/login"

  return (
    <nav className="bg-slate-800 px-6 py-3 text-white">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link href="/">
          <div className="text-lg font-bold">Class Khappa</div>
        </Link>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden block text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 items-center">
          {isLoginPage ? (
            <li className=" font-semibold">Please login</li>
          ) : (
            <>
              <li>
                <Link href="/sales" className="hover:text-gray-300">
                  Sales
                </Link>
              </li>
              <li>
                <Link href="/inventory/add" className="hover:text-gray-300">
                  Add Inventory
                </Link>
              </li>
              <li>
                <Link href="/inventory/view" className="hover:text-gray-300">
                  Inventory
                </Link>
              </li>
              <li>
                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    loggingOut
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <ul className="md:hidden flex flex-col gap-4 mt-3 bg-slate-700 p-4 rounded-lg">
          {isLoginPage ? (
            <li className="font-semibold">Please login</li>
          ) : (
            <>
              <li>
                <Link href="/sales" className="hover:text-gray-300">
                  Sales
                </Link>
              </li>
              <li>
                <Link href="/inventory/add" className="hover:text-gray-300">
                  Add Inventory
                </Link>
              </li>
              <li>
                <Link href="/inventory/view" className="hover:text-gray-300">
                  Inventory
                </Link>
              </li>
              <li>
                <button
                  onClick={onLogout}
                  disabled={loggingOut}
                  className={`px-4 py-2 rounded-lg font-medium w-full ${
                    loggingOut
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </li>
            </>
          )}
        </ul>
      )}
    </nav>
  )
}
