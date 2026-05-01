"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import {
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  PlusCircle,
  ArrowRightLeft,
  Users,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

// মডাল কম্পোনেন্ট
const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl shadow-red-100/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to log out of your account?
              </p>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-400 transition-all shadow-lg shadow-red-200"
              >
                Log out
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setLogoutModal(false);
    signOut({ callbackUrl: "/" });
    toast.success("Logged out successfully");
  };

  const user = session?.user;

  const getDropdownItems = () => {
    if (!user) return [];

    // Role‑based dashboard route
    const dashboardRoute = user.role
      ? `/${user.role}/dashboard`
      : "/dashboard";

    switch (user.role) {
      case "skill_member":
        return [
          { href: dashboardRoute, label: "Dashboard", icon: LayoutDashboard },
          { href: `/${user.role}/add-skills`, label: "Add Skills", icon: PlusCircle },
          { href: `/${user.role}/exchange-request`, label: "Exchange Requests", icon: ArrowRightLeft },
        ];
      case "skill_verifier":
        return [
          { href: dashboardRoute, label: "Dashboard", icon: LayoutDashboard },
          { href: `/${user.role}/skills`, label: "Pending Skills", icon: ShieldCheck },
        ];
      case "admin":
        return [
          { href: dashboardRoute, label: "Dashboard", icon: LayoutDashboard },
          { href: `/${user.role}/skills`, label: "Skills Management", icon: ShieldCheck },
          { href: `/${user.role}/users-management`, label: "Users Management", icon: Users },
        ];
      default:
        return [
          { href: dashboardRoute, label: "Dashboard", icon: LayoutDashboard },
        ];
    }
  };

  // অপ্রমাণীকৃত ব্যবহারকারীর জন্যও Skills ও Users লিঙ্ক
  const publicLinks = [
    { href: "/skills", label: "Skills" },
    { href: "/users", label: "Users" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg shadow-lg shadow-sky-100/30"
            : "bg-white/60 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-3 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 p-0.5 shadow-md">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain"
                    />
                  </div>
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-800 transition-colors">
                  Skill <span className="text-emerald-500">Barter</span>
                </span>
              </Link>
            </motion.div>

            {/* Middle: Skills & Users (সবার জন্য) */}
            <div className="hidden sm:flex items-center gap-8">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-emerald-600 font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-500 hover:after:w-full after:transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right: Login / Profile */}
            <div className="flex items-center gap-3">
              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              ) : !user ? (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                >
                  Login
                </Link>
              ) : (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 focus:outline-none">
                    {/* প্রোফাইল সার্কেল (প্রথম অক্ষর) */}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl shadow-sky-100/50 border border-white/50 focus:outline-none p-2">
                      {/* User info */}
                      <div className="px-4 py-3 text-sm">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-gray-500 truncate text-xs">{user.email}</p>
                      </div>

                      {/* ডায়নামিক লিঙ্ক */}
                      <div className="py-1">
                        {getDropdownItems().map((item) => (
                          <Menu.Item key={item.href}>
                            {({ active }) => (
                              <Link
                                href={item.href}
                                className={`${
                                  active ? "bg-emerald-50 text-emerald-600" : "text-gray-700"
                                } group flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors`}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </div>

                      {/* Logout বাটন */}
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setLogoutModal(true)}
                              className={`${
                                active ? "bg-red-50 text-red-600" : "text-gray-700"
                              } group flex w-full items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors`}
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Logout confirmation modal */}
      <LogoutModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Navbar;