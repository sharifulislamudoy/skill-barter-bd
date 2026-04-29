"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg shadow-sky-100/30"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-3 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Text */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-sky-500 to-emerald-400 p-0.5 shadow-md">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <Image
                    src="/logo.png"
                    alt="Skill Barter Logo"
                    width={24}
                    height={24}
                    className="h-5 w-5 object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-800 group-hover:text-sky-600 transition-colors">
                Skill <span className="text-emerald-500">Barter</span>
              </span>
            </Link>
          </motion.div>

          {/* Middle: Browse Skills link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/browse"
              className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors px-4 py-2 rounded-full hover:bg-emerald-500/10"
            >
              Browse Skills
            </Link>
          </motion.div>

          {/* Right: Login Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
            >
              Login
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;