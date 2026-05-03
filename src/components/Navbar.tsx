"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import {
  LogOut,
  ChevronDown,
  LayoutDashboard,
  PlusCircle,
  ArrowRightLeft,
  Users,
  ShieldCheck,
  List,
} from "lucide-react";
import toast from "react-hot-toast";

const LogoutModal = ({ isOpen, onClose, onConfirm }: any) => (
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
          className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to log out?
            </p>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-400"
            >
              Log out
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Navbar = () => {
  const { data: session, status } = useSession();
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
    const dashboardRoute = user.role
      ? `/${user.role}/dashboard`
      : "/dashboard";
    switch (user.role) {
      case "skill_member":
        return [
          { href: dashboardRoute, label: "Dashboard", icon: LayoutDashboard },
          { href: `/${user.role}/add-skills`, label: "Add Skills", icon: PlusCircle },
          { href: `/${user.role}/my-skills`, label: "My Skills", icon: List },
          {
            href: `/${user.role}/exchange-requests`,
            label: "Exchange Requests",
            icon: ArrowRightLeft,
          },
          {
            href: `/${user.role}/my-connections`,
            label: "My Connections",
            icon: Users,
          },
        ];
      case "skill_verifier":
        return [
          { href: dashboardRoute, label: "Dashboard", icon: LayoutDashboard },
          { href: `/${user.role}/skills`, label: "Pending Skills", icon: ShieldCheck },
        ];
      default:
        return [
          { href: dashboardRoute, label: "Dashboard", icon: LayoutDashboard },
        ];
    }
  };

  const publicLinks = [
    { href: "/skills", label: "Skills", icon: ShieldCheck },
    { href: "/users", label: "Users", icon: Users },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg shadow-lg"
            : "bg-white/60 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-3 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 p-0.5 shadow-md">
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
              <span className="text-xl font-bold tracking-tight text-gray-800">
                Talent
                <span className="relative inline-block text-gray-800 ml-0.5">
                  o
                  {/* Green curved dash above the 'o' */}
                  <svg
                    className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-2"
                    viewBox="0 0 20 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2,6 Q10,0 18,6"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-8">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-emerald-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-emerald-500 hover:after:w-full after:transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              ) : !user ? (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105"
                >
                  Login
                </Link>
              ) : (
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center gap-2 focus:outline-none">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-white font-bold shadow-md">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl border border-white/50 p-2">
                      <div className="px-4 py-3 text-sm flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-gray-500 truncate text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="py-1">
                        {getDropdownItems().map((item) => (
                          <Menu.Item key={item.href}>
                            {({ active }) => (
                              <Link
                                href={item.href}
                                className={`${
                                  active
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "text-gray-700"
                                } group flex items-center gap-2 px-4 py-2 rounded-lg text-sm`}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setLogoutModal(true)}
                              className={`${
                                active
                                  ? "bg-red-50 text-red-600"
                                  : "text-gray-700"
                              } group flex w-full items-center gap-2 px-4 py-2 rounded-lg text-sm`}
                            >
                              <LogOut className="h-4 w-4" /> Logout
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

      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg z-30">
        <div className="flex justify-around items-center py-2">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 px-4 py-1 text-gray-600 hover:text-emerald-600"
            >
              <link.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <LogoutModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Navbar;